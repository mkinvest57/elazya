use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::sync::{mpsc, oneshot};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::io::{BufReader, AsyncBufReadExt};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
use futures_util::{StreamExt, SinkExt};
use tokio::time::{timeout, Duration};
use std::process::Stdio; // Reverted back to simple Stdio since we don't need StdCommand
use tokio::process::{Child, Command};
use tauri::{AppHandle, Emitter, Manager};

pub fn find_node_executable() -> String {
    // 1. Try PATH
    if let Ok(path) = which::which("node") {
        return path.to_string_lossy().to_string();
    }

    // 2. Try common macOS paths
    let common_paths = [
        "/usr/local/bin/node",
        "/opt/homebrew/bin/node",
        "/usr/bin/node",
    ];

    for path in common_paths {
        if std::path::Path::new(path).exists() {
            return path.to_string();
        }
    }

    // Fallback to "node" and hope for the best at runtime
    "node".to_string()
}


pub fn find_npm_executable() -> String {
    if let Ok(path) = which::which("npm") {
        return path.to_string_lossy().to_string();
    }

    let common_paths = [
        "/usr/local/bin/npm",
        "/opt/homebrew/bin/npm",
        "/usr/bin/npm",
    ];

    for path in common_paths {
        if std::path::Path::new(path).exists() {
            return path.to_string();
        }
    }
    "npm".to_string()
}

pub fn check_node_version() -> Result<String, String> {
    let node_path = find_node_executable();
    let output = std::process::Command::new(&node_path)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to run node: {}", e))?;
    
    if !output.status.success() {
        return Err("Node.js process exited with error".to_string());
    }

    let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
    // Expected format: v22.x.x
    if version.starts_with("v") {
        let major_str = version.split('.').next().unwrap_or("").trim_start_matches('v');
        if let Ok(major) = major_str.parse::<i32>() {
            if major >= 22 {
                return Ok(version);
            } else {
                return Err(format!("Node.js version too old: {}. Required: v22+", version));
            }
        }
    }
    
    Err(format!("Could not parse Node.js version: {}", version))
}

pub fn check_openclaw_installed() -> bool {
    // Check if npm is available using our robust finder
    let npm_path = find_npm_executable();
    if std::path::Path::new(&npm_path).exists() {
        return true;
    }
    // Fallback if "npm" string works in shell
    which::which("npm").is_ok()
}

pub fn install_openclaw_cli() -> Result<(), String> {
    // Just verify npm is available.
    let npm_path = find_npm_executable();
    // Try to run npm --version to be sure
    let status = std::process::Command::new(&npm_path)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();

    if status.is_ok() && status.unwrap().success() {
        Ok(())
    } else {
        Err("npm not found or not executable".to_string())
    }
}


const GATEWAY_PORT: &str = "18789";
const GATEWAY_TOKEN: &str = "elazya-v1000-internal-token";

