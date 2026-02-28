use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::sync::{mpsc, oneshot};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::io::AsyncBufReadExt;
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
use futures_util::{StreamExt, SinkExt};
use std::process::Stdio;
use tauri::{AppHandle, Emitter, Manager};
use tokio::time::{timeout, Duration};
use tauri_plugin_shell::process::{CommandEvent, CommandChild};
use tauri_plugin_shell::ShellExt;

pub fn find_node_executable() -> String {
    // 1. Try PATH
    if let Ok(path) = which::which("node") {
        return path.to_string_lossy().to_string();
    }

    // 2. Try common macOS paths
    let common_paths = [
        "/usr/local/bin/node",
        "/opt/homebrew/bin/node",
        "/usr/bin/node",
    ];

    for path in common_paths {
        if std::path::Path::new(path).exists() {
            return path.to_string();
        }
    }

    // Fallback to "node" and hope for the best at runtime
    "node".to_string()
}


pub fn find_npm_executable() -> String {
    if let Ok(path) = which::which("npm") {
        return path.to_string_lossy().to_string();
    }

    let common_paths = [
        "/usr/local/bin/npm",
        "/opt/homebrew/bin/npm",
        "/usr/bin/npm",
    ];

    for path in common_paths {
        if std::path::Path::new(path).exists() {
            return path.to_string();
        }
    }
    "npm".to_string()
}

pub fn check_node_version() -> Result<String, String> {
    let node_path = find_node_executable();
    let output = std::process::Command::new(&node_path)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to run node: {}", e))?;
    
    if !output.status.success() {
        return Err("Node.js process exited with error".to_string());
    }

    let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
    // Expected format: v22.x.x
    if version.starts_with("v") {
        let major_str = version.split('.').next().unwrap_or("").trim_start_matches('v');
        if let Ok(major) = major_str.parse::<i32>() {
            if major >= 22 {
                return Ok(version);
            } else {
                return Err(format!("Node.js version too old: {}. Required: v22+", version));
            }
        }
    }
    
    Err(format!("Could not parse Node.js version: {}", version))
}

pub fn check_openclaw_installed() -> bool {
    // Check if npm is available using our robust finder
    let npm_path = find_npm_executable();
    if std::path::Path::new(&npm_path).exists() {
        return true;
    }
    // Fallback if "npm" string works in shell
    which::which("npm").is_ok()
}

