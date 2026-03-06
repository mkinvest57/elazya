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
