use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::sqlite::SqlitePool;
use sqlx::Row;
use tauri::AppHandle;
use async_trait::async_trait;
use serde_json::Value;

use crate::agent_base::{ElAgent, AgentInfo, AgentResult, log_agent_action};
use crate::openclaw_client::OpenClawAgentClient;
use crate::apple_mail;

// ─── Agent Implementation ───────────────────────────────────

pub struct ComptaExportAgent;

#[async_trait]
impl ElAgent for ComptaExportAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "compta-export",
            name: "Compta Export",
            emoji: "📊",
            description: "Export comptable mensuel automatique",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);
        let month_str = chrono::Local::now().format("%Y-%m").to_string();

        let mut folder_path = PathBuf::from(
            settings.get("watch_folder")
                .and_then(|v| v.as_str())
                .unwrap_or("~/Documents/Factures")
        );

        if folder_path.starts_with("~/") {
            if let Some(home) = dirs::home_dir() {
                folder_path = home.join(folder_path.strip_prefix("~/").unwrap());
            }
        }

        let mut files_content = Vec::new();

        if is_test {
            files_content.push(serde_json::json!({
                "filename": "FA-2603-01.txt",
                "content": "Facture FA-2603-01\nClient: Apple Inc.\nDate: 01/03/2026\nDescription: Prestation de développement logiciel\nTotal HT: 5000.00 EUR\nTVA (20%): 1000.00 EUR\nTotal TTC: 6000.00 EUR\nStatut: PAYÉ"
            }));
            files_content.push(serde_json::json!({
                "filename": "FA-2603-02.md",
                "content": "# Facture N° FA-2603-02\n- Client : Startup XYZ\n- Date d'émission : 05/03/2026\n\n**Montants** :\n- HT : 1200\n- TVA : 240\n- TTC : 1440\n\n*Condition: En attente de paiement*"
            }));
            files_content.push(serde_json::json!({
                "filename": "FA-2603-03.txt",
                "content": "FACTURE FA-2603-03\nÀ l'attention de: Google France\nDate de facturation: 12 Mars 2026\n\nPrestation Conseil\nHT: 8000 €\nTVA: 1600 €\nTTC: 9600 €\nStatut : Payé le 13/03"
            }));
        } else {
            if folder_path.exists() {
                if let Ok(entries) = std::fs::read_dir(&folder_path) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() {
                            let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
                            if ext == "txt" || ext == "md" {
                                if let Ok(content) = std::fs::read_to_string(&path) {
                                    files_content.push(serde_json::json!({
                                        "filename": path.file_name().unwrap_or_default().to_string_lossy(),
                                        "content": content
                                    }));
                                }
                            }
                        }
                    }
                }
            } else {
                return AgentResult {
                    status: "warning".into(),
                    summary: format!("Le dossier n'existe pas : {:?}", folder_path),
                    details: serde_json::json!({}),
                };
            }

            if files_content.is_empty() {
                return AgentResult {
                    status: "warning".into(),
                    summary: "Aucune facture logicielle trouvée dans le dossier.".into(),
                    details: serde_json::json!({}),
                };
            }
        }

        let prompt = format!(
            "Tu es un expert comptable automatisé.\n\
            Voici un lot de fichiers textes représentant des factures du mois.\n\
            Ton but est d'extraire les données clés de CHAQUE facture pour générer un tableau comptable d'export.\n\
            Factures : {}\n\n\
            Pour chaque facture, extrais exactement :\n\
            - num (String): Le numéro de la facture\n\
            - client (String): Le nom du client\n\
            - ht (Number): Montant Hors Taxe\n\
            - tva (Number): Montant de la TVA\n\
            - ttc (Number): Montant TTC\n\
            - date (String): La date de la facture (format court)\n\
            - statut (String): 'Payé' ou 'En attente'\n\n\
            Renvoie UNIQUEMENT un JSON structuré exactement comme ceci:\n\
            {{\n\
              \"factures\": [\n\
                {{ \"num\": \"...\", \"client\": \"...\", \"ht\": 1000, \"tva\": 200, \"ttc\": 1200, \"date\": \"...\", \"statut\": \"...\" }}\n\
              ],\n\
              \"total_ht\": 1000,\n\
              \"total_tva\": 200,\n\
              \"total_ttc\": 1200\n\
            }}",
            serde_json::to_string(&files_content).unwrap()
        );

        let parsed_json = match client.call_llm(&prompt).await {
            Ok(text) => OpenClawAgentClient::extract_json(&text),
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur Lecture LLM: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        let factures = parsed_json.get("factures").and_then(|v| v.as_array()).cloned().unwrap_or_default();
        let total_ht = parsed_json.get("total_ht").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let count = factures.len();

        let csv_format = settings.get("format").and_then(|v| v.as_str()).unwrap_or("Standard");
        
        // Build CSV string
        let mut csv_data = String::new();
        // Header
        csv_data.push_str("NumFacture;Client;Date;MontantHT;MontantTVA;MontantTTC;Statut\n");

        for f in &factures {
            let num = f.get("num").and_then(|v| v.as_str()).unwrap_or("");
            let client = f.get("client").and_then(|v| v.as_str()).unwrap_or("");
            let date = f.get("date").and_then(|v| v.as_str()).unwrap_or("");
            let ht = f.get("ht").and_then(|v| v.as_f64()).unwrap_or(0.0);
            let tva = f.get("tva").and_then(|v| v.as_f64()).unwrap_or(0.0);
            let ttc = f.get("ttc").and_then(|v| v.as_f64()).unwrap_or(0.0);
            let statut = f.get("statut").and_then(|v| v.as_str()).unwrap_or("");

            csv_data.push_str(&format!("{};{};{};{};{};{};{}\n", num, client, date, ht, tva, ttc, statut));
        }

        // Write CSV
        let export_dir = dirs::desktop_dir().unwrap_or_else(|| PathBuf::from("~/Desktop")).join("Compta_Export");
        if !export_dir.exists() {
            let _ = std::fs::create_dir_all(&export_dir);
        }

        let file_name = format!("Export_Compta_{}_{}.csv", csv_format, month_str);
        let file_path = export_dir.join(&file_name);

        if let Err(e) = std::fs::write(&file_path, &csv_data) {
            return AgentResult {
                status: "error".into(),
                summary: format!("Impossible d'écrire le CSV: {}", e),
                details: serde_json::json!({"error": e.to_string()}),
            };
        }

        let target_email = settings.get("email_comptable").and_then(|v| v.as_str()).unwrap_or("");

        if !is_test && !target_email.is_empty() {
             let email_subject = format!("Client XYZ - Export Compta {}", month_str);
             let email_body = format!("Bonjour,\n\nVoici l'export comptable ({}) pour le mois de {}.\nIl contient {} factures, pour un total de {} € HT.\nLe fichier {} est placé sur mon bureau.\n\nCordialement.", csv_format, month_str, count, total_ht, file_name);
             
             let _ = apple_mail::draft_email(target_email, &email_subject, &email_body);
        }

        let summary_msg = format!("Export généré: {} factures, Total HT: {} €", count, total_ht);

        AgentResult {
            status: "success".into(),
            summary: summary_msg,
            details: serde_json::json!({
                "factures": factures,
                "total_ht": total_ht,
                "total_tva": parsed_json.get("total_tva").unwrap_or(&serde_json::json!(0)),
                "total_ttc": parsed_json.get("total_ttc").unwrap_or(&serde_json::json!(0)),
                "csv_path": file_path.to_string_lossy(),
                "csv_raw": csv_data
            }),
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── Compta Watcher ───────────────────────────────────────────

pub struct ComptaWatcher {
    pub active: Mutex<bool>,
    pub last_run_month: Mutex<String>,
}

impl ComptaWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            last_run_month: Mutex::new(String::new()),
        })
    }
}