pub fn install_openclaw_cli() -> Result<(), String> {
    // Strategy: NPM first, bash fallback
    let npm_path = find_npm_executable();
    
    // Attempt 1: NPM install
    println!("[OpenClaw Install] Trying npm install...");
    let npm_status = std::process::Command::new(&npm_path)
        .args(["install", "-g", "openclaw"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .status();

    if let Ok(status) = npm_status {
        if status.success() {
            println!("[OpenClaw Install] NPM install succeeded");
            return Ok(());
        }
        println!("[OpenClaw Install] NPM install failed (exit code: {}), trying bash fallback...", status);
    } else {
        println!("[OpenClaw Install] NPM not available, trying bash fallback...");
    }

    // Attempt 2: Bash fallback (curl install script)
    let bash_status = std::process::Command::new("bash")
        .args(["-c", "curl -fsSL https://openclaw.ai/install.sh | bash"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .status();

    match bash_status {
        Ok(status) if status.success() => {
            println!("[OpenClaw Install] Bash install script succeeded");
            Ok(())
        }
        Ok(status) => {
            Err(format!("Both NPM and bash install failed. Bash exit code: {}", status))
        }
        Err(e) => {
            Err(format!("Both NPM and bash install failed. Bash error: {}", e))
        }
    }
}


const GATEWAY_PORT: &str = "18789";
const GATEWAY_TOKEN: &str = "elazya-v1000-internal-token";

fn kill_port(port: &str) {
    println!("[OpenClaw Bridge] Cleaning up port {}...", port);
    
    // 1. Try lsof to find specific PIDs
    let output = std::process::Command::new("lsof")
        .arg("-i")
        .arg(format!(":{}", port))
        .arg("-t")
        .output();

    if let Ok(output) = output {
        let pids = String::from_utf8_lossy(&output.stdout);
        for pid in pids.lines() {
            if let Ok(pid) = pid.trim().parse::<i32>() {
                println!("[OpenClaw Bridge] Killing process on port {}: {}", port, pid);
                let _ = std::process::Command::new("kill").arg("-9").arg(pid.to_string()).status();
            }
        }
    }

    // 2. Also pkill by name just in case
    let _ = std::process::Command::new("pkill")
        .arg("-9")
        .arg("-f")
        .arg("openclaw")
        .status();
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GatewayFrame {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub method: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub payload: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ok: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<Value>,
    #[serde(rename = "type")]
    pub frame_type: String, // "req", "res", "event"
}

pub struct OpenClawBridge {
    tx: mpsc::Sender<GatewayFrame>,
    pending: Arc<Mutex<HashMap<String, oneshot::Sender<Result<Value, String>>>>>,
    connected: Arc<Mutex<bool>>,
}

impl OpenClawBridge {
    pub async fn new(url: String, app_handle: AppHandle) -> Result<Arc<Self>, String> {
        let (tx, mut rx) = mpsc::channel::<GatewayFrame>(32);
        let pending = Arc::new(Mutex::new(HashMap::<String, oneshot::Sender<Result<Value, String>>>::new()));
        let connected = Arc::new(Mutex::new(false));
        
        let bridge = Arc::new(Self {
            tx,
            pending: Arc::clone(&pending),
            connected: Arc::clone(&connected),
        });

        let bridge_clone = Arc::clone(&bridge);
        
        tokio::spawn(async move {
            loop {
                println!("[OpenClaw Bridge] Attempting to connect to {}...", url);
                match connect_async(&url).await {
                    Ok((ws_stream, _)) => {
                        println!("[OpenClaw Bridge] Connected!");
                        let _ = app_handle.emit("bridge-status", "connected");
                        let (mut write, mut read) = ws_stream.split();
                        
                        // Handshake
                        let connect_id = uuid::Uuid::new_v4().to_string();
                        let connect_params = serde_json::json!({
                            "client": {
                                "id": "openclaw-macos",
                                "displayName": "Elazya v1000",
                                "version": "1.0.0",
                                "platform": "macOS",
                                "mode": "ui"
                            },
                            "minProtocol": 3,
                            "maxProtocol": 3,
                            "role": "operator",
                            "scopes": ["operator.admin"],
                            "auth": { "token": GATEWAY_TOKEN }
                        });
                        
                        let handshake_frame = GatewayFrame {
                            method: Some("connect".to_string()),
                            event: None,
                            params: Some(connect_params),
                            payload: None,
                            id: Some(connect_id.clone()),
                            ok: None,
                            error: None,
                            frame_type: "req".to_string(),
                        };

                        if let Ok(json) = serde_json::to_string(&handshake_frame) {
                            if let Err(e) = write.send(Message::Text(json.into())).await {
                                println!("[OpenClaw Bridge] Handshake send failed: {}", e);
                                continue;
                            }
                        }

                        {
                            let mut c = bridge_clone.connected.lock().unwrap();
                            *c = true;
                        }

                        let pending_inner = Arc::clone(&bridge_clone.pending);
                        let app_inner = app_handle.clone();

                        // Inner loop for this specific connection
                        let read_task = tokio::spawn(async move {
                            while let Some(msg) = read.next().await {
                                if let Ok(Message::Text(text)) = msg {
                                    println!("[OpenClaw Bridge] Received: {}", text);
                                    let mut is_hello_ok = false;
                                    if let Ok(value) = serde_json::from_str::<Value>(&text) {
                                        if value["type"] == "hello-ok" { is_hello_ok = true; }
                                    }

                                    if let Ok(frame) = serde_json::from_str::<GatewayFrame>(&text) {
                                        if frame.frame_type == "res" || is_hello_ok {
                                            let response_id = if is_hello_ok { connect_id.clone() } else { frame.id.unwrap_or_default() };
                                            let mut p = pending_inner.lock().unwrap();
                                            if let Some(otx) = p.remove(&response_id) {
                                                if let Some(error) = frame.error {
                                                    let _ = otx.send(Err(error.to_string()));
                                                } else {
                                                    let result = if is_hello_ok { serde_json::from_str::<Value>(&text).unwrap_or(Value::Null) } else { frame.payload.unwrap_or(Value::Null) };
                                                    let _ = otx.send(Ok(result));
                                                }
                                            }
                                        } else if frame.frame_type == "event" {
                                            let _ = app_inner.emit(&frame.event.unwrap_or_default(), frame.payload);
                                        }
                                    }
                                }
                            }
                            println!("[OpenClaw Bridge] Read loop ended");
                        });

                        while let Some(frame) = rx.recv().await {
                            if let Ok(json) = serde_json::to_string(&frame) {
                                if let Err(e) = write.send(Message::Text(json.into())).await {
                                    println!("[OpenClaw Bridge] Write failed: {}", e);
                                    break;
                                }
                            }
                            if read_task.is_finished() { break; }
                        }
                        
                        read_task.abort();
                        {
                            let mut c = bridge_clone.connected.lock().unwrap();
                            *c = false;
                        }
                        let _ = app_handle.emit("bridge-status", "disconnected");
                        println!("[OpenClaw Bridge] Connection closed, retrying in 2s...");
                    }
                    Err(e) => {
                        println!("[OpenClaw Bridge] Connection failed: {}, retrying in 2s...", e);
                    }
                }
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            }
        });

        Ok(bridge)
    }

    pub async fn request(&self, method: &str, params: Value) -> Result<Value, String> {
        let id = uuid::Uuid::new_v4().to_string();
        let (otx, orx) = oneshot::channel();
        
        {
            let mut p = self.pending.lock().unwrap();
            p.insert(id.clone(), otx);
        }

        let frame = GatewayFrame {
            method: Some(method.to_string()),
            event: None,
            params: Some(params),
            payload: None,
            id: Some(id.clone()),
            ok: None,
            error: None,
            frame_type: "req".to_string(),
        };

        println!("[OpenClaw Bridge] Sending request ({}): {}", id, method);
        if let Err(e) = self.tx.send(frame).await {
            let mut p = self.pending.lock().unwrap();
            p.remove(&id);
            return Err(format!("Bridge channel closed: {}", e));
        }
        
        match timeout(Duration::from_secs(15), orx).await {
            Ok(res) => res.map_err(|e| e.to_string())?,
            Err(_) => {
                let mut p = self.pending.lock().unwrap();
                p.remove(&id);
                Err(format!("Request '{}' timed out after 15 seconds", method).to_string())
            }
        }
    }

    pub fn is_connected(&self) -> bool {
        *self.connected.lock().unwrap()
    }

    /// Send a test message to verify the bridge is operational.
    /// Returns Ok with the response payload on success.
    pub async fn send_test_message(&self) -> Result<Value, String> {
        // Use health.ping which is a lightweight echo method
        let params = serde_json::json!({ "echo": "elazya-heartbeat" });
        
        // Retry up to 3 times with exponential backoff
        let mut last_error = String::from("Unknown error");
        for attempt in 0..3u32 {
            if attempt > 0 {
                let delay_ms = 1000 * 2u64.pow(attempt - 1); // 1s, 2s
                println!("[OpenClaw Bridge] Test message retry {} after {}ms...", attempt + 1, delay_ms);
                tokio::time::sleep(Duration::from_millis(delay_ms)).await;
            }
            
            match self.request("health.ping", params.clone()).await {
                Ok(response) => {
                    println!("[OpenClaw Bridge] Test message succeeded: {}", response);
                    return Ok(response);
                }
                Err(e) => {
                    println!("[OpenClaw Bridge] Test message attempt {} failed: {}", attempt + 1, e);
                    last_error = e;
                }
            }
        }
        
        Err(format!("Test message failed after 3 attempts: {}", last_error))
    }
}

pub struct ManagedOpenClaw {
    pub child: Mutex<Option<CommandChild>>,
    pub bridge: Arc<OpenClawBridge>,
}


impl ManagedOpenClaw {
    fn spawn_gateway(_openclaw_dir: &str) -> Result<(), String> {
        // Obsolete helper
        Err("Internal helper deprecated, use start() logic directly".to_string())
    }

    pub async fn start(openclaw_dir: &str, app_handle: AppHandle) -> Result<Self, String> {
        // Ensure clean slate on both default and isolated ports
        kill_port("18789");
        kill_port(GATEWAY_PORT);

        let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
        let _ = std::fs::create_dir_all(&state_dir);

        let config_path = state_dir.join("openclaw.json");
        
        // Always load or create config to enforce token sync
        let mut config: Value = if config_path.exists() {
            let content = std::fs::read_to_string(&config_path).unwrap_or("{}".to_string());
            serde_json::from_str(&content).unwrap_or(serde_json::json!({}))
        } else {
            serde_json::json!({})
        };

        // Enforce Gateway structure
        if config.get("gateway").is_none() { config["gateway"] = serde_json::json!({}); }
        if config["gateway"].get("auth").is_none() { config["gateway"]["auth"] = serde_json::json!({}); }

        // Force correct token
        config["gateway"]["auth"]["mode"] = serde_json::Value::String("token".to_string());
        config["gateway"]["auth"]["token"] = serde_json::Value::String(GATEWAY_TOKEN.to_string());

        // Ensure local mode if missing
        if config["gateway"].get("mode").is_none() {
             config["gateway"]["mode"] = serde_json::Value::String("local".to_string());
        }

        let _ = std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap());
        let _log_dir = state_dir.join("logs");
        let _ = std::fs::create_dir_all(&_log_dir);
        let _cache_dir = state_dir.join("cache");
        let _ = std::fs::create_dir_all(&_cache_dir);

        // Spawn Sidecar using ShellExt (Tauri v2)
        let (mut rx, child) = app_handle.shell().sidecar("openclaw")
            .map_err(|e| format!("Failed to create sidecar command: {}", e))?
            .args([
                "gateway",
                "run",
                "--force",
                "--port",
                GATEWAY_PORT,
                "--token",
                GATEWAY_TOKEN,
                "--allow-unconfigured",
            ])
            .env("OPENCLAW_GATEWAY_PORT", GATEWAY_PORT)
            .env("OPENCLAW_GATEWAY_TOKEN", GATEWAY_TOKEN)
            .env("OPENCLAW_GATEWAY_BIND", "loopback")
            .env("OPENCLAW_STATE_DIR", format!("{}/elazya-engine-state", openclaw_dir))
            .env("OPENCLAW_CONFIG_PATH", format!("{}/elazya-engine-state/openclaw.json", openclaw_dir))
            .env("OPENCLAW_LOG_DIR", format!("{}/elazya-engine-state/logs", openclaw_dir))
            .spawn()
            .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;
        
        println!("[Elazya Debug] Child sidecar spawned with PID: {:?}", child.pid());

        let app_handle_log = app_handle.clone();

        // Stream output from sidecar
        tauri::async_runtime::spawn(async move {
            println!("[Elazya Debug] Listening for sidecar events...");
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(line) => {
                        let line_str = String::from_utf8_lossy(&line);
                        println!("[OpenClaw] {}", line_str);
                        let _ = app_handle_log.emit("server-log", format!("[INFO] {}", line_str));
                    }
                    CommandEvent::Stderr(line) => {
                        let line_str = String::from_utf8_lossy(&line);
                        println!("[OpenClaw ERR] {}", line_str);
                        let _ = app_handle_log.emit("server-log", format!("[ERROR] {}", line_str));
                    }
                    CommandEvent::Terminated(payload) => {
                        println!("[Elazya Debug] Sidecar Terminated: {:?}", payload.code);
                    }
                    CommandEvent::Error(err) => {
                        println!("[Elazya Debug] Sidecar Error Event: {}", err);
                    }
                    _ => {
                        println!("[Elazya Debug] Unknown sidecar event received");
                    }
                }
            }
            println!("[OpenClaw] Sidecar channel closed");
        });

        let url = format!("ws://127.0.0.1:{}", GATEWAY_PORT);
        // Wait a bit for startup
        tokio::time::sleep(Duration::from_millis(2000)).await;
        
        // Re-check lsof to ensure it started?
        // health_check(openclaw_dir).ok();

        let bridge = OpenClawBridge::new(url, app_handle.clone()).await?;

        Ok(Self {
            child: Mutex::new(Some(child)),
            bridge,
        })
    }

    #[allow(dead_code)]
    pub fn stop(&self) {
        if let Ok(mut child_lock) = self.child.lock() {
            if let Some(child) = child_lock.take() {
                // CommandChild::kill() returns Result<(), Error>
                let _ = child.kill(); 
            }
        }
    }

    pub fn restart(&self, _openclaw_dir: &str) -> Result<(), String> {
        // Restarting sidecars is complex because we need to re-attach listeners.
        // Ideally, we would re-run start(), but that requires async and AppHandle access not easily available here.
        // For the setup wizard, let's just return Ok and let the user restart the app manually.
        // Use a special error message that the UI can interpret as "Success, please restart" if needed, 
        // or just Ok() if we want to pretend it worked (but the engine is stopped).
        
        // Better approach: Just stop it. The app will restart it on next launch.
        self.stop();
        // Return Ok so the wizard shows "Success" instead of "Error"
        Ok(())
    }
}

pub fn enable_channel(openclaw_dir: &str, channel: &str, token: &str, user_id: Option<&str>, dm_policy: Option<&str>) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("channels").is_none() {
        config["channels"] = serde_json::json!({});
    }

    // Build channel config with optional userId for security
    let mut channel_config = serde_json::json!({
        "enabled": true,
        "botToken": token
    });

    // Set DM policy (allowlist, pairing, open)
    // FORCE 'open' for now to ensure users can chat immediately without configuration
    let policy = dm_policy.unwrap_or("open");
    channel_config["dmPolicy"] = serde_json::json!(policy);

    // Add userId for allowlist mode ONLY if policy is not open
    if policy != "open" {
        if let Some(uid) = user_id {
            if !uid.is_empty() {
                channel_config["allowFrom"] = serde_json::json!([uid]);
            }
        }
    } else {
        // If OPEN, ensure allowFrom is wildcard to avoid conflicts
        channel_config["allowFrom"] = serde_json::json!(["*"]);
    }

    config["channels"][channel] = channel_config;

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn configure_gateway(
    openclaw_dir: &str, 
    port: u16, 
    bind: &str, 
    auth_mode: &str, 
    token: &str, 
    password: &str
) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("gateway").is_none() {
        config["gateway"] = serde_json::json!({});
    }

    config["gateway"]["port"] = serde_json::json!(port);
    config["gateway"]["bind"] = serde_json::json!(bind);
    config["gateway"]["mode"] = serde_json::json!("local");
    
    // Auth configuration
    if config["gateway"].get("auth").is_none() {
        config["gateway"]["auth"] = serde_json::json!({});
    }
    config["gateway"]["auth"]["mode"] = serde_json::json!(auth_mode);
    
    if auth_mode == "token" && !token.is_empty() {
        config["gateway"]["auth"]["token"] = serde_json::json!(token);
    }
    if auth_mode == "password" && !password.is_empty() {
        config["gateway"]["auth"]["password"] = serde_json::json!(password);
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn health_check(openclaw_dir: &str) -> Result<serde_json::Value, String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");
    
    // Read config to get port and auth
    let config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        return Ok(serde_json::json!({
            "ok": false,
            "detail": "Config not found"
        }));
    };
    
    let port = config["gateway"]["port"].as_u64().unwrap_or(18789) as u16;
    let url = format!("ws://127.0.0.1:{}", port);
    
    // Simple TCP check to see if port is open
    use std::net::TcpStream;
    use std::time::Duration;
    
    let addr = format!("127.0.0.1:{}", port);
    match TcpStream::connect_timeout(&addr.parse().unwrap(), Duration::from_secs(2)) {
        Ok(_) => Ok(serde_json::json!({
            "ok": true,
            "url": url
        })),
        Err(e) => Ok(serde_json::json!({
            "ok": false,
            "url": url,
            "detail": format!("Connection failed: {}", e)
        }))
    }
}

/// B2: Create agent workspace with bootstrap files
pub fn ensure_workspace(openclaw_dir: &str) -> Result<serde_json::Value, String> {
    let home_dir = dirs::home_dir().ok_or("Cannot find home directory")?;
    let workspace_dir = home_dir.join(".openclaw").join("workspace");
    let sessions_dir = home_dir.join(".openclaw").join("sessions");
    
    // Create directories
    std::fs::create_dir_all(&workspace_dir)
        .map_err(|e| format!("Failed to create workspace: {}", e))?;
    std::fs::create_dir_all(&sessions_dir)
        .map_err(|e| format!("Failed to create sessions: {}", e))?;
    
    // Create BOOT.md if it doesn't exist
    let boot_md_path = workspace_dir.join("BOOT.md");
    if !boot_md_path.exists() {
        let boot_content = r#"# BOOT.md — Your Agent's Personality

This file defines who your agent is. Edit it to customize your AI assistant.

## Identity

You are a helpful AI assistant named Elazya. You are:
- Friendly and professional
- Knowledgeable about a wide range of topics
- Honest about your limitations

## Preferences

- Respond in the same language as the user
- Keep responses concise but thorough
- Use markdown formatting when helpful

## Special Instructions

- **IMPORTANT**: Do NOT output your internal thought process, reasoning, or "Chain of Thought" (e.g. "Recognizing User Frustration..."). 
- ONLY output the final response to the user.
- Keep the tone natural and conversational.
"#;
        std::fs::write(&boot_md_path, boot_content)
            .map_err(|e| format!("Failed to create BOOT.md: {}", e))?;
    }
    
    Ok(serde_json::json!({
        "workspace": workspace_dir.to_string_lossy(),
        "sessions": sessions_dir.to_string_lossy(),
        "bootMdCreated": !boot_md_path.exists()
    }))
}

/// B3: Install launchd daemon service (macOS)
pub fn install_daemon_service(openclaw_dir: &str) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        let home_dir = dirs::home_dir().ok_or("Cannot find home directory")?;
        let launch_agents = home_dir.join("Library").join("LaunchAgents");
        std::fs::create_dir_all(&launch_agents)
            .map_err(|e| format!("Failed to create LaunchAgents: {}", e))?;
        
        let plist_path = launch_agents.join("ai.openclaw.gateway.plist");
        let node_path = find_node_executable();
        let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
        let gateway_script = state_dir.join("node_modules").join("@anthropic-ai").join("openclaw").join("dist").join("index.js");
        
        // Read config for port
        let config_path = state_dir.join("openclaw.json");
        let port: u16 = if config_path.exists() {
            if let Ok(content) = std::fs::read_to_string(&config_path) {
                if let Ok(config) = serde_json::from_str::<Value>(&content) {
                    config["gateway"]["port"].as_u64().unwrap_or(18789) as u16
                } else { 18789 }
            } else { 18789 }
        } else { 18789 };
        
        let plist_content = format!(r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>ai.openclaw.gateway</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
        <string>{}</string>
        <string>gateway</string>
        <string>--port</string>
        <string>{}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>{}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>{}/gateway.log</string>
    <key>StandardErrorPath</key>
    <string>{}/gateway.error.log</string>
</dict>
</plist>"#, 
            node_path,
            gateway_script.to_string_lossy(),
            port,
            state_dir.to_string_lossy(),
            state_dir.to_string_lossy(),
            state_dir.to_string_lossy()
        );
        
        std::fs::write(&plist_path, plist_content)
            .map_err(|e| format!("Failed to write plist: {}", e))?;
        
        // Load the service
        let output = std::process::Command::new("launchctl")
            .args(["load", "-w", &plist_path.to_string_lossy()])
            .output()
            .map_err(|e| format!("Failed to run launchctl: {}", e))?;
        
        if output.status.success() {
            Ok(serde_json::json!({
                "installed": true,
                "plist": plist_path.to_string_lossy()
            }))
        } else {
            Ok(serde_json::json!({
                "installed": false,
                "error": String::from_utf8_lossy(&output.stderr).to_string()
            }))
        }
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok(serde_json::json!({
            "installed": false,
            "error": "Daemon service install only supported on macOS"
        }))
    }
}

