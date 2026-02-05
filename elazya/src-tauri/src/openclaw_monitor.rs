use tauri::Emitter;
use std::path::Path;
use std::time::Duration;
use serde_json::Value;

#[derive(serde::Serialize, serde::Deserialize, Clone, Default)]
pub struct UsageStats {
    pub input: u64,
    pub output: u64,
    pub total: u64,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Default)]
pub struct TokenUsage {
    pub session: UsageStats,
    pub monthly: UsageStats,
}

#[derive(serde::Serialize, Clone)]
pub struct ChannelInfo {
    pub id: String,
    pub name: String,
    pub connected: bool,
}

pub fn get_token_usage(openclaw_dir: &str) -> TokenUsage {
    let usage_path = Path::new(openclaw_dir)
        .join("elazya-engine-state")
        .join("cache")
        .join("token-usage.json");
    
    if let Ok(content) = std::fs::read_to_string(usage_path) {
        if let Ok(usage) = serde_json::from_str::<TokenUsage>(&content) {
            return usage;
        }
    }
    TokenUsage::default()
}

pub fn get_connected_channels(openclaw_dir: &str) -> Vec<ChannelInfo> {
    let state_dir = Path::new(openclaw_dir).join("elazya-engine-state");
    let config_path = state_dir.join("openclaw.json");
    
    let mut channels = Vec::new();
    let known_channels = vec!["whatsapp", "telegram", "discord", "slack"];

    // Default state: all disconnected
    let mut config_channels = serde_json::Map::new();

    if let Ok(content) = std::fs::read_to_string(&config_path) {
        if let Ok(json) = serde_json::from_str::<Value>(&content) {
            if let Some(c) = json.get("channels").and_then(|v| v.as_object()) {
                config_channels = c.clone();
            }
        }
    }

    for channel_id in known_channels {
        let connected = if let Some(c_config) = config_channels.get(channel_id) {
            // Check if enabled and has token/key
            let enabled = c_config.get("enabled").and_then(|b| b.as_bool()).unwrap_or(false);
            let has_token = c_config.get("token").is_some() || c_config.get("apiKey").is_some() || 
                           (c_config.get("auth").is_some() && c_config["auth"].get("token").is_some());
            enabled && has_token
        } else {
            false
        };

        channels.push(ChannelInfo {
            id: channel_id.to_string(),
            name: channel_id.chars().next().unwrap().to_uppercase().to_string() + &channel_id[1..],
            connected,
        });
    }

    channels
}

pub fn get_installed_skills(openclaw_dir: &str) -> Vec<String> {
    let package_json_path = Path::new(openclaw_dir).join("package.json");
    let mut skills = Vec::new();

    if let Ok(content) = std::fs::read_to_string(&package_json_path) {
        if let Ok(json) = serde_json::from_str::<Value>(&content) {
            if let Some(deps) = json.get("dependencies").and_then(|v| v.as_object()) {
                for (key, _) in deps {
                    if key.starts_with("@openclaw/skill-") || key.contains("openclaw-skill") {
                        // Extract nice name: @openclaw/skill-browser -> browser
                        let name = if key.starts_with("@openclaw/skill-") {
                            key.replace("@openclaw/skill-", "")
                        } else {
                            key.to_string()
                        };
                        skills.push(name);
                    }
                }
            }
        }
    }
    skills
}

pub fn watch_token_usage<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>, openclaw_dir: String) {
    let usage_path = Path::new(&openclaw_dir)
        .join("elazya-engine-state")
        .join("cache")
        .join("token-usage.json");

    tauri::async_runtime::spawn(async move {
        let mut last_mtime = std::time::SystemTime::UNIX_EPOCH;

        loop {
            if let Ok(metadata) = std::fs::metadata(&usage_path) {
                if let Ok(mtime) = metadata.modified() {
                    if mtime > last_mtime {
                        last_mtime = mtime;
                        if let Ok(content) = std::fs::read_to_string(&usage_path) {
                            if let Ok(usage) = serde_json::from_str::<Value>(&content) {
                                let _ = app_handle.emit("token-usage-update", usage);
                            }
                        }
                    }
                }
            }
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    });
}
