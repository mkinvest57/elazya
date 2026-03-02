import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface LLMProvider {
    id: string;
    name: string;
    models: string[];
}

export interface ChannelStatus {
    id: string;
    name: string;
    configured?: boolean;
    active?: boolean;
    connected?: boolean;
}

export interface RequirementsStatus {
    node_version: string | null;
    node_ok: boolean;
    openclaw_installed: boolean;
    error: string | null;
}

export class OpenClawClient {
    private static statusListeners: ((status: 'connected' | 'disconnected') => void)[] = [];

    static async init() {
        await listen<'connected' | 'disconnected'>('bridge-status', (event) => {
            console.log("[OpenClaw Client] Bridge status changed:", event.payload);
            this.statusListeners.forEach(listener => listener(event.payload));
        });
    }

    static async checkRequirements(): Promise<RequirementsStatus> {
        return invoke('check_requirements');
    }

    static async installOpenClaw(): Promise<void> {
        return invoke('install_openclaw');
    }

    static async isSetupComplete(): Promise<boolean> {
        try {
            return await invoke<boolean>("is_setup_complete");
        } catch {
            return localStorage.getItem('elazya_configured') === 'true';
        }
    }

    static async isBridgeConnected(): Promise<boolean> {
        try {
            return await invoke<boolean>("is_bridge_connected");
        } catch {
            return false;
        }
    }

    static async getSetting(key: string): Promise<string | null> {
        try {
            return await invoke<string | null>("get_setting", { key });
        } catch {
            return localStorage.getItem(key);
        }
    }

    static async setSetting(key: string, value: string): Promise<void> {
        try {
            await invoke("set_setting", { key, value });
        } catch {
            localStorage.setItem(key, value);
        }
    }

    static onStatusChange(callback: (status: 'connected' | 'disconnected') => void) {
        // First check initial status
        this.isBridgeConnected().then(connected => {
            callback(connected ? 'connected' : 'disconnected');
        });

        this.statusListeners.push(callback);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== callback);
        };
    }

    static async request(method: string, params: any = {}): Promise<any> {
        try {
            if (method === "config.patch" || method === "config.set") {
                const snapshot = await invoke("openclaw_request", { method: "config.get", params: {} }) as any;
                const baseHash = snapshot?.hash;

                if (!baseHash) {
                    throw new Error("Impossible de récupérer le hash de configuration actuel.");
                }

                const finalParams = {
                    raw: typeof params === 'string' ? params : JSON.stringify(params),
                    baseHash
                };

                return await invoke("openclaw_request", { method, params: finalParams });
            }

            return await invoke("openclaw_request", { method, params });
        } catch (err) {
            console.error(`OpenClaw Request Error (${method}):`, err);
            throw err;
        }
    }

    static async listProviders(): Promise<LLMProvider[]> {
        const res = await this.request("models.list");
        const models = res.models || [];

        const providersMap: Record<string, LLMProvider> = {};
        for (const m of models) {
            const pId = m.provider;
            if (!providersMap[pId]) {
                providersMap[pId] = {
                    id: pId,
                    name: pId.charAt(0).toUpperCase() + pId.slice(1),
                    models: []
                };
            }
            providersMap[pId].models.push(m.id);
        }

        return Object.values(providersMap);
    }

    static async getChannels(): Promise<ChannelStatus[]> {
        try {
            const res = await this.request("channels.status");
            if (!res || !res.channels) return [];

            return Object.entries(res.channels).map(([id, info]: [string, any]) => ({
                id,
                name: id.charAt(0).toUpperCase() + id.slice(1),
                configured: info.configured,
                active: info.active
            }));
        } catch (err) {
            console.error("Failed to fetch channels:", err);
            return [];
        }
    }

    static async toggleChannel(id: string, activate: boolean): Promise<any> {
        const method = activate ? "channels.login" : "channels.logout";
        return await this.request(method, { channel: id });
    }

    static async getUsageStats(): Promise<any> {
        return invoke('get_usage_stats');
    }

    static async getChannelsStatus(): Promise<any[]> {
        return invoke('get_channels');
    }

    static async getInstalledSkills(): Promise<string[]> {
        return invoke('get_skills');
    }

    static async enableChannel(channel: string, token: string, userId?: string, dmPolicy?: string): Promise<void> {
        return invoke('enable_channel', {
            channel,
            token,
            userId: userId || null,
            dmPolicy: dmPolicy || 'allowlist'
        });
    }

    static async configureHooks(bootMd: boolean, commandLogger: boolean, sessionMemory: boolean): Promise<void> {
        return invoke('configure_hooks_cmd', { bootMd, commandLogger, sessionMemory });
    }

    static async configureExtraKeys(googlePlaces: string, notion: string): Promise<void> {
        return invoke('configure_extra_keys_cmd', { googlePlaces, notion });
    }

    static async installSkill(skill: string): Promise<void> {
        return invoke('install_skill_cmd', { skill });
    }

    static async configureLLM(provider: string, apiKey: string, model: string): Promise<void> {
        return invoke('configure_llm_cmd', { provider, apiKey, model });
    }

    // B1: Fetch available models from a provider
    static async listModels(provider: string, apiKey: string): Promise<string[]> {
        return invoke('list_models_cmd', { provider, apiKey });
    }

    static async configureWebSearch(provider: string, apiKey: string): Promise<void> {
        return invoke('configure_web_search_cmd', { provider, apiKey });
    }

    static async configureGateway(
        port: number,
        bind: string,
        authMode: string,
        token: string,
        password: string
    ): Promise<void> {
        return invoke('configure_gateway_cmd', { port, bind, authMode, token, password });
    }

    static async healthCheck(): Promise<{ ok: boolean; url?: string; detail?: string }> {
        return invoke('health_check_cmd');
    }

    static async ensureWorkspace(): Promise<{ workspace: string; sessions: string; bootMdCreated: boolean }> {
        return invoke('ensure_workspace_cmd');
    }

    static async installDaemonService(): Promise<{ installed: boolean; plist?: string; error?: string }> {
        return invoke('install_daemon_service_cmd');
    }

    static async restartEngine(): Promise<void> {
        return invoke('restart_openclaw');
    }

    static async uninstallSkill(skill: string): Promise<void> {
        return invoke('uninstall_skill_cmd', { skill });
    }

    static async resetApp(): Promise<void> {
        return invoke('reset_app_cmd');
    }

    // ─── Agent Engine ────────────────────────────────────────

    static async getAgentConfig(agentId: string): Promise<{ agent_id: string; enabled: boolean; settings: string } | null> {
        try {
            return await invoke('get_agent_config', { agentId });
        } catch {
            return null;
        }
    }

    static async saveAgentConfig(agentId: string, enabled: boolean, settings: string): Promise<void> {
        return invoke('save_agent_config', { agentId, enabled, settings });
    }

    static async toggleAgent(agentId: string, enabled: boolean): Promise<void> {
        return invoke('toggle_agent', { agentId, enabled });
    }

    static async runAgent(agentId: string): Promise<any> {
        return invoke('run_agent', { agentId });
    }

    static async getAgentLogs(agentId: string, limit: number = 10): Promise<any[]> {
        try {
            return await invoke('get_agent_logs', { agentId, limit });
        } catch {
            return [];
        }
    }

    static async getRecentLogs(limit: number = 20): Promise<any[]> {
        try {
            return await invoke('get_recent_logs', { limit });
        } catch {
            return [];
        }
    }

    static async getActiveAgentCount(): Promise<number> {
        try {
            return await invoke<number>('get_active_agent_count');
        } catch {
            return 0;
        }
    }
}
