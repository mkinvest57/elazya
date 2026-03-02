/**
 * Facturation Auto Agent — Real Implementation
 * 
 * 1. File watcher: polls watch_dir every 5s for new PDFs
 * 2. OpenClaw call: sends invoice content to LLM via chat.send
 * 3. File ops: creates client dir, moves PDF
 * 4. Log: inserts AgentLog in SQLite
 * 5. Event: emits agent-action for real-time UI
 */

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::sqlite::SqlitePool;
use sqlx::Row;
use tauri::{AppHandle, Emitter};
use crate::openclaw::OpenClawBridge;

/// Shared state for the file watcher: tracks processed files + cancellation flag
pub struct FacturationWatcher {
    pub active: Mutex<bool>,
    pub processed: Mutex<HashSet<PathBuf>>,
}

impl FacturationWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            processed: Mutex::new(HashSet::new()),
        })
    }
}

/// Start the file watcher loop for Facturation Auto.
/// Spawns a tokio task that polls `watch_dir` every 5s for new .pdf files.
pub fn start_watcher(
    app: AppHandle,
    db: SqlitePool,
    bridge: Arc<OpenClawBridge>,
    watcher: Arc<FacturationWatcher>,
    watch_dir: String,
    client_dir: String,
) {
    tauri::async_runtime::spawn(async move {
        {
            let mut active = watcher.active.lock().await;
            *active = true;
        }

        println!("[Facturation] Watcher started on: {}", watch_dir);

        loop {
            // Check if still active
            {
                let active = watcher.active.lock().await;
                if !*active {
                    println!("[Facturation] Watcher stopped");
                    break;
                }
            }

            // Expand ~ in paths
            let expanded_dir = expand_tilde(&watch_dir);
            let expanded_client = expand_tilde(&client_dir);

            // Scan directory for new PDFs
            if let Ok(entries) = std::fs::read_dir(&expanded_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.extension().and_then(|e| e.to_str()) == Some("pdf") {
                        let mut processed = watcher.processed.lock().await;
                        if !processed.contains(&path) {
                            processed.insert(path.clone());
                            // Process this invoice
                            let result = process_invoice(
                                &app,
                                &db,
                                &bridge,
                                &path,
                                &expanded_client,
                            ).await;

                            match result {
                                Ok(summary) => println!("[Facturation] ✓ {}", summary),
                                Err(e) => println!("[Facturation] ✗ Error: {}", e),
                            }
                        }
                    }
                }
            }

            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
        }
    });
}

/// Stop the watcher
pub async fn stop_watcher(watcher: &Arc<FacturationWatcher>) {
    let mut active = watcher.active.lock().await;
    *active = false;
}

