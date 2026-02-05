use sqlx::sqlite::SqlitePool;
use sqlx::sqlite::SqlitePoolOptions;
use std::fs;
use tauri::{Manager, State};
use std::sync::Arc;
use serde_json::Value;

mod openclaw;
mod openclaw_monitor;

use openclaw::ManagedOpenClaw;
use openclaw_monitor::{get_token_usage, get_connected_channels, get_installed_skills, watch_token_usage, TokenUsage, ChannelInfo};

// Application State
struct AppState {
    db: SqlitePool,
    openclaw: Arc<ManagedOpenClaw>,
    openclaw_dir: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Bonjour, {}! Elazya running on Rust backend.", name)
}

#[tauri::command]
async fn is_setup_complete(state: State<'_, AppState>) -> Result<bool, String> {
    let has_keys = sqlx::query_as::<_, (String,)>("SELECT key FROM settings WHERE key LIKE '%_api_key' AND value != 'placeholder'")
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(!has_keys.is_empty())
}

#[tauri::command]
async fn get_setting(state: State<'_, AppState>, key: String) -> Result<Option<String>, String> {
    let res = sqlx::query_as::<_, (String,)>("SELECT value FROM settings WHERE key = ?")
        .bind(key)
        .fetch_optional(&state.db)
        .await
        .map(|o| o.map(|r| r.0))
        .map_err(|e| e.to_string())?;
    Ok(res)
}

