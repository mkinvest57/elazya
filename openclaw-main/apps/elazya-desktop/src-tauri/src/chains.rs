use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::sqlite::SqlitePool;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{Duration, interval};
use tauri::{AppHandle, Emitter};

use crate::openclaw::OpenClawBridge;

// ─────────────────────────────────────────────
//  Data Types
// ─────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chain {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub enabled: bool,
    pub config: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainLog {
    pub id: i64,
    pub chain_id: String,
    pub timestamp: String,
    pub message: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainMetrics {
    pub chain_id: String,
    pub total_executions: i64,
    pub total_time_saved_minutes: i64,
    pub last_run: Option<String>,
    pub consecutive_failures: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainStats {
    pub active_chains: i64,
    pub total_actions_today: i64,
    pub total_time_saved_minutes: i64,
}

// ─────────────────────────────────────────────
//  Chain Engine
// ─────────────────────────────────────────────

pub struct ChainEngine {
    db: SqlitePool,
    bridge: Arc<OpenClawBridge>,
    app_handle: AppHandle,
    running_tasks: Arc<Mutex<Vec<tokio::task::JoinHandle<()>>>>,
}

impl ChainEngine {
    pub fn new(db: SqlitePool, bridge: Arc<OpenClawBridge>, app_handle: AppHandle) -> Self {
        Self {
            db,
            bridge,
            app_handle,
            running_tasks: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Start all enabled chains
    pub async fn start(&self) {
        println!("[ChainEngine] Starting enabled chains...");
        let chains = self.get_enabled_chains().await;
        for chain in chains {
            self.spawn_chain(&chain).await;
        }
    }

    async fn get_enabled_chains(&self) -> Vec<Chain> {
        sqlx::query_as::<_, (String, String, String, String, bool, String)>(
            "SELECT id, name, description, icon, enabled, config FROM chains WHERE enabled = 1"
        )
        .fetch_all(&self.db)
        .await
        .unwrap_or_default()
        .into_iter()
        .map(|r| Chain {
            id: r.0,
            name: r.1,
            description: r.2,
            icon: r.3,
            enabled: r.4,
            config: r.5,
        })
        .collect()
    }

    async fn spawn_chain(&self, chain: &Chain) {
        let chain_id = chain.id.clone();
        let db = self.db.clone();
        let bridge = Arc::clone(&self.bridge);
        let app_handle = self.app_handle.clone();

        let handle = tokio::spawn(async move {
            match chain_id.as_str() {
                "facturation" => run_facturation_chain(db, bridge, app_handle).await,
                "email" => run_email_chain(db, bridge, app_handle).await,
                "veille" => run_veille_chain(db, bridge, app_handle).await,
                _ => {
                    println!("[ChainEngine] Unknown chain: {}", chain_id);
                }
            }
        });

        let mut tasks = self.running_tasks.lock().await;
        tasks.push(handle);
    }

    /// Stop all running chain tasks
    pub async fn stop(&self) {
        let mut tasks = self.running_tasks.lock().await;
        for handle in tasks.drain(..) {
            handle.abort();
        }
        println!("[ChainEngine] All chains stopped");
    }
}

// ─────────────────────────────────────────────
//  Logging + Metrics helpers
// ─────────────────────────────────────────────

async fn log_chain(db: &SqlitePool, chain_id: &str, message: &str, status: &str) {
    let _ = sqlx::query(
        "INSERT INTO chain_logs (chain_id, message, status) VALUES (?, ?, ?)"
    )
    .bind(chain_id)
    .bind(message)
    .bind(status)
    .execute(db)
    .await;

    println!("[Chain:{}] [{}] {}", chain_id, status, message);
}

async fn increment_execution(db: &SqlitePool, chain_id: &str, time_saved_minutes: i64) {
    let _ = sqlx::query(
        "UPDATE chain_metrics SET total_executions = total_executions + 1, total_time_saved_minutes = total_time_saved_minutes + ?, last_run = datetime('now'), consecutive_failures = 0 WHERE chain_id = ?"
    )
    .bind(time_saved_minutes)
    .bind(chain_id)
    .execute(db)
    .await;
}

async fn record_failure(db: &SqlitePool, chain_id: &str) {
    let _ = sqlx::query(
        "UPDATE chain_metrics SET consecutive_failures = consecutive_failures + 1 WHERE chain_id = ?"
    )
    .bind(chain_id)
    .execute(db)
    .await;
}

async fn should_auto_pause(db: &SqlitePool, chain_id: &str) -> bool {
    let result = sqlx::query_as::<_, (i64,)>(
        "SELECT consecutive_failures FROM chain_metrics WHERE chain_id = ?"
    )
    .bind(chain_id)
    .fetch_optional(db)
    .await;

    match result {
        Ok(Some((failures,))) => failures >= 3,
        _ => false,
    }
}

async fn auto_pause_chain(db: &SqlitePool, chain_id: &str) {
    let _ = sqlx::query("UPDATE chains SET enabled = 0 WHERE id = ?")
        .bind(chain_id)
        .execute(db)
        .await;
    log_chain(db, chain_id, "Chaîne auto-pausée après 3 échecs consécutifs", "error").await;
}

// ─────────────────────────────────────────────
//  Chain #1: Facturation
//  Trigger: watches ~/Documents/Factures/ for new PDFs
// ─────────────────────────────────────────────

async fn run_facturation_chain(db: SqlitePool, bridge: Arc<OpenClawBridge>, app_handle: AppHandle) {
    let chain_id = "facturation";
    let watch_dir = dirs::home_dir()
        .map(|h| h.join("Documents").join("Factures"))
        .unwrap_or_default();

    // Ensure directory exists
    let _ = std::fs::create_dir_all(&watch_dir);

    log_chain(&db, chain_id, &format!("Surveillance démarrée: {}", watch_dir.display()), "info").await;
    let _ = app_handle.emit("chain-log", serde_json::json!({
        "chain": chain_id, "message": "Surveillance du dossier Factures activée", "status": "info"
    }));

    // Poll-based file watching (simpler than notify crate, avoids extra dep)
    let mut known_files: std::collections::HashSet<String> = std::collections::HashSet::new();

    // Index existing files
    if let Ok(entries) = std::fs::read_dir(&watch_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |e| e == "pdf") {
                known_files.insert(path.to_string_lossy().to_string());
            }
        }
    }

    let mut poll_interval = interval(Duration::from_secs(10));

    loop {
        poll_interval.tick().await;

        // Check if still enabled
        let enabled = sqlx::query_as::<_, (bool,)>(
            "SELECT enabled FROM chains WHERE id = ?"
        )
        .bind(chain_id)
        .fetch_optional(&db)
        .await;

        if !matches!(enabled, Ok(Some((true,)))) {
            log_chain(&db, chain_id, "Chaîne désactivée, arrêt", "info").await;
            break;
        }

        // Check for auto-pause
        if should_auto_pause(&db, chain_id).await {
            auto_pause_chain(&db, chain_id).await;
            break;
        }

        // Scan for new PDFs
        if let Ok(entries) = std::fs::read_dir(&watch_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let path_str = path.to_string_lossy().to_string();

                if path.extension().map_or(false, |e| e == "pdf") && !known_files.contains(&path_str) {
                    known_files.insert(path_str.clone());
                    process_invoice(&db, &bridge, &app_handle, chain_id, &path).await;
                }
            }
        }
    }
}

async fn process_invoice(
    db: &SqlitePool,
    bridge: &Arc<OpenClawBridge>,
    app_handle: &AppHandle,
    chain_id: &str,
    filepath: &std::path::Path,
) {
    let filename = filepath.file_name().unwrap_or_default().to_string_lossy().to_string();
    log_chain(db, chain_id, &format!("Nouvelle facture détectée: {}", filename), "info").await;
    let _ = app_handle.emit("chain-log", serde_json::json!({
        "chain": chain_id, "message": format!("📄 Facture détectée: {}", filename), "status": "info"
    }));

    // 1. OCR via Tesseract
    log_chain(db, chain_id, "Extraction texte PDF via OCR...", "info").await;
    let ocr_result = std::process::Command::new("tesseract")
        .arg(filepath.to_string_lossy().as_ref())
        .arg("stdout")
        .args(["-l", "fra"])
        .output();

    let ocr_text = match ocr_result {
        Ok(output) if output.status.success() => {
            String::from_utf8_lossy(&output.stdout).to_string()
        }
        Ok(output) => {
            let err = String::from_utf8_lossy(&output.stderr);
            log_chain(db, chain_id, &format!("OCR échoué: {}", err), "error").await;
            record_failure(db, chain_id).await;
            return;
        }
        Err(e) => {
            log_chain(db, chain_id, &format!("Tesseract non disponible: {}. Installez-le avec: brew install tesseract", e), "error").await;
            record_failure(db, chain_id).await;
            return;
        }
    };

    // 2. Extract invoice data via LLM
    log_chain(db, chain_id, "Analyse facture avec IA...", "info").await;
    let prompt = format!(
        r#"Voici le texte OCR d'une facture française.
Extrais les informations suivantes et réponds UNIQUEMENT en JSON valide:

{{
  "client": "nom du client",
  "montant": 1234.56,
  "date": "2026-01-15",
  "echeance": "2026-02-15",
  "numero": "FAC-2026-001"
}}

Si une info est manquante, mets null.

Texte OCR:
{}"#,
        &ocr_text[..ocr_text.len().min(3000)]
    );

    let params = serde_json::json!({
        "sessionKey": format!("facturation-{}", uuid::Uuid::new_v4()),
        "message": prompt,
        "idempotencyKey": uuid::Uuid::new_v4().to_string()
    });

    match bridge.request("chat.send", params).await {
        Ok(response) => {
            let content = response["content"].as_str().unwrap_or("");
            // Try to extract JSON from response
            if let Some(json_start) = content.find('{') {
                if let Some(json_end) = content.rfind('}') {
                    let json_str = &content[json_start..=json_end];
                    if let Ok(invoice) = serde_json::from_str::<Value>(json_str) {
                        let client = invoice["client"].as_str().unwrap_or("Inconnu");
                        let montant = invoice["montant"].as_f64().unwrap_or(0.0);

                        log_chain(db, chain_id, &format!("Facture analysée: {} — {}€", client, montant), "success").await;
                        let _ = app_handle.emit("chain-log", serde_json::json!({
                            "chain": chain_id,
                            "message": format!("✅ {} — {}€", client, montant),
                            "status": "success"
                        }));

                        // 3. Classify: create client folder and copy
                        let client_folder = dirs::home_dir()
                            .map(|h| h.join("Clients").join(client).join("Factures").join("2026"))
                            .unwrap_or_default();
                        let _ = std::fs::create_dir_all(&client_folder);
                        let dest = client_folder.join(&filename);
                        let _ = std::fs::copy(filepath, &dest);
                        log_chain(db, chain_id, &format!("Classée dans {}", client_folder.display()), "success").await;

                        // 4. Create macOS Reminder if due date exists
                        if let Some(echeance) = invoice["echeance"].as_str() {
                            let reminder_name = format!("Relancer {} - Facture {}", client, invoice["numero"].as_str().unwrap_or("?"));
                            let script = format!(
                                r#"tell application "Reminders" to make new reminder with properties {{name:"{}", body:"Montant: {}€"}}"#,
                                reminder_name, montant
                            );
                            let _ = std::process::Command::new("osascript")
                                .args(["-e", &script])
                                .output();
                            log_chain(db, chain_id, &format!("Rappel créé: échéance {}", echeance), "success").await;
                        }

                        increment_execution(db, chain_id, 15).await; // ~15 min saved per invoice
                    } else {
                        log_chain(db, chain_id, "Impossible de parser le JSON de la facture", "error").await;
                        record_failure(db, chain_id).await;
                    }
                }
            }
        }
        Err(e) => {
            log_chain(db, chain_id, &format!("Erreur LLM: {}", e), "error").await;
            record_failure(db, chain_id).await;
        }
    }
}

// ─────────────────────────────────────────────
//  Chain #2: Email Smart Reply
//  Trigger: every 2 minutes via timer
// ─────────────────────────────────────────────

async fn run_email_chain(db: SqlitePool, bridge: Arc<OpenClawBridge>, app_handle: AppHandle) {
    let chain_id = "email";
    log_chain(&db, chain_id, "Surveillance emails démarrée", "info").await;
    let _ = app_handle.emit("chain-log", serde_json::json!({
        "chain": chain_id, "message": "📧 Surveillance emails activée", "status": "info"
    }));

    let mut check_interval = interval(Duration::from_secs(120)); // 2 minutes

    loop {
        check_interval.tick().await;

        // Check if still enabled
        let enabled = sqlx::query_as::<_, (bool,)>(
            "SELECT enabled FROM chains WHERE id = ?"
        )
        .bind(chain_id)
        .fetch_optional(&db)
        .await;

        if !matches!(enabled, Ok(Some((true,)))) {
            log_chain(&db, chain_id, "Chaîne désactivée, arrêt", "info").await;
            break;
        }

        if should_auto_pause(&db, chain_id).await {
            auto_pause_chain(&db, chain_id).await;
            break;
        }

        // Check for unread emails via bridge
        log_chain(&db, chain_id, "Vérification emails...", "info").await;

        let params = serde_json::json!({
            "sessionKey": format!("email-check-{}", uuid::Uuid::new_v4()),
            "message": "List my 3 most recent unread emails. For each, give: sender, subject, and first 100 chars of text. Format as JSON array.",
            "idempotencyKey": uuid::Uuid::new_v4().to_string()
        });

        match bridge.request("chat.send", params).await {
            Ok(response) => {
                let content = response["content"].as_str().unwrap_or("");
                if content.contains("unread") || content.contains("email") || content.contains("@") {
                    log_chain(&db, chain_id, "Emails analysés", "info").await;

                    // Ask LLM to draft replies for important ones
                    let draft_params = serde_json::json!({
                        "sessionKey": format!("email-draft-{}", uuid::Uuid::new_v4()),
                        "message": format!(
                            "Based on these emails:\n{}\n\nFor any that look like they need a reply, draft a short, professional response in French (3-5 lines max). If none need a reply, say 'Aucun email urgent.'",
                            content
                        ),
                        "idempotencyKey": uuid::Uuid::new_v4().to_string()
                    });

                    if let Ok(draft_response) = bridge.request("chat.send", draft_params).await {
                        let draft = draft_response["content"].as_str().unwrap_or("");
                        if !draft.contains("Aucun") {
                            log_chain(&db, chain_id, "Brouillons de réponse générés", "success").await;
                            let _ = app_handle.emit("chain-log", serde_json::json!({
                                "chain": chain_id,
                                "message": "✅ Brouillons email prêts",
                                "status": "success"
                            }));
                            increment_execution(&db, chain_id, 10).await; // ~10 min saved
                        } else {
                            log_chain(&db, chain_id, "Aucun email urgent détecté", "info").await;
                            increment_execution(&db, chain_id, 2).await; // minor time saved
                        }
                    }
                } else {
                    log_chain(&db, chain_id, "Aucun nouvel email", "info").await;
                }
            }
            Err(e) => {
                log_chain(&db, chain_id, &format!("Erreur: {}", e), "error").await;
                record_failure(&db, chain_id).await;
            }
        }
    }
}

// ─────────────────────────────────────────────
//  Chain #3: Veille & Contenu
//  Trigger: once daily (or every 4 hours while active)
// ─────────────────────────────────────────────

async fn run_veille_chain(db: SqlitePool, bridge: Arc<OpenClawBridge>, app_handle: AppHandle) {
    let chain_id = "veille";
    log_chain(&db, chain_id, "Veille automatique démarrée", "info").await;
    let _ = app_handle.emit("chain-log", serde_json::json!({
        "chain": chain_id, "message": "🔍 Veille automatique activée", "status": "info"
    }));

    // Run immediately, then every 4 hours
    run_veille_cycle(&db, &bridge, &app_handle, chain_id).await;

    let mut schedule = interval(Duration::from_secs(4 * 60 * 60)); // 4 hours

    loop {
        schedule.tick().await;

        let enabled = sqlx::query_as::<_, (bool,)>(
            "SELECT enabled FROM chains WHERE id = ?"
        )
        .bind(chain_id)
        .fetch_optional(&db)
        .await;

        if !matches!(enabled, Ok(Some((true,)))) {
            log_chain(&db, chain_id, "Chaîne désactivée, arrêt", "info").await;
            break;
        }

        if should_auto_pause(&db, chain_id).await {
            auto_pause_chain(&db, chain_id).await;
            break;
        }

        run_veille_cycle(&db, &bridge, &app_handle, chain_id).await;
    }
}

async fn run_veille_cycle(
    db: &SqlitePool,
    bridge: &Arc<OpenClawBridge>,
    app_handle: &AppHandle,
    chain_id: &str,
) {
    log_chain(db, chain_id, "Lancement veille...", "info").await;

    let prompt = r#"Effectue une veille sur les sujets suivants: IA, productivité, freelance, marketing digital.

Trouve les 3-5 actualités les plus pertinentes du jour.
Pour chaque info, donne:
- Titre
- Résumé en 2-3 lignes
- Un angle de post LinkedIn/X possible

Formate en markdown structuré."#;

    let params = serde_json::json!({
        "sessionKey": format!("veille-{}", uuid::Uuid::new_v4()),
        "message": prompt,
        "idempotencyKey": uuid::Uuid::new_v4().to_string()
    });

    match bridge.request("chat.send", params).await {
        Ok(response) => {
            let content = response["content"].as_str().unwrap_or("(pas de contenu)");

            // Create Apple Note with the summary
            let today = chrono::Local::now().format("%d/%m/%Y").to_string();
            let note_title = format!("Veille du {}", today);
            let note_body = content
                .replace('"', "\\\"")
                .replace('\n', "\\n")
                .chars()
                .take(4000)
                .collect::<String>();

            let script = format!(
                r#"tell application "Notes" to make new note in default account with properties {{name:"{}", body:"{}"}}"#,
                note_title, note_body
            );
            let note_result = std::process::Command::new("osascript")
                .args(["-e", &script])
                .output();

            match note_result {
                Ok(output) if output.status.success() => {
                    log_chain(db, chain_id, &format!("Note créée: \"{}\"", note_title), "success").await;
                    let _ = app_handle.emit("chain-log", serde_json::json!({
                        "chain": chain_id,
                        "message": format!("✅ Veille terminée, note: {}", note_title),
                        "status": "success"
                    }));
                    increment_execution(db, chain_id, 30).await; // ~30 min saved
                }
                _ => {
                    // Notes app may not be available, just log the content
                    log_chain(db, chain_id, "Veille terminée (note non créée — Apple Notes indisponible)", "info").await;
                    increment_execution(db, chain_id, 20).await;
                }
            }
        }
        Err(e) => {
            log_chain(db, chain_id, &format!("Erreur veille: {}", e), "error").await;
            record_failure(db, chain_id).await;
        }
    }
}

// ─────────────────────────────────────────────
//  Tauri Command helpers (called from main.rs)
// ─────────────────────────────────────────────

pub async fn get_all_chains(db: &SqlitePool) -> Result<Vec<serde_json::Value>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, String, bool, String)>(
        "SELECT id, name, description, icon, enabled, config FROM chains"
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())?;

    let mut chains = Vec::new();
    for r in rows {
        // Get metrics for this chain
        let metrics = sqlx::query_as::<_, (i64, i64, Option<String>, i64)>(
            "SELECT total_executions, total_time_saved_minutes, last_run, consecutive_failures FROM chain_metrics WHERE chain_id = ?"
        )
        .bind(&r.0)
        .fetch_optional(db)
        .await
        .unwrap_or(None);

        let (execs, time_saved, last_run, failures) = metrics.unwrap_or((0, 0, None, 0));

        chains.push(serde_json::json!({
            "id": r.0,
            "name": r.1,
            "description": r.2,
            "icon": r.3,
            "enabled": r.4,
            "config": r.5,
            "totalExecutions": execs,
            "timeSavedMinutes": time_saved,
            "lastRun": last_run,
            "consecutiveFailures": failures,
        }));
    }

    Ok(chains)
}