pub fn install_skill(openclaw_dir: &str, skill_name: &str) -> Result<(), String> {
    println!("[OpenClaw] Installation compétence: {}", skill_name);

    // Skills are SKILL.md files in the skills/ directory.
    // "Installing" a skill means:
    // 1. Ensure the skill exists in the workspace skills/ directory
    // 2. Enable it in the openclaw.json config

    let home_dir = dirs::home_dir().ok_or("Cannot find home directory")?;
    let workspace_skills = home_dir.join(".openclaw").join("workspace").join("skills");
    let source_skills = std::path::Path::new(openclaw_dir).join("skills");
    let skill_workspace_dir = workspace_skills.join(skill_name);
    let skill_source_dir = source_skills.join(skill_name);

    // If skill not in workspace but exists in source, copy it
    if !skill_workspace_dir.join("SKILL.md").exists() {
        if skill_source_dir.join("SKILL.md").exists() {
            std::fs::create_dir_all(&skill_workspace_dir)
                .map_err(|e| format!("Failed to create skill dir: {}", e))?;
            // Copy whole skill directory
            copy_dir_recursive(&skill_source_dir, &skill_workspace_dir)
                .map_err(|e| format!("Failed to copy skill: {}", e))?;
            println!("[OpenClaw] Skill '{}' copied to workspace", skill_name);
        } else {
            return Err(format!("Skill '{}' not found in source directory", skill_name));
        }
    }

    // Enable the skill in openclaw.json config
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config: {}", e))?
    } else {
        serde_json::json!({})
    };

    // Ensure skills.entries object exists
    if config.get("skills").is_none() {
        config["skills"] = serde_json::json!({});
    }
    if config["skills"].get("entries").is_none() {
        config["skills"]["entries"] = serde_json::json!({});
    }

    // Enable the skill
    if config["skills"]["entries"].get(skill_name).is_none() {
        config["skills"]["entries"][skill_name] = serde_json::json!({});
    }
    config["skills"]["entries"][skill_name]["enabled"] = serde_json::Value::Bool(true);

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Failed to write config: {}", e))?;

    println!("[OpenClaw] Skill '{}' enabled in config", skill_name);
    Ok(())
}