fn kill_port(port: &str) {
    println!("[OpenClaw Bridge] Cleaning up port {}...", port);
    
    // 1. Try lsof to find specific PIDs
    let output = std::process::Command::new("lsof")
        .arg("-i")
        .arg(format!(":{}", port))
        .arg("-t")
        .output();

    if let Ok(output) = output {
        let pids = String::from_utf8_lossy(&output.stdout);
        for pid in pids.lines() {
            if let Ok(pid) = pid.trim().parse::<i32>() {
                println!("[OpenClaw Bridge] Killing process on port {}: {}", port, pid);
                let _ = std::process::Command::new("kill").arg("-9").arg(pid.to_string()).status();
            }
        }
    }

    // 2. Also pkill by name just in case
    let _ = std::process::Command::new("pkill")
        .arg("-9")
        .arg("-f")
        .arg("openclaw")
        .status();
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GatewayFrame {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub method: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub payload: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ok: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<Value>,
    #[serde(rename = "type")]
    pub frame_type: String, // "req", "res", "event"
}

pub struct OpenClawBridge {
    tx: mpsc::Sender<GatewayFrame>,
    pending: Arc<Mutex<HashMap<String, oneshot::Sender<Result<Value, String>>>>>,
    run_listeners: Arc<Mutex<HashMap<String, oneshot::Sender<Value>>>>,
    connected: Arc<Mutex<bool>>,
}

impl OpenClawBridge {
    pub async fn new(url: String, app_handle: AppHandle) -> Result<Arc<Self>, String> {
        let (tx, mut rx) = mpsc::channel::<GatewayFrame>(32);
        let pending = Arc::new(Mutex::new(HashMap::<String, oneshot::Sender<Result<Value, String>>>::new()));
        let connected = Arc::new(Mutex::new(false));
        let run_listeners = Arc::new(Mutex::new(HashMap::<String, oneshot::Sender<Value>>::new()));
        
        let bridge = Arc::new(Self {
            tx,
            pending: Arc::clone(&pending),
            run_listeners: Arc::clone(&run_listeners),
            connected: Arc::clone(&connected),
        });

        let bridge_clone = Arc::clone(&bridge);
        
        tokio::spawn(async move {
            loop {
                println!("[OpenClaw Bridge] Attempting to connect to {}...", url);
                match connect_async(&url).await {
                    Ok((ws_stream, _)) => {
                        println!("[OpenClaw Bridge] Connected!");
                        let _ = app_handle.emit("bridge-status", "connected");
                        let (mut write, mut read) = ws_stream.split();
                        
                        // Handshake
                        let connect_id = uuid::Uuid::new_v4().to_string();
                        let connect_params = serde_json::json!({
                            "client": {
                                "id": "openclaw-macos",
                                "displayName": "Elazya v1000",
                                "version": "1.0.0",
                                "platform": "macOS",
                                "mode": "ui"
                            },
                            "minProtocol": 3,
                            "maxProtocol": 3,
                            "role": "operator",
                            "scopes": ["operator.admin"],
                            "auth": { "token": GATEWAY_TOKEN }
                        });
                        
                        let handshake_frame = GatewayFrame {
                            method: Some("connect".to_string()),
                            event: None,
                            params: Some(connect_params),
                            payload: None,
                            id: Some(connect_id.clone()),
                            ok: None,
                            error: None,
                            frame_type: "req".to_string(),
                        };

                        if let Ok(json) = serde_json::to_string(&handshake_frame) {
                            if let Err(e) = write.send(Message::Text(json.into())).await {
                                println!("[OpenClaw Bridge] Handshake send failed: {}", e);
                                continue;
                            }
                        }

                        // Short delay to ensure handshake is processed by the server
                        // before the bridge is considered "ready" to send other requests
                        tokio::time::sleep(tokio::time::Duration::from_millis(1500)).await;

                        {
                            let mut c = bridge_clone.connected.lock().unwrap();
                            *c = true;
                        }

                        let pending_inner = Arc::clone(&bridge_clone.pending);
                        let run_listeners_inner = Arc::clone(&bridge_clone.run_listeners);
                        let app_inner = app_handle.clone();

                        // Inner loop for this specific connection
                        let read_task = tokio::spawn(async move {
                            while let Some(msg) = read.next().await {
                                if let Ok(Message::Text(text)) = msg {
                                    println!("[OpenClaw Bridge] Received: {}", text);
                                    let mut is_hello_ok = false;
                                    if let Ok(value) = serde_json::from_str::<Value>(&text) {
                                        if value["type"] == "hello-ok" { is_hello_ok = true; }
                                    }

                                    if let Ok(frame) = serde_json::from_str::<GatewayFrame>(&text) {
                                        if frame.frame_type == "res" || is_hello_ok {
                                            let response_id = if is_hello_ok { connect_id.clone() } else { frame.id.unwrap_or_default() };
                                            let mut p = pending_inner.lock().unwrap();
                                            if let Some(otx) = p.remove(&response_id) {
                                                if let Some(error) = frame.error {
                                                    let _ = otx.send(Err(error.to_string()));
                                                } else {
                                                    let result = if is_hello_ok { serde_json::from_str::<Value>(&text).unwrap_or(Value::Null) } else { frame.payload.unwrap_or(Value::Null) };
                                                    let _ = otx.send(Ok(result));
                                                }
                                            }
                                        } else if frame.frame_type == "event" {
                                            let event_name = frame.event.unwrap_or_default();
                                            let payload = frame.payload.unwrap_or(Value::Null);
                                            
                                            // Intercept run events
                                            if event_name == "run.completed" || event_name == "run.failed" || event_name == "message" {
                                                if let Some(run_id) = payload.get("runId").and_then(|v| v.as_str()) {
                                                    let mut listeners = run_listeners_inner.lock().unwrap();
                                                    if let Some(otx) = listeners.remove(run_id) {
                                                        let mut out_payload = payload.clone();
                                                        if event_name == "run.failed" {
                                                            out_payload["_run_failed"] = serde_json::json!(true);
                                                        }
                                                        let _ = otx.send(out_payload);
                                                    }
                                                }
                                            }
                                            
                                            let _ = app_inner.emit(&event_name, payload);
                                        }
                                    }
                                }
                            }
                            println!("[OpenClaw Bridge] Read loop ended");
                        });

                        while let Some(frame) = rx.recv().await {
                            if let Ok(json) = serde_json::to_string(&frame) {
                                if let Err(e) = write.send(Message::Text(json.into())).await {
                                    println!("[OpenClaw Bridge] Write failed: {}", e);
                                    break;
                                }
                            }
                            if read_task.is_finished() { break; }
                        }
                        
                        read_task.abort();
                        {
                            let mut c = bridge_clone.connected.lock().unwrap();
                            *c = false;
                        }
                        let _ = app_handle.emit("bridge-status", "disconnected");
                        println!("[OpenClaw Bridge] Connection closed, retrying in 2s...");
                    }
                    Err(e) => {
                        println!("[OpenClaw Bridge] Connection failed: {}, retrying in 2s...", e);
                    }
                }
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            }
        });

        Ok(bridge)
    }

    pub async fn chat_request(&self, params: Value) -> Result<Value, String> {
        let res = self.request("chat.send", params).await?;
        
        let run_id = res.get("runId").and_then(|v| v.as_str()).map(|s| s.to_string());
        if let Some(id) = run_id {
            let (otx, orx) = oneshot::channel();
            {
                let mut listeners = self.run_listeners.lock().unwrap();
                listeners.insert(id.clone(), otx);
            }
            
            match tokio::time::timeout(tokio::time::Duration::from_secs(120), orx).await {
                Ok(Ok(payload)) => Ok(payload),
                Ok(Err(_)) => Err("Run listener channel dropped".to_string()),
                Err(_) => {
                    let mut listeners = self.run_listeners.lock().unwrap();
                    listeners.remove(&id);
                    Err(format!("LLM generation for run {} timed out after 120s", id))
                }
            }
        } else {
            Ok(res)
        }
    }

    pub async fn request(&self, method: &str, params: Value) -> Result<Value, String> {
        let id = uuid::Uuid::new_v4().to_string();
        let (otx, orx) = oneshot::channel();
        
        {
            let mut p = self.pending.lock().unwrap();
            p.insert(id.clone(), otx);
        }

        let frame = GatewayFrame {
            method: Some(method.to_string()),
            event: None,
            params: Some(params),
            payload: None,
            id: Some(id.clone()),
            ok: None,
            error: None,
            frame_type: "req".to_string(),
        };

        println!("[OpenClaw Bridge] Sending request ({}): {}", id, method);
        if let Err(e) = self.tx.send(frame).await {
            let mut p = self.pending.lock().unwrap();
            p.remove(&id);
            return Err(format!("Bridge channel closed: {}", e));
        }
        
        match timeout(Duration::from_secs(15), orx).await {
            Ok(res) => res.map_err(|e| e.to_string())?,
            Err(_) => {
                let mut p = self.pending.lock().unwrap();
                p.remove(&id);
                Err(format!("Request '{}' timed out after 15 seconds", method).to_string())
            }
        }
    }

    pub fn is_connected(&self) -> bool {
        *self.connected.lock().unwrap()
    }
}

pub fn setup_morning_briefing(state_dir: &std::path::Path) {
    // 1. Setup Cron Job
    let cron_dir = state_dir.join("cron");
    let _ = std::fs::create_dir_all(&cron_dir);
    let jobs_path = cron_dir.join("jobs.json");

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    let payload = serde_json::json!({
        "kind": "agentTurn",
        "message": "C'est l'heure du Morning Briefing. Résume les emails urgents et les tâches Notion pour aujourd'hui.",
        "channel": "telegram",
        "deliver": true
    });

    let job = serde_json::json!({
        "id": "morning_briefing",
        "agentId": "briefing",
        "name": "Morning Briefing",
        "description": "Routine matinale générant un résumé envoyé sur Telegram",
        "enabled": true,
        "createdAtMs": now,
        "updatedAtMs": now,
        "schedule": {
            "kind": "cron",
            "expr": "0 8 * * 1-5"
        },
        "sessionTarget": "isolated",
        "wakeMode": "now",
        "payload": payload,
        "state": {}
    });

    let jobs_data = serde_json::json!({
        "version": 1,
        "jobs": [job]
    });

    let _ = std::fs::write(&jobs_path, serde_json::to_string_pretty(&jobs_data).unwrap_or_default());

    // 2. Setup Markdown Agent
    let agent_dir = state_dir.join("agents").join("briefing").join("agent");
    let _ = std::fs::create_dir_all(&agent_dir);
    let identity_path = agent_dir.join("IDENTITY.md");

    let instructions = r#"# IDENTITY.md - Morning Briefing Agent

Tu es l'agent responsable du Morning Briefing d'Elazya.
Chaque matin (lundi à vendredi), tu es réveillé pour préparer un rapport proactif pour l'utilisateur.

## TES OBJECTIFS :
1. Lire les emails importants reçus depuis hier soir (utilise les outils Apple Mail si connectés).
2. Consulter les tâches Notion prévues pour aujourd'hui (utilise les outils Notion si connectés).
3. Rédiger un résumé structuré, concis et actionnable.

## FORMAT DE SORTIE :
Tu vas générer la réponse finale. Le système l'enverra automatiquement au canal Telegram (comme défini dans la charge utile du cron).
Utilise des emojis :
- 📧 Pour les emails
- 📝 Pour les tâches
- 🚨 Pour les urgences

**Ne sois pas bavard.** Va droit au but.
"#;

    // Only write if it doesn't exist to allow user customization later
    if !identity_path.exists() {
        let _ = std::fs::write(&identity_path, instructions);
    }
}

pub fn setup_pipeline_agents(state_dir: &std::path::Path) {
    let base_agents_dir = state_dir.join("agents");

    // 1. Qualification Agent
    let qualif_dir = base_agents_dir.join("qualification").join("agent");
    let _ = std::fs::create_dir_all(&qualif_dir);
    let qualif_path = qualif_dir.join("IDENTITY.md");
    if !qualif_path.exists() {
        let qualif_instructions = r#"# IDENTITY.md - Qualification Leads

Tu es l'agent chargé de qualifier les nouveaux leads.
Évalue le lead fourni dans la requête.
S'il est qualifié, tu DOIS obligatoirement utiliser l'outil `sessions_send` pour transmettre ses informations structurées à l'agent `crm-prospect`.
N'utilise AUCUN AUTRE MOYEN de stockage. Fais-le silencieusement.
"#;
        let _ = std::fs::write(&qualif_path, qualif_instructions);
    }

    // 2. CRM Prospect Agent
    let crm_dir = base_agents_dir.join("crm-prospect").join("agent");
    let _ = std::fs::create_dir_all(&crm_dir);
    let crm_path = crm_dir.join("IDENTITY.md");
    if !crm_path.exists() {
        let crm_instructions = r#"# IDENTITY.md - CRM Prospect

Tu es l'agent chargé de l'insertion CRM.
Tu vas recevoir des données d'un lead (depuis l'agent de qualification).
Traite ces données (formate-les pour le CRM, simule l'enregistrement).
Une fois terminé, tu DOIS obligatoirement utiliser l'outil `sessions_send` pour transmettre l'état d'avancement à l'agent `onboarding-client`.
"#;
        let _ = std::fs::write(&crm_path, crm_instructions);
    }

    // 3. Onboarding Client Agent
    let onboard_dir = base_agents_dir.join("onboarding-client").join("agent");
    let _ = std::fs::create_dir_all(&onboard_dir);
    let onboard_path = onboard_dir.join("IDENTITY.md");
    if !onboard_path.exists() {
        let onboard_instructions = r#"# IDENTITY.md - Onboarding Client

Tu es le dernier maillon de la chaîne de prospection.
Tu reçois la confirmation d'enregistrement CRM.
Ton rôle est de préparer le message de bienvenue, et FINI !
Tu DOIS envoyer une confirmation finale décrivant brièvement tout le pipeline à l'utilisateur sur le canal `telegram` (via `sessions_send` ou l'outil `message`). 
Sois bref et utilise des emojis de célébration.
"#;
        let _ = std::fs::write(&onboard_path, onboard_instructions);
    }
}