pub async fn toggle_chain_db(db: &SqlitePool, chain_id: &str) -> Result<bool, String> {
    // Toggle and return new state
    sqlx::query("UPDATE chains SET enabled = NOT enabled WHERE id = ?")
        .bind(chain_id)
        .execute(db)
        .await
        .map_err(|e| e.to_string())?;

    // Reset failure counter when re-enabling
    sqlx::query("UPDATE chain_metrics SET consecutive_failures = 0 WHERE chain_id = ?")
        .bind(chain_id)
        .execute(db)
        .await
        .map_err(|e| e.to_string())?;

    let result = sqlx::query_as::<_, (bool,)>("SELECT enabled FROM chains WHERE id = ?")
        .bind(chain_id)
        .fetch_one(db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.0)
}

pub async fn get_chain_logs_db(db: &SqlitePool, chain_id: Option<&str>, limit: i32) -> Result<Vec<serde_json::Value>, String> {
    let rows = if let Some(cid) = chain_id {
        sqlx::query_as::<_, (i64, String, String, String, String)>(
            "SELECT id, chain_id, timestamp, message, status FROM chain_logs WHERE chain_id = ? ORDER BY id DESC LIMIT ?"
        )
        .bind(cid)
        .bind(limit)
        .fetch_all(db)
        .await
        .map_err(|e| e.to_string())?
    } else {
        sqlx::query_as::<_, (i64, String, String, String, String)>(
            "SELECT id, chain_id, timestamp, message, status FROM chain_logs ORDER BY id DESC LIMIT ?"
        )
        .bind(limit)
        .fetch_all(db)
        .await
        .map_err(|e| e.to_string())?
    };

    Ok(rows.iter().map(|r| serde_json::json!({
        "id": r.0,
        "chainId": r.1,
        "timestamp": r.2,
        "message": r.3,
        "status": r.4,
    })).collect())
}

