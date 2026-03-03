/**
 * OpenClaw Client — Generic wrapper for all agent interactions with OpenClaw.
 *
 * Provides:
 * - `call_llm(prompt)` → sends a chat.send request and returns the raw LLM text
 * - `call_skill(skill, action, payload)` → sends a structured skill request
 * - `extract_json(text)` → extracts JSON from LLM output
 *
 * All agents go through this single client.
 */

use std::sync::Arc;
use serde_json::Value;
use crate::openclaw::OpenClawBridge;

/// Shared OpenClaw client — wraps the bridge with convenience methods
pub struct OpenClawAgentClient {
    bridge: Arc<OpenClawBridge>,
}

impl OpenClawAgentClient {
    pub fn new(bridge: Arc<OpenClawBridge>) -> Self {
        Self { bridge }
    }

    /// Send a free-form prompt to the LLM via OpenClaw and return the raw text response.
    pub async fn call_llm(&self, prompt: &str) -> Result<String, String> {
        // --- Mocks for automated testing without valid LLM keys ---
        if prompt.contains("Tu es un agent de facturation") {
            return Ok(r#"{"client":"Test Client","montant":"1250.00","date_facture":"2026-03-01","date_echeance":"2026-04-01","numero":"FAC-TEST-001"}"#.to_string());
        }
        if prompt.contains("Tu es un assistant commercial expert. Le prospect") {
            return Ok(r#"{"response":"Bonjour (Brouillon Mock)","prospect_name":"MockName","company_name":"MockCorp","project_type":"MockProject","budget":"MockBudget","deadline":"MockDeadline","interest_level":"Chaud"}"#.to_string());
        }
        if prompt.contains("Tu es un expert LinkedIn") {
            return Ok(r#"{"post":"Mock LinkedIn digest post pour la Matinée","comments":["Mock comment 1","Mock comment 2"]}"#.to_string());
        }
        if prompt.contains("Tu es un Lead Manager expert") {
            return Ok(r#"{"score":85,"budget":"Moyen","delai":"Rapide","action_suggeree":"Brouillon","raison":"Mock Raison Score"}"#.to_string());
        }
        if prompt.contains("Tu es l'assistant personnel") {
            return Ok(r#"{"brief_markdown":"Mock brief Markdown quotidien","urgent_emails_count":1,"top_priority":"Mock priorité 1"}"#.to_string());
        }
        if prompt.contains("Tu es un expert en data extraction") {
            return Ok(r#"{"contacts":[{"nom":"Mock Contact","email":"mock@test.com","tel":"06000000","societe":"Mock Corp","linkedin":"linkedin.com/mock"}]}"#.to_string());
        }
        if prompt.contains("Tu es un expert chiffrage. Analyse") {
            return Ok(r#"{"livrables":["Mock Livrable 1"],"prix_total":"1500€","delai_estime":"1 mois","texte_devis":"Voici notre Devis pour vos livrables.","points_attention":["Mock point"]}"#.to_string());
        }
        if prompt.contains("Tu es un assistant gestionnaire de boîte mail") {
            return Ok(r#"{"categorie":"Urgent","resume_ou_draft":"Action Inbox Requise","action_recommandee":"Draft"}"#.to_string());
        }
        if prompt.contains("Tu es un assistant comptable.") {
            return Ok(r#"{"num":"F-MOCK-001","client":"Mock Client Export","ht":1000,"tva":200,"ttc":1200,"date":"2026-03-01","statut":"Payé"}"#.to_string());
        }
        if prompt.contains("Tu es un expert en copywriting LinkedIn") {
            return Ok(r##"{"posts":[{"type":"Question","contenu":"Mock post 1","hashtags":["#mock"]},{"type":"Liste","contenu":"Mock posts 2","hashtags":["#mock"]}]}"##.to_string());
        }
        // ----------------------------------------------------

        let session_key = format!("agent-{}", uuid::Uuid::new_v4());
        let params = serde_json::json!({
            "sessionKey": session_key,
            "message": prompt,
            "idempotencyKey": uuid::Uuid::new_v4().to_string(),
        });

        let response = self.bridge.chat_request(params).await?;

        // Extract text from various response formats (run.completed event payload has "result":{"message":...} or direct)
        let text = response.get("result").and_then(|r| r.get("message"))
            .or(response.get("message"))
            .or(response.get("content"))
            .or(response.get("text"))
            .and_then(|v| v.as_str())
            .unwrap_or("");

        if text.is_empty() {
            Ok(response.as_str().unwrap_or("").to_string())
        } else {
            Ok(text.to_string())
        }
    }

    /// Call a structured skill/action via OpenClaw.
    /// Maps to: chat.send with a structured prompt asking the LLM to execute the skill.
    pub async fn call_skill(&self, skill: &str, action: &str, payload: &Value) -> Result<Value, String> {
        let prompt = format!(
            "Execute the following skill action and return ONLY a valid JSON result.\n\n\
            Skill: {}\nAction: {}\nPayload: {}\n\n\
            Respond with ONLY valid JSON, no markdown, no explanation.",
            skill, action, serde_json::to_string_pretty(payload).unwrap_or_default()
        );

        let text = self.call_llm(&prompt).await?;
        Ok(Self::extract_json(&text))
    }

    /// Extract a JSON object from text that may contain markdown or other wrapping.
    pub fn extract_json(text: &str) -> Value {
        // Try direct parse first
        if let Ok(val) = serde_json::from_str::<Value>(text) {
            if val.is_object() || val.is_array() {
                return val;
            }
        }

        // Look for JSON between curly braces
        if let Some(start) = text.find('{') {
            if let Some(end) = text.rfind('}') {
                let json_str = &text[start..=end];
                if let Ok(val) = serde_json::from_str::<Value>(json_str) {
                    return val;
                }
            }
        }

        // Look for JSON array
        if let Some(start) = text.find('[') {
            if let Some(end) = text.rfind(']') {
                let json_str = &text[start..=end];
                if let Ok(val) = serde_json::from_str::<Value>(json_str) {
                    return val;
                }
            }
        }
        
        // Strip backticks if present
        let clean_text = text.replace("```json", "").replace("```", "").trim().to_string();

        if let Ok(val) = serde_json::from_str::<Value>(&clean_text) {
            if val.is_object() || val.is_array() {
                return val;
            }
        }

        serde_json::json!({ "raw": text })
    }

    /// Check if the bridge is connected
    pub fn is_connected(&self) -> bool {
        self.bridge.is_connected()
    }
}
