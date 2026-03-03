/**
 * Facturation Auto Agent — Refactored onto BaseAgent pattern.
 *
 * Implements ElAgent trait. Uses OpenClawAgentClient for LLM calls.
 * File watcher logic remains here but uses shared helpers from agent_base.
 */

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::sqlite::SqlitePool;
use tauri::AppHandle;
use async_trait::async_trait;
use serde_json::Value;

use crate::agent_base::{ElAgent, AgentInfo, AgentResult, log_agent_action, expand_tilde, sanitize_dirname};
use crate::openclaw_client::OpenClawAgentClient;

// ─── Agent Implementation ───────────────────────────────────

pub struct FacturationAgent;

#[async_trait]
impl ElAgent for FacturationAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "facturation",
            name: "Facturation Auto",
            emoji: "💰",
            description: "Classe vos factures, crée les dossiers clients, pose les rappels",
        }
    }

    async fn run(
        &self,
        client: &OpenClawAgentClient,
        settings: &Value,
        trigger: &Value,
    ) -> AgentResult {
        let watch_dir = settings.get("watch_dir")
            .and_then(|v| v.as_str())
            .unwrap_or("~/Documents/Factures");
        let client_dir = settings.get("client_dir")
            .and_then(|v| v.as_str())
            .unwrap_or("~/Clients");

        let expanded_watch = expand_tilde(watch_dir);
        let expanded_client = expand_tilde(client_dir);

        // Determine which file to process
        let pdf_path = if let Some(path) = trigger.get("file_path").and_then(|v| v.as_str()) {
            PathBuf::from(path)
        } else {
            // Find first PDF in watch dir, or create test file
            match find_first_pdf(&expanded_watch) {
                Some(p) => p,
                None => {
                    // Create test file
                    let _ = std::fs::create_dir_all(&expanded_watch);
                    let test_path = Path::new(&expanded_watch).join("Facture_Test_Dupont_1250EUR.pdf");
                    let _ = std::fs::write(&test_path, b"%PDF-1.4 Test Invoice\n");
                    test_path
                }
            }
        };

        let filename = pdf_path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown.pdf")
            .to_string();

        let file_size = std::fs::metadata(&pdf_path).map(|m| m.len()).unwrap_or(0);

        // ── Call OpenClaw LLM ───────────────────────────────
        let prompt = format!(
            "Tu es un agent de facturation. Analyse le nom et les métadonnées de cette facture et génère un JSON structuré.\n\n\
            Fichier: {}\nTaille: {} octets\n\n\
            Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après, au format:\n\
            {{\"client\": \"Nom du client\", \"montant\": \"1250.00\", \"date_facture\": \"2026-03-01\", \"date_echeance\": \"2026-04-01\", \"numero\": \"FAC-001\"}}",
            filename, file_size
        );

        let parsed = if trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false) {
            serde_json::json!({
                "client": "Test Client",
                "montant": "1250.00",
                "date_facture": "2026-03-01",
                "date_echeance": "2026-04-01",
                "numero": "FAC-TEST-001"
            })
        } else {
            match client.call_llm(&prompt).await {
                Ok(text) => OpenClawAgentClient::extract_json(&text),
                Err(_) => fallback_parse(&filename),
            }
        };

        let client_name = parsed.get("client").and_then(|v| v.as_str()).unwrap_or("Client_Inconnu").to_string();
        let montant = parsed.get("montant").and_then(|v| v.as_str()).unwrap_or("N/A").to_string();
        let date_echeance = parsed.get("date_echeance").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let numero = parsed.get("numero").and_then(|v| v.as_str()).unwrap_or("N/A").to_string();

        // ── File operations ─────────────────────────────────
        let year = chrono::Local::now().format("%Y").to_string();
        let sanitized = sanitize_dirname(&client_name);
        let dest_dir = Path::new(&expanded_client).join(&sanitized).join(&year);

        if let Err(e) = std::fs::create_dir_all(&dest_dir) {
            return AgentResult {
                status: "error".into(),
                summary: format!("Impossible de créer {}: {}", dest_dir.display(), e),
                details: serde_json::json!({"error": e.to_string()}),
            };
        }

        let dest_file = dest_dir.join(&filename);
        if let Err(e) = std::fs::rename(&pdf_path, &dest_file) {
            match std::fs::copy(&pdf_path, &dest_file) {
                Ok(_) => { let _ = std::fs::remove_file(&pdf_path); }
                Err(e2) => {
                    return AgentResult {
                        status: "error".into(),
                        summary: format!("Impossible de déplacer {}: {}/{}", filename, e, e2),
                        details: serde_json::json!({"error": format!("{}/{}", e, e2)}),
                    };
                }
            }
        }

        let echeance_info = if !date_echeance.is_empty() {
            format!(", rappel avant le {}", date_echeance)
        } else { String::new() };

        AgentResult {
            status: "success".into(),
            summary: format!("Facture {} ({} — {}€) classée dans {}/{}{}", numero, client_name, montant, sanitized, year, echeance_info),
            details: serde_json::json!({
                "source": pdf_path.to_str().unwrap_or(""),
                "destination": dest_file.to_str().unwrap_or(""),
                "parsed": parsed,
            }),
        }
    }

    fn validate_settings(&self, settings: &Value) -> Result<(), String> {
        if let Some(dir) = settings.get("watch_dir").and_then(|v| v.as_str()) {
            let expanded = expand_tilde(dir);
            if !Path::new(&expanded).exists() {
                return Err(format!("Le dossier '{}' n'existe pas", dir));
            }
        }
        Ok(())
    }
}