/// Process a single invoice PDF:
/// 1. Read the file name + metadata
/// 2. Call OpenClaw to parse
/// 3. Create client folder + move file
/// 4. Log to DB + emit event
pub async fn process_invoice(
    app: &AppHandle,
    db: &SqlitePool,
    bridge: &Arc<OpenClawBridge>,
    pdf_path: &Path,
    client_dir: &str,
) -> Result<String, String> {
    let filename = pdf_path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown.pdf")
        .to_string();
    
    let file_size = std::fs::metadata(pdf_path)
        .map(|m| m.len())
        .unwrap_or(0);

    println!("[Facturation] Processing: {} ({} bytes)", filename, file_size);

    // ── Step 1: Call OpenClaw to parse the invoice ───────────
    let prompt = format!(
        "Tu es un agent de facturation. Analyse le nom et les métadonnées de cette facture et génère un JSON structuré.\n\n\
        Fichier: {}\n\
        Taille: {} octets\n\n\
        Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après, au format:\n\
        {{\"client\": \"Nom du client\", \"montant\": \"1250.00\", \"date_facture\": \"2026-03-01\", \"date_echeance\": \"2026-04-01\", \"numero\": \"FAC-001\"}}",
        filename, file_size
    );

    let session_key = format!("facturation-{}", uuid::Uuid::new_v4());
    let params = serde_json::json!({
        "sessionKey": session_key,
        "message": prompt,
        "idempotencyKey": uuid::Uuid::new_v4().to_string(),
    });

    let ocr_result = match bridge.request("chat.send", params).await {
        Ok(response) => {
            println!("[Facturation] OpenClaw response: {}", response);
            parse_openclaw_response(&response)
        }
        Err(e) => {
            // If OpenClaw is not connected, still do basic processing
            println!("[Facturation] OpenClaw unavailable ({}), using filename fallback", e);
            fallback_parse(&filename)
        }
    };

    // ── Step 2: File operations ─────────────────────────────
    let client_name = ocr_result.get("client")
        .and_then(|v| v.as_str())
        .unwrap_or("Client_Inconnu")
        .to_string();
    
    let montant = ocr_result.get("montant")
        .and_then(|v| v.as_str())
        .unwrap_or("N/A")
        .to_string();

    let date_echeance = ocr_result.get("date_echeance")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let numero = ocr_result.get("numero")
        .and_then(|v| v.as_str())
        .unwrap_or("N/A")
        .to_string();

    // Create client/year directory
    let year = chrono::Local::now().format("%Y").to_string();
    let sanitized_client = sanitize_dirname(&client_name);
    let dest_dir = Path::new(client_dir)
        .join(&sanitized_client)
        .join(&year);

    if let Err(e) = std::fs::create_dir_all(&dest_dir) {
        let err_msg = format!("Impossible de créer le dossier {}: {}", dest_dir.display(), e);
        log_agent_action(app, db, "error", &err_msg, &serde_json::json!({"error": err_msg})).await;
        return Err(err_msg);
    }

    // Move the PDF
    let dest_file = dest_dir.join(&filename);
    if let Err(e) = std::fs::rename(pdf_path, &dest_file) {
        // If rename fails (cross-device), try copy then delete
        match std::fs::copy(pdf_path, &dest_file) {
            Ok(_) => { let _ = std::fs::remove_file(pdf_path); }
            Err(e2) => {
                let err_msg = format!("Impossible de déplacer {}: {} / {}", filename, e, e2);
                log_agent_action(app, db, "error", &err_msg, &serde_json::json!({"error": err_msg})).await;
                return Err(err_msg);
            }
        }
    }

    // ── Step 3: Build summary and log ───────────────────────
    let echeance_info = if !date_echeance.is_empty() {
        format!(", rappel avant le {}", date_echeance)
    } else {
        String::new()
    };

    let summary = format!(
        "Facture {} ({} — {}€) classée dans {}/{}{}",
        numero, client_name, montant, sanitized_client, year, echeance_info
    );

    let details = serde_json::json!({
        "source": pdf_path.to_str().unwrap_or(""),
        "destination": dest_file.to_str().unwrap_or(""),
        "parsed": ocr_result,
    });

    log_agent_action(app, db, "success", &summary, &details).await;

    Ok(summary)
}

/// Run facturation on a test/example — creates a dummy PDF if none exists
pub async fn run_test(
    app: &AppHandle,
    db: &SqlitePool,
    bridge: &Arc<OpenClawBridge>,
    watch_dir: &str,
    client_dir: &str,
) -> Result<String, String> {
    let expanded_dir = expand_tilde(watch_dir);
    let expanded_client = expand_tilde(client_dir);

    // Ensure watch dir exists
    std::fs::create_dir_all(&expanded_dir)
        .map_err(|e| format!("Impossible de créer {}: {}", expanded_dir, e))?;

    // Look for any existing PDF, or create a test one
    let test_pdf = match find_first_pdf(&expanded_dir) {
        Some(path) => path,
        None => {
            // Create a simple test PDF (just text content, not a real PDF)
            let test_path = Path::new(&expanded_dir).join("Facture_Test_Dupont_1250EUR.pdf");
            std::fs::write(&test_path, b"%PDF-1.4 Test Invoice\n")
                .map_err(|e| format!("Impossible de créer le fichier test: {}", e))?;
            test_path
        }
    };

    process_invoice(app, db, bridge, &test_pdf, &expanded_client).await
}

// ─── Helpers ────────────────────────────────────────────────

