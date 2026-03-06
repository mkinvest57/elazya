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

pub struct OnboardingClientAgent;

#[async_trait]
impl ElAgent for OnboardingClientAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "onboarding-client",
            name: "Onboarding Client Express",
            emoji: "📧",
            description: "Répond aux prospects en 5 min, crée le dossier client",
        }
    }

    async fn run(
        &self,
        client: &OpenClawAgentClient,
        settings: &Value,
        trigger: &Value,
    ) -> AgentResult {
        // If it's a test run, we simulate
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);
        
        let mut email_id = trigger.get("email_id").and_then(|v| v.as_str()).unwrap_or("test_id").to_string();
        let mut sender = trigger.get("sender").and_then(|v| v.as_str()).unwrap_or("Jean Dupont <jean@innovtech.com>").to_string();
        let mut subject = trigger.get("subject").and_then(|v| v.as_str()).unwrap_or("Demande d'informations - InnovTech").to_string();
        let mut content = trigger.get("content").and_then(|v| v.as_str()).unwrap_or("Bonjour, je souhaite automatiser mon entreprise.").to_string();

        if is_test {
            // Check if there's actually an email in the inbox to test with, otherwise use dummy
            if let Ok(emails) = apple_mail::get_recent_unread_emails(5) {
                if let Some(msg) = emails.first() {
                    email_id = msg.id.clone();
                    sender = msg.sender.clone();
                    subject = msg.subject.clone();
                    content = msg.content.clone();
                }
            }
        }

        let calendly_url = settings.get("calendly_url").and_then(|v: &Value| v.as_str()).unwrap_or("https://calendly.com/votre-lien");

        // 1. Generate the response with LLM
        let prompt = format!(
            "Tu es un assistant commercial expert. Le prospect '{}' (Sujet: '{}') a envoyé ce message:\n\n{}\n\n\
            Objectif 1 : Rédiger une réponse professionnelle, chaleureuse et structurée en français. \
            Accuse réception, montre de l'intérêt et propose un appel de découverte en utilisant STRICTEMENT ce lien Calendly : {}. \
            Objectif 2 : Extraire les informations CRM suivantes du message du prospect (si non précisé, indique 'Non spécifié'): \
            - nom du prospect \
            - nom de la société \
            - type de projet \
            - budget \
            - délais \
            - niveau d'intérêt (froid, tiède, chaud).\n\n\
            Renvoie UNIQUEMENT un JSON structuré exactement comme ceci:\n\
            {{\n  \"response\": \"Texte complet de l'email de réponse...\",\n  \"prospect_name\": \"...\",\n  \"company_name\": \"...\",\n  \"project_type\": \"...\",\n  \"budget\": \"...\",\n  \"deadline\": \"...\",\n  \"interest_level\": \"...\"\n}}",
            sender, subject, content, calendly_url
        );

        let parsed = match client.call_llm(&prompt).await {
            Ok(text) => OpenClawAgentClient::extract_json(&text),
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur de génération LLM: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        let response_text = parsed.get("response").and_then(|v| v.as_str()).unwrap_or("Bonjour, merci pour votre message. Nous vous recontactons vite.");
        let company_name = parsed.get("company_name").and_then(|v| v.as_str()).unwrap_or("Inconnu");
        let prospect_name = parsed.get("prospect_name").and_then(|v| v.as_str()).unwrap_or("Inconnu");
        let project_type = parsed.get("project_type").and_then(|v| v.as_str()).unwrap_or("Non spécifié");
        let budget = parsed.get("budget").and_then(|v| v.as_str()).unwrap_or("Non spécifié");
        let deadline = parsed.get("deadline").and_then(|v| v.as_str()).unwrap_or("Non spécifié");
        let interest_level = parsed.get("interest_level").and_then(|v| v.as_str()).unwrap_or("Non spécifié");

        let notion_added = false; // Simulated Notion push for now

        // 3. Draft the email response
        if !is_test {
            if let Err(e) = apple_mail::draft_email(&sender, &format!("Re: {}", subject), response_text) {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Impossible de créer le brouillon: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
            let _ = apple_mail::mark_email_as_read(&email_id);
        } else {
            // For test, we can still draft so the user sees the preview! 
            let _ = apple_mail::draft_email(&sender, &format!("Re: {}", subject), response_text);
        }

        AgentResult {
            status: "success".into(),
            summary: format!("Brouillon préparé pour {}", sender),
            details: serde_json::json!({
                "email_subject": subject,
                "prospect_name": prospect_name,
                "company": company_name,
                "project_type": project_type,
                "budget": budget,
                "deadline": deadline,
                "interest_level": interest_level,
                "generated_response": response_text,
                "notion_added": notion_added
            }),
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── File/Mail Watcher ───────────────────────────────────────────

pub struct OnboardingWatcher {
    pub active: Mutex<bool>,
    pub processed: Mutex<HashSet<String>>, // Email IDs
}

impl OnboardingWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            processed: Mutex::new(HashSet::new()),
        })
    }
}

pub fn start_onboarding_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<OnboardingWatcher>,
) {
    let agent = OnboardingClientAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Onboarding] Watcher started");

        loop {
            { let a = watcher.active.lock().await; if !*a { println!("[Onboarding] Watcher stopped"); break; } }

            // Polling Apple Mail every 30 seconds
            if let Ok(emails) = apple_mail::get_recent_unread_emails(10) {
                for email in emails {
                    // Specific keywords checking
                    let subject_lower = email.subject.to_lowercase();
                    let content_lower = email.content.to_lowercase();
                    
                    let is_prospect = subject_lower.contains("devis") || 
                                      subject_lower.contains("information") || 
                                      subject_lower.contains("contact") ||
                                      content_lower.contains("intéressé") ||
                                      content_lower.contains("rdv") ||
                                      content_lower.contains("automatisation");

                    if is_prospect {
                        let mut processed = watcher.processed.lock().await;
                        if !processed.contains(&email.id) {
                            processed.insert(email.id.clone());

                            let trigger = serde_json::json!({
                                "email_id": email.id,
                                "sender": email.sender,
                                "subject": email.subject,
                                "content": email.content
                            });

                            let result = agent.run(&oc_client, &serde_json::json!({}), &trigger).await;
                            println!("[Onboarding] {} — {}", result.status, result.summary);
                            log_agent_action(&app, &db, "onboarding-client", &result, None).await;
                        }
                    }
                }
            }
            
            tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
        }
    });
}

pub async fn stop_onboarding_watcher(watcher: &Arc<OnboardingWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