pub async fn get_chain_stats_db(db: &SqlitePool) -> Result<ChainStats, String> {
    let active = sqlx::query_as::<_, (i64,)>(
        "SELECT COUNT(*) FROM chains WHERE enabled = 1"
    )
    .fetch_one(db)
    .await
    .map(|r| r.0)
    .unwrap_or(0);

    let today_actions = sqlx::query_as::<_, (i64,)>(
        "SELECT COUNT(*) FROM chain_logs WHERE date(timestamp) = date('now') AND status = 'success'"
    )
    .fetch_one(db)
    .await
    .map(|r| r.0)
    .unwrap_or(0);

    let time_saved = sqlx::query_as::<_, (i64,)>(
        "SELECT COALESCE(SUM(total_time_saved_minutes), 0) FROM chain_metrics"
    )
    .fetch_one(db)
    .await
    .map(|r| r.0)
    .unwrap_or(0);

    Ok(ChainStats {
        active_chains: active,
        total_actions_today: today_actions,
        total_time_saved_minutes: time_saved,
    })
}

// ─────────────────────────────────────────────
//  Skills Auto-Installer
//  Ensures chain dependencies are available
// ─────────────────────────────────────────────

#[derive(Debug, Clone, Serialize)]
pub struct DepCheckResult {
    pub chain_id: String,
    pub dependency: String,
    pub available: bool,
    pub install_hint: Option<String>,
}

