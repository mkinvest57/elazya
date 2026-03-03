use sqlx::sqlite::SqlitePool;
use sqlx::sqlite::SqlitePoolOptions;
use std::fs;
use tauri::{Emitter, Listener, Manager, State};
use std::sync::Arc;
use serde_json::Value;
use sqlx::Row;
use tauri_plugin_cli::CliExt;

mod openclaw;
mod openclaw_monitor;
mod openclaw_client;
mod agent_base;
mod apple_mail;
mod agent_facturation;
mod agent_onboarding;
mod agent_linkedin;
mod agent_qualification;
mod agent_routine;
mod agent_crm_prospect;
mod agent_devis;
mod agent_email;
mod agent_compta;
mod agent_content;
mod agents;
mod agent_engine;

use openclaw::ManagedOpenClaw;
use openclaw_monitor::{get_connected_channels, get_installed_skills, watch_token_usage, TokenUsage, ChannelInfo};
use agent_facturation::FacturationWatcher;
use agent_onboarding::OnboardingWatcher;
use agent_linkedin::LinkedInWatcher;
use agent_qualification::QualificationWatcher;
use agent_routine::RoutineWatcher;
use agent_crm_prospect::CrmWatcher;
use agent_devis::DevisWatcher;
use agent_email::EmailWatcher;
use agent_compta::ComptaWatcher;
use agent_content::ContentWatcher;
use openclaw_client::OpenClawAgentClient;
use agent_engine::AgentEngine;

// Application State
struct AppState {
    db: SqlitePool,
    openclaw: Arc<ManagedOpenClaw>,
    openclaw_dir: String,
    facturation_watcher: Arc<FacturationWatcher>,
    onboarding_watcher: Arc<OnboardingWatcher>,
    linkedin_watcher: Arc<LinkedInWatcher>,
    qualification_watcher: Arc<QualificationWatcher>,
    routine_watcher: Arc<RoutineWatcher>,
    crm_watcher: Arc<CrmWatcher>,
    devis_watcher: Arc<DevisWatcher>,
    email_watcher: Arc<EmailWatcher>,
    compta_watcher: Arc<ComptaWatcher>,
    content_watcher: Arc<ContentWatcher>,
    engine: Arc<AgentEngine>,
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
    println!("[Elazya] get_usage_stats called");
    // Call usage.cost via bridge
    let params = serde_json::json!({ "days": 30 });
    let res_result = state.openclaw.bridge.request("usage.cost", params).await;
    
    match &res_result {
        Ok(r) => println!("[Elazya] get_usage_stats bridge response: {:?}", r),
        Err(e) => println!("[Elazya] get_usage_stats bridge error: {:?}", e),
    }

