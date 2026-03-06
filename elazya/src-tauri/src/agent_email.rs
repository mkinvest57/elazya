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
use crate::apple_mail::{self, MailMessage};

// ─── Agent Implementation ───────────────────────────────────

pub struct EmailIntelligentAgent;

#[async_trait]
impl ElAgent for EmailIntelligentAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "email-intelligent",
            name: "Email Intelligent",
            emoji: "📥",
            description: "Trie votre Inbox, prépare les réponses et isole les urgences",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);
        
        let mut emails = Vec::new();

        if is_test {
            // Mock emails based on the prompt's diverse scenarios
            emails.push(serde_json::json!({
                "id": "mock_1",
                "sender": "client.mecontent@exemple.com",
                "subject": "Le site est planté !!",
                "body": "Faites quelque chose tout de suite, on perd des ventes !!! Aidez-moi !! C'est très urgent."
            }));
            emails.push(serde_json::json!({
                "id": "mock_2",
                "sender": "notion@updates.com",
                "subject": "Vous avez été mentionné",
                "body": "N'oubliez pas de faire les wireframes de l'application Elazya d'ici vendredi."
            }));
            emails.push(serde_json::json!({
                "id": "mock_3",
                "sender": "partenaire@cool.fr",
                "subject": "Dispo pour un call demain ?",
                "body": "Hello, je voulais juste savoir si on pouvait s'appeler demain aprèm pour parler du lancement ?"
            }));
            emails.push(serde_json::json!({
                "id": "mock_4",
                "sender": "marketing@newsletter.io",
                "subject": "Achetez nos supers logiciels 50% off",
                "body": "Promotion exceptionnelle, cliquez ici pour acheter."
            }));
        } else {
            let fetched: Vec<MailMessage> = match apple_mail::get_recent_unread_emails(5) {
                Ok(res) => res,
                Err(e) => {
                    println!("[Email Intelligent] Failed to fetch emails: {}", e);
                    vec![]
                }
            };
            if fetched.is_empty() {
                return AgentResult {
                    status: "warning".into(),
                    summary: "Aucun nouvel email à trier.".into(),
                    details: serde_json::json!({}),
                };
            }
            
            for mail in fetched {
                emails.push(serde_json::json!({
                    "id": mail.id,
                    "sender": mail.sender,
                    "subject": mail.subject,
                    "body": mail.content
                }));
            }
        }

        let custom_keywords = settings.get("keywords").and_then(|v| v.as_str()).unwrap_or("");
        
        // Let LLM batch process emails
        let prompt = format!(
            "Tu es 'Email Intelligent', un assistant de tri de boîte de réception de haut niveau.\n\
            Voici un tableau JSON de nouveaux emails reçus.\n\
            Emails d'entrée : {}\n\n\
            Tu dois classer chaque email STRICTEMENT dans l'une de ces 4 catégories :\n\
            1) 'Urgent' : ex: problème critique, client fâché, serveur down. (Inclut les mots clés : {})\n\
            2) 'À faire' : tâche administrative, tâche de design, bug mineur, demande longue...\n\
            3) 'Réponse simple' : e-mail courtois qui nécessite une réponse courte (ex: dispo pour un call).\n\
            4) 'Spam / Archive' : spam, promotions, newsletters inutiles.\n\n\
            Si la catégorie est 'Réponse simple', rédige un court texte de réponse (draft) poli et pro.\n\n\
            Renvoie UNIQUEMENT un JSON structuré exactement comme ceci:\n\
            {{\n\
              \"analyses\": [\n\
                {{\n\
                  \"id\": \"id_de_lemail\",\n\
                  \"categorie\": \"Urgent | À faire | Réponse simple | Spam / Archive\",\n\
                  \"action_suggeree\": \"Notification macOS | Tâche Notion | Brouillon et Archive | Archive\",\n\
                  \"draft_genere\": \"le brouillon ou chaine vide\"\n\
                }}\n\
              ]\n\
            }}",
            serde_json::to_string(&emails).unwrap(),
            custom_keywords
        );

        let parsed_json = match client.call_llm(&prompt).await {
            Ok(text) => OpenClawAgentClient::extract_json(&text),
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur Classification LLM: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        let analyses = parsed_json.get("analyses").and_then(|v| v.as_array()).cloned().unwrap_or_default();
        let mut processed_results = Vec::new();
        
        let mut counts = [0; 4]; // [Urgent, A faire, Simple, Spam]

        for analysis in analyses {
            let cat = analysis.get("categorie").and_then(|v| v.as_str()).unwrap_or("");
            let draft = analysis.get("draft_genere").and_then(|v| v.as_str()).unwrap_or("");
            let original_id = analysis.get("id").and_then(|v| v.as_str()).unwrap_or("");
            
            // Re-bind to original for UI display
            let mut original_mail = serde_json::json!({});
            for m in &emails {
                if m.get("id").unwrap().as_str().unwrap() == original_id {
                    original_mail = m.clone();
                    break;
                }
            }
            
            // Execute simulated actions
            match cat {
                c if c.contains("Urgent") => {
                    counts[0] += 1;
                    #[cfg(target_os = "macos")]
                    {
                        if !is_test {
                            let subj = original_mail.get("subject").unwrap().as_str().unwrap();
                            let sndr = original_mail.get("sender").unwrap().as_str().unwrap();
                            let msg = format!("Email Urgent de {}: {}", sndr, subj);
                            let _ = std::process::Command::new("osascript")
                                .arg("-e")
                                .arg(format!("display notification \"{}\" with title \"Elazya : Mail Urgent\"", msg.replace("\"", "'")))
                                .output();
                        }
                    }
                },
                c if c.contains("faire") => counts[1] += 1,
                c if c.contains("simple") => {
                    counts[2] += 1;
                    if !is_test && !draft.is_empty() {
                       let sndr = original_mail.get("sender").unwrap().as_str().unwrap();
                       let script = format!(
                            r#"
                            tell application "Mail"
                                activate
                                set newMessage to make new outgoing message with properties {{subject:"Re: Votre demande", content:"{}\n", visible:true}}
                                tell newMessage
                                    make new to recipient at end of to recipients with properties {{address:"{}"}}
                                end tell
                            end tell
                            "#,
                            draft.replace("\"", "\\\""), sndr
                        );
                        #[cfg(target_os = "macos")]
                        {
                            let _ = std::process::Command::new("osascript").arg("-e").arg(&script).output();
                        }
                    }
                },
                _ => counts[3] += 1, // Spam / Default
            }

            processed_results.push(serde_json::json!({
                "original": original_mail,
                "analysis": analysis
            }));
        }

        let summary_msg = format!("Inbox scannée: {} Urgents, {} Tâches, {} Brouillons, {} Spams", counts[0], counts[1], counts[2], counts[3]);

        AgentResult {
            status: "success".into(),
            summary: summary_msg,
            details: serde_json::json!({
                "processed": processed_results,
                "counts": {
                    "urgent": counts[0],
                    "todo": counts[1],
                    "draft": counts[2],
                    "spam": counts[3]
                }
            }),
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── Email Watcher ───────────────────────────────────────────

pub struct EmailWatcher {
    pub active: Mutex<bool>,
    pub processed_ids: Mutex<HashSet<String>>,
}

impl EmailWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            processed_ids: Mutex::new(HashSet::new()),
        })
    }
}

pub fn start_email_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<EmailWatcher>,
) {
    let agent = EmailIntelligentAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Email Intelligent] Watcher started");

        loop {
            // Check every 5 minutes (300 secs)
            tokio::time::sleep(tokio::time::Duration::from_secs(300)).await;

            { let a = watcher.active.lock().await; if !*a { println!("[Email Intelligent] Watcher stopped"); break; } }

            let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = 'email-intelligent'")
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

            // Trigger non-test run
            let trigger = serde_json::json!({ "test": false });
            let result = agent.run(&oc_client, &settings, &trigger).await;
            
            if result.status == "success" {
                println!("[Email Intelligent] {}", result.summary);
                log_agent_action(&app, &db, "email-intelligent", &result, None).await;
            }
        }
    });
}

pub async fn stop_email_watcher(watcher: &Arc<EmailWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