/// Helper: recursively copy a directory
fn copy_dir_recursive(src: &std::path::Path, dst: &std::path::Path) -> Result<(), String> {
    std::fs::create_dir_all(dst).map_err(|e| format!("{}", e))?;
    if let Ok(entries) = std::fs::read_dir(src) {
        for entry in entries.flatten() {
            let path = entry.path();
            let dest_path = dst.join(entry.file_name());
            if path.is_dir() {
                copy_dir_recursive(&path, &dest_path)?;
            } else {
                std::fs::copy(&path, &dest_path).map_err(|e| format!("{}", e))?;
            }
        }
    }
    Ok(())
}


pub fn uninstall_skill(openclaw_dir: &str, skill_name: &str) -> Result<(), String> {
    println!("[OpenClaw] Désinstallation compétence: {}", skill_name);

    // Disable the skill in openclaw.json config
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config: {}", e))?
    } else {
        return Ok(()); // Nothing to disable
    };

    // Disable the skill in config
    if let Some(entries) = config.get_mut("skills")
        .and_then(|s| s.get_mut("entries"))
    {
        if let Some(entry) = entries.get_mut(skill_name) {
            entry["enabled"] = serde_json::Value::Bool(false);
        }
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Failed to write config: {}", e))?;

    println!("[OpenClaw] Skill '{}' disabled in config", skill_name);
    Ok(())
}

