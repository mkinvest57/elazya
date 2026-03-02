/**
 * Agent Engine — Central registry for all Elazya agents.
 *
 * Loads all agents, exposes:
 * - `get_agent_by_id(id)` → &dyn ElAgent
 * - `run_agent(id, settings, trigger)` → AgentResult
 * - `test_agent(id, settings)` → AgentResult
 * - `list_agents()` → Vec<AgentInfo>
 */

use std::collections::HashMap;
use std::sync::Arc;
use sqlx::sqlite::SqlitePool;
use sqlx::Row;
use tauri::AppHandle;

use crate::agent_base::{ElAgent, AgentInfo, AgentResult, log_agent_action};
use crate::openclaw_client::OpenClawAgentClient;
use crate::agent_facturation::FacturationAgent;
use crate::agents::*;

/// Central agent engine.
pub struct AgentEngine {
    agents: HashMap<&'static str, Box<dyn ElAgent>>,
    client: Arc<OpenClawAgentClient>,
}

impl AgentEngine {
    /// Create a new engine with all agents registered.
    pub fn new(client: Arc<OpenClawAgentClient>) -> Self {
        let mut agents: HashMap<&'static str, Box<dyn ElAgent>> = HashMap::new();

        // Register all agents
        agents.insert("facturation", Box::new(FacturationAgent));
        agents.insert("onboarding-client", Box::new(OnboardingClientAgent));
        agents.insert("linkedin-digest", Box::new(LinkedInDigestAgent));
        agents.insert("qualification", Box::new(QualificationAgent));
        agents.insert("routine-matinale", Box::new(RoutineMatinaleAgent));
        agents.insert("crm-prospect", Box::new(CrmProspectAgent));
        agents.insert("devis-express", Box::new(DevisExpressAgent));
        agents.insert("email-intelligent", Box::new(EmailIntelligentAgent));
        agents.insert("compta-export", Box::new(ComptaExportAgent));
        agents.insert("content-linkedin", Box::new(ContentLinkedInAgent));

        Self { agents, client }
    }

    /// List all registered agents.
    pub fn list_agents(&self) -> Vec<AgentInfo> {
        self.agents.values().map(|a| a.info()).collect()
    }

    /// Get an agent by ID.
    pub fn get_agent(&self, id: &str) -> Option<&dyn ElAgent> {
        self.agents.get(id).map(|a| a.as_ref())
    }

    /// Run an agent with the given settings and trigger, log the result.
    pub async fn run_agent(
        &self,
        app: &AppHandle,
        db: &SqlitePool,
        agent_id: &str,
        trigger: &serde_json::Value,
    ) -> Result<AgentResult, String> {
        let agent = self.agents.get(agent_id)
            .ok_or_else(|| format!("Agent '{}' non trouvé", agent_id))?;

        let settings = get_settings(db, agent_id).await;
        let result = agent.run(&self.client, &settings, trigger).await;
        log_agent_action(app, db, agent_id, &result).await;
        Ok(result)
    }

    /// Test an agent with default/example data, log the result.
    pub async fn test_agent(
        &self,
        app: &AppHandle,
        db: &SqlitePool,
        agent_id: &str,
    ) -> Result<AgentResult, String> {
        let agent = self.agents.get(agent_id)
            .ok_or_else(|| format!("Agent '{}' non trouvé", agent_id))?;

        let settings = get_settings(db, agent_id).await;
        let result = agent.test(&self.client, &settings).await;
        log_agent_action(app, db, agent_id, &result).await;
        Ok(result)
    }

    /// Get the OpenClaw client reference.
    pub fn client(&self) -> &Arc<OpenClawAgentClient> {
        &self.client
    }
}

/// Read settings for an agent from DB.
async fn get_settings(db: &SqlitePool, agent_id: &str) -> serde_json::Value {
    let row = sqlx::query("SELECT settings FROM agent_config WHERE agent_id = ?")
        .bind(agent_id)
        .fetch_optional(db)
        .await
        .ok()
        .flatten();

    match row {
        Some(r) => {
            let s: String = r.get("settings");
            serde_json::from_str(&s).unwrap_or(serde_json::json!({}))
        }
        None => serde_json::json!({}),
    }
}