/// Parse OpenClaw's LLM response to extract the JSON portion
fn parse_openclaw_response(response: &serde_json::Value) -> serde_json::Value {
    // The response from chat.send typically has a "message" or "content" field
    let text = response.get("message")
        .or(response.get("content"))
        .or(response.get("text"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    // If the response itself is a string at top level
    let text = if text.is_empty() {
        response.as_str().unwrap_or("")
    } else {
        text
    };

    // Try to extract JSON from the response text
    extract_json_from_text(text)
}

/// Extract a JSON object from text that may contain markdown or other wrapping
fn extract_json_from_text(text: &str) -> serde_json::Value {
    // Try direct parse first
    if let Ok(val) = serde_json::from_str::<serde_json::Value>(text) {
        if val.is_object() { return val; }
    }

    // Look for JSON between curly braces
    if let Some(start) = text.find('{') {
        if let Some(end) = text.rfind('}') {
            let json_str = &text[start..=end];
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(json_str) {
                if val.is_object() { return val; }
            }
        }
    }

    // Fallback: return an empty structure
    serde_json::json!({
        "client": "Client Inconnu",
        "montant": "N/A",
        "date_facture": "",
        "date_echeance": "",
        "numero": "N/A"
    })
}

/// Fallback parser when OpenClaw is not available — attempts to parse from filename
fn fallback_parse(filename: &str) -> serde_json::Value {
    // Try to extract info from filename like "Facture_Client_Dupont_1250EUR.pdf"
    let base = filename.trim_end_matches(".pdf").trim_end_matches(".PDF");
    let parts: Vec<&str> = base.split(|c: char| c == '_' || c == '-' || c == ' ').collect();

    let mut client = "Client Inconnu".to_string();
    let mut montant = "N/A".to_string();

    for (i, part) in parts.iter().enumerate() {
        // Look for name-like parts (skip "Facture", "FAC", etc.)
        if part.len() > 2 && part.chars().next().map(|c| c.is_uppercase()).unwrap_or(false)
            && *part != "Facture" && *part != "FAC" && !part.contains("EUR")
        {
            if client == "Client Inconnu" {
                client = part.to_string();
            }
        }
        // Look for amount
        if part.contains("EUR") || part.ends_with("€") {
            montant = part.replace("EUR", "").replace("€", "").trim().to_string();
        }
        // Check next part for numeric montant
        if (*part == "montant" || *part == "total") && i + 1 < parts.len() {
            montant = parts[i + 1].to_string();
        }
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let echeance = (chrono::Local::now() + chrono::Duration::days(30))
        .format("%Y-%m-%d").to_string();

    serde_json::json!({
        "client": client,
        "montant": montant,
        "date_facture": today,
        "date_echeance": echeance,
        "numero": format!("FAC-{}", &uuid::Uuid::new_v4().to_string()[..6])
    })
}

/// Log an agent action to the database and emit an event
async fn log_agent_action(
    app: &AppHandle,
    db: &SqlitePool,
    status: &str,
    summary: &str,
    details: &serde_json::Value,
) {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let details_str = serde_json::to_string(details).unwrap_or_default();

    let _ = sqlx::query(
        "INSERT INTO agent_log (agent_id, timestamp, status, summary, details) VALUES (?, ?, ?, ?, ?)"
    )
        .bind("facturation")
        .bind(&now)
        .bind(status)
        .bind(summary)
        .bind(&details_str)
        .execute(db)
        .await;

    // Get last inserted ID
    let id: i64 = sqlx::query("SELECT last_insert_rowid() as id")
        .fetch_one(db)
        .await
        .map(|r| r.get("id"))
        .unwrap_or(0);

    let _ = app.emit("agent-action", serde_json::json!({
        "type": "run",
        "agentId": "facturation",
        "log": {
            "id": id,
            "timestamp": now,
            "status": status,
            "summary": summary,
        }
    }));
}

/// Sanitize a string for use as a directory name
fn sanitize_dirname(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' { c } else { '_' })
        .collect::<String>()
        .trim()
        .to_string()
}

/// Expand ~ to the home directory
fn expand_tilde(path: &str) -> String {
    if path.starts_with("~/") || path == "~" {
        if let Some(home) = dirs::home_dir() {
            return path.replacen("~", home.to_str().unwrap_or("~"), 1);
        }
    }
    path.to_string()
}

/// Find the first PDF file in a directory
fn find_first_pdf(dir: &str) -> Option<PathBuf> {
    std::fs::read_dir(dir).ok()?.find_map(|entry| {
        let path = entry.ok()?.path();
        if path.extension().and_then(|e| e.to_str()) == Some("pdf") {
            Some(path)
        } else {
            None
        }
    })
}
