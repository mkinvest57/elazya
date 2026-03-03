use std::path::{Path, PathBuf};
use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::sqlite::SqlitePool;
use sqlx::Row;
use tauri::AppHandle;
use async_trait::async_trait;
use serde_json::Value;

use crate::agent_base::{ElAgent, AgentInfo, AgentResult, log_agent_action};
use crate::openclaw_client::OpenClawAgentClient;

// ─── Agent Implementation ───────────────────────────────────

pub struct DevisExpressAgent;

#[async_trait]
impl ElAgent for DevisExpressAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "devis-express",
            name: "Devis Express",
            emoji: "⚡",
            description: "Analyse un brief prospect et génère un devis chiffré prêt à l'envoi",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);
        
        let mut file_content = trigger.get("file_content").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let file_name = trigger.get("file_name").and_then(|v| v.as_str()).unwrap_or("Test_Brief.txt");
        
        if is_test && file_content.is_empty() {
            // Mock content for testing
            file_content = "Bonjour Elazya, nous cherchons une agence pour refondre notre site vitrine (5 pages) \
                            et moderniser notre logo. Notre budget tourne autour de 3500€ et il nous faudrait \
                            ça idéalement pour la fin du mois prochain. Pouvez-vous nous faire un devis ? \
                            Cordialement, Jean (jean@entreprise-demo.fr)".to_string();
        }

        if file_content.is_empty() {
            return AgentResult {
                status: "warning".into(),
                summary: "Aucun brief à analyser.".into(),
                details: serde_json::json!({}),
            };
        }

        // Get pricing grid from settings
        let grille_tarifaire = settings.get("tarifs").and_then(|v| v.as_str()).unwrap_or(
            "Site web vitrine : 2500€\nSite e-commerce : 5000€\nLogo : 800€\nMaintenance : 150€/mois"
        );

        // --- STEP 1: Parse Brief ---
        let parse_prompt = format!(
            "Tu es un avant-vente senior. Analyse le brief prospect suivant.\n\
            Brief: {}\n\n\
            Renvoie STRICTEMENT un JSON avec cette structure:\n\
            {{\n\
              \"livrables\": [\"Livrable 1\", \"Livrable 2\"],\n\
              \"delai\": \"délai identifié ou 'Non précisé'\",\n\
              \"budget\": \"budget identifié ou 'Non précisé'\",\n\
              \"complexite\": \"Basique, Standard, ou Complexe\",\n\
              \"client_email\": \"email si trouvé, sinon ''\"\n\
            }}",
            file_content
        );

        let parsed_json = match client.call_llm(&parse_prompt).await {
            Ok(text) => OpenClawAgentClient::extract_json(&text),
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur Parsing Brief: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        // --- STEP 2: Generate Quote (Markdown) ---
        let livrables = parsed_json.get("livrables").and_then(|v| v.as_array())
            .map(|a| a.iter().filter_map(|i| i.as_str()).collect::<Vec<_>>().join(", "))
            .unwrap_or("Non définis".to_string());
        
        let client_email = parsed_json.get("client_email").and_then(|v| v.as_str()).unwrap_or("").to_string();

        let generate_prompt = format!(
            "Génère un devis formel structuré en Markdown. \n\
            Grille tarifaire de notre agence : \n{}\n\n\
            Données du brief prospect : \n\
            Livrables demandés : {}\n\
            Délai souhaité : {}\n\
            Complexité estimée : {}\n\n\
            Rédige le corps du devis incluant un tableau des prix (calcule un total réaliste basé sur la grille), \
            et des conditions de paiement (Acompte 30%). Sois très professionnel.",
            grille_tarifaire,
            livrables,
            parsed_json.get("delai").and_then(|v| v.as_str()).unwrap_or("?"),
            parsed_json.get("complexite").and_then(|v| v.as_str()).unwrap_or("?")
        );

        let mut quote_markdown = match client.call_llm(&generate_prompt).await {
            Ok(text) => text,
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur Génération Devis: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        // Ensure proper markdown formatting (sometimes LLMs wrap in ```markdown)
        if quote_markdown.starts_with("```markdown") {
            quote_markdown = quote_markdown.replace("```markdown\n", "").replace("\n```", "");
        } else if quote_markdown.starts_with("```") {
            quote_markdown = quote_markdown.replace("```\n", "").replace("\n```", "");
        }

        // --- STEP 3: Save to Disk & Draft Email ---
        let mut saved_path = "".to_string();
        let mut email_drafted = false;

        let desktop_raw = dirs::desktop_dir();
        if let Some(mut desktop) = desktop_raw {
            desktop.push("Devis_Elazya");
            let _ = std::fs::create_dir_all(&desktop);
            
            let date_str = chrono::Local::now().format("%Y-%m-%d").to_string();
            let safe_filename = format!("Devis_{}_{}.md", date_str, file_name.replace(".txt", "").replace(" ", "_"));
            desktop.push(&safe_filename);

            if let Ok(_) = std::fs::write(&desktop, &quote_markdown) {
                saved_path = desktop.to_string_lossy().to_string();
                
                // Emulate opening the file
                #[cfg(target_os = "macos")]
                {
                    let _ = std::process::Command::new("open").arg(&desktop).spawn();
                }

                // If email exists, draft an email via AppleScript
                if !client_email.is_empty() {
                    let subject = "Votre Devis Suite à votre Brief";
                    let body = "Bonjour,\n\nVeuillez trouver ci-joint notre proposition commerciale suite à votre demande.\n\nCordialement,";
                    
                    let script = format!(
                        r#"
                        tell application "Mail"
                            activate
                            set newMessage to make new outgoing message with properties {{subject:"{}", content:"{}\n\nLe devis a été généré dans: {}", visible:true}}
                            tell newMessage
                                make new to recipient at end of to recipients with properties {{address:"{}"}}
                            end tell
                        end tell
                        "#,
                        subject, body, saved_path, client_email
                    );

                    #[cfg(target_os = "macos")]
                    {
                        if let Ok(_) = std::process::Command::new("osascript").arg("-e").arg(&script).output() {
                            email_drafted = true;
                        }
                    }
                }
            }
        }

        AgentResult {
            status: "success".into(),
            summary: format!("Devis généré avec succès pour {}", file_name),
            details: serde_json::json!({
                "file": file_name,
                "parsed_brief": parsed_json,
                "quote_markdown": quote_markdown,
                "saved_path": saved_path,
                "email_drafted": email_drafted
            }),
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── Devis Watcher (Directory Scanner) ───────────────────────────────────────────

pub struct DevisWatcher {
    pub active: Mutex<bool>,
    pub processed_files: Mutex<HashSet<String>>,
}

impl DevisWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            processed_files: Mutex::new(HashSet::new()),
        })
    }
}