    let res = res_result.map_err(|e| format!("Bridge error: {}", e))?;

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
async fn uninstall_skill_cmd(state: State<'_, AppState>, skill: String) -> Result<(), String> {
    openclaw::uninstall_skill(&state.openclaw_dir, &skill)
}

#[tauri::command]
async fn reset_app_cmd(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    // Stop engine first
    state.openclaw.stop();
    openclaw::reset_application(&state.openclaw_dir, app)
}

/// Handle deep link URL from Stripe upgrade flow.
/// URL format: elazya://upgrade-success?plan=pro&session=cs_xxx
#[tauri::command]
async fn handle_deep_link(app: tauri::AppHandle, url: String) -> Result<(), String> {
    println!("[DeepLink] Received: {}", url);

    if url.contains("upgrade-success") {
        let parsed = url::Url::parse(&url)
            .map_err(|e| format!("Failed to parse deep link URL: {}", e))?;

        let plan = parsed.query_pairs()
            .find(|(k, _)| k == "plan")
            .map(|(_, v)| v.to_string())
            .unwrap_or_else(|| "solo".to_string());

        let session = parsed.query_pairs()
            .find(|(k, _)| k == "session")
            .map(|(_, v)| v.to_string())
            .unwrap_or_default();

        handle_upgrade_success(app, plan, session).await?;
    } else if url.contains("upgrade-cancelled") {
        println!("[DeepLink] Upgrade cancelled by user");
    }

    Ok(())
}

/// Update the license after a successful Stripe upgrade.
/// Writes to ~/.elazya/license.json and emits event to reload UI.
#[tauri::command]
async fn handle_upgrade_success(app: tauri::AppHandle, plan: String, session_id: String) -> Result<(), String> {
    println!("[Upgrade] Processing upgrade to plan: {} (session: {})", plan, session_id);

    // 1. Ensure ~/.elazya directory exists
    let home = dirs::home_dir()
        .ok_or_else(|| "Could not determine home directory".to_string())?;
    let elazya_dir = home.join(".elazya");
    if !elazya_dir.exists() {
        fs::create_dir_all(&elazya_dir)
            .map_err(|e| format!("Failed to create ~/.elazya: {}", e))?;
    }

    // 2. Build plan code for license key
    let plan_code = match plan.to_lowercase().as_str() {
        "pro" => "PRO",
        "business" => "BIZ",
        _ => "SOLO",
    };

    // 3. Generate a new license key for the upgraded plan
    let key = format!("ELAZYA-{}-{}-{}",
        plan_code,
        generate_key_segment(),
        generate_key_segment(),
    );

    // 4. Write license.json
    let license = serde_json::json!({
        "key": key,
        "plan": plan.to_lowercase(),
        "activatedAt": chrono::Utc::now().to_rfc3339(),
        "upgradedAt": chrono::Utc::now().to_rfc3339(),
        "stripeSession": session_id,
    });

    let license_path = elazya_dir.join("license.json");
    fs::write(&license_path, serde_json::to_string_pretty(&license).unwrap())
        .map_err(|e| format!("Failed to write license.json: {}", e))?;

    println!("[Upgrade] License upgraded to {} — key: {}", plan, key);

    // 5. Emit event to frontend so it reloads the license
    let _ = app.emit("license-updated", serde_json::json!({
        "plan": plan.to_lowercase(),
        "key": key,
    }));

    Ok(())
}

/// Generate a 4-character alphanumeric key segment.
fn generate_key_segment() -> String {
    use uuid::Uuid;
    let id = Uuid::new_v4().to_string();
    id.chars()
        .filter(|c| c.is_alphanumeric())
        .take(4)
        .collect::<String>()
        .to_uppercase()
}

#[tauri::command]
async fn is_bridge_connected(state: State<'_, AppState>) -> Result<bool, String> {
    Ok(state.openclaw.bridge.is_connected())
}

// ─── Agent Engine Commands ──────────────────────────────────────────────

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct AgentConfig {
    agent_id: String,
    enabled: bool,
    settings: String, // JSON string
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct AgentLogEntry {
    id: i64,
    agent_id: String,
    timestamp: String,
    status: String,
    summary: String,
    details: String,
}

#[tauri::command]
async fn get_agent_config(state: State<'_, AppState>, agent_id: String) -> Result<Option<AgentConfig>, String> {
    let row = sqlx::query("SELECT agent_id, enabled, settings FROM agent_config WHERE agent_id = ?")
        .bind(&agent_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    match row {
        Some(r) => Ok(Some(AgentConfig {
            agent_id: r.get("agent_id"),
            enabled: r.get::<i32, _>("enabled") != 0,
            settings: r.get("settings"),
        })),
        None => Ok(None),
    }
}

#[tauri::command]
async fn save_agent_config(state: State<'_, AppState>, agent_id: String, enabled: bool, settings: String) -> Result<(), String> {
    sqlx::query("INSERT OR REPLACE INTO agent_config (agent_id, enabled, settings) VALUES (?, ?, ?)")
        .bind(&agent_id)
        .bind(enabled as i32)
        .bind(&settings)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn toggle_agent(app: tauri::AppHandle, state: State<'_, AppState>, agent_id: String, enabled: bool) -> Result<(), String> {
    // Upsert the enabled state
    sqlx::query("INSERT INTO agent_config (agent_id, enabled, settings) VALUES (?, ?, '{}') ON CONFLICT(agent_id) DO UPDATE SET enabled = excluded.enabled")
        .bind(&agent_id)
        .bind(enabled as i32)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    // ── Facturation Auto: start/stop watcher ────────────────
    if agent_id == "facturation" {
        if enabled {
            // Read config to get watch_dir and client_dir
            let settings = get_agent_settings(&state.db, "facturation").await;
            let watch_dir = settings.get("watch_dir")
                .and_then(|v| v.as_str())
                .unwrap_or("~/Documents/Factures")
                .to_string();
            let client_dir = settings.get("client_dir")
                .and_then(|v| v.as_str())
                .unwrap_or("~/Clients")
                .to_string();

            agent_facturation::start_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.facturation_watcher.clone(),
                watch_dir,
                client_dir,
            );
        } else {
            agent_facturation::stop_watcher(&state.facturation_watcher).await;
        }
    } else if agent_id == "onboarding-client" {
        if enabled {
            agent_onboarding::start_onboarding_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.onboarding_watcher.clone(),
            );
        } else {
            agent_onboarding::stop_onboarding_watcher(&state.onboarding_watcher).await;
        }
    } else if agent_id == "linkedin-digest" {
        if enabled {
            agent_linkedin::start_linkedin_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.linkedin_watcher.clone(),
            );
        } else {
            agent_linkedin::stop_linkedin_watcher(&state.linkedin_watcher).await;
        }
    } else if agent_id == "qualification" {
        if enabled {
            agent_qualification::start_qualification_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.qualification_watcher.clone(),
            );
        } else {
            agent_qualification::stop_qualification_watcher(&state.qualification_watcher).await;
        }
    } else if agent_id == "routine-matinale" {
        if enabled {
            agent_routine::start_routine_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.routine_watcher.clone(),
            );
        } else {
            agent_routine::stop_routine_watcher(&state.routine_watcher).await;
        }
    } else if agent_id == "crm-prospect" {
        if enabled {
            agent_crm_prospect::start_crm_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.crm_watcher.clone(),
            );
        } else {
            agent_crm_prospect::stop_crm_watcher(&state.crm_watcher).await;
        }
    } else if agent_id == "devis-express" {
        if enabled {
            agent_devis::start_devis_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.devis_watcher.clone(),
            );
        } else {
            agent_devis::stop_devis_watcher(&state.devis_watcher).await;
        }
    } else if agent_id == "email-intelligent" {
        if enabled {
            agent_email::start_email_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.email_watcher.clone(),
            );
        } else {
            agent_email::stop_email_watcher(&state.email_watcher).await;
        }
    } else if agent_id == "compta-export" {
        if enabled {
            agent_compta::start_compta_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.compta_watcher.clone(),
            );
        } else {
            agent_compta::stop_compta_watcher(&state.compta_watcher).await;
        }
    } else if agent_id == "content-linkedin" {
        if enabled {
            agent_content::start_content_watcher(
                app.clone(),
                state.db.clone(),
                state.engine.client().clone(),
                state.content_watcher.clone(),
            );
        } else {
            agent_content::stop_content_watcher(&state.content_watcher).await;
        }
    }

    // Emit event so UI updates in real time
    let _ = app.emit("agent-action", serde_json::json!({
        "type": "toggle",
        "agentId": agent_id,
        "enabled": enabled,
    }));

    Ok(())
}

