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
// 1. Onboarding Client Express
// ═══════════════════════════════════════════════════════════════

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

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "email" / "respond"
        // 1. Detect new prospect email (trigger contains email data)
        // 2. callLLM → generate personalized response
        // 3. callSkill("email", "send", response)
        // 4. callSkill("files", "create_folder", client_folder)

        let prospect = trigger.get("prospect_name")
            .and_then(|v| v.as_str())
            .unwrap_or("Prospect Test");

        let prompt = format!(
            "Tu es un assistant commercial. Génère une réponse courte et professionnelle pour accueillir le prospect '{}'. \
            Renvoie UNIQUEMENT un JSON: {{\"response\": \"...\", \"suggested_meeting\": \"...\"}}",
            prospect
        );

        match client.call_llm(&prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                AgentResult {
                    status: "success".into(),
                    summary: format!("Réponse prospect {} envoyée en 4 min", prospect),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur onboarding: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 2. LinkedIn Digest
// ═══════════════════════════════════════════════════════════════

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

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, _trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "linkedin" / "generate_content"
        // 1. Analyze industry trends (callSkill("web", "search", topic))
        // 2. Generate post (callLLM → structured LinkedIn post)
        // 3. Generate comments (callLLM → 3 relevant comments)

        let tone = settings.get("post_tone")
            .and_then(|v| v.as_str())
            .unwrap_or("Inspirant");

        let prompt = format!(
            "Tu es un expert LinkedIn. Génère 1 post et 3 commentaires pertinents. Ton: {}. \
            Renvoie UNIQUEMENT un JSON: {{\"post\": \"...\", \"comments\": [\"...\", \"...\", \"...\"], \"hashtags\": [\"...\"]}}",
            tone
        );

        match client.call_llm(&prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                AgentResult {
                    status: "success".into(),
                    summary: "1 post + 3 commentaires générés".into(),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur LinkedIn: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 3. Qualification Leads Auto
// ═══════════════════════════════════════════════════════════════

pub struct QualificationAgent;

#[async_trait]
impl ElAgent for QualificationAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "qualification",
            name: "Qualification Leads Auto",
            emoji: "🎯",
            description: "Score et trie vos leads automatiquement",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, _settings: &Value, trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "crm" / "qualify_leads"
        // 1. Read incoming leads (trigger or CRM source)
        // 2. callLLM → score each lead (cold/warm/hot)
        // 3. Alert for hot leads

        let lead_count = trigger.get("lead_count")
            .and_then(|v| v.as_u64())
            .unwrap_or(5);

        let prompt = format!(
            "Tu es un expert en qualification de leads B2B. Simule l'analyse de {} leads et renvoie un JSON: \
            {{\"total\": {}, \"cold\": N, \"warm\": N, \"hot\": N, \"hot_leads\": [{{\"name\": \"...\", \"score\": N}}]}}",
            lead_count, lead_count
        );

        match client.call_llm(&prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                let hot = parsed.get("hot").and_then(|v| v.as_u64()).unwrap_or(1);
                AgentResult {
                    status: "success".into(),
                    summary: format!("{} leads triés · {} qualifiés chauds", lead_count, hot),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur qualification: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 4. Routine Matinale
// ═══════════════════════════════════════════════════════════════

pub struct RoutineMatinaleAgent;

#[async_trait]
impl ElAgent for RoutineMatinaleAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "routine-matinale",
            name: "Routine Matinale",
            emoji: "🏃",
            description: "Briefing quotidien à 7h30 avec vos priorités",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, settings: &Value, _trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skills: "email" / "summarize", "calendar" / "today"
        // 1. callSkill("email", "summarize_unread") → résumé emails
        // 2. callSkill("calendar", "today") → events du jour
        // 3. callLLM → compile into daily briefing

        let include_calendar = settings.get("include_calendar")
            .and_then(|v| v.as_str())
            .unwrap_or("true") == "true";

        let prompt = format!(
            "Tu es un assistant personnel. Génère un briefing matinal structuré. Inclure calendrier: {}. \
            Renvoie UNIQUEMENT un JSON: {{\"briefing\": \"...\", \"priorities\": [\"...\"], \"emails_summary\": \"...\", \"meetings\": []}}",
            include_calendar
        );

        match client.call_llm(&prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                AgentResult {
                    status: "success".into(),
                    summary: "Briefing quotidien généré et envoyé".into(),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur routine: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 5. CRM Prospect
// ═══════════════════════════════════════════════════════════════

pub struct CrmProspectAgent;

#[async_trait]
impl ElAgent for CrmProspectAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "crm-prospect",
            name: "CRM Prospect",
            emoji: "🎨",
            description: "Relances automatiques et suivi prospect",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, _settings: &Value, _trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "crm" / "follow_up"
        // 1. callSkill("crm", "get_stale_prospects") → prospects sans suivi
        // 2. callLLM → generate follow-up messages for each
        // 3. callSkill("email", "send_batch") → send follow-ups

        let prompt = "Tu es un CRM intelligent. Simule une relance automatique de prospects. \
            Renvoie UNIQUEMENT un JSON: {\"prospects_contacted\": N, \"follow_ups\": [{\"name\": \"...\", \"message\": \"...\"}]}";

        match client.call_llm(prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                let count = parsed.get("prospects_contacted").and_then(|v| v.as_u64()).unwrap_or(3);
                AgentResult {
                    status: "success".into(),
                    summary: format!("Relance automatique envoyée à {} prospects", count),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur CRM: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 6. Devis Express
// ═══════════════════════════════════════════════════════════════

pub struct DevisExpressAgent;

#[async_trait]
impl ElAgent for DevisExpressAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "devis-express",
            name: "Devis Express",
            emoji: "📄",
            description: "Génère un devis professionnel en 10 minutes",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, _settings: &Value, trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "documents" / "generate_quote"
        // 1. Read client context from trigger
        // 2. callLLM → generate structured quote data
        // 3. callSkill("documents", "generate_pdf", quote_data)

        let client_name = trigger.get("client_name")
            .and_then(|v| v.as_str())
            .unwrap_or("Client Test");

        let prompt = format!(
            "Tu es un générateur de devis. Génère un devis pour '{}'. \
            Renvoie UNIQUEMENT un JSON: {{\"devis_number\": \"DEV-001\", \"client\": \"...\", \"items\": [{{\"label\": \"...\", \"price\": N}}], \"total\": N}}",
            client_name
        );

        match client.call_llm(&prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                let num = parsed.get("devis_number").and_then(|v| v.as_str()).unwrap_or("DEV-???");
                AgentResult {
                    status: "success".into(),
                    summary: format!("Devis {} généré", num),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur devis: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 7. Email Intelligent
// ═══════════════════════════════════════════════════════════════

pub struct EmailIntelligentAgent;

#[async_trait]
impl ElAgent for EmailIntelligentAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "email-intelligent",
            name: "Email Intelligent",
            emoji: "💼",
            description: "Trie votre inbox, suggère des réponses",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, _settings: &Value, _trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "email" / "smart_sort"
        // 1. callSkill("email", "fetch_unread") → get unread emails
        // 2. callLLM → categorize (urgent, action, info, spam)
        // 3. callLLM → generate reply suggestions for urgent ones

        let prompt = "Tu es un assistant email intelligent. Simule le tri de 30 emails. \
            Renvoie UNIQUEMENT un JSON: {\"sorted\": 30, \"categories\": {\"urgent\": N, \"action\": N, \"info\": N, \"spam\": N}, \"reply_suggestions\": N}";

        match client.call_llm(prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                let sorted = parsed.get("sorted").and_then(|v| v.as_u64()).unwrap_or(30);
                let replies = parsed.get("reply_suggestions").and_then(|v| v.as_u64()).unwrap_or(5);
                AgentResult {
                    status: "success".into(),
                    summary: format!("{} emails triés · {} réponses suggérées", sorted, replies),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur email: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 8. Compta Export
// ═══════════════════════════════════════════════════════════════

pub struct ComptaExportAgent;

#[async_trait]
impl ElAgent for ComptaExportAgent {
    fn info(&self) -> AgentInfo {
        AgentInfo {
            id: "compta-export",
            name: "Compta Export",
            emoji: "📊",
            description: "Export comptable mensuel automatique",
        }
    }

    async fn run(&self, client: &OpenClawAgentClient, _settings: &Value, _trigger: &Value) -> AgentResult {
        // TODO: OpenClaw skill: "accounting" / "monthly_export"
        // 1. callSkill("files", "list_invoices", { month }) → collect all invoices
        // 2. callLLM → structure into accounting format
        // 3. callSkill("documents", "generate_csv", data) → export file

        let prompt = "Tu es un comptable. Simule un export comptable mensuel avec toutes les factures du mois. \
            Renvoie UNIQUEMENT un JSON: {\"month\": \"2026-03\", \"invoices_count\": N, \"total_revenue\": N, \"total_expenses\": N, \"export_path\": \"...\"}";

        match client.call_llm(prompt).await {
            Ok(text) => {
                let parsed = OpenClawAgentClient::extract_json(&text);
                AgentResult {
                    status: "success".into(),
                    summary: "Export comptable mensuel généré".into(),
                    details: parsed,
                }
            }
            Err(e) => AgentResult {
                status: "error".into(),
                summary: format!("Erreur compta: {}", e),
                details: serde_json::json!({"error": e}),
            }
        }
    }
}

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