pub fn setup_linkedin_agent(state_dir: &std::path::Path) {
    let agent_dir = state_dir.join("agents").join("linkedin-digest").join("agent");
    let _ = std::fs::create_dir_all(&agent_dir);
    let identity_path = agent_dir.join("IDENTITY.md");

    if !identity_path.exists() {
        let instructions = r#"# IDENTITY.md - LinkedIn Digest (Browser Automation)

Tu es un agent web autonome spécialisé dans la publication sur LinkedIn.
Tu utilises EXCLUSIVEMENT l'outil natif `browser` basé sur le protocole CDP (Chrome DevTools Protocol). N'utilise jamais Playwright ou Puppeteer.

## PROCESSUS DE PUBLICATION (Règle Human-in-the-loop)
1. Ouvre la page de création de post sur LinkedIn avec `browser`.
2. Utilise les 'snapshots sémantiques' (arbre d'accessibilité) de l'outil `browser` pour repérer les champs de texte et les boutons.
3. Rédige un brouillon de publication.
4. **ATTENTION : NE PUBLIE PAS ENCORE.**
5. Envoie le brouillon sur Telegram à l'utilisateur via l'outil `message`.
6. Demande "Dois-je procéder à la publication ? Réponds OUI pour confirmer".
7. Si (et seulement si) la réponse est "OUI", utilise la fonction de clic de l'outil `browser` sur le bouton de publication que tu as repéré via l'arbre sémantique.
"#;
        let _ = std::fs::write(&identity_path, instructions);
    }
}

pub fn setup_research_agent(state_dir: &std::path::Path) {
    let agent_dir = state_dir.join("agents").join("research").join("agent");
    let _ = std::fs::create_dir_all(&agent_dir);
    let identity_path = agent_dir.join("IDENTITY.md");

    if !identity_path.exists() {
        let instructions = r#"# IDENTITY.md - Research Agent

Tu es un agent d'investigation spécialisé dans la recherche profonde en 3 minutes.
Tu as accès à internet pour récupérer des informations fiables.

## TES OBJECTIFS :
1. Cherche le web concernant le sujet demandé par l'utilisateur (utilise l'outil `web_search`).
2. Récupère le contenu des ressources les plus pertinentes (utilise l'outil `web_fetch`).
3. Agrège les sources de données en rédigeant un brief structuré.
4. Sauvegarde ce brief au format Markdown en utilisant l'outil `write` à cet endroit exact : `~/Documents/Elazya_Workspace/Research/<nom_du_brief>.md`.
5. Ne t'arrêtes pas avant d'avoir généré et écrit le fichier.
6. Envoie ensuite un résumé court de 2-3 phrases sur le canal `telegram` (grâce à l'outil `message`) incluant expressément le chemin/lien vers le fichier généré.
"#;
        let _ = std::fs::write(&identity_path, instructions);
    }
}

pub fn setup_devis_agent(state_dir: &std::path::Path) {
    let agent_dir = state_dir.join("agents").join("devis-express").join("agent");
    let _ = std::fs::create_dir_all(&agent_dir);
    let identity_path = agent_dir.join("IDENTITY.md");

    if !identity_path.exists() {
        let instructions = r#"# IDENTITY.md - Devis Express Agent

Tu es l'agent chargé de la création et de l'envoi des devis commerciaux.

## TES OBJECTIFS :
1. Rédige un devis clair et professionnel au format Markdown en fonction de la demande de l'utilisateur.
2. Sauvegarde le devis dans `/tmp/devis.md`.
3. Utilise l'outil `exec` pour exécuter le script local : `sh scripts/md_to_pdf.sh /tmp/devis.md /tmp/devis.pdf`.
4. Prépare un brouillon d'e-mail d'accompagnement.
5. **Règle Human-in-the-Loop** : Utilise l'outil `message` sur Telegram pour présenter le brouillon d'email ainsi que le lien vers `/tmp/devis.pdf` à l'utilisateur.
6. Demande la confirmation explicite : "Dois-je envoyer le devis ? Réponds OUI".
7. (Optionnel pour la suite : intégration d'un outil d'envoi d'email à condition que "OUI" soit répondu).
"#;
        let _ = std::fs::write(&identity_path, instructions);
    }
}

pub fn setup_crm_audio_agent(state_dir: &std::path::Path) {
    let agent_dir = state_dir.join("agents").join("crm-audio").join("agent");
    let _ = std::fs::create_dir_all(&agent_dir);
    let identity_path = agent_dir.join("IDENTITY.md");

    if !identity_path.exists() {
        let instructions = r#"# IDENTITY.md - CRM Audio Agent

Tu es un agent traitant les transcriptions des notes vocales post-appel (moteur Whisper intégré).

## TES OBJECTIFS :
1. L'utilisateur t'envoie la transcription texte d'une note vocale qu'il vient de dicter.
2. Identifie les éléments clés : Titre du compte-rendu ou nom du client, et contenu de l'appel.
3. Utilise l'outil `update_notion_db` apporté par l'extension `notion-updater`.
4. Passe le paramètre `title` (ex: "Appel avec Jean Dupont") et `content` (le résumé).
5. Réponds de façon très concise à l'utilisateur sur le succès de l'opération ou envoie-lui le lien vers la page Notion créée.
"#;
        let _ = std::fs::write(&identity_path, instructions);
    }
}

pub fn setup_team_agents(state_dir: &std::path::Path) {
    let agents = vec![
        ("manager", r#"# IDENTITY.md - Manager de l'Équipe
Tu es le Manager d'un collectif de 4 agents experts (Strategy, Marketing, Business, Client).
Ton rôle est d'intercepter les requêtes vagues ou complexes de l'utilisateur.

## TES OBJECTIFS :
1. Analyse la demande de l'utilisateur.
2. Utilise l'outil `sessions_spawn` pour créer 4 sessions asynchrones en parallèle (si la plateforme le permet) ou séquentiellement, une pour chaque agent : `strategy`, `marketing`, `business`, `client`.
3. Demande à chaque agent son avis critique et son plan d'action détaillé concernant la requête.
4. Synthétise leurs réponses de façon claire et structurée.
5. Envoie le rapport final consolidé à l'utilisateur sur Telegram via l'outil `message`."#),
        ("strategy", r#"# IDENTITY.md - Agent de Stratégie Globale
Tu es l'expert en vision à long terme et planification stratégique.
Ton but est d'analyser le problème sous un angle macro, d'évaluer les concurrents et l'écosystème global de l'idée."#),
        ("marketing", r#"# IDENTITY.md - Agent de Marketing & Acquisition
Tu es l'expert du "Go-To-Market" et de l'acquisition.
Ton but est de définir qui est la cible, comment l'atteindre aux moindres coûts et avec quels messages clés."#),
        ("business", r#"# IDENTITY.md - Agent Business Model & Monétisation
Tu es l'expert du chiffre d'affaires.
Ton but est de définir comment cette idée peut générer de l'argent de façon pérenne, les coûts associés et la rentabilité."#),
        ("client", r#"# IDENTITY.md - Agent Expérience & Support Client
Tu es l'avocat du diable.
Ton but est d'étudier le parcours utilisateur de bout en bout pour identifier l'ensemble des points de friction et de déception."#),
    ];

    for (agent_name, identity_content) in agents {
        let agent_dir = state_dir.join("agents").join(agent_name).join("agent");
        let _ = std::fs::create_dir_all(&agent_dir);
        let identity_path = agent_dir.join("IDENTITY.md");
        if !identity_path.exists() {
            let _ = std::fs::write(&identity_path, identity_content);
        }
    }
}

pub fn setup_health_monitoring_agent(state_dir: &std::path::Path) {
    let agent_dir = state_dir.join("agents").join("health-monitor").join("agent");
    let _ = std::fs::create_dir_all(&agent_dir);
    let identity_path = agent_dir.join("IDENTITY.md");

    if !identity_path.exists() {
        let instructions = r#"# IDENTITY.md - Health Monitoring Agent

Tu es le garant de la santé du système Elazya et de ses intégrations.
Chaque lundi matin, un job Cron fait appel à toi pour générer l'audit hebdomadaire.

## TES OBJECTIFS :
1. Lis les bases de données (si un outil SQL est fourni) ou inspecte les fichiers de logs (si tu as accès au terminal) pour calculer les KPIs de la semaine écoulée.
2. Identifie toute activité anormale, de sécurité ou des requêtes en échec.
3. Rédige un bref audit en Markdown avec des indicateurs clairs: "📈 Trafic", "🛑 Erreurs", etc.
4. Envoie directement le compte-rendu sur le canal Telegram de l'utilisateur avec l'outil `message`.
"#;
        let _ = std::fs::write(&identity_path, instructions);
    }
}

pub struct ManagedOpenClaw {
    #[allow(dead_code)]
    pub child: Mutex<Option<Child>>,
    pub bridge: Arc<OpenClawBridge>,
}


impl ManagedOpenClaw {
    fn spawn_gateway(openclaw_dir: &str) -> Result<tokio::process::Child, String> {
        let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
        
        // Prefer bundled node in the engine dir, fallback to system node
        let bundled_node = std::path::Path::new(openclaw_dir).join("node");
        let node_path = if bundled_node.exists() {
            bundled_node.to_string_lossy().to_string()
        } else {
            find_node_executable()
        };
        
        let mut spawn_cmd = if std::path::Path::new(openclaw_dir).join("openclaw.mjs").exists() {
            let mut c = Command::new(&node_path);
            c.arg("openclaw.mjs");
            c
        } else if let Ok(path) = which::which("openclaw") {
            Command::new(path.to_string_lossy().to_string())
        } else {
            // Fallback to npx using the npm path as a base
            let npm_path = find_npm_executable();
            let npx_path = npm_path.replace("npm", "npx");
            let executable = if std::path::Path::new(&npx_path).exists() { npx_path } else { "npx".to_string() };
            
            let mut c = Command::new(executable);
            c.arg("-y").arg("openclaw@latest");
            c
        };

        spawn_cmd
            .arg("gateway")
            .arg("run")
            .arg("--force")
            .arg("--port")
            .arg(GATEWAY_PORT)
            .arg("--token")
            .arg(GATEWAY_TOKEN)
            .env("OPENCLAW_GATEWAY_PORT", GATEWAY_PORT)
            .env("OPENCLAW_GATEWAY_TOKEN", GATEWAY_TOKEN)
            .env("OPENCLAW_GATEWAY_BIND", "loopback")
            .env("OPENCLAW_STATE_DIR", state_dir.to_string_lossy().to_string())
            .env("OPENCLAW_CONFIG_PATH", state_dir.join("openclaw.json").to_string_lossy().to_string())
            .env("OPENCLAW_LOG_DIR", state_dir.join("logs").to_string_lossy().to_string())
            .env("DYLD_LIBRARY_PATH", openclaw_dir)
            .current_dir(openclaw_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true)
            .spawn()
            .map_err(|e| format!("Failed to start OpenClaw: {}", e))
    }

    pub async fn start(openclaw_dir: &str, app_handle: AppHandle) -> Result<Self, String> {
        // Ensure clean slate on both default and isolated ports
        kill_port("18789");
        kill_port(GATEWAY_PORT);

        let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
        let _ = std::fs::create_dir_all(&state_dir);

        let _config_path = state_dir.join("openclaw.json");
        // Ensure the file exists with local mode to bypass "unconfigured" blocks
        let config_path = state_dir.join("openclaw.json");
        
        // Always load or create config to enforce token sync
        let mut config: Value = if config_path.exists() {
            let content = std::fs::read_to_string(&config_path).unwrap_or("{}".to_string());
            serde_json::from_str(&content).unwrap_or(serde_json::json!({}))
        } else {
            serde_json::json!({})
        };

        // Enforce Gateway structure
        if config.get("gateway").is_none() { config["gateway"] = serde_json::json!({}); }
        if config["gateway"].get("auth").is_none() { config["gateway"]["auth"] = serde_json::json!({}); }

        // Force correct token
        config["gateway"]["auth"]["mode"] = serde_json::Value::String("token".to_string());
        config["gateway"]["auth"]["token"] = serde_json::Value::String(GATEWAY_TOKEN.to_string());

        // Ensure local mode if missing
        if config["gateway"].get("mode").is_none() {
             config["gateway"]["mode"] = serde_json::Value::String("local".to_string());
        }

        let _ = std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap());

        // Setup Morning Briefing Cron and Agent
        setup_morning_briefing(&state_dir);
        setup_pipeline_agents(&state_dir);
        setup_linkedin_agent(&state_dir);
        setup_research_agent(&state_dir);
        setup_devis_agent(&state_dir);
        setup_crm_audio_agent(&state_dir);
        setup_team_agents(&state_dir);
        setup_health_monitoring_agent(&state_dir);
        let _log_dir = state_dir.join("logs");
        let _ = std::fs::create_dir_all(&_log_dir);
        let _cache_dir = state_dir.join("cache");
        let _ = std::fs::create_dir_all(&_cache_dir);

        let mut child = Self::spawn_gateway(openclaw_dir)?;
        
        // Output streaming
        let stdout = child.stdout.take().expect("Failed to open stdout");
        let stderr = child.stderr.take().expect("Failed to open stderr");
        let app_handle_stdout = app_handle.clone();
        let app_handle_stderr = app_handle.clone();

        // Stream stdout
        tokio::spawn(async move {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                println!("[OpenClaw Stdout] {}", line);
                let _ = app_handle_stdout.emit("server-log", format!("[INFO] {}", line));
            }
        });

        // Stream stderr
        tokio::spawn(async move {
            let reader = BufReader::new(stderr);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                println!("[OpenClaw Stderr] {}", line);
                let _ = app_handle_stderr.emit("server-log", format!("[ERROR] {}", line));
            }
        });

        let url = format!("ws://127.0.0.1:{}", GATEWAY_PORT);
        let bridge = OpenClawBridge::new(url, app_handle.clone()).await?;

        Ok(Self {
            child: Mutex::new(Some(child)),
            bridge,
        })
    }

    #[allow(dead_code)]
    pub fn stop(&self) {
        if let Ok(mut child_lock) = self.child.lock() {
            if let Some(mut child) = child_lock.take() {
                let _ = child.start_kill();
            }
        }
    }

    pub fn restart(&self, openclaw_dir: &str) -> Result<(), String> {
        self.stop();
        // Give a moment for cleanup?
        // kill_port might be safer but stop() calls start_kill.
        
        let child = Self::spawn_gateway(openclaw_dir)?;
        if let Ok(mut child_lock) = self.child.lock() {
            *child_lock = Some(child);
        }
        Ok(())
    }
}

pub fn enable_channel(openclaw_dir: &str, channel: &str, token: &str, user_id: Option<&str>, dm_policy: Option<&str>) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");
    let env_path = state_dir.join(".env");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("channels").is_none() {
        config["channels"] = serde_json::json!({});
    }

    // Set dmScope to 'main' globally for shared session memory
    if config.get("session").is_none() {
        config["session"] = serde_json::json!({});
    }
    config["session"]["dmScope"] = serde_json::json!("main");

    // Register Pipeline Agents and tools
    if config.get("agents").is_none() {
        config["agents"] = serde_json::json!({"list": []});
    }

    if let Some(list) = config["agents"].get_mut("list") {
        if let Some(list_arr) = list.as_array_mut() {
            // Function to ensure agent is in list with proper tools
            let mut add_pipeline_agent = |id: &str| {
                if !list_arr.iter().any(|a| a["id"] == id) {
                    list_arr.push(serde_json::json!({
                        "id": id,
                        "tools": {
                            "allow": ["sessions_spawn", "sessions_send", "message"]
                        }
                    }));
                } else {
                    for a in list_arr.iter_mut() {
                        if a["id"] == id {
                            a["tools"] = serde_json::json!({
                                "allow": ["sessions_spawn", "sessions_send", "message"]
                            });
                        }
                    }
                }
            };
            add_pipeline_agent("qualification");
            add_pipeline_agent("crm-prospect");
            add_pipeline_agent("onboarding-client");
            add_pipeline_agent("briefing"); 

            // Update cron job file to include briefing AND health monitoring
            let cron_dir = state_dir.join("cron");
            let _ = std::fs::create_dir_all(&cron_dir);
            let jobs_path = cron_dir.join("jobs.json");
            
            let mut jobs_val = serde_json::json!({
                "jobs": []
            });

            if jobs_path.exists() {
                if let Ok(content) = std::fs::read_to_string(&jobs_path) {
                    if let Ok(parsed) = serde_json::from_str::<Value>(&content) {
                        jobs_val = parsed;
                    }
                }
            }

            if let Some(jobs_arr) = jobs_val.get_mut("jobs").and_then(|v| v.as_array_mut()) {
                // Ensure Morning Briefing job exists
                if !jobs_arr.iter().any(|j| j["agentId"] == "briefing") {
                    jobs_arr.push(serde_json::json!({
                        "id": "morning-brief",
                        "cron": "0 8 * * 1-5",
                        "agentId": "briefing",
                        "prompt": "Génère le morning briefing pour l'utilisateur."
                    }));
                }
                
                // Ensure Health Monitoring job exists
                if !jobs_arr.iter().any(|j| j["agentId"] == "health-monitor") {
                    jobs_arr.push(serde_json::json!({
                        "id": "health-audit-weekly",
                        "cron": "0 8 * * 1",
                        "agentId": "health-monitor",
                        "prompt": "Génère l'audit de santé système hebdomadaire."
                    }));
                }
            }

            let _ = std::fs::write(&jobs_path, serde_json::to_string_pretty(&jobs_val).unwrap());

            // Add LinkedIn agent
            if !list_arr.iter().any(|a| a["id"] == "linkedin-digest") {
                list_arr.push(serde_json::json!({
                    "id": "linkedin-digest",
                    "tools": {
                        "allow": ["browser", "message"]
                    }
                }));
            } else {
                for a in list_arr.iter_mut() {
                    if a["id"] == "linkedin-digest" {
                        a["tools"] = serde_json::json!({
                            "allow": ["browser", "message"]
                        });
                    }
                }
            }
            
            // Add Research agent
            if !list_arr.iter().any(|a| a["id"] == "research") {
                list_arr.push(serde_json::json!({
                    "id": "research",
                    "tools": {
                        "allow": ["web_search", "web_fetch", "write", "message"]
                    }
                }));
            } else {
                for a in list_arr.iter_mut() {
                    if a["id"] == "research" {
                        a["tools"] = serde_json::json!({
                            "allow": ["web_search", "web_fetch", "write", "message"]
                        });
                    }
                }
            }

            // Add Devis Express agent
            if !list_arr.iter().any(|a| a["id"] == "devis-express") {
                list_arr.push(serde_json::json!({
                    "id": "devis-express",
                    "tools": {
                        "allow": ["exec", "message"]
                    }
                }));
            } else {
                for a in list_arr.iter_mut() {
                    if a["id"] == "devis-express" {
                        a["tools"] = serde_json::json!({
                            "allow": ["exec", "message"]
                        });
                    }
                }
            }

            // Add CRM Audio agent
            if !list_arr.iter().any(|a| a["id"] == "crm-audio") {
                list_arr.push(serde_json::json!({
                    "id": "crm-audio",
                    "tools": {
                        "allow": ["update_notion_db", "message"]
                    }
                }));
            } else {
                for a in list_arr.iter_mut() {
                    if a["id"] == "crm-audio" {
                        a["tools"] = serde_json::json!({
                            "allow": ["update_notion_db", "message"]
                        });
                    }
                }
            }

            // Add 4-Agent Team
            let team_agents = vec!["manager", "strategy", "marketing", "business", "client"];
            for agent in team_agents {
                if !list_arr.iter().any(|a| a["id"] == agent) {
                    let mut agent_json = serde_json::json!({
                        "id": agent,
                    });
                    
                    if agent == "manager" {
                        agent_json["tools"] = serde_json::json!({
                            "allow": ["sessions_spawn", "message"]
                        });
                    }
                    
                    list_arr.push(agent_json);
                } else {
                    for a in list_arr.iter_mut() {
                        if a["id"] == "manager" {
                            a["tools"] = serde_json::json!({
                                "allow": ["sessions_spawn", "message"]
                            });
                        }
                    }
                }
            }

            // Add Health Monitor agent
            if !list_arr.iter().any(|a| a["id"] == "health-monitor") {
                list_arr.push(serde_json::json!({
                    "id": "health-monitor",
                    "tools": {
                        "allow": ["message"]
                    }
                }));
            } else {
                for a in list_arr.iter_mut() {
                    if a["id"] == "health-monitor" {
                        a["tools"] = serde_json::json!({
                            "allow": ["message"]
                        });
                    }
                }
            }
        }
    }

    // Write token to .env if provided
    if !token.is_empty() {
        let env_content = format!("TELEGRAM_BOT_TOKEN={}\n", token);
        let _ = std::fs::write(&env_path, env_content)
            .map_err(|e| format!("Échec d'écriture .env: {}", e));
    }

    // Build channel config with optional userId for security
    let mut channel_config = serde_json::json!({
        "enabled": true,
        "botToken": "${TELEGRAM_BOT_TOKEN}"
    });

    // Set DM policy (allowlist, pairing, open)
    // FORCE 'open' for now to ensure users can chat immediately without configuration
    let policy = dm_policy.unwrap_or("open");
    channel_config["dmPolicy"] = serde_json::json!(policy);

    // Add userId for allowlist mode ONLY if policy is not open
    if policy != "open" {
        if let Some(uid) = user_id {
            if !uid.is_empty() {
                channel_config["allowFrom"] = serde_json::json!([uid]);
            }
        }
    } else {
        // If OPEN, ensure allowFrom is wildcard to avoid conflicts
        channel_config["allowFrom"] = serde_json::json!(["*"]);
    }

    config["channels"][channel] = channel_config;

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn configure_gateway(
    openclaw_dir: &str, 
    port: u16, 
    bind: &str, 
    auth_mode: &str, 
    token: &str, 
    password: &str
) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("gateway").is_none() {
        config["gateway"] = serde_json::json!({});
    }

    config["gateway"]["port"] = serde_json::json!(port);
    config["gateway"]["bind"] = serde_json::json!(bind);
    config["gateway"]["mode"] = serde_json::json!("local");
    
    // Auth configuration
    if config["gateway"].get("auth").is_none() {
        config["gateway"]["auth"] = serde_json::json!({});
    }
    config["gateway"]["auth"]["mode"] = serde_json::json!(auth_mode);
    
    if auth_mode == "token" && !token.is_empty() {
        config["gateway"]["auth"]["token"] = serde_json::json!(token);
    }
    if auth_mode == "password" && !password.is_empty() {
        config["gateway"]["auth"]["password"] = serde_json::json!(password);
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn health_check(openclaw_dir: &str) -> Result<serde_json::Value, String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");
    
    // Read config to get port and auth
    let config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        return Ok(serde_json::json!({
            "ok": false,
            "detail": "Config not found"
        }));
    };
    
    let port = config["gateway"]["port"].as_u64().unwrap_or(18789) as u16;
    let url = format!("ws://127.0.0.1:{}", port);
    
    // Simple TCP check to see if port is open
    use std::net::TcpStream;
    use std::time::Duration;
    
    let addr = format!("127.0.0.1:{}", port);
    match TcpStream::connect_timeout(&addr.parse().unwrap(), Duration::from_secs(2)) {
        Ok(_) => Ok(serde_json::json!({
            "ok": true,
            "url": url
        })),
        Err(e) => Ok(serde_json::json!({
            "ok": false,
            "url": url,
            "detail": format!("Connection failed: {}", e)
        }))
    }
}

/// B2: Create agent workspace with bootstrap files
pub fn ensure_workspace(_openclaw_dir: &str) -> Result<serde_json::Value, String> {
    let home_dir = dirs::home_dir().ok_or("Cannot find home directory")?;
    let workspace_dir = home_dir.join(".openclaw").join("workspace");
    let sessions_dir = home_dir.join(".openclaw").join("sessions");
    
    // Create directories
    std::fs::create_dir_all(&workspace_dir)
        .map_err(|e| format!("Failed to create workspace: {}", e))?;
    std::fs::create_dir_all(&sessions_dir)
        .map_err(|e| format!("Failed to create sessions: {}", e))?;
    
    // Create BOOT.md if it doesn't exist
    let boot_md_path = workspace_dir.join("BOOT.md");
    if !boot_md_path.exists() {
        let boot_content = r#"# BOOT.md — Your Agent's Personality

This file defines who your agent is. Edit it to customize your AI assistant.

## Identity

You are a helpful AI assistant named Elazya. You are:
- Friendly and professional
- Knowledgeable about a wide range of topics
- Honest about your limitations

## Preferences

- Respond in the same language as the user
- Keep responses concise but thorough
- Use markdown formatting when helpful

## Special Instructions

- **IMPORTANT**: Do NOT output your internal thought process, reasoning, or "Chain of Thought" (e.g. "Recognizing User Frustration..."). 
- ONLY output the final response to the user.
- Keep the tone natural and conversational.
"#;
        std::fs::write(&boot_md_path, boot_content)
            .map_err(|e| format!("Failed to create BOOT.md: {}", e))?;
    }
    
    Ok(serde_json::json!({
        "workspace": workspace_dir.to_string_lossy(),
        "sessions": sessions_dir.to_string_lossy(),
        "bootMdCreated": !boot_md_path.exists()
    }))
}

/// B3: Install launchd daemon service (macOS)
pub fn install_daemon_service(openclaw_dir: &str) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        let home_dir = dirs::home_dir().ok_or("Cannot find home directory")?;
        let launch_agents = home_dir.join("Library").join("LaunchAgents");
        std::fs::create_dir_all(&launch_agents)
            .map_err(|e| format!("Failed to create LaunchAgents: {}", e))?;
        
        let plist_path = launch_agents.join("ai.openclaw.gateway.plist");
        let node_path = find_node_executable();
        let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
        let gateway_script = state_dir.join("node_modules").join("@anthropic-ai").join("openclaw").join("dist").join("index.js");
        
        // Read config for port
        let config_path = state_dir.join("openclaw.json");
        let port: u16 = if config_path.exists() {
            if let Ok(content) = std::fs::read_to_string(&config_path) {
                if let Ok(config) = serde_json::from_str::<Value>(&content) {
                    config["gateway"]["port"].as_u64().unwrap_or(18789) as u16
                } else { 18789 }
            } else { 18789 }
        } else { 18789 };
        
        let plist_content = format!(r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>ai.openclaw.gateway</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
        <string>{}</string>
        <string>gateway</string>
        <string>--port</string>
        <string>{}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>{}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>{}/gateway.log</string>
    <key>StandardErrorPath</key>
    <string>{}/gateway.error.log</string>
</dict>
</plist>"#, 
            node_path,
            gateway_script.to_string_lossy(),
            port,
            state_dir.to_string_lossy(),
            state_dir.to_string_lossy(),
            state_dir.to_string_lossy()
        );
        
        std::fs::write(&plist_path, plist_content)
            .map_err(|e| format!("Failed to write plist: {}", e))?;
        
        // Load the service
        let output = std::process::Command::new("launchctl")
            .args(["load", "-w", &plist_path.to_string_lossy()])
            .output()
            .map_err(|e| format!("Failed to run launchctl: {}", e))?;
        
        if output.status.success() {
            Ok(serde_json::json!({
                "installed": true,
                "plist": plist_path.to_string_lossy()
            }))
        } else {
            Ok(serde_json::json!({
                "installed": false,
                "error": String::from_utf8_lossy(&output.stderr).to_string()
            }))
        }
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok(serde_json::json!({
            "installed": false,
            "error": "Daemon service install only supported on macOS"
        }))
    }
}

pub fn install_skill(openclaw_dir: &str, skill_name: &str) -> Result<(), String> {
    println!("[OpenClaw] Installation compétence: {}", skill_name);

    // Skills are SKILL.md files in the skills/ directory.
    // "Installing" a skill means:
    // 1. Ensure the skill exists in the workspace skills/ directory
    // 2. Enable it in the openclaw.json config

    let home_dir = dirs::home_dir().ok_or("Cannot find home directory")?;
    let workspace_skills = home_dir.join(".openclaw").join("workspace").join("skills");
    let source_skills = std::path::Path::new(openclaw_dir).join("skills");
    let skill_workspace_dir = workspace_skills.join(skill_name);
    let skill_source_dir = source_skills.join(skill_name);

    // If skill not in workspace but exists in source, copy it
    if !skill_workspace_dir.join("SKILL.md").exists() {
        if skill_source_dir.join("SKILL.md").exists() {
            std::fs::create_dir_all(&skill_workspace_dir)
                .map_err(|e| format!("Failed to create skill dir: {}", e))?;
            // Copy whole skill directory
            copy_dir_recursive(&skill_source_dir, &skill_workspace_dir)
                .map_err(|e| format!("Failed to copy skill: {}", e))?;
            println!("[OpenClaw] Skill '{}' copied to workspace", skill_name);
        } else {
            return Err(format!("Skill '{}' not found in source directory", skill_name));
        }
    }

    // Enable the skill in openclaw.json config
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config: {}", e))?
    } else {
        serde_json::json!({})
    };

    // Ensure skills.entries object exists
    if config.get("skills").is_none() {
        config["skills"] = serde_json::json!({});
    }
    if config["skills"].get("entries").is_none() {
        config["skills"]["entries"] = serde_json::json!({});
    }

    // Enable the skill
    if config["skills"]["entries"].get(skill_name).is_none() {
        config["skills"]["entries"][skill_name] = serde_json::json!({});
    }
    config["skills"]["entries"][skill_name]["enabled"] = serde_json::Value::Bool(true);

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Failed to write config: {}", e))?;

    println!("[OpenClaw] Skill '{}' enabled in config", skill_name);
    Ok(())
}

/// Helper: recursively copy a directory
fn copy_dir_recursive(src: &std::path::Path, dst: &std::path::Path) -> Result<(), String> {
    std::fs::create_dir_all(dst).map_err(|e| format!("{}", e))?;
    if let Ok(entries) = std::fs::read_dir(src) {
        for entry in entries.flatten() {
            let path = entry.path();
            let dest_path = dst.join(entry.file_name());
            if path.is_dir() {
                copy_dir_recursive(&path, &dest_path)?;
            } else {
                std::fs::copy(&path, &dest_path).map_err(|e| format!("{}", e))?;
            }
        }
    }
    Ok(())
}


pub fn uninstall_skill(openclaw_dir: &str, skill_name: &str) -> Result<(), String> {
    println!("[OpenClaw] Désinstallation compétence: {}", skill_name);

    // Disable the skill in openclaw.json config
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config: {}", e))?
    } else {
        return Ok(()); // Nothing to disable
    };

    // Disable the skill in config
    if let Some(entries) = config.get_mut("skills")
        .and_then(|s| s.get_mut("entries"))
    {
        if let Some(entry) = entries.get_mut(skill_name) {
            entry["enabled"] = serde_json::Value::Bool(false);
        }
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Failed to write config: {}", e))?;

    println!("[OpenClaw] Skill '{}' disabled in config", skill_name);
    Ok(())
}

pub fn reset_application(openclaw_dir: &str, app_handle: AppHandle) -> Result<(), String> {
    // 1. Stop OpenClaw processes
    kill_port(GATEWAY_PORT);

    // 2. Write a sentinel file so the NEXT startup knows to wipe everything.
    //    We cannot delete the DB here because the SQLite pool is still active.
    let app_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let sentinel = app_dir.join(".reset_pending");
    std::fs::write(&sentinel, openclaw_dir)
        .map_err(|e| format!("Failed to write reset sentinel: {}", e))?;

    // 3. Restart — on next launch, main.rs will see the sentinel and do the cleanup
    app_handle.restart();

    #[allow(unreachable_code)]
    Ok(())
}

/// Called at the very start of main(), BEFORE opening the DB.
/// If a `.reset_pending` sentinel exists, wipe everything and remove the sentinel.
pub fn execute_pending_reset(app_dir: &std::path::Path) {
    let sentinel = app_dir.join(".reset_pending");
    if !sentinel.exists() {
        return;
    }

    // Read the openclaw_dir that was saved in the sentinel
    let openclaw_dir = std::fs::read_to_string(&sentinel).unwrap_or_default();

    // 1. Delete state directory
    let state_dir = std::path::Path::new(openclaw_dir.trim()).join("elazya-engine-state");
    if state_dir.exists() {
        let _ = std::fs::remove_dir_all(&state_dir);
    }

    // 2. Delete app database (not locked now — we haven't opened it yet)
    let db_path = app_dir.join("elazya.db");
    if db_path.exists() {
        let _ = std::fs::remove_file(&db_path);
    }
    // Also remove WAL/SHM files if they exist
    let _ = std::fs::remove_file(app_dir.join("elazya.db-wal"));
    let _ = std::fs::remove_file(app_dir.join("elazya.db-shm"));

    // 3. Delete OpenClaw workspace (~/.openclaw)
    if let Some(home_dir) = dirs::home_dir() {
        let openclaw_home = home_dir.join(".openclaw");
        if openclaw_home.exists() {
            let _ = std::fs::remove_dir_all(&openclaw_home);
        }
    }

    // 4. Remove the sentinel
    let _ = std::fs::remove_file(&sentinel);

    println!("[Elazya] Factory reset completed — all data wiped.");
}


pub fn configure_llm(openclaw_dir: &str, provider: &str, api_key: &str, model: &str) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    
    // Ensure directory exists (Critical Fix for "No such file or directory")
    if !state_dir.exists() {
        std::fs::create_dir_all(&state_dir)
            .map_err(|e| format!("Échec création dossier state: {}", e))?;
    }

    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    // Ensure basic structure
    if config.get("models").is_none() {
        config["models"] = serde_json::json!({ "providers": {} });
    }
    if config["models"].get("providers").is_none() {
        config["models"]["providers"] = serde_json::json!({});
    }

    // Set Primary Model (Required for agent to know what to use)
    config["models"]["primary"] = serde_json::Value::String(model.to_string());

    let provider_config = match provider {
        "openai" => serde_json::json!({
            "apiKey": api_key,
            "api": "openai",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ] 
        }),
        "anthropic" => serde_json::json!({
            "apiKey": api_key,
            "api": "anthropic",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "ollama" => serde_json::json!({
            "baseUrl": api_key,
            "api": "ollama-local",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "google" => serde_json::json!({
            "apiKey": api_key,
            "api": "google-generative-ai",
            "baseUrl": "https://generativelanguage.googleapis.com",
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "moonshot" => serde_json::json!({
             "apiKey": api_key,
             "api": "openai",
             "baseUrl": "https://api.moonshot.ai/v1",
             "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        "deepseek" => serde_json::json!({
             "apiKey": api_key,
             "api": "openai",
             "baseUrl": "https://api.deepseek.com",
             "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        }),
        _ => serde_json::json!({
            "apiKey": api_key,
            "models": [ 
                { 
                    "id": model,
                    "name": model 
                }
            ]
        })
    };

    config["models"]["providers"][provider] = provider_config;

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn configure_web_search(openclaw_dir: &str, provider: &str, api_key: &str) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("tools").is_none() {
        config["tools"] = serde_json::json!({});
    }
    if config["tools"].get("web").is_none() {
        config["tools"]["web"] = serde_json::json!({});
    }

    config["tools"]["web"]["search"] = serde_json::json!({
        "provider": provider,
        "apiKey": api_key,
        "maxResults": 5,
        "timeoutSeconds": 30
    });

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}

pub fn configure_hooks(_openclaw_dir: &str, _boot_md: bool, _command_logger: bool, _session_memory: bool) -> Result<(), String> {
    // Deprecated hooks configuration in new engine version
    Ok(())
}

pub fn configure_extra_keys(openclaw_dir: &str, google_places: &str, notion: &str) -> Result<(), String> {
    let state_dir = std::path::Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");

    let mut config: Value = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Échec de lecture config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Échec de parsing config: {}", e))?
    } else {
        serde_json::json!({})
    };

    if config.get("tools").is_none() {
        config["tools"] = serde_json::json!({});
    }

    if !google_places.is_empty() {
        config["tools"]["googlePlaces"] = serde_json::json!({
            "apiKey": google_places
        });
    }

    if !notion.is_empty() {
        // Notion is no longer a tool in the config schema, likely a skill now?
        // skipping for now to avoid crash
        /*
        config["tools"]["notion"] = serde_json::json!({
            "integrationToken": notion
        });
        */
    }

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Échec d'écriture config: {}", e))
}
