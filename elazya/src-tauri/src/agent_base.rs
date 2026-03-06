/**
 * Agent Base — Trait + common types for all Elazya agents.
 *
 * Every agent implements `ElAgent`:
 * - `info()` → static metadata (id, name, emoji, description)
 * - `run()` → execute the agent's main action
 * - `test()` → run with test/example data
 * - `configure()` → validate and apply settings
 */

use async_trait::async_trait;
use serde_json::Value;
use sqlx::sqlite::SqlitePool;
use sqlx::Row;
use tauri::{AppHandle, Emitter};
use crate::openclaw_client::OpenClawAgentClient;

/// Static metadata for an agent.
#[derive(Debug, Clone, serde::Serialize)]
pub struct AgentInfo {
    pub id: &'static str,
    pub name: &'static str,
    pub emoji: &'static str,
    pub description: &'static str,
}

/// Result of an agent execution.
#[derive(Debug, Clone, serde::Serialize)]
pub struct AgentResult {
    pub status: String,   // "success" | "error"
    pub summary: String,  // Human-readable 1-line summary
    pub details: Value,   // Full JSON details
}

/// The trait every Elazya agent must implement.
#[async_trait]
pub trait ElAgent: Send + Sync {
    /// Agent metadata.
    fn info(&self) -> AgentInfo;

    /// Execute the agent with the given settings and trigger data.
    async fn run(
        &self,
        client: &OpenClawAgentClient,
        settings: &Value,
        trigger: &Value,
    ) -> AgentResult;

    /// Run with test/example data.
    async fn test(
        &self,
        client: &OpenClawAgentClient,
        settings: &Value,
    ) -> AgentResult {
        // Default: run with empty trigger
        self.run(client, settings, &serde_json::json!({"test": true})).await
    }

    /// Validate settings. Returns Ok(()) or an error message.
    fn validate_settings(&self, _settings: &Value) -> Result<(), String> {
        Ok(())
    }
}

// ─── Shared Logging Helper ──────────────────────────────────

/// Log an agent action to SQLite and emit a Tauri event for real-time UI.
pub async fn log_agent_action(
    app: &AppHandle,
    db: &SqlitePool,
    agent_id: &str,
    result: &AgentResult,
    source: Option<&str>,
) -> i64 {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let details_str = serde_json::to_string(&result.details).unwrap_or_default();

    let final_summary = if source == Some("telegram") {
        format!("[Telegram] {}", result.summary)
    } else {
        result.summary.clone()
    };

    let _ = sqlx::query(
        "INSERT INTO agent_log (agent_id, timestamp, status, summary, details) VALUES (?, ?, ?, ?, ?)"
    )
        .bind(agent_id)
        .bind(&now)
        .bind(&result.status)
        .bind(&final_summary)
        .bind(&details_str)
        .execute(db)
        .await;

    let id: i64 = sqlx::query("SELECT last_insert_rowid() as id")
        .fetch_one(db)
        .await
        .map(|r| r.get("id"))
        .unwrap_or(0);

    let _ = app.emit("agent-action", serde_json::json!({
        "type": "run",
        "agentId": agent_id,
        "log": {
            "id": id,
            "timestamp": now,
            "status": result.status,
            "summary": final_summary,
        }
    }));

    id
}

// ─── Path Helpers ───────────────────────────────────────────

/// Expand ~ to the home directory.
pub fn expand_tilde(path: &str) -> String {
    if path.starts_with("~/") || path == "~" {
        if let Some(home) = dirs::home_dir() {
            return path.replacen("~", home.to_str().unwrap_or("~"), 1);
        }
    }
    path.to_string()
}

/// Sanitize a string for use as a directory name.
pub fn sanitize_dirname(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' { c } else { '_' })
        .collect::<String>()
        .trim()
        .to_string()
}
