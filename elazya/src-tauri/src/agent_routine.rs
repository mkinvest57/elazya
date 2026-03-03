use std::path::PathBuf;
use std::sync::Arc;
use std::process::Command;
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

pub struct RoutineMatinaleAgent;

#[async_trait]
impl ElAgent for RoutineMatinaleAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "routine-matinale",
            name: "Routine Matinale",
            emoji: "☕",
            description: "Génère un briefing complet chaque matin (Mails, Agenda, Tâches)",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();

        // 1. Gather Data (Emails + Mocks for Agenda/Tasks)
        let unread_emails = apple_mail::get_recent_unread_emails(10).unwrap_or_else(|_| vec![]);
        let mut email_summaries = String::new();
        
        if unread_emails.is_empty() {
            email_summaries.push_str("Aucun email non lu ce matin.");
        } else {
            for (i, msg) in unread_emails.iter().take(5).enumerate() {
                email_summaries.push_str(&format!("{}. De: {} | Sujet: {}\n", i+1, msg.sender, msg.subject));
            }
        }

        // 2. Build AI Prompt for Synthesis
        let prompt = format!(
            "Tu es l'assistant personnel (Chief of Staff). Rédige un BRIEF MORDANT ET STRUCTURÉ pour aujourd'hui ({}).\n\
            Voici les données brutes :\n\
            EMAILS RECENTS:\n{}\n\
            AGENDA DU JOUR (Simulé): 10h Kickoff Client, 14h Synchro Équipe, 16h Point Dev.\n\
            TÂCHES PRIORITAIRES (Simulées): 1. Finaliser le contrat Acme, 2. Relancer le prospect TechCorp, 3. Revoir PR frontend.\n\
            \n\
            Rédige un briefing Markdown propre (utilise des Emojis, sois concis). \
            Extrais les 3 emails les plus urgents si présents. \n\
            Renvoie UNIQUEMENT un JSON structuré :\n\
            {{\n\
                \"brief_markdown\": \"<Le texte complet du brief formaté en Markdown>\",\n\
                \"urgent_emails_count\": <Le nombre d'emails qui te semblent urgents (0-5)>,\n\
                \"top_priority\": \"<La tâche la plus importante du jour en 4 mots>\"\n\
            }}",
            today, email_summaries
        );

        let parsed = match client.call_llm(&prompt).await {
            Ok(text) => OpenClawAgentClient::extract_json(&text),
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur LLM Routine: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        let brief_markdown = parsed.get("brief_markdown").and_then(|v| v.as_str()).unwrap_or("Erreur de génération du brief").to_string();
        let urgent_count = parsed.get("urgent_emails_count").and_then(|v| v.as_i64()).unwrap_or(0);

        // 3. Save to Desktop / Briefs
        let mut desktop_dir = dirs::desktop_dir().unwrap_or_else(|| PathBuf::from("~/Desktop"));
        desktop_dir.push("Briefs");
        
        if !desktop_dir.exists() {
            let _ = std::fs::create_dir_all(&desktop_dir);
        }
        
        let file_path = desktop_dir.join(format!("Brief_Quotidien_{}.md", today));

        if !is_test {
            if let Err(e) = std::fs::write(&file_path, &brief_markdown) {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Impossible d'écrire le brief: {}", e),
                    details: serde_json::json!({"error": e.to_string()}),
                };
            }
            // Open note
            let _ = Command::new("open").arg(&file_path).output();
        } else {
            // Test Mode: preview in temp file
            let temp_path = std::env::temp_dir().join(format!("Test_Brief_{}.md", today));
            let _ = std::fs::write(&temp_path, &brief_markdown);
            let _ = Command::new("open").arg(&temp_path).output();
        }

        // 4. Result
        let summary_msg = if urgent_count > 0 {
            format!("Briefing prêt. 🚨 {} emails urgents détectés.", urgent_count)
        } else {
            "Briefing matinal généré avec succès ☕".into()
        };

        AgentResult {
            status: "success".into(),
            summary: summary_msg,
            details: parsed,
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── Routine Watcher ───────────────────────────────────────────

pub struct RoutineWatcher {
    pub active: Mutex<bool>,
    pub last_run_date: Mutex<String>,
}

impl RoutineWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            last_run_date: Mutex::new(String::new()),
        })
    }
}

pub fn start_routine_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<RoutineWatcher>,
) {
    let agent = RoutineMatinaleAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Routine] Watcher started");

        loop {
            { let a = watcher.active.lock().await; if !*a { println!("[Routine] Watcher stopped"); break; } }

            let today = chrono::Local::now().format("%Y-%m-%d").to_string();
            let current_full_time = chrono::Local::now().format("%H:%M").to_string();
            
            // Read schedule_time settings from DB
            let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = 'routine-matinale'")
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

            let schedule_time = settings.get("send_time").and_then(|v| v.as_str()).unwrap_or("07:30");
            
            let mut should_run = false;
            {
                let mut last_run = watcher.last_run_date.lock().await;
                // Run only if time matches and we haven't run today yet
                if *last_run != today && current_full_time == schedule_time {
                    *last_run = today.clone();
                    should_run = true;
                }
            }

            if should_run {
                println!("[Routine] Daily Briefing triggered.");
                let trigger = serde_json::json!({});
                let result = agent.run(&oc_client, &settings, &trigger).await;
                println!("[Routine] {} — {}", result.status, result.summary);
                log_agent_action(&app, &db, "routine-matinale", &result).await;
            }
            
            // Poll every 60 seconds (since we need minute precision for "H:M")
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        }
    });
}

pub async fn stop_routine_watcher(watcher: &Arc<RoutineWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
