import { useState, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { open } from '@tauri-apps/plugin-shell';
import { ChevronRight, ChevronLeft, Check, Key, Zap, ExternalLink, Copy, CheckCircle, Sparkles, FileText, Mail, Search, Shield, Cpu } from 'lucide-react';

// Generate random hex token (like OpenClaw's randomToken)
function generateToken(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

interface Props {
    onComplete: () => void;
}

type SetupPart = 'welcome' | 'provider' | 'channels' | 'chains' | 'install';

const STEPS: SetupPart[] = ['welcome', 'provider', 'channels', 'chains', 'install'];

const STEP_LABELS: Record<SetupPart, string> = {
    welcome: 'BIENVENUE',
    provider: 'INTELLIGENCE',
    channels: 'CANAUX',
    chains: 'AGENTS',
    install: 'INSTALLATION'
};

export default function OnboardingWizard({ onComplete }: Props) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [installLog, setInstallLog] = useState<string[]>([]);

    // Comprehensive Configuration State
    const [config, setConfig] = useState({
        // Part 1: Provider
        provider: 'google',
        model: 'google/gemini-3-pro-preview',
        apiKey: '',

        // Part 2: Channels
        activeChannels: [] as string[],
        channelConfig: {} as Record<string, { token?: string, userId?: string, dmPolicy?: 'allowlist' | 'pairing' | 'open' }>,

        // Part 3: Chains
        chains: {
            facturation: true,
            email: true,
            veille: true
        },

        // Internal / Hidden defaults
        mode: 'hybrid',
        gateway: {
            port: 18789,
            bind: 'loopback' as const,
            authMode: 'token' as const,
            token: 'elazya-v2-internal-token',
            password: ''
        },
        extraKeys: {
            brave: ''
        }
    });

    const currentStep = STEPS[currentStepIndex];

    const next = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            startInstallation();
        }
    };

    const back = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    useEffect(() => {
        if (currentStep === 'install') {
            startInstallation();
        }
    }, [currentStepIndex]);

    const startInstallation = async () => {
        const log = (msg: string) => setInstallLog(prev => [...prev, msg]);

        log("🚀 Démarrage de l'initialisation...");

        try {
            // 1. Save Base Settings & Defaults
            log("💾 Configuration d'Elazya v2.0.0...");
            await OpenClawClient.setSetting('elazya_provider', config.provider);
            await OpenClawClient.setSetting('elazya_model', config.model);
            await OpenClawClient.setSetting('elazya_api_key', config.apiKey);

            // Force secure defaults for removed steps
            await OpenClawClient.setSetting('elazya_mode', 'hybrid');
            await OpenClawClient.setSetting('elazya_security_sandbox', 'true');
            
            // Configure Gateway (defaults)
            const gatewayToken = config.gateway.token || generateToken();
            await OpenClawClient.configureGateway(
                config.gateway.port,
                config.gateway.bind,
                config.gateway.authMode,
                gatewayToken,
                config.gateway.password
            );
            await OpenClawClient.setSetting('elazya_gateway_token', gatewayToken);


            // 2. Configure Engine LLM
            log("⚙️ Configuration du moteur LLM...");
            await OpenClawClient.configureLLM(config.provider, config.apiKey, config.model);

            // 3. Configure Gateway (Already done above, skipping log)


            // 4. Configure Channels
            for (const channel of config.activeChannels) {
                const conf = config.channelConfig[channel];
                if (conf && conf.token) {
                    log(`📡 Configuration du canal : ${channel}...`);
                    await OpenClawClient.enableChannel(
                        channel,
                        conf.token,
                        conf.userId,
                        conf.dmPolicy || 'open' // Default to open for easy onboard
                    );
                }
            }

            // 5. Install Skills based on Chains
            const skillsToInstall = new Set<string>();
            skillsToInstall.add('gog'); // Core
            skillsToInstall.add('browser');
            skillsToInstall.add('fs');

            if (config.activeChannels.includes('telegram')) skillsToInstall.add('telegram');
            if (config.activeChannels.includes('whatsapp')) skillsToInstall.add('wacli');

            if (config.chains?.facturation) { skillsToInstall.add('tesseract'); skillsToInstall.add('fs'); }
            if (config.chains?.email) { skillsToInstall.add('gog'); }
            if (config.chains?.veille) { skillsToInstall.add('browser'); }

            for (const skill of Array.from(skillsToInstall)) {
                log(`📦 Installation du skill : ${skill}...`);
                try {
                    await OpenClawClient.installSkill(skill);
                    log(`✅ ${skill} installé.`);
                } catch (e) {
                    log(`⚠️ Échec installation ${skill} : ${e}`);
                }
            }

            // 6. Configure Web Search (if key provided)
            if (config.extraKeys.brave) {
                log("🔍 Configuration de Brave Search...");
                try {
                    await OpenClawClient.configureWebSearch('brave', config.extraKeys.brave);
                } catch (e) {
                    log(`⚠️ Avertissement config Web Search : ${e}`);
                }
            }

            // 7. Configure Hooks (Defaults)
            log("⚙️ Configuration des hooks système...");
            try {
                await OpenClawClient.configureHooks(true, true, true); // bootMd, commandLogger, sessionMemory
            } catch (e) {
                log(`⚠️ Avertissement config hooks : ${e}`);
            }

            // 8. Create Workspace
            log("📁 Création de l'espace de travail...");
            try {
                const workspace = await OpenClawClient.ensureWorkspace();
                log(`✅ Workspace : ${workspace.workspace}`);
                log(`✅ Sessions : ${workspace.sessions}`);
            } catch (e) {
                log(`⚠️ Avertissement workspace : ${e}`);
            }

            // 9. Install Daemon Service (optional, macOS only)
            log("🚀 Installation du service daemon...");
            try {
                const daemon = await OpenClawClient.installDaemonService();
                if (daemon.installed) {
                    log(`✅ Service installé : ${daemon.plist}`);
                } else if (daemon.error) {
                    log(`⚠️ Service non installé : ${daemon.error}`);
                }
            } catch (e) {
                log(`⚠️ Daemon service : ${e}`);
            }

            // 10. Restart Engine
            log("🔄 Redémarrage du Gateway OpenClaw...");
            await OpenClawClient.restartEngine();

            // 11. Health Check
            log("🏥 Vérification de la santé du Gateway...");
            await new Promise(r => setTimeout(r, 2500));
            try {
                const health = await OpenClawClient.healthCheck();
                if (health.ok) {
                    log(`✅ Gateway opérationnel ! (${health.url})`);
                } else {
                    log(`⚠️ Gateway non détecté : ${health.detail || 'timeout'}`);
                }
            } catch (e) {
                log(`⚠️ Health check échoué : ${e}`);
            }

            log("✅ Installation Terminée !");

            await OpenClawClient.setSetting('elazya_configured', 'true');
            // Force frontend flag for v2 check in App.tsx
            localStorage.setItem('elazya_v2_configured', 'true');
            
            // Set default tech level
            localStorage.setItem('elazya_tech_level', 'intermediate');
            await OpenClawClient.setSetting('elazya_tech_level', 'intermediate');

            setTimeout(onComplete, 1000);

        } catch (e) {
            log(`❌ Erreur : ${e}`);
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col font-sans bg-aurora text-white overflow-hidden relative selection:bg-indigo-500/30">
            {/* Header / Progress */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                        {currentStepIndex + 1}
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Assistant d'Installation</h1>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                            Elazya • {STEP_LABELS[currentStep] || currentStep.toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="text-xs font-mono text-zinc-600">
                    Elazya v2.0.0
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full relative z-10">
                {currentStep === 'welcome' && <StepWelcomeV2 />}
                {currentStep === 'provider' && <StepProvider config={config} setConfig={setConfig} />}
                {currentStep === 'channels' && <StepChannels config={config} setConfig={setConfig} />}
                {currentStep === 'chains' && <StepChains config={config} setConfig={setConfig} />}
                
                {currentStep === 'install' && (
                    <StepInstall
                        log={installLog}
                        config={config}
                        onOpenDashboard={() => {
                            const port = config.gateway.port || 18789;
                            const token = config.gateway.token || '';
                            const url = `http://localhost:${port}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                            open(url);
                        }}
                    />
                )}
            </div>

            {/* Footer / Navigation */}
            {currentStep !== 'install' && (
                <div className="p-6 border-t border-white/5 bg-[#09090b] flex justify-between items-center sticky bottom-0 z-20">
                    <button
                        onClick={back}
                        disabled={currentStepIndex === 0}
                        className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:text-white disabled:opacity-0 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" /> Retour
                    </button>

                    <button
                        onClick={next}
                        disabled={
                            (currentStep === 'provider' && config.provider !== 'ollama' && !config.apiKey.trim())
                        }
                        className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95"
                    >
                        {currentStepIndex === STEPS.length - 1 ? 'Installer' : 'Continuer'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}


// --- PART 4.7: CHAIN SELECTION (Section VIII) ---
function StepChains({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const CHAIN_OPTIONS = [
        {
            id: 'facturation',
            name: 'Pack Administratif',
            icon: FileText,
            color: 'from-green-400 to-emerald-600',
            description: 'Factures, relances, classement automatique',
            details: 'Détecte vos factures PDF dans ~/Documents/Factures/, les classe par client, vous rappelle les échéances et prépare les relances.',
            roi: '45 min/semaine',
        },
        {
            id: 'email',
            name: 'Réponses Email Intelligentes',
            icon: Mail,
            color: 'from-blue-400 to-indigo-600',
            description: 'Brouillons automatiques pour vos clients',
            details: 'Analyse vos emails non-lus, génère des brouillons de réponse adaptés au contexte et trie les urgences.',
            roi: '1-2h/jour',
        },
        {
            id: 'veille',
            name: 'Veille & Idées Contenu',
            icon: Search,
            color: 'from-purple-400 to-violet-600',
            description: 'Résumés quotidiens + angles de posts',
            details: 'Surveille vos sources préférées, résume les actualités importantes et suggère des angles de contenu pour vos publications.',
            roi: '30 min/jour',
        },
    ];

    const toggleChain = (chainId: string) => {
        setConfig({
            ...config,
            chains: { ...config.chains, [chainId]: !config.chains[chainId] }
        });
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-3">
                <div className="inline-block p-3 rounded-full bg-emerald-500/10 mb-2">
                    <Zap className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black">Choisissez vos agents</h2>
                <p className="text-zinc-400">Sélectionnez les automatisations à activer dès le démarrage.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {CHAIN_OPTIONS.map(chain => {
                    const isEnabled = config.chains[chain.id];
                    return (
                        <button
                            key={chain.id}
                            onClick={() => toggleChain(chain.id)}
                            className={`p-5 rounded-2xl border text-left transition-all ${
                                isEnabled
                                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                    : 'bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chain.color} flex items-center justify-center flex-shrink-0`}>
                                    <chain.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-white">{chain.name}</h3>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                            isEnabled
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : 'border-zinc-600'
                                        }`}>
                                            {isEnabled && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-400 mb-2">{chain.description}</p>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{chain.details}</p>
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="text-emerald-400 text-xs font-bold">ROI : {chain.roi}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="text-xs text-zinc-600 text-center">
                💡 Vous pourrez activer ou désactiver les agents à tout moment dans <span className="text-emerald-400">Mission Control</span>.
            </p>
        </div>
    );
}



// --- PART 3: PROVIDER ---
function StepProvider({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const [loadingModels, setLoadingModels] = useState(false);
    const [dynamicModels, setDynamicModels] = useState<string[]>([]);
    const [customModel, setCustomModel] = useState('');

    const PROVIDERS = [
        { id: 'google', name: 'Google', models: ['google/gemini-3-pro-preview', 'google/gemini-2.5-flash', 'google/gemini-2.5-pro'] },
        { id: 'openai', name: 'OpenAI', models: ['openai/gpt-4o', 'openai/gpt-4-turbo', 'openai/gpt-4o-mini'] },
        { id: 'anthropic', name: 'Anthropic', models: ['anthropic/claude-sonnet-4-20250514', 'anthropic/claude-3.5-sonnet', 'anthropic/claude-3-opus'] },
        { id: 'moonshot', name: 'Moonshot', models: ['moonshot/kimi-k2-0905-preview', 'moonshot/kimi-k2-thinking'] },
        { id: 'deepseek', name: 'DeepSeek', models: ['deepseek/deepseek-chat', 'deepseek/deepseek-coder-v3'] },
        { id: 'ollama', name: 'Ollama (Local)', models: ['ollama/llama3.3', 'ollama/qwen2.5', 'ollama/mistral'] },
        { id: 'openrouter', name: 'OpenRouter', models: ['openrouter/auto', 'openrouter/anthropic/claude-3.5-sonnet'] },
        { id: 'groq', name: 'Groq', models: ['groq/llama-3.3-70b-versatile', 'groq/mixtral-8x7b'] },
    ];

    const handleProviderChange = async (providerId: string) => {
        const defaultModel = PROVIDERS.find(p => p.id === providerId)?.models[0] || '';
        setConfig({ ...config, provider: providerId, model: defaultModel });
        setDynamicModels([]);

        // B1: Try to fetch dynamic models if API key is set
        if (config.apiKey && providerId !== 'ollama') {
            setLoadingModels(true);
            try {
                const models = await OpenClawClient.listModels(providerId, config.apiKey);
                if (models && models.length > 0) {
                    setDynamicModels(models);
                }
            } catch (e) {
                console.log('Failed to fetch models, using static list');
            }
            setLoadingModels(false);
        }
    };

    // Get available models (dynamic or static)
    const availableModels = dynamicModels.length > 0
        ? dynamicModels
        : PROVIDERS.find(p => p.id === config.provider)?.models || [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Fournisseur d'Intelligence</h2>
                <p className="text-zinc-400 mt-2">Sélectionnez le "cerveau" qui propulse OpenClaw.</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PROVIDERS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handleProviderChange(p.id)}
                            className={`p-3 rounded-xl border text-center font-bold transition-all flex flex-col items-center gap-1 ${config.provider === p.id
                                ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                : 'bg-black/40 backdrop-blur-xl border-white/10 text-zinc-400 hover:border-white/20'}`}
                        >
                            <span className="text-sm">{p.name}</span>
                            {config.provider === p.id && <Check className="w-3 h-3 text-fuchsia-400" />}
                        </button>
                    ))}
                </div>

                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Clé API</label>
                    <div className="flex items-center gap-3 bg-black/50 p-4 rounded-xl border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                        <Key className="w-5 h-5 text-zinc-500" />
                        <input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                            onBlur={() => handleProviderChange(config.provider)} // Fetch models on blur
                            placeholder={`Entrez votre clé API ${PROVIDERS.find(p => p.id === config.provider)?.name}...`}
                            className="bg-transparent border-none outline-none flex-1 font-mono text-sm"
                        />
                    </div>
                    {/* Educational Content / Links */}
                    {config.provider === 'google' && (
                        <div className="flex items-center gap-2 text-xs text-indigo-400 mt-2">
                            <ExternalLink className="w-3 h-3" />
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="hover:underline">
                                Obtenir une clé Google AI Studio (Gratuit)
                            </a>
                            <span className="text-zinc-600">|</span>
                            <a href="https://www.youtube.com/results?search_query=comment+obtenir+clé+api+google+gemini" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-300">
                                <Zap className="w-3 h-3" /> Tutoriel Vidéo
                            </a>
                        </div>
                    )}
                    {config.provider === 'openai' && (
                        <div className="flex items-center gap-2 text-xs text-indigo-400 mt-2">
                            <ExternalLink className="w-3 h-3" />
                            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="hover:underline">
                                Créer une clé OpenAI
                            </a>
                        </div>
                    )}
                    {config.provider === 'anthropic' && (
                        <div className="flex items-center gap-2 text-xs text-indigo-400 mt-2">
                            <ExternalLink className="w-3 h-3" />
                            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="hover:underline">
                                Console Anthropic
                            </a>
                        </div>
                    )}
                    {config.provider === 'ollama' && <p className="text-xs text-zinc-500">Laissez vide si Ollama tourne localement sans auth.</p>}
                    {config.provider === 'openrouter' && <p className="text-xs text-indigo-400">OpenRouter unifie 100+ modèles avec une seule clé API.</p>}
                </div>

                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Modèle</label>
                        {loadingModels && <span className="text-xs text-indigo-400 animate-pulse">Chargement des modèles...</span>}
                        {dynamicModels.length > 0 && <span className="text-xs text-violet-400">✓ {dynamicModels.length} modèles disponibles</span>}
                    </div>
                    <select
                        className="w-full bg-black/50 p-4 rounded-xl border border-white/5 outline-none font-mono text-sm"
                        value={config.model}
                        onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    >
                        {availableModels.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    {/* Custom model input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder="Ou entrez un modèle personnalisé..."
                            className="flex-1 bg-black/30 p-2 rounded-lg border border-white/5 font-mono text-xs"
                        />
                        <button
                            onClick={() => {
                                if (customModel.trim()) {
                                    setConfig({ ...config, model: customModel.trim() });
                                    setCustomModel('');
                                }
                            }}
                            disabled={!customModel.trim()}
                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors"
                        >
                            Utiliser
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}



// --- PART 5: CHANNELS ---
function StepChannels({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const handleToggle = (id: string) => {
        const active = config.activeChannels.includes(id)
            ? config.activeChannels.filter((x: string) => x !== id)
            : [...config.activeChannels, id];
        setConfig({ ...config, activeChannels: active });
    };

    const updateChannelConfig = (id: string, key: string, val: string) => {
        setConfig({
            ...config,
            channelConfig: {
                ...config.channelConfig,
                [id]: { ...config.channelConfig[id], [key]: val }
            }
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Canaux de Communication</h2>
                <p className="text-zinc-400 mt-2">Où voulez-vous parler à OpenClaw ?</p>
            </div>

            <div className="space-y-4">
                {/* Telegram */}
                <div className={`rounded-xl border transition-all ${config.activeChannels.includes('telegram') ? 'bg-black/40 backdrop-blur-xl border-white/20' : 'bg-black/40 backdrop-blur-xl/50 border-white/10'}`}>
                    <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => handleToggle('telegram')}>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">✈️</span>
                            <span className="font-bold">Telegram (Recommandé)</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${config.activeChannels.includes('telegram') ? 'bg-blue-600 border-blue-600' : 'border-zinc-600'}`}>
                            {config.activeChannels.includes('telegram') && <Check className="w-4 h-4 text-white" />}
                        </div>
                    </div>

                    {config.activeChannels.includes('telegram') && (
                        <div className="px-4 pb-4 space-y-3">
                            <input
                                type="password"
                                placeholder="Token du Bot (via @BotFather)"
                                className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                                value={config.channelConfig['telegram']?.token || ''}
                                onChange={(e) => updateChannelConfig('telegram', 'token', e.target.value)}
                            />
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs space-y-2">
                                <p className="font-bold text-blue-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Comment obtenir un token ?
                                </p>
                                <ol className="list-decimal list-inside space-y-1 text-zinc-400 ml-1">
                                    <li>Ouvrez <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-white hover:underline">@BotFather</a> sur Telegram.</li>
                                    <li>Envoyez la commande <code className="bg-black/30 px-1 rounded text-white">/newbot</code>.</li>
                                    <li>Donnez un nom à votre bot (ex: "Mon Assistant").</li>
                                    <li>Donnez un username (doit finir par "bot").</li>
                                    <li>Copiez le <strong>HTTP API Token</strong> qu'il vous donne.</li>
                                </ol>
                                <div className="pt-2 border-t border-blue-500/20 mt-2">
                                    <a href="https://www.youtube.com/results?search_query=créer+bot+telegram+botfather+tuto" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-300 hover:text-white font-bold">
                                        <ExternalLink className="w-3 h-3" /> Voir un tutoriel vidéo (Screen Recording)
                                    </a>
                                </div>
                            </div>

                            {/* DM Policy Selection */}
                            <div className="bg-black/20 rounded-lg p-3 space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500">Politique d'Accès DM</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'allowlist', label: 'Liste Blanche', hint: 'Seuls les IDs autorisés' },
                                        { id: 'pairing', label: 'Appairage', hint: 'Code de jumelage' },
                                        { id: 'open', label: 'Ouvert', hint: '⚠️ Risqué' },
                                    ].map(policy => (
                                        <button
                                            key={policy.id}
                                            onClick={() => updateChannelConfig('telegram', 'dmPolicy', policy.id)}
                                            className={`flex-1 p-2 rounded-lg text-xs font-bold transition-all ${(config.channelConfig['telegram']?.dmPolicy || 'allowlist') === policy.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-black/30 text-zinc-400 hover:bg-black/50'
                                                }`}
                                        >
                                            {policy.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* User ID - only show for allowlist */}
                            {(config.channelConfig['telegram']?.dmPolicy || 'allowlist') === 'allowlist' && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Votre User ID Telegram (ex: 7943150201)"
                                        className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                                        value={config.channelConfig['telegram']?.userId || ''}
                                        onChange={(e) => updateChannelConfig('telegram', 'userId', e.target.value)}
                                    />
                                    <p className="text-[10px] text-zinc-500">Utilisez <code>openclaw logs --follow</code> ou @userinfobot pour trouver votre ID.</p>
                                </>
                            )}

                            {(config.channelConfig['telegram']?.dmPolicy) === 'open' && (
                                <p className="text-[10px] text-orange-400">⚠️ Mode ouvert : n'importe qui peut envoyer des DMs à votre bot. Non recommandé.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* WhatsApp */}
                <div className={`rounded-xl border transition-all ${config.activeChannels.includes('whatsapp') ? 'bg-black/40 backdrop-blur-xl border-white/20' : 'bg-black/40 backdrop-blur-xl/50 border-white/10'}`}>
                    <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => handleToggle('whatsapp')}>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">💬</span>
                            <span className="font-bold">WhatsApp Business</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${config.activeChannels.includes('whatsapp') ? 'bg-green-600 border-green-600' : 'border-zinc-600'}`}>
                            {config.activeChannels.includes('whatsapp') && <Check className="w-4 h-4 text-white" />}
                        </div>
                    </div>

                    {config.activeChannels.includes('whatsapp') && (
                        <div className="px-4 pb-4 space-y-3">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs">
                                <p className="text-green-400 font-bold mb-1">📱 Configuration WhatsApp</p>
                                <p className="text-zinc-400">WhatsApp nécessite un compte WhatsApp Business API. Vous pouvez utiliser un service comme Twilio ou la Cloud API officielle de Meta.</p>
                            </div>
                            <input
                                type="password"
                                placeholder="Token d'accès WhatsApp Business API"
                                className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                                value={config.channelConfig['whatsapp']?.token || ''}
                                onChange={(e) => updateChannelConfig('whatsapp', 'token', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Numéro de téléphone (format: +33612345678)"
                                className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                                value={config.channelConfig['whatsapp']?.userId || ''}
                                onChange={(e) => updateChannelConfig('whatsapp', 'userId', e.target.value)}
                            />
                            <p className="text-[10px] text-zinc-500">Consultez la <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noreferrer" className="text-green-400 underline">documentation Meta</a> pour obtenir vos identifiants.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



// --- PART 7: INSTALL ---
function StepInstall({ log, config, onOpenDashboard }: {
    log: string[],
    config: any,
    onOpenDashboard: () => void
}) {
    const isComplete = log.some(l => l.includes('Installation Terminée'));
    const port = config?.gateway?.port || 18789;
    const token = config?.gateway?.token || '';
    const dashboardUrl = `http://localhost:${port}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const [copied, setCopied] = useState(false);

    const copyUrl = async () => {
        await navigator.clipboard.writeText(dashboardUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Installation du Gateway Elazya</h2>
                <p className="text-zinc-400 mt-2">Configuration de votre démon AI local...</p>
            </div>

            <div className="bg-black/80 rounded-2xl p-6 border border-white/10 font-mono text-xs h-72 overflow-y-auto shadow-inner">
                {log.map((line, i) => (
                    <div key={i} className="mb-1 text-zinc-300">
                        {line}
                    </div>
                ))}
                {log.length === 0 && <span className="text-zinc-600 animate-pulse">Initialisation...</span>}
            </div>

            {/* Completion Panel */}
            {isComplete && (
                <div className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/30 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-fuchsia-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Elazya est Prête !</h3>
                            <p className="text-sm text-zinc-400">Votre assistant AI est opérationnel.</p>
                        </div>
                    </div>

                    {/* Dashboard URL */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dashboard (avec token)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={dashboardUrl}
                                className="flex-1 bg-black/50 p-3 rounded-lg border border-white/10 font-mono text-xs text-zinc-300"
                            />
                            <button
                                onClick={copyUrl}
                                className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                                title="Copier l'URL"
                            >
                                {copied ? <Check className="w-4 h-4 text-fuchsia-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onOpenDashboard}
                            className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-indigo-400 hover:to-violet-400 transition-all shadow-lg active:scale-95"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Ouvrir le Dashboard
                        </button>
                    </div>

                    <p className="text-xs text-zinc-500 text-center">
                        Conservez ce lien pour accéder à OpenClaw Control UI.
                        <br />Docs: <a href="https://docs.openclaw.ai/web/control-ui" className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">docs.openclaw.ai/web/control-ui</a>
                    </p>
                </div>
            )}
        </div>
    );
}

// --- PART 0: WELCOME (V2 PREMIUM) ---
function StepWelcomeV2() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 py-6 relative w-full h-full overflow-y-auto">

            {/* Ambient Background Glow for this step */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[100px] -z-10 animate-pulse-glow pointer-events-none" />

            {/* Hero Section */}
            <div className="space-y-4 relative group cursor-default shrink-0">
                {/* Floating Logo */}


                <div className="space-y-1">
                    <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase">Bienvenue sur</p>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl">
                        ELAZYA
                    </h1>
                </div>

                <p className="text-base md:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed font-light">
                    L'assistant IA <span className="text-white font-medium">Privé</span>, <span className="text-white font-medium">Local</span> et <span className="text-white font-medium">Illimité</span>.
                    <br />Reprenez le contrôle de vos données.
                </p>
            </div>

            // Feature Showcase (Glassmorphism V2)
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-4 shrink-0">
                {[
                    { icon: Shield, color: 'text-indigo-400', title: '100% Privé', desc: 'Vos données ne quittent jamais votre Mac. Zéro télémétrie.' },
                    { icon: Cpu, color: 'text-violet-400', title: 'Puissance Locale', desc: 'Connectez Gemini, GPT-4 ou des modèles locaux open-source.' },
                    { icon: Sparkles, color: 'text-fuchsia-400', title: 'Sur Mesure', desc: 'L\'assistant s\'adapte à votre métier et vos outils favoris.' }
                ].map((item, i) => (
                    <div key={i} className="group relative p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/10 transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex flex-col items-center space-y-3">
                            <div className={`p-3 rounded-xl bg-black/40 border border-white/5 shadow-inner group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-500`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