#[tauri::command]
async fn set_setting(state: State<'_, AppState>, key: String, value: String) -> Result<(), String> {
    sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
        .bind(key)
        .bind(value)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn openclaw_request(
    state: State<'_, AppState>,
    method: String,
    params: Value
) -> Result<Value, String> {
    println!("[OpenClaw Request] Method: {}, Params: {}", method, params);
    let res = state.openclaw.bridge.request(&method, params).await;
    match &res {
        Ok(val) => println!("[OpenClaw Response] Success: {}", val),
        Err(e) => println!("[OpenClaw Response] Error: {}", e),
    }
    res
}

#[tauri::command]
async fn openclaw_send_message(
    state: State<'_, AppState>,
    session_key: String,
    message: String,
) -> Result<Value, String> {
    let params = serde_json::json!({
        "sessionKey": session_key,
        "message": message,
        "idempotencyKey": uuid::Uuid::new_v4().to_string(),
    });
    state.openclaw.bridge.request("chat.send", params).await
}

#[derive(serde::Serialize)]
struct RequirementsStatus {
    node_version: Option<String>,
    node_ok: bool,
    openclaw_installed: bool,
    error: Option<String>,
}

#[tauri::command]
async fn check_requirements() -> Result<RequirementsStatus, String> {
    let node_res = openclaw::check_node_version();
    let openclaw_ok = openclaw::check_openclaw_installed();
    
    let (node_version, node_ok, error) = match node_res {
        Ok(v) => (Some(v), true, None),
        Err(e) => (None, false, Some(e)),
    };

    Ok(RequirementsStatus {
        node_version,
        node_ok,
        openclaw_installed: openclaw_ok,
        error,
    })
}

#[tauri::command]
async fn install_openclaw() -> Result<(), String> {
    openclaw::install_openclaw_cli()
}

#[tauri::command]
async fn get_usage_stats(state: State<'_, AppState>) -> Result<TokenUsage, String> {
    // Call usage.cost via bridge
    let params = serde_json::json!({ "days": 30 });
    let res = state.openclaw.bridge.request("usage.cost", params).await
        .map_err(|e| format!("Bridge error: {}", e))?;

    // Parse response
    let totals = res.get("totals").ok_or("No totals in response")?;
    let daily = res.get("daily").and_then(|v| v.as_array());

    // Helper to map JSON to UsageStats
    fn map_stats(val: &Value) -> openclaw_monitor::UsageStats {
        openclaw_monitor::UsageStats {
            input: val.get("input").and_then(|v| v.as_u64()).unwrap_or(0),
            output: val.get("output").and_then(|v| v.as_u64()).unwrap_or(0),
            total: val.get("totalTokens").and_then(|v| v.as_u64()).unwrap_or(0),
        }
    }

    let monthly = map_stats(totals);

    // Use current day as session approximation
    let session = if let Some(d) = daily {
        if let Some(last) = d.last() {
             map_stats(last)
        } else {
            openclaw_monitor::UsageStats::default()
        }
    } else {
        openclaw_monitor::UsageStats::default()
    };

    Ok(TokenUsage {
        session,
        monthly,
    })
}

#[tauri::command]
async fn get_channels(state: State<'_, AppState>) -> Result<Vec<ChannelInfo>, String> {
    // Also use bridge if possible, but fallback to file scan for now
    Ok(get_connected_channels(&state.openclaw_dir))
}

#[tauri::command]
async fn get_skills(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    Ok(get_installed_skills(&state.openclaw_dir))
}

#[tauri::command]
async fn enable_channel(state: State<'_, AppState>, channel: String, token: String, user_id: Option<String>, dm_policy: Option<String>) -> Result<(), String> {
    openclaw::enable_channel(&state.openclaw_dir, &channel, &token, user_id.as_deref(), dm_policy.as_deref())
}

#[tauri::command]
async fn configure_hooks_cmd(state: State<'_, AppState>, boot_md: bool, command_logger: bool, session_memory: bool) -> Result<(), String> {
    openclaw::configure_hooks(&state.openclaw_dir, boot_md, command_logger, session_memory)
}

#[tauri::command]
async fn configure_extra_keys_cmd(state: State<'_, AppState>, google_places: String, notion: String) -> Result<(), String> {
    openclaw::configure_extra_keys(&state.openclaw_dir, &google_places, &notion)
}

#[tauri::command]
async fn install_skill_cmd(state: State<'_, AppState>, skill: String) -> Result<(), String> {
    openclaw::install_skill(&state.openclaw_dir, &skill)
}

#[tauri::command]
async fn configure_llm_cmd(state: State<'_, AppState>, provider: String, api_key: String, model: String) -> Result<(), String> {
    openclaw::configure_llm(&state.openclaw_dir, &provider, &api_key, &model)
}

#[tauri::command]
async fn list_models_cmd(_provider: String, _api_key: String) -> Result<Vec<String>, String> {
    // B1: For now, return empty array - dynamic model fetching would require HTTP client
    // In production, this would call provider APIs to fetch available models
    Ok(vec![])
}

#[tauri::command]
async fn configure_web_search_cmd(state: State<'_, AppState>, provider: String, api_key: String) -> Result<(), String> {
    openclaw::configure_web_search(&state.openclaw_dir, &provider, &api_key)
}

#[tauri::command]
async fn configure_gateway_cmd(
    state: State<'_, AppState>, 
    port: u16, 
    bind: String, 
    auth_mode: String, 
    token: String, 
    password: String
) -> Result<(), String> {
    openclaw::configure_gateway(&state.openclaw_dir, port, &bind, &auth_mode, &token, &password)
}

#[tauri::command]
async fn health_check_cmd(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    openclaw::health_check(&state.openclaw_dir)
}

#[tauri::command]
async fn ensure_workspace_cmd(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    openclaw::ensure_workspace(&state.openclaw_dir)
}

#[tauri::command]
async fn install_daemon_service_cmd(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    openclaw::install_daemon_service(&state.openclaw_dir)
}

#[tauri::command]
async fn restart_openclaw(state: State<'_, AppState>) -> Result<(), String> {
    state.openclaw.restart(&state.openclaw_dir)
}

#[tauri::command]
async fn is_bridge_connected(state: State<'_, AppState>) -> Result<bool, String> {
    Ok(state.openclaw.bridge.is_connected())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let app_handle = app.handle();
            
            // 1. Database Setup
            let app_dir = app_handle.path().app_data_dir()
                .map_err(|e| format!("Failed to get app data dir: {}", e))?;
            
            if !app_dir.exists() {
                fs::create_dir_all(&app_dir)
                    .map_err(|e| format!("Failed to create app data dir: {}", e))?;
            }
            
            let db_path = app_dir.join("elazya.db");
            let db_url = format!("sqlite://{}", db_path.to_string_lossy());
            
            if !db_path.exists() { 
                fs::File::create(&db_path)
                    .map_err(|e| format!("Failed to create db file: {}", e))?;
            }

            let pool = match tauri::async_runtime::block_on(async {
                let pool = SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(&db_url)
                    .await
                    .map_err(|e| format!("Failed to connect to SQLite: {}", e))?;
                
                sqlx::query(include_str!("../migrations/202601300001_init.sql"))
                    .execute(&pool)
                    .await
                    .map_err(|e| format!("Failed to run migration 1: {}", e))?;

                sqlx::query(include_str!("../migrations/202601300002_settings.sql"))
                    .execute(&pool)
                    .await
                    .map_err(|e| format!("Failed to run migration 2: {}", e))?;
                
                Ok::<SqlitePool, String>(pool)
            }) {
                Ok(p) => p,
                Err(e) => return Err(e.into()),
            };

            // 2. OpenClaw Setup
            let openclaw_dir = std::env::var("OPENCLAW_DIR")
                .unwrap_or_else(|_| "/Users/sashimi/Documents/Elazya_Projects/openclaw-main".to_string());
            
            if !std::path::Path::new(&openclaw_dir).exists() {
                return Err(format!("OpenClaw directory not found at: {}. Please set OPENCLAW_DIR environment variable.", openclaw_dir).into());
            }

            let app_handle_clone = app_handle.clone();
            let openclaw = tauri::async_runtime::block_on(async {
                ManagedOpenClaw::start(&openclaw_dir, app_handle_clone).await
            }).map_err(|e| format!("OpenClaw Engine failed to start (dir: {}): {}", openclaw_dir, e))?;

            let app_handle_clone_for_watch = app_handle.clone();
             let openclaw_dir_clone = openclaw_dir.clone();
             watch_token_usage(app_handle_clone_for_watch, openclaw_dir_clone);

            // 3. Manage State
            app.manage(AppState { 
                db: pool, 
                openclaw: Arc::new(openclaw),
                openclaw_dir
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_setting,
            set_setting,
            is_setup_complete,
            is_bridge_connected,
            openclaw_request,
            openclaw_send_message,
            check_requirements,
            install_openclaw,
            get_usage_stats,
            get_channels,
            get_skills,
            enable_channel,
            install_skill_cmd,
            configure_llm_cmd,
            list_models_cmd,
            configure_web_search_cmd,
            configure_hooks_cmd,
            configure_extra_keys_cmd,
            configure_gateway_cmd,
            health_check_cmd,
            ensure_workspace_cmd,
            install_daemon_service_cmd,
            restart_openclaw
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
