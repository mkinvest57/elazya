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
use chrono::Datelike;

// ─── Agent Implementation ───────────────────────────────────

pub struct ContentLinkedInAgent;

#[async_trait]
impl ElAgent for ContentLinkedInAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "content-linkedin",
            name: "Content Auto LinkedIn",
            emoji: "✍️",
            description: "Génère 5 posts LinkedIn à partir d'une idée",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        let is_test = trigger.get("test").and_then(|v| v.as_bool()).unwrap_or(false);
        let now = chrono::Local::now();
        let date_str = now.format("%Y-%m-%d").to_string();

        let mut idea = settings.get("idea").and_then(|v| v.as_str()).unwrap_or("").to_string();

        if idea.is_empty() && is_test {
             idea = "L'impact de l'IA sur la productivité des freelances en 2026".to_string();
        }

        if idea.is_empty() {
             return AgentResult {
                status: "warning".into(),
                summary: "Aucune idée fournie pour la génération.".into(),
                details: serde_json::json!({}),
             };
        }

        let prompt = format!(
            "Tu es un expert en copywriting LinkedIn (Ghostwriter).\n\
            Je te donne une idée brute ou un thème : \"{}\"\n\n\
            Ton objectif est de décliner cette idée en 5 posts LinkedIn distincts, prêts à être publiés, avec 5 angles différents :\n\
            1. 'question' : Pose un débat, invite l'audience à répondre dans les commentaires.\n\
            2. 'liste' : Un format liste ou carrousel texte (ex: 3 erreurs, 5 outils).\n\
            3. 'hottake' : Une opinion forte, un peu polarisante, à contre-courant.\n\
            4. 'story' : Une histoire personnelle courte avec une morale ou leçon.\n\
            5. 'data' : Un post axé sur l'analyse, avec des chiffres ou un constat concret.\n\n\
            Retourne UNIQUEMENT un JSON structuré exactement comme ceci :\n\
            {{\n\
              \"posts\": [\n\
                {{ \"type\": \"question\", \"title\": \"...\", \"content\": \"...\", \"hashtags\": \"#... #...\" }},\n\
                {{ \"type\": \"liste\", \"title\": \"...\", \"content\": \"...\", \"hashtags\": \"#... #...\" }},\n\
                {{ \"type\": \"hottake\", \"title\": \"...\", \"content\": \"...\", \"hashtags\": \"#... #...\" }},\n\
                {{ \"type\": \"story\", \"title\": \"...\", \"content\": \"...\", \"hashtags\": \"#... #...\" }},\n\
                {{ \"type\": \"data\", \"title\": \"...\", \"content\": \"...\", \"hashtags\": \"#... #...\" }}\n\
              ]\n\
            }}\n\
            IMPORTANT: Ne mets pas de guillemets autour du JSON, ne mets pas de blocs Markdown (```json). Renvoie UNIQUEMENT le texte JSON pur.",
            idea
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

        let posts = parsed_json.get("posts").and_then(|v| v.as_array()).cloned().unwrap_or_default();
        let count = posts.len();

        if count == 0 {
             return AgentResult {
                status: "error".into(),
                summary: "Les posts n'ont pas pu être générés correctement au format JSON.".into(),
                details: serde_json::json!({"raw_json": parsed_json}),
             };
        }

        // Write Markdown files
        let export_dir = dirs::desktop_dir().unwrap_or_else(|| PathBuf::from("~/Desktop")).join(format!("LinkedIn_Content/{}", date_str));
        if !export_dir.exists() {
            let _ = std::fs::create_dir_all(&export_dir);
        }

        let mut saved_files = Vec::new();

        for (i, p) in posts.iter().enumerate() {
            let p_type = p.get("type").and_then(|v| v.as_str()).unwrap_or("post");
            let p_title = p.get("title").and_then(|v| v.as_str()).unwrap_or("Titre_inconnu");
            let p_content = p.get("content").and_then(|v| v.as_str()).unwrap_or("");
            let p_hashtags = p.get("hashtags").and_then(|v| v.as_str()).unwrap_or("");

            // safe filename
            let safe_title = p_title.replace(|c: char| !c.is_alphanumeric(), "_");
            let safe_title_short = safe_title.chars().take(20).collect::<String>();
            let file_name = format!("Post_{:02}_{}_{}.md", i + 1, p_type, safe_title_short);
            let file_path = export_dir.join(&file_name);

            let md_content = format!("# {}\n\n---\n**Type:** {}\n\n{}\n\n\n{}", p_title, p_type, p_content, p_hashtags);

            if std::fs::write(&file_path, &md_content).is_ok() {
                saved_files.push(file_name);
            }
        }

        let summary_msg = format!("Généré {} posts pour le thème: '{}'", count, idea);

        AgentResult {
            status: "success".into(),
            summary: summary_msg,
            details: serde_json::json!({
                "idea": idea,
                "posts": posts,
                "saved_files": saved_files,
                "export_dir": export_dir.to_string_lossy()
            }),
        }
    }

    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── Content Watcher ───────────────────────────────────────────

pub struct ContentWatcher {
    pub active: Mutex<bool>,
    pub last_run_date: Mutex<String>,
}

impl ContentWatcher {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            active: Mutex::new(false),
            last_run_date: Mutex::new(String::new()),
        })
    }
}

pub fn start_content_watcher(
    app: AppHandle,
    db: SqlitePool,
    oc_client: Arc<OpenClawAgentClient>,
    watcher: Arc<ContentWatcher>,
) {
    let agent = ContentLinkedInAgent;

    tauri::async_runtime::spawn(async move {
        { let mut a = watcher.active.lock().await; *a = true; }
        println!("[Content] Watcher started");

        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(3600)).await; // Check once per hour

            { let a = watcher.active.lock().await; if !*a { println!("[Content] Watcher stopped"); break; } }

            let current_date = chrono::Local::now();
            let day_of_week = current_date.weekday().number_from_monday(); // 1 = Monday
            let hour = current_date.format("%H").to_string();
            let date_str = current_date.format("%Y-%m-%d").to_string();

            // Run only on Mondays at 8 AM
            if day_of_week == 1 && hour == "08" {
                 let mut should_run = false;
                 {
                     let mut last_run = watcher.last_run_date.lock().await;
                     if *last_run != date_str {
                         *last_run = date_str.clone();
                         should_run = true;
                     }
                 }

                 if should_run {
                     let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = 'content-linkedin'")
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
                         log_agent_action(&app, &db, "content-linkedin", &result).await;
                     }
                 }
            }
        }
    });
}

pub async fn stop_content_watcher(watcher: &Arc<ContentWatcher>) {
    let mut a = watcher.active.lock().await;
    *a = false;
}
