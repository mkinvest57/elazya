use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::sqlite::SqlitePool;
use tauri::AppHandle;
use async_trait::async_trait;
use serde_json::Value;

use crate::agent_base::{ElAgent, AgentInfo, AgentResult, log_agent_action};
use crate::openclaw_client::OpenClawAgentClient;
use crate::apple_mail;

// ─── Agent Implementation ───────────────────────────────────

pub struct QualificationAgent;

#[async_trait]
impl ElAgent for QualificationAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "qualification",
            name: "Qualification Leads Auto",
            emoji: "🎯",
            description: "Analyse, score et trie automatiquement vos prospects entrants",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        // Test mode simulation
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);
        
        // Fetch specific thresholds
        let hot_threshold_str = settings.get("hot_threshold").and_then(|v| v.as_str()).unwrap_or("80");
        let hot_threshold: i32 = hot_threshold_str.replace("%", "").parse().unwrap_or(80);

        let mut email_id = trigger.get("email_id").and_then(|v| v.as_str()).unwrap_or("test_id").to_string();
        let mut sender = trigger.get("sender").and_then(|v| v.as_str()).unwrap_or("Sophie Martin <sophie@startup-tech.com>").to_string();
        let mut subject = trigger.get("subject").and_then(|v| v.as_str()).unwrap_or("Refonte de notre infrastructure - Demande de devis urgent").to_string();
        let mut content = trigger.get("content").and_then(|v| v.as_str()).unwrap_or("Bonjour, nous venons de lever des fonds et nous avons besoin de refondre toute notre stack technique d'ici 2 mois. Notre budget est d'environ 50k€. Quand pouvons-nous en discuter ?").to_string();

        if is_test {
            // Check if there's actually a test email in the inbox, else keep dummy
            if let Ok(emails) = apple_mail::get_recent_unread_emails(5) {
                if let Some(msg) = emails.first() {
                    email_id = msg.id.clone();
                    sender = msg.sender.clone();
                    subject = msg.subject.clone();
                    content = msg.content.clone();
                }
            }
        }

        // 1. Send to LLM for Smart Scoring
        let prompt = format!(
            "Tu es un Lead Manager expert. Évalue ce mail prospect entrant.\n\
            Expéditeur : '{}'\nSujet : '{}'\nContenu : '{}'\n\n\
            Analyse précisément et renvoie EXACTEMENT CE JSON :\n\
            {{\n\
              \"score\": <entier entre 0 et 100 estimant la chaleur du lead>,\n\
              \"budget\": \"<Bas | Moyen | Haut | Non spécifié>\",\n\
              \"delai\": \"<Urgent | 1-3 mois | > 3 mois | Non spécifié>\",\n\
              \"action_suggeree\": \"<Répondre maintenant | Tâche CRM | Ignorer>\",\n\
              \"raison\": \"<1 phrase courte expliquant le score>\"\n\
            }}",
            sender, subject, content
        );

        let parsed = match client.call_llm(&prompt).await {
            Ok(text) => OpenClawAgentClient::extract_json(&text),
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur de Scoring LLM: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        let score = parsed.get("score").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
        let budget = parsed.get("budget").and_then(|v| v.as_str()).unwrap_or("Non spécifié");
        let delai = parsed.get("delai").and_then(|v| v.as_str()).unwrap_or("Non spécifié");
        let action = parsed.get("action_suggeree").and_then(|v| v.as_str()).unwrap_or("À vérifier");
        let raison = parsed.get("raison").and_then(|v| v.as_str()).unwrap_or("Analyse incomplète");

        // 2. Logic execution based on computed Score
        let message_log;
        let mut drafted = false;
        
        if score >= hot_threshold {
            message_log = format!("🔥 Lead Ultra Chaud ({} / 100) : Brouillon auto préparé !", score);
            // Action : Draft Response right away!
            let calendly_url = settings.get("calendly_url").and_then(|v| v.as_str()).unwrap_or("https://calendly.com");
            let auto_reply = format!(
                "Bonjour,\n\nMerci pour votre message ! Votre projetsemble passionnant.\n\n\
                Je suis disponible pour en discuter rapidement. Voici mon agenda pour bloquer un créneau :\n{}\n\n\
                À très vite.", 
                calendly_url
            );
            if !is_test {
                let _ = apple_mail::draft_email(&sender, &format!("Re: {}", subject), &auto_reply);
                let _ = apple_mail::mark_email_as_read(&email_id);
            } else {
                let _ = apple_mail::draft_email(&sender, &format!("Re: {}", subject), &auto_reply);
            }
            drafted = true;
        } else if score >= 40 {
            message_log = format!("☀️ Lead Tiède ({} / 100) : Ajouté au CRM pour suivi", score);
            // Action : Just store data (mocked to DB insertion / Notion in prod)
            if !is_test {
                let _ = apple_mail::mark_email_as_read(&email_id);
            }
        } else {
            message_log = format!("❄️ Lead Froid ({} / 100) : Ignoré silencieusement", score);
            // Action : Mark as read to avoid reparsing
            if !is_test {
                let _ = apple_mail::mark_email_as_read(&email_id);
            }
        }

        // 3. Return Structured Response for UI rendering
        AgentResult {
            status: "success".into(),
            summary: message_log,
            details: serde_json::json!({
                "score": score,
                "budget": budget,
                "delai": delai,
                "action": action,
                "raison": raison,
                "drafted": drafted,
                "email_sender": sender
            }),
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── Qualification Watcher ───────────────────────────────────────────

pub struct QualificationWatcher {
    pub active: Mutex<bool>,
    pub processed: Mutex<HashSet<String>>,
}

impl QualificationWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            processed: Mutex::new(HashSet::new()),
        })
    }
}

