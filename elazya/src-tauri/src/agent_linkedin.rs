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

// ─── Agent Implementation ───────────────────────────────────

pub struct LinkedInDigestAgent;

#[async_trait]
impl ElAgent for LinkedInDigestAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "linkedin-digest",
            name: "LinkedIn Digest",
            emoji: "📱",
            description: "Génère posts et commentaires LinkedIn quotidiens",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);

        let tone = settings.get("post_tone")
            .and_then(|v| v.as_str())
            .unwrap_or("Inspirant");
            
        let themes = settings.get("themes")
            .and_then(|v| v.as_str())
            .unwrap_or("l'impact de l'IA et de l'automatisation pour les freelances et agences");
            
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();

        let prompt = format!(
            "Tu es un expert LinkedIn. Génère 1 post très qualitatif (avec sauts de ligne) et 3 commentaires pertinents. \
            Le sujet aujourd'hui est :\n{}\n\
            Ton de rédaction : {}. \
            Renvoie UNIQUEMENT un JSON: {{\"post\": \"Texte complet avec emojis...\", \"comments\": [\"...\", \"...\", \"...\"], \"hashtags\": [\"#IA\", \"#Entrepreneuriat\"]}}",
            themes, tone
        );

        let parsed = match client.call_llm(&prompt).await {
            Ok(text) => OpenClawAgentClient::extract_json(&text),
            Err(e) => {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Erreur LinkedIn: {}", e),
                    details: serde_json::json!({"error": e}),
                };
            }
        };

        let post_text = parsed.get("post").and_then(|v| v.as_str()).unwrap_or("Post indisponible").to_string();
        
        let mut md_content = format!("# 🚀 Digest LinkedIn du {}\n\n", today);
        md_content.push_str("## 📝 Ton Post du Jour\n\n");
        md_content.push_str(&post_text);
        md_content.push_str("\n\n---\n\n## 💬 Commentaires Suggérés\n\n");
        
        if let Some(comments) = parsed.get("comments").and_then(|v| v.as_array()) {
            for (i, c) in comments.iter().enumerate() {
                md_content.push_str(&format!("*Commentaire {}* :\n{}\n\n", i+1, c.as_str().unwrap_or("")));
            }
        }

        if let Some(hashtags) = parsed.get("hashtags").and_then(|v| v.as_array()) {
            md_content.push_str("## 🏷️ Hashtags recommandés\n\n");
            for h in hashtags.iter() {
                md_content.push_str(&format!("{} ", h.as_str().unwrap_or("")));
            }
            md_content.push_str("\n");
        }

        // Export to Desktop/LinkedIn
        let mut desktop_dir = dirs::desktop_dir().unwrap_or_else(|| PathBuf::from("~/Desktop"));
        desktop_dir.push("LinkedIn");
        if !desktop_dir.exists() {
            let _ = std::fs::create_dir_all(&desktop_dir);
        }
        let file_path = desktop_dir.join(format!("LinkedIn_Digest_{}.md", today));

        if !is_test {
            if let Err(e) = std::fs::write(&file_path, &md_content) {
                return AgentResult {
                    status: "error".into(),
                    summary: format!("Impossible d'écrire le fichier: {}", e),
                    details: serde_json::json!({"error": e.to_string()}),
                };
            }

            // Open with default editor (TextEdit usually for .md or specific editor)
            let _ = Command::new("open")
                .arg(&file_path)
                .output();
        } else {
            // During testing, we write a temporary file and open it as proof of preview
            let temp_path = std::env::temp_dir().join(format!("Test_LinkedIn_Digest_{}.md", today));
            let _ = std::fs::write(&temp_path, &md_content);
            let _ = Command::new("open").arg(&temp_path).output();
        }

        AgentResult {
            status: "success".into(),
            summary: "1 post + 3 commentaires générés avec succès".into(),
            details: parsed,
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── LinkedIn Watcher ───────────────────────────────────────────

pub struct LinkedInWatcher {
    pub active: Mutex<bool>,
    pub last_run_date: Mutex<String>,
}

impl LinkedInWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            last_run_date: Mutex::new(String::new()),
        })
    }
}

pub fn start_linkedin_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<LinkedInWatcher>,
) {
    let agent = LinkedInDigestAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[LinkedIn] Watcher started");

        loop {
            { let a = watcher.active.lock().await; if !*a { println!("[LinkedIn] Watcher stopped"); break; } }

            let today = chrono::Local::now().format("%Y-%m-%d").to_string();
            let current_full_time = chrono::Local::now().format("%H:%M").to_string();
            
            // Read settings from DB
            let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = 'linkedin-digest'")
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

            let schedule_time = settings.get("schedule_time").and_then(|v| v.as_str()).unwrap_or("08:00");
            
            // Generate the digest every day at schedule_time
            let mut should_run = false;
            {
                let mut last_run = watcher.last_run_date.lock().await;
                if *last_run != today && current_full_time == schedule_time {
                    *last_run = today.clone();
                    should_run = true;
                }
            }

            if should_run {
                println!("[LinkedIn] Daily generation triggered.");
                let trigger = serde_json::json!({});
                let result = agent.run(&oc_client, &settings, &trigger).await;
                println!("[LinkedIn] {} — {}", result.status, result.summary);
                log_agent_action(&app, &db, "linkedin-digest", &result).await;
            }
            
            // Poll every ~1 hour
            tokio::time::sleep(tokio::time::Duration::from_secs(3600)).await;
        }
    });
}

pub async fn stop_linkedin_watcher(watcher: &Arc<LinkedInWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