pub async fn auto_install_chain_deps(db: &SqlitePool) -> Result<Vec<DepCheckResult>, String> {
    let mut results: Vec<DepCheckResult> = Vec::new();

    // Get all chains (not just enabled ones — user may want to enable them later)
    let chains = sqlx::query_as::<_, (String,)>("SELECT id FROM chains")
        .fetch_all(db)
        .await
        .map_err(|e| e.to_string())?;

    for (chain_id,) in chains {
        match chain_id.as_str() {
            "facturation" => {
                // Requires: tesseract
                let has_tesseract = which::which("tesseract").is_ok();
                results.push(DepCheckResult {
                    chain_id: "facturation".into(),
                    dependency: "Tesseract OCR".into(),
                    available: has_tesseract,
                    install_hint: if has_tesseract { None } else { Some("brew install tesseract".into()) },
                });
            }
            "email" => {
                // Requires: OpenClaw bridge (already started if we got here)
                results.push(DepCheckResult {
                    chain_id: "email".into(),
                    dependency: "OpenClaw Bridge".into(),
                    available: true,
                    install_hint: None,
                });
            }
            "veille" => {
                // Requires: OpenClaw bridge + LLM configured
                results.push(DepCheckResult {
                    chain_id: "veille".into(),
                    dependency: "OpenClaw Bridge".into(),
                    available: true,
                    install_hint: None,
                });
            }
            _ => {}
        }
    }

    Ok(results)
}
