/**
 * Agent Skeletons — All 9 remaining agents.
 *
 * Each implements ElAgent with proper metadata.
 * `run()` contains a TODO indicating the planned OpenClaw skill.
 */

use async_trait::async_trait;
use serde_json::Value;
use crate::agent_base::{ElAgent, AgentInfo, AgentResult};
use crate::openclaw_client::OpenClawAgentClient;



// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════




// ═══════════════════════════════════════════════════════════════




// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// 9. Content LinkedIn
// ═══════════════════════════════════════════════════════════════

pub struct ContentLinkedInAgent;

#[async_trait]
impl ElAgent for ContentLinkedInAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "content-linkedin",
            name: "Content LinkedIn",
            emoji: "🚀",
            description: "Transforme 1 idée en 5 posts variés",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, _settings: &Value, trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "content" / "generate_variations"
        // 1. Read the idea/topic from trigger
        // 2. callLLM → generate 5 post variations
        // 3. Schedule posts across the week

        let idea = trigger.get("idea")
            .and_then(|v| v.as_str())
            .unwrap_or("L'importance de l'automatisation pour les solopreneurs");

        let prompt = format!(
            "Tu es un expert en content marketing LinkedIn. Transforme cette idée en 5 variations de posts: '{}'. \
            Renvoie UNIQUEMENT un JSON: {{\"idea\": \"...\", \"posts\": [{{\"tone\": \"...\", \"content\": \"...\", \"day\": \"Lundi\"}}], \"count\": 5}}",
            idea
        );

        match client.call_llm(&prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                let count = parsed.get("count").and_then(|v| v.as_u64()).unwrap_or(5);
                AgentResult {
                    status: "success".into(),
                    summary: format!("{} variations de posts générées", count),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur content: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}