#[tauri::command]
async fn get_agent_logs(state: State<'_, AppState>, agent_id: String, limit: i32) -> Result<Vec<AgentLogEntry>, String> {
    let rows = sqlx::query("SELECT id, agent_id, timestamp, status, summary, details FROM agent_log WHERE agent_id = ? ORDER BY id DESC LIMIT ?")
        .bind(&agent_id)
        .bind(limit)
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(rows.iter().map(|r| AgentLogEntry {
        id: r.get("id"),
        agent_id: r.get("agent_id"),
        timestamp: r.get("timestamp"),
        status: r.get("status"),
        summary: r.get("summary"),
        details: r.get("details"),
    }).collect())
}

#[tauri::command]
async fn check_macos_permissions() -> Result<serde_json::Value, String> {
    use std::process::Command;
    // Quick checks via osascript. This will trigger macOS permission prompts if not granted.
    let mail_check = Command::new("osascript").arg("-e").arg("tell application \"Mail\" to return true").output();
    let cal_check = Command::new("osascript").arg("-e").arg("tell application \"Calendar\" to return true").output();
    let contacts_check = Command::new("osascript").arg("-e").arg("tell application \"Contacts\" to return true").output();
    
    Ok(serde_json::json!({
        "mail": mail_check.is_ok() && mail_check.unwrap().status.success(),
        "calendar": cal_check.is_ok() && cal_check.unwrap().status.success(),
        "contacts": contacts_check.is_ok() && contacts_check.unwrap().status.success(),
    }))
}