pub fn start_compta_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<ComptaWatcher>,
) {
    let agent = ComptaExportAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Compta] Watcher started");

        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(3600)).await; // Check once per hour

            { let a = watcher.active.lock().await; if !*a { println!("[Compta] Watcher stopped"); break; } }

            let current_date = chrono::Local::now();
            let day = current_date.format("%d").to_string();
            let hour = current_date.format("%H").to_string();
            let month_str = current_date.format("%Y-%m").to_string();

            // Run only on the 1st of the month, around 9 AM
            if day == "01" && hour == "09" {
                 let mut should_run = false;
                 {
                     let mut last_run = watcher.last_run_month.lock().await;
                     if *last_run != month_str {
                         *last_run = month_str.clone();
                         should_run = true;
                     }
                 }

                 if should_run {
                     let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = 'compta-export'")
                        .fetch_optional(&db)
                        .await
                        .ok()
                        .flatten();

                     let settings: Value = match row {
                        Some(r) => {
                            let s: String = r.get("settings");
                            serde_json::from_str(&s).unwrap_or(serde_json::json!({}))
                        }
                        None => serde_json::json!({}),
                     };

                     let trigger = serde_json::json!({ "test": false });
                     let result = agent.run(&oc_client, &settings, &trigger).await;
            
                     if result.status == "success" {
                         log_agent_action(&app, &db, "compta-export", &result).await;
                     }
                 }
            }
        }
    });
}

pub async fn stop_compta_watcher(watcher: &Arc<ComptaWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
