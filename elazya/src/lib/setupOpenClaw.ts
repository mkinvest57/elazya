import { invoke } from '@tauri-apps/api/core';

export interface OpenClawConfigParams {
    googleApiKey: string;
    telegramBotToken: string;
    adminTelegramId?: string; // Optional: Si fourni, la dmPolicy deviendra 'open' avec cet ID en allowFrom
}

export async function setupOpenClawConfig({ googleApiKey, telegramBotToken, adminTelegramId }: OpenClawConfigParams) {
    // Construction du JSON basé sur les contraintes architecturales.
    const config = {
        // 1. LLM Configuration (Optimized for Free Tier)
        agents: {
            defaults: {
                model: "gemini-2.5-flash", // Heartbeats et tâches communes 
                temperature: 0.7
            },
            // Override optionnel pour des tâches très spécifiques nécessitant le modèle lourd
            deep_reasoning: {
                model: "gemini-3.1-pro-preview",
                temperature: 0.2
            }
        },
        // 2. Connectivity & Channels
        channels: {
            telegram: {
                enabled: true,
                botToken: telegramBotToken,
                dmPolicy: adminTelegramId ? "open" : "pairing",
                // Si adminTelegramId est fourni, seul cet ID pourra interagir avec le bot
                ...(adminTelegramId ? { allowFrom: [adminTelegramId] } : {})
            }
        },
        // 3. Tools / Capabilities
        tools: {
            // Outils natifs système requis par Elazya
            read: { enabled: true },
            write: { enabled: true },
            edit: { enabled: true },
            cron: { enabled: true },
            browser: {
                enabled: true,
                headless: false // Permet de voir le navigateur tourner pour LinkedIn / Recherche
            },
            exec: {
                enabled: true,
                requireValidation: true // SECURITY: Empêche l'exécution de code arbitraire sans l'accord de l'utilisateur
            }
        },
        // Session state
        session: {
            dmScope: "per-channel-peer", // Isolation stricte des utilisateurs
        },
        // 4. Gateway Security
        gateway: {
            bind: "127.0.0.1", // SECURITY: Empêche l'exposition réseau (RCE)
            port: 18789        // Port par défaut d'OpenClaw
        },
        // Injection de la clé API
        env: {
            "GOOGLE_API_KEY": googleApiKey
        }
    };

    const jsonString = JSON.stringify(config, null, 2);

    try {
        // Appel sécurisé au backend Rust pour écrire le JSON de config
        await invoke('apply_openclaw_config_and_restart', {
            configJson: jsonString
        });

        // On appelle la commande native existante pour redémarrer le démon
        await invoke('restart_openclaw');

        console.log('[setupOpenClaw] Configuration appliquée et processus redémarré avec succès.');
        return true;
    } catch (error) {
        console.error('[setupOpenClaw] Échec de l\'application de la configuration:', error);
        throw error;
    }
}