#[tauri::command]
async fn get_recent_logs(state: State<'_, AppState>, limit: i32) -> Result<Vec<AgentLogEntry>, String> {
    let rows = sqlx::query("SELECT id, agent_id, timestamp, status, summary, details FROM agent_log ORDER BY id DESC LIMIT ?")
        .bind(limit)
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(rows.iter().map(|r| AgentLogEntry {
        id: r.get("id"),
        agent_id: r.get("agent_id"),
        timestamp: r.get("timestamp"),
        status: r.get("status"),
        summary: r.get("summary"),
        details: r.get("details"),
    }).collect())
}

#[tauri::command]
async fn get_active_agent_count(state: State<'_, AppState>) -> Result<i32, String> {
    let row = sqlx::query("SELECT COUNT(*) as cnt FROM agent_config WHERE enabled = 1")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(row.get::<i32, _>("cnt"))
}

#[tauri::command]
async fn run_agent(app: tauri::AppHandle, state: State<'_, AppState>, agent_id: String) -> Result<AgentLogEntry, String> {
    // All agents go through the engine now
    let result = state.engine.test_agent(&app, &state.db, &agent_id).await?;

    // Read back the last inserted log
    let row = sqlx::query("SELECT id, agent_id, timestamp, status, summary, details FROM agent_log WHERE agent_id = ? ORDER BY id DESC LIMIT 1")
        .bind(&agent_id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(AgentLogEntry {
        id: row.get("id"),
        agent_id: row.get("agent_id"),
        timestamp: row.get("timestamp"),
        status: row.get("status"),
        summary: row.get("summary"),
        details: row.get("details"),
    })
}

/// Helper to read agent settings JSON from config DB
async fn get_agent_settings(db: &SqlitePool, agent_id: &str) -> serde_json::Value {
    let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = ?")
        .bind(agent_id)
        .fetch_optional(db)
        .await
        .ok()
        .flatten();

    match row {
        Some(r) => {
            let s: String = r.get("settings");
            serde_json::from_str(&s).unwrap_or(serde_json::json!({}))
        }
        None => serde_json::json!({}),
    }
}

/// Simple pseudo-random index for varied simulated outputs.
fn rand_index(max: usize) -> usize {
    use std::time::SystemTime;
    let nanos = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos() as usize;
    nanos % max
}

/// Process a deep link URL (standalone function, callable from event listener).
fn process_deep_link_url(app: &tauri::AppHandle, url: &str) {
    if url.contains("upgrade-success") {
        if let Ok(parsed) = url::Url::parse(url) {
            let plan = parsed.query_pairs()
                .find(|(k, _)| k == "plan")
                .map(|(_, v)| v.to_string())
                .unwrap_or_else(|| "solo".to_string());
            let session = parsed.query_pairs()
                .find(|(k, _)| k == "session")
                .map(|(_, v)| v.to_string())
                .unwrap_or_default();

            let home = match dirs::home_dir() {
                Some(h) => h,
                None => { println!("[DeepLink] Could not determine home directory"); return; }
            };
            let elazya_dir = home.join(".elazya");
            let _ = fs::create_dir_all(&elazya_dir);

            let plan_code = match plan.to_lowercase().as_str() {
                "pro" => "PRO",
                "business" => "BIZ",
                _ => "SOLO",
            };
            let key = format!("ELAZYA-{}-{}-{}", plan_code, generate_key_segment(), generate_key_segment());

            let license = serde_json::json!({
                "key": key,
                "plan": plan.to_lowercase(),
                "activatedAt": chrono::Utc::now().to_rfc3339(),
                "upgradedAt": chrono::Utc::now().to_rfc3339(),
                "stripeSession": session,
            });
            let license_path = elazya_dir.join("license.json");
            let _ = fs::write(&license_path, serde_json::to_string_pretty(&license).unwrap());

            println!("[DeepLink] License upgraded to {} — key: {}", plan, key);
            let _ = app.emit("license-updated", serde_json::json!({
                "plan": plan.to_lowercase(),
                "key": key,
            }));
        }
    } else if url.contains("upgrade-cancelled") {
        println!("[DeepLink] Upgrade cancelled by user");
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let app_handle = app.handle();
            
            // 0. Execute any pending factory reset BEFORE opening the DB
            let app_dir = app_handle.path().app_data_dir()
                .map_err(|e| format!("Failed to get app data dir: {}", e))?;
            
            if !app_dir.exists() {
                fs::create_dir_all(&app_dir)
                    .map_err(|e| format!("Failed to create app data dir: {}", e))?;
            }

            // This will delete DB, state, ~/.openclaw if a reset was requested
            openclaw::execute_pending_reset(&app_dir);
            
            // 1. Database Setup
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

                // Agent engine tables
                let agent_sql = include_str!("../migrations/202603020001_agents.sql");
                for stmt in agent_sql.split(';').filter(|s| !s.trim().is_empty()) {
                    sqlx::query(stmt)
                        .execute(&pool)
                        .await
                        .map_err(|e| format!("Failed to run agent migration: {}", e))?;
                }
                
                Ok::<SqlitePool, String>(pool)
            }) {
                Ok(p) => p,
                Err(e) => return Err(e.into()),
            };

            // 2. OpenClaw Setup
            let openclaw_dir = std::env::var("OPENCLAW_DIR").unwrap_or_else(|_| {
                #[cfg(debug_assertions)]
                {
                    "/Users/sashimi/Documents/Elazya_Projects/openclaw-main".to_string()
                }
                #[cfg(not(debug_assertions))]
                {
                    // Use the bundled engine from Contents/Resources/resources/engine/
                    let resource_dir = app_handle.path().resource_dir()
                        .unwrap_or_else(|_| app_dir.join("engine"));
                    let bundled_engine = resource_dir.join("resources").join("engine");
                    if bundled_engine.exists() && bundled_engine.join("openclaw.mjs").exists() {
                        bundled_engine.to_string_lossy().to_string()
                    } else {
                        // Fallback to app data dir
                        let default_dir = app_dir.join("engine");
                        default_dir.to_string_lossy().to_string()
                    }
                }
            });
            
            let engine_path = std::path::Path::new(&openclaw_dir);
            if !engine_path.exists() {
                if let Err(e) = std::fs::create_dir_all(engine_path) {
                    println!("[Warning] Failed to create OpenClaw engine directory: {}", e);
                } else {
                    println!("[Info] Created OpenClaw engine directory at: {}", openclaw_dir);
                }
            }

            let app_handle_clone = app_handle.clone();
            let openclaw = tauri::async_runtime::block_on(async {
                ManagedOpenClaw::start(&openclaw_dir, app_handle_clone).await
            }).map_err(|e| format!("OpenClaw Engine failed to start (dir: {}): {}", openclaw_dir, e))?;

            let app_handle_clone_for_watch = app_handle.clone();
             let openclaw_dir_clone = openclaw_dir.clone();
             watch_token_usage(app_handle_clone_for_watch, openclaw_dir_clone);

            // 3. Create agent engine with shared OpenClaw client
            let oc_client = Arc::new(OpenClawAgentClient::new(openclaw.bridge.clone()));
            let engine = Arc::new(AgentEngine::new(oc_client.clone()));

            // 4. Manage State
            app.manage(AppState { 
                db: pool.clone(), 
                openclaw: Arc::new(openclaw),
                openclaw_dir,
                facturation_watcher: FacturationWatcher::new(),
                onboarding_watcher: OnboardingWatcher::new(),
                linkedin_watcher: LinkedInWatcher::new(),
                qualification_watcher: QualificationWatcher::new(),
                routine_watcher: RoutineWatcher::new(),
                crm_watcher: CrmWatcher::new(),
                devis_watcher: DevisWatcher::new(),
                email_watcher: EmailWatcher::new(),
                compta_watcher: ComptaWatcher::new(),
                content_watcher: ContentWatcher::new(),
                engine: engine.clone(),
            });

            // Deep link handler: listen for elazya:// URLs
            let app_handle_for_deep_link = app_handle.clone();
            app.listen("deep-link://new-url", move |event: tauri::Event| {
                let payload = event.payload().to_string();
                println!("[DeepLink] Raw payload: {}", payload);

                // tauri-plugin-deep-link v2 sends payload as JSON array of URL strings
                let urls: Vec<String> = serde_json::from_str(&payload).unwrap_or_else(|_| {
                    // Fallback: try as a single quoted string
                    let trimmed = payload.trim_matches('"').to_string();
                    if trimmed.starts_with("elazya://") {
                        vec![trimmed]
                    } else {
                        vec![]
                    }
                });

                for url in urls {
                    println!("[DeepLink] Processing URL: {}", url);
                    let handle = app_handle_for_deep_link.clone();
                    tauri::async_runtime::spawn(async move {
                        process_deep_link_url(&handle, &url);
                    });
                }
            });

            // Handle CLI flags
            if let Ok(matches) = app.cli().matches() {
                if let Some(arg) = matches.args.get("test-agent") {
                    if let Some(agent_id) = arg.value.as_str() {
                        println!("[CLI] Testing agent: {}", agent_id);
                        let handle = app_handle.clone();
                        let db = pool.clone();
                        let agent_id: String = agent_id.to_string();
                        let engine = engine.clone();
                        let oc_client_clone = oc_client.clone();

                        tauri::async_runtime::spawn(async move {
                            // Wait a tiny bit for app to settle before running tests
                            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                            match engine.test_agent(&handle, &db, &agent_id).await {
                                Ok(res) => {
                                    println!("[CLI RESULT] {}", serde_json::to_string_pretty(&res).unwrap());
                                    if res.status == "success" {
                                        std::process::exit(0);
                                    } else {
                                        std::process::exit(1);
                                    }
                                }
                                Err(e) => {
                                    println!("[CLI ERROR] {}", e);
                                    std::process::exit(1);
                                }
                            }
                        });
                    }
                }
            }

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
            restart_openclaw,
            uninstall_skill_cmd,
            reset_app_cmd,
            handle_deep_link,
            handle_upgrade_success,
            // Agent engine commands
            get_agent_config,
            save_agent_config,
            toggle_agent,
            get_agent_logs,
            get_recent_logs,
            get_active_agent_count,
            run_agent,
            check_macos_permissions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
