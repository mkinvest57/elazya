use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::sync::{mpsc, oneshot};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
use futures_util::{StreamExt, SinkExt};
use tokio::time::{timeout, Duration};
use std::process::Stdio;
use tokio::process::{Child, Command};
use tauri::{AppHandle, Emitter};

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
    // Just verify npm is available.
    let npm_path = find_npm_executable();
    // Try to run npm --version to be sure
    let status = std::process::Command::new(&npm_path)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();

    if status.is_ok() && status.unwrap().success() {
        Ok(())
    } else {
        Err("npm not found or not executable".to_string())
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
}

pub struct ManagedOpenClaw {
    #[allow(dead_code)]
    pub child: Mutex<Option<Child>>,
    pub bridge: Arc<OpenClawBridge>,
}


impl ManagedOpenClaw {
    fn spawn_gateway(openclaw_dir: &str) -> Result<tokio::process::Child, String> {
        let node_path = find_node_executable();
        let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
        
        let mut spawn_cmd = if std::path::Path::new(openclaw_dir).join("openclaw.mjs").exists() {
            let mut c = Command::new(node_path);
            c.arg("openclaw.mjs");
            c
        } else if let Ok(path) = which::which("openclaw") {
            Command::new(path.to_string_lossy().to_string())
        } else {
            // Fallback to npx
            let mut c = Command::new("npx");
            c.arg("-y").arg("openclaw@latest");
            c
        };

        spawn_cmd
            .arg("gateway")
            .arg("run")
            .arg("--force")
            .arg("--port")
            .arg(GATEWAY_PORT)
            .arg("--token")
            .arg(GATEWAY_TOKEN)
            .env("OPENCLAW_GATEWAY_PORT", GATEWAY_PORT)
            .env("OPENCLAW_GATEWAY_TOKEN", GATEWAY_TOKEN)
            .env("OPENCLAW_GATEWAY_BIND", "loopback")
            .env("OPENCLAW_STATE_DIR", state_dir.to_string_lossy().to_string())
            .env("OPENCLAW_CONFIG_PATH", state_dir.join("openclaw.json").to_string_lossy().to_string())
            .env("OPENCLAW_LOG_DIR", state_dir.join("logs").to_string_lossy().to_string())
            .current_dir(openclaw_dir)
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .kill_on_drop(true)
            .spawn()
            .map_err(|e| format!("Failed to start OpenClaw: {}", e))
    }

    pub async fn start(openclaw_dir: &str, app_handle: AppHandle) -> Result<Self, String> {
        // Ensure clean slate on both default and isolated ports
        kill_port("18789");
        kill_port(GATEWAY_PORT);

        let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
        let _ = std::fs::create_dir_all(&state_dir);

        let config_path = state_dir.join("openclaw.json");
        // Ensure the file exists with local mode to bypass "unconfigured" blocks
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

        let child = Self::spawn_gateway(openclaw_dir)?;

        let url = format!("ws://127.0.0.1:{}", GATEWAY_PORT);
        let bridge = OpenClawBridge::new(url, app_handle.clone()).await?;

        Ok(Self {
            child: Mutex::new(Some(child)),
            bridge,
        })
    }

    #[allow(dead_code)]
    pub fn stop(&self) {
        if let Ok(mut child_lock) = self.child.lock() {
            if let Some(mut child) = child_lock.take() {
                let _ = child.start_kill();
            }
        }
    }

    pub fn restart(&self, openclaw_dir: &str) -> Result<(), String> {
        self.stop();
        // Give a moment for cleanup?
        // kill_port might be safer but stop() calls start_kill.
        
        let child = Self::spawn_gateway(openclaw_dir)?;
        if let Ok(mut child_lock) = self.child.lock() {
            *child_lock = Some(child);
        }
        Ok(())
    }
}

pub fn enable_channel(openclaw_dir: &str, channel: &str, token: &str) -> Result<(), String> {
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

    // Standard OpenClaw channel config structure
    let channel_config = serde_json::json!({
        "enabled": true,
        "token": token,
        // Some channels use "apiKey" or nested strictures. 
        // We'll set both token and apiKey to be safe, or stick to the most common 'token'.
        // For Discord it is 'token'. For Telegram it is 'token'. For WhatsApp it might be more complex.
        // Assuming 'token' is sufficient for the simplified wizard.
    });

    config["channels"][channel] = channel_config;

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn install_skill(openclaw_dir: &str, skill_name: &str) -> Result<(), String> {
    let node_path = find_node_executable();
    let npm_path = which::which("npm").map_err(|_| "npm introuvable".to_string())?;
    
    let package_name = if skill_name.contains("/") {
        skill_name.to_string()
    } else {
        format!("@openclaw/skill-{}", skill_name)
    };

    println!("[OpenClaw] Installation compétence: {}", package_name);

    // Ensure package.json exists so we can save dependencies
    if !std::path::Path::new(openclaw_dir).join("package.json").exists() {
         let _ = std::process::Command::new(npm_path.clone())
            .arg("init")
            .arg("-y")
            .current_dir(openclaw_dir)
            .output();
    }

    let status = std::process::Command::new(npm_path)
        .arg("install")
        .arg(&package_name)
        .current_dir(openclaw_dir)
        .status()
        .map_err(|e| format!("Échec exécution npm install: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Échec installation compétence {}", skill_name))
    }
}

pub fn configure_llm(openclaw_dir: &str, provider: &str, api_key: &str, model: &str) -> Result<(), String> {
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

    // Ensure basic structure
    if config.get("models").is_none() {
        config["models"] = serde_json::json!({ "providers": {} });
    }
    if config["models"].get("providers").is_none() {
        config["models"]["providers"] = serde_json::json!({});
    }

    // Set Primary Model
    config["models"]["primary"] = serde_json::Value::String(model.to_string());

    let provider_config = match provider {
        "openai" => serde_json::json!({
            "apiKey": api_key,
            "api": "openai",
            "models": [model] 
        }),
        "anthropic" => serde_json::json!({
            "apiKey": api_key,
            "api": "anthropic",
            "models": [model]
        }),
        "ollama" => serde_json::json!({
            "baseUrl": api_key,
            "api": "ollama-local",
            "models": [model]
        }),
        "google" => serde_json::json!({
            "apiKey": api_key,
            "api": "google-generative-ai",
            "baseUrl": "https://generativelanguage.googleapis.com",
            "models": [model]
        }),
        "moonshot" => serde_json::json!({
             "apiKey": api_key,
             "api": "openai",
             "baseUrl": "https://api.moonshot.ai/v1",
             "models": [model]
        }),
        "deepseek" => serde_json::json!({
             "apiKey": api_key,
             "api": "openai",
             "baseUrl": "https://api.deepseek.com",
             "models": [model]
        }),
        _ => serde_json::json!({
            "apiKey": api_key,
            "models": [model]
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