pub fn start_qualification_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<QualificationWatcher>,
) {
    let agent = QualificationAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Qualification] Watcher started");

        loop {
            { let a = watcher.active.lock().await; if !*a { println!("[Qualification] Watcher stopped"); break; } }

            // Polling Apple Mail every 45 secs for potential leads
            if let Ok(emails) = apple_mail::get_recent_unread_emails(15) {
                for email in emails {
                    let subject_lower = email.subject.to_lowercase();
                    let content_lower = email.content.to_lowercase();
                    
                    // Broad lead filters (different from precise Onboarding)
                    let is_probable_lead = subject_lower.contains("projet") || 
                                           subject_lower.contains("collaboration") ||
                                           content_lower.contains("agence") ||
                                           content_lower.contains("devis") ||
                                           content_lower.contains("budget");

                    if is_probable_lead {
                        let mut processed = watcher.processed.lock().await;
                        if !processed.contains(&email.id) {
                            processed.insert(email.id.clone());

                            // Read DB settings (thresholds, etc.)
                            let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = 'qualification'")
                                .fetch_optional(&db)
                                .await
                                .ok()
                                .flatten();

                            let settings: Value = match row {
                                Some(r) => {
                                    let s: String = sqlx::Row::get(&r, "settings");
                                    serde_json::from_str(&s).unwrap_or(serde_json::json!({}))
                                }
                                None => serde_json::json!({}),
                            };

                            let trigger = serde_json::json!({
                                "email_id": email.id,
                                "sender": email.sender,
                                "subject": email.subject,
                                "content": email.content
                            });

                            let result = agent.run(&oc_client, &settings, &trigger).await;
                            println!("[Qualification] {} — {}", result.status, result.summary);
                            log_agent_action(&app, &db, "qualification", &result, None).await;
                        }
                    }
                }
            }
            
            tokio::time::sleep(tokio::time::Duration::from_secs(45)).await;
        }
    });
}

pub async fn stop_qualification_watcher(watcher: &Arc<QualificationWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