// ─── File Watcher ───────────────────────────────────────────

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

pub fn start_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<FacturationWatcher>,
    watch_dir: String,
    client_dir: String,
) {
    let agent = FacturationAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Facturation] Watcher started on: {}", watch_dir);

        loop {
            { let a = watcher.active.lock().await; if !*a { println!("[Facturation] Watcher stopped"); break; } }

            let expanded = expand_tilde(&watch_dir);
            if let Ok(entries) = std::fs::read_dir(&expanded) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.extension().and_then(|e| e.to_str()) == Some("pdf") {
                        let mut processed = watcher.processed.lock().await;
                        if !processed.contains(&path) {
                            processed.insert(path.clone());

                            let settings = serde_json::json!({
                                "watch_dir": watch_dir,
                                "client_dir": client_dir,
                            });
                            let trigger = serde_json::json!({ "file_path": path.to_str().unwrap_or("") });

                            let result = agent.run(&oc_client, &settings, &trigger).await;
                            println!("[Facturation] {} — {}", result.status, result.summary);
                            log_agent_action(&app, &db, "facturation", &result).await;
                        }
                    }
                }
            }
            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
        }
    });
}

pub async fn stop_watcher(watcher: &Arc<FacturationWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}

// ─── Helpers ────────────────────────────────────────────────

fn fallback_parse(filename: &str) -> Value {
    let base = filename.trim_end_matches(".pdf").trim_end_matches(".PDF");
    let parts: Vec<&str> = base.split(|c: char| c == '_' || c == '-' || c == ' ').collect();
    let mut client = "Client Inconnu".to_string();
    let mut montant = "N/A".to_string();

    for part in &parts {
        if part.len() > 2 && part.chars().next().map(|c| c.is_uppercase()).unwrap_or(false)
            && *part != "Facture" && *part != "FAC" && !part.contains("EUR") {
            if client == "Client Inconnu" { client = part.to_string(); }
        }
        if part.contains("EUR") || part.ends_with("€") {
            montant = part.replace("EUR", "").replace("€", "").trim().to_string();
        }
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let echeance = (chrono::Local::now() + chrono::Duration::days(30)).format("%Y-%m-%d").to_string();

    serde_json::json!({
        "client": client, "montant": montant,
        "date_facture": today, "date_echeance": echeance,
        "numero": format!("FAC-{}", &uuid::Uuid::new_v4().to_string()[..6])
    })
}

fn find_first_pdf(dir: &str) -> Option<PathBuf> {
    std::fs::read_dir(dir).ok()?.find_map(|entry| {
        let path = entry.ok()?.path();
        if path.extension().and_then(|e| e.to_str()) == Some("pdf") { Some(path) } else { None }
    })
}