pub fn start_devis_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<DevisWatcher>,
) {
    let agent = DevisExpressAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Devis Express] Watcher started");

        loop {
            { let a = watcher.active.lock().await; if !*a { println!("[Devis Express] Watcher stopped"); break; } }

            let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = 'devis-express'")
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

            let raw_dir = settings.get("watch_folder").and_then(|v| v.as_str()).unwrap_or("~/Documents/Briefs");
            let expanded_dir = raw_dir.replace("~", &dirs::home_dir().unwrap().to_string_lossy());
            let watch_path = Path::new(&expanded_dir);

            if watch_path.exists() && watch_path.is_dir() {
                if let Ok(entries) = std::fs::read_dir(watch_path) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() {
                            let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                            
                            if file_name.ends_with(".txt") || file_name.ends_with(".md") {
                                let mut processed = watcher.processed_files.lock().await;
                                if !processed.contains(&file_name) {
                                    processed.insert(file_name.clone());

                                    if let Ok(content) = std::fs::read_to_string(&path) {
                                        let trigger = serde_json::json!({
                                            "file_name": file_name,
                                            "file_content": content
                                        });

                                        let result = agent.run(&oc_client, &settings, &trigger).await;
                                        println!("[Devis Express] {} — {}", result.status, result.summary);
                                        log_agent_action(&app, &db, "devis-express", &result).await;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if raw_dir.starts_with("~/Documents/Briefs") {
                let _ = std::fs::create_dir_all(watch_path);
            }
            
            // Poll folder every 10 seconds
            tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
        }
    });
}

pub async fn stop_devis_watcher(watcher: &Arc<DevisWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