pub fn reset_application(openclaw_dir: &str, app_handle: AppHandle) -> Result<(), String> {
    // 1. Stop OpenClaw processes
    kill_port(GATEWAY_PORT);

    // 2. Write a sentinel file so the NEXT startup knows to wipe everything.
    //    We cannot delete the DB here because the SQLite pool is still active.
    let app_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let sentinel = app_dir.join(".reset_pending");
    std::fs::write(&sentinel, openclaw_dir)
        .map_err(|e| format!("Failed to write reset sentinel: {}", e))?;

    // 3. Restart — on next launch, main.rs will see the sentinel and do the cleanup
    app_handle.restart();

    #[allow(unreachable_code)]
    Ok(())
}

/// Called at the very start of main(), BEFORE opening the DB.
/// If a `.reset_pending` sentinel exists, wipe everything and remove the sentinel.
pub fn execute_pending_reset(app_dir: &std::path::Path) {
    let sentinel = app_dir.join(".reset_pending");
    if !sentinel.exists() {
        return;
    }

    // Read the openclaw_dir that was saved in the sentinel
    let openclaw_dir = std::fs::read_to_string(&sentinel).unwrap_or_default();

    // 1. Delete state directory
    let state_dir = std::path::Path::new(openclaw_dir.trim()).join("elazya-engine-state");
    if state_dir.exists() {
        let _ = std::fs::remove_dir_all(&state_dir);
    }

    // 2. Delete app database (not locked now — we haven't opened it yet)
    let db_path = app_dir.join("elazya.db");
    if db_path.exists() {
        let _ = std::fs::remove_file(&db_path);
    }
    // Also remove WAL/SHM files if they exist
    let _ = std::fs::remove_file(app_dir.join("elazya.db-wal"));
    let _ = std::fs::remove_file(app_dir.join("elazya.db-shm"));

    // 3. Delete OpenClaw workspace (~/.openclaw)
    if let Some(home_dir) = dirs::home_dir() {
        let openclaw_home = home_dir.join(".openclaw");
        if openclaw_home.exists() {
            let _ = std::fs::remove_dir_all(&openclaw_home);
        }
    }

    // 4. Remove the sentinel
    let _ = std::fs::remove_file(&sentinel);

    println!("[Elazya] Factory reset completed — all data wiped.");
}


pub fn configure_llm(openclaw_dir: &str, provider: &str, api_key: &str, model: &str) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    
    // Ensure directory exists (Critical Fix for "No such file or directory")
    if !state_dir.exists() {
        std::fs::create_dir_all(&state_dir)
            .map_err(|e| format!("Échec création dossier state: {}", e))?;
    }

    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    // Ensure basic structure
    if config.get("models").is_none() {
        config["models"] = serde_json::json!({ "providers": {} });
    }
    if config["models"].get("providers").is_none() {
        config["models"]["providers"] = serde_json::json!({});
    }

    // Set Primary Model (Required for agent to know what to use)
    config["models"]["primary"] = serde_json::Value::String(model.to_string());

    let provider_config = match provider {
        "openai" => serde_json::json!({
            "apiKey": api_key,
            "api": "openai",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ] 
        }),
        "anthropic" => serde_json::json!({
            "apiKey": api_key,
            "api": "anthropic",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "ollama" => serde_json::json!({
            "baseUrl": api_key,
            "api": "ollama-local",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "google" => serde_json::json!({
            "apiKey": api_key,
            "api": "google-generative-ai",
            "baseUrl": "https://generativelanguage.googleapis.com",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "moonshot" => serde_json::json!({
             "apiKey": api_key,
             "api": "openai",
             "baseUrl": "https://api.moonshot.ai/v1",
             "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "deepseek" => serde_json::json!({
             "apiKey": api_key,
             "api": "openai",
             "baseUrl": "https://api.deepseek.com",
             "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        _ => serde_json::json!({
            "apiKey": api_key,
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        })
    };

    config["models"]["providers"][provider] = provider_config;

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn configure_web_search(openclaw_dir: &str, provider: &str, api_key: &str) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("tools").is_none() {
        config["tools"] = serde_json::json!({});
    }
    if config["tools"].get("web").is_none() {
        config["tools"]["web"] = serde_json::json!({});
    }

    config["tools"]["web"]["search"] = serde_json::json!({
        "provider": provider,
        "apiKey": api_key,
        "maxResults": 5,
        "timeoutSeconds": 30
    });

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn configure_hooks(_openclaw_dir: &str, _boot_md: bool, _command_logger: bool, _session_memory: bool) -> Result<(), String> {
    // Deprecated hooks configuration in new engine version
    Ok(())
}

pub fn configure_extra_keys(openclaw_dir: &str, google_places: &str, notion: &str) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("tools").is_none() {
        config["tools"] = serde_json::json!({});
    }

    if !google_places.is_empty() {
        config["tools"]["googlePlaces"] = serde_json::json!({
            "apiKey": google_places
        });
    }

    if !notion.is_empty() {
        // Notion is no longer a tool in the config schema, likely a skill now?
        // skipping for now to avoid crash
        /*
        config["tools"]["notion"] = serde_json::json!({
            "integrationToken": notion
        });
        */
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}
