import { useState, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { open } from '@tauri-apps/plugin-shell';
import { ChevronRight, ChevronLeft, Check, Key, Shield, AlertTriangle, Zap, Terminal, Globe, MessageSquare, RefreshCw, ExternalLink, Copy, CheckCircle } from 'lucide-react';

// Generate random hex token (like OpenClaw's randomToken)
function generateToken(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

interface Props {
    onComplete: () => void;
}

type SetupPart = 'security' | 'mode' | 'provider' | 'gateway' | 'channels' | 'keys' | 'hooks' | 'install';

const STEPS: SetupPart[] = ['security', 'mode', 'provider', 'gateway', 'channels', 'keys', 'hooks', 'install'];

export default function OnboardingWizard({ onComplete }: Props) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [installLog, setInstallLog] = useState<string[]>([]);

    // Comprehensive Configuration State
    const [config, setConfig] = useState({
        // Part 1: Security
        securityAck: false,

        // Part 2: Mode
        mode: 'quickstart', // quickstart | manual

        // Part 3: Provider
        provider: 'google',
        model: 'google/gemini-3-pro-preview',
        apiKey: '',

        // Part 4: Gateway
        gatewayMode: 'local' as 'local' | 'remote', // C1: Local or Remote
        gateway: {
            port: 18789,
            bind: 'loopback' as 'loopback' | 'lan' | 'auto' | 'tailnet',
            authMode: 'token' as 'token' | 'password',
            token: '', // Will be auto-generated
            password: '',
            // C2: Tailscale
            tailscaleMode: 'off' as 'off' | 'serve' | 'funnel',
        },
        // Remote gateway (C1)
        remoteGateway: {
            url: '',
            token: '',
        },

        // Part 5: Channels
        activeChannels: [] as string[],
        channelConfig: {} as Record<string, { token?: string, userId?: string, dmPolicy?: 'allowlist' | 'pairing' | 'open' }>,

        // Part 6: Extra Keys
        extraKeys: {
            googlePlaces: '',
            notion: '',
            openai: '',
            elevenlabs: '',
            brave: ''
        },

        // Part 7: Hooks
        hooks: {
            bootMd: true,
            commandLogger: true,
            sessionMemory: true
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
        // Auto-skip gateway step in quickstart mode
        if (currentStep === 'gateway' && config.mode === 'quickstart') {
            next();
        }
    }, [currentStepIndex]);

    const startInstallation = async () => {
        const log = (msg: string) => setInstallLog(prev => [...prev, msg]);

        log("🚀 Démarrage de l'initialisation...");

        try {
            // 1. Save Base Settings
            log("💾 Sauvegarde de la configuration...");
            await OpenClawClient.setSetting('elazya_provider', config.provider);
            await OpenClawClient.setSetting('elazya_model', config.model);
            await OpenClawClient.setSetting('elazya_api_key', config.apiKey);

            // 2. Configure Engine LLM
            log("⚙️ Configuration du moteur LLM...");
            await OpenClawClient.configureLLM(config.provider, config.apiKey, config.model);

            // 3. Configure Gateway (always - includes auth token!)
            log("🌐 Configuration du Gateway...");
            try {
                // For quickstart mode, auto-generate token if not set
                const gatewayToken = config.gateway.token || generateToken();
                const gatewayPassword = config.gateway.password || '';

                await OpenClawClient.configureGateway(
                    config.gateway.port,
                    config.gateway.bind,
                    config.gateway.authMode,
                    gatewayToken,
                    gatewayPassword
                );

                // Save token for display/later use
                await OpenClawClient.setSetting('elazya_gateway_token', gatewayToken);
            } catch (e) {
                log(`⚠️ Avertissement config Gateway : ${e}`);
            }

            // 4. Configure Channels
            for (const channel of config.activeChannels) {
                const conf = config.channelConfig[channel];
                if (conf && conf.token) {
                    log(`📡 Configuration du canal : ${channel}...`);
                    await OpenClawClient.enableChannel(
                        channel,
                        conf.token,
                        conf.userId,
                        conf.dmPolicy || 'allowlist'
                    );
                }
            }

            // 5. Configure Web Search (if key provided)
            if (config.extraKeys.brave) {
                log("🔍 Configuration de Brave Search...");
                try {
                    await OpenClawClient.configureWebSearch('brave', config.extraKeys.brave);
                } catch (e) {
                    log(`⚠️ Avertissement config Web Search : ${e}`);
                }
            }

            // 6. Configure Extra Keys (Google Places, Notion)
            if (config.extraKeys.googlePlaces || config.extraKeys.notion) {
                log("🔑 Configuration des clés additionnelles...");
                try {
                    await OpenClawClient.configureExtraKeys(
                        config.extraKeys.googlePlaces || '',
                        config.extraKeys.notion || ''
                    );
                } catch (e) {
                    log(`⚠️ Avertissement config clés : ${e}`);
                }
            }

            // 7. Configure Hooks
            log("⚙️ Configuration des hooks système...");
            try {
                await OpenClawClient.configureHooks(
                    config.hooks.bootMd,
                    config.hooks.commandLogger,
                    config.hooks.sessionMemory
                );
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

            setTimeout(onComplete, 1000);

        } catch (e) {
            log(`❌ Erreur : ${e}`);
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col font-sans">
            {/* Header / Progress */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#09090b] sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                        {currentStepIndex + 1}
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Assistant d'Installation</h1>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                            Elazya v1000 • {currentStep.toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="text-xs font-mono text-zinc-600">
                    Elazya v1.0.0
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full relative z-10">
                {currentStep === 'security' && (
                    <StepSecurity ack={config.securityAck} toggleAck={() => setConfig({ ...config, securityAck: !config.securityAck })} />
                )}
                {currentStep === 'mode' && (
                    <StepMode mode={config.mode} setMode={(m) => setConfig({ ...config, mode: m })} />
                )}
                {currentStep === 'provider' && (
                    <StepProvider config={config} setConfig={setConfig} />
                )}
                {currentStep === 'gateway' && config.mode === 'manual' && (
                    <StepGateway config={config} setConfig={setConfig} />
                )}
                {currentStep === 'gateway' && config.mode === 'quickstart' && (
                    // Quickstart mode auto-skips via useEffect
                    <div className="flex items-center justify-center h-40">
                        <span className="text-zinc-500 animate-pulse">Configuration automatique...</span>
                    </div>
                )}
                {currentStep === 'channels' && (
                    <StepChannels config={config} setConfig={setConfig} />
                )}
                {currentStep === 'keys' && (
                    <StepKeys config={config} setConfig={setConfig} />
                )}
                {currentStep === 'hooks' && (
                    <StepHooks config={config} setConfig={setConfig} />
                )}
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
                            (currentStep === 'security' && !config.securityAck)
                        }
                        className="px-8 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                        {currentStepIndex === STEPS.length - 1 ? 'Installer' : 'Continuer'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

// --- PART 1: SECURITY ---
function StepSecurity({ ack, toggleAck }: { ack: boolean, toggleAck: () => void }) {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-block p-4 rounded-full bg-red-500/10 mb-4">
                    <Shield className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-black">Sécurité — Veuillez Lire</h2>
                <p className="text-zinc-400">OpenClaw est puissant et s'exécute localement. Un grand pouvoir implique de grandes responsabilités.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" /> Risques
                    </h3>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-2">
                            <span className="text-red-500">✓</span>
                            <span>L'agent peut lire les fichiers de votre système.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-500">✓</span>
                            <span>L'agent peut exécuter des commandes et des actions.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-500">✓</span>
                            <span>Un prompt malveillant pourrait le tromper.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-blue-400">
                        <Shield className="w-5 h-5" /> Recommandations
                    </h3>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-2">
                            <span className="text-blue-500">●</span>
                            <span>Utilisez des listes blanches pour contrôler l'accès.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500">●</span>
                            <span>Gardez les secrets sensibles hors de l'espace de travail.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500">●</span>
                            <span>Utilisez le modèle le plus performant possible (Gemini Pro/GPT-4).</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div
                onClick={toggleAck}
                className={`p-4 rounded-xl border flex items-center justify-center gap-3 cursor-pointer transition-all ${ack ? 'bg-red-500/10 border-red-500/50 text-white' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
            >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${ack ? 'bg-red-500 border-red-500' : 'border-zinc-500'}`}>
                    {ack && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-mono text-sm">"Je comprends que cet outil est puissant et comporte des risques."</span>
            </div>
        </div>
    );
}

// --- PART 2: MODE ---
function StepMode({ mode, setMode }: { mode: string, setMode: (m: string) => void }) {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black">Mode de Démarrage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setMode('quickstart')}
                    className={`p-6 rounded-2xl border text-left transition-all ${mode === 'quickstart'
                        ? 'bg-blue-600 border-blue-600 shadow-lg scale-[1.02]'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <Zap className={`w-8 h-8 ${mode === 'quickstart' ? 'text-white' : 'text-blue-500'}`} />
                        {mode === 'quickstart' && <Check className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="text-xl font-bold">Démarrage Rapide</h3>
                    <p className={`text-sm mt-2 ${mode === 'quickstart' ? 'text-blue-200' : 'text-zinc-400'}`}>
                        Recommandé pour les débutants. Configure des paramètres sûrs automatiquement.
                    </p>
                </button>

                <button
                    onClick={() => setMode('manual')}
                    className={`p-6 rounded-2xl border text-left transition-all ${mode === 'manual'
                        ? 'bg-zinc-800 border-zinc-600 shadow-lg scale-[1.02]'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <Terminal className={`w-8 h-8 ${mode === 'manual' ? 'text-white' : 'text-zinc-500'}`} />
                        {mode === 'manual' && <Check className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="text-xl font-bold">Manuel</h3>
                    <p className={`text-sm mt-2 ${mode === 'manual' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                        Contrôle granulaire sur chaque paramètre. Pour les utilisateurs avancés.
                    </p>
                </button>
            </div>
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
                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                        >
                            <span className="text-sm">{p.name}</span>
                            {config.provider === p.id && <Check className="w-3 h-3 text-blue-500" />}
                        </button>
                    ))}
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Clé API</label>
                    <div className="flex items-center gap-3 bg-black/50 p-4 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
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
                    {config.provider === 'ollama' && <p className="text-xs text-zinc-500">Laissez vide si Ollama tourne localement sans auth.</p>}
                    {config.provider === 'openrouter' && <p className="text-xs text-blue-400">OpenRouter unifie 100+ modèles avec une seule clé API.</p>}
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Modèle</label>
                        {loadingModels && <span className="text-xs text-blue-400 animate-pulse">Chargement des modèles...</span>}
                        {dynamicModels.length > 0 && <span className="text-xs text-emerald-400">✓ {dynamicModels.length} modèles disponibles</span>}
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

// --- PART 4: GATEWAY CONFIG ---
function StepGateway({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const BIND_OPTIONS = [
        { id: 'loopback', name: 'Loopback (127.0.0.1)', desc: 'Sécurisé - accès local uniquement.' },
        { id: 'lan', name: 'LAN (0.0.0.0)', desc: 'Accessible depuis le réseau local.' },
        { id: 'auto', name: 'Auto', desc: 'Détection automatique.' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Configuration du Gateway</h2>
                <p className="text-zinc-400 mt-2">Paramètres réseau pour le serveur OpenClaw local.</p>
            </div>

            <div className="space-y-6">
                {/* Port */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Port du Gateway</label>
                    <input
                        type="number"
                        value={config.gateway.port}
                        onChange={(e) => setConfig({
                            ...config,
                            gateway: { ...config.gateway, port: parseInt(e.target.value) || 18789 }
                        })}
                        className="w-full bg-black/50 p-4 rounded-xl border border-white/5 outline-none font-mono text-sm"
                        placeholder="18789"
                    />
                    <p className="text-xs text-zinc-500">Port WebSocket (par défaut: 18789)</p>
                </div>

                {/* Bind Mode */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Mode d'écoute</label>
                    <div className="space-y-3">
                        {BIND_OPTIONS.map(opt => (
                            <div
                                key={opt.id}
                                onClick={() => setConfig({
                                    ...config,
                                    gateway: { ...config.gateway, bind: opt.id }
                                })}
                                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${config.gateway.bind === opt.id
                                    ? 'bg-blue-600/20 border-blue-500/50'
                                    : 'bg-black/30 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div>
                                    <h3 className="font-bold text-sm">{opt.name}</h3>
                                    <p className="text-xs text-zinc-500">{opt.desc}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${config.gateway.bind === opt.id ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'
                                    }`}>
                                    {config.gateway.bind === opt.id && <Check className="w-3 h-3 text-white" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Auth Mode */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Authentification</label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setConfig({
                                ...config,
                                gateway: {
                                    ...config.gateway,
                                    authMode: 'token',
                                    token: config.gateway.token || generateToken()
                                }
                            })}
                            className={`flex-1 p-4 rounded-xl border text-center font-bold transition-all ${config.gateway.authMode === 'token'
                                ? 'bg-blue-600/20 border-blue-500/50'
                                : 'bg-black/30 border-white/5 hover:border-white/20'
                                }`}
                        >
                            Token (Recommandé)
                        </button>
                        <button
                            onClick={() => setConfig({
                                ...config,
                                gateway: { ...config.gateway, authMode: 'password' }
                            })}
                            className={`flex-1 p-4 rounded-xl border text-center font-bold transition-all ${config.gateway.authMode === 'password'
                                ? 'bg-blue-600/20 border-blue-500/50'
                                : 'bg-black/30 border-white/5 hover:border-white/20'
                                }`}
                        >
                            Mot de passe
                        </button>
                    </div>

                    {config.gateway.authMode === 'token' && (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={config.gateway.token || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        gateway: { ...config.gateway, token: e.target.value }
                                    })}
                                    className="flex-1 bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-xs"
                                    placeholder="Token auto-généré..."
                                />
                                <button
                                    onClick={() => setConfig({
                                        ...config,
                                        gateway: { ...config.gateway, token: generateToken() }
                                    })}
                                    className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                                    title="Générer nouveau token"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-500">Ce token sécurise l'accès au Gateway et à l'interface web.</p>
                        </div>
                    )}

                    {config.gateway.authMode === 'password' && (
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={config.gateway.password || ''}
                                onChange={(e) => setConfig({
                                    ...config,
                                    gateway: { ...config.gateway, password: e.target.value }
                                })}
                                className="w-full bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-sm"
                                placeholder="Mot de passe..."
                            />
                            <p className="text-[10px] text-zinc-500">Utilisez un mot de passe fort.</p>
                        </div>
                    )}
                </div>

                {/* C2: Tailscale Mode */}
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Tailscale (Accès Remote)</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'off', name: 'Désactivé', desc: 'Accès local uniquement' },
                            { id: 'serve', name: 'Serve', desc: 'Partage sur votre Tailnet' },
                            { id: 'funnel', name: 'Funnel', desc: 'Accès public internet' },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setConfig({
                                    ...config,
                                    gateway: { ...config.gateway, tailscaleMode: opt.id }
                                })}
                                className={`p-3 rounded-lg border text-center transition-all ${config.gateway.tailscaleMode === opt.id
                                    ? 'bg-purple-600/20 border-purple-500/50'
                                    : 'bg-black/30 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-sm font-bold">{opt.name}</div>
                                <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                            </button>
                        ))}
                    </div>
                    {config.gateway.tailscaleMode !== 'off' && (
                        <p className="text-xs text-purple-400 bg-purple-500/10 p-2 rounded-lg">
                            ⚠️ Nécessite Tailscale installé et authentifié sur ce système.
                        </p>
                    )}
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
                <div className={`rounded-xl border transition-all ${config.activeChannels.includes('telegram') ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800'}`}>
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

                {/* WhatsApp (Placeholder for now) */}
                <div className="rounded-xl border bg-zinc-900/50 border-zinc-800 opacity-50 cursor-not-allowed p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl">💬</span>
                        <span className="font-bold text-zinc-500">WhatsApp (Bientôt)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- PART 5: SKILL KEYS ---
function StepKeys({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const updateKey = (key: string, val: string) => {
        setConfig({
            ...config,
            extraKeys: { ...config.extraKeys, [key]: val }
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Configuration des Compétences</h2>
                <p className="text-zinc-400 mt-2">Pour utiliser certaines compétences, vous devez fournir des clés API.</p>
            </div>

            <div className="space-y-4">
                {/* Brave Search - Critical */}
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-2">
                    <label className="text-xs font-bold uppercase text-orange-500 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Brave Search (Accès Web)
                    </label>
                    <input
                        type="password"
                        placeholder="BSA..."
                        className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                        value={config.extraKeys.brave}
                        onChange={(e) => updateKey('brave', e.target.value)}
                    />
                    <p className="text-[10px] text-zinc-500">Requis pour que l'agent puisse faire des recherches sur le web.</p>
                </div>

                {/* Google Places */}
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> API Google Places
                    </label>
                    <input
                        type="password"
                        placeholder="AIza..."
                        className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                        value={config.extraKeys.googlePlaces}
                        onChange={(e) => updateKey('googlePlaces', e.target.value)}
                    />
                </div>

                {/* Notion */}
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Intégration Notion
                    </label>
                    <input
                        type="password"
                        placeholder="secret_..."
                        className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                        value={config.extraKeys.notion}
                        onChange={(e) => updateKey('notion', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

// --- PART 6: HOOKS ---
function StepHooks({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const toggle = (key: string) => {
        // @ts-ignore
        const current = config.hooks[key];
        setConfig({
            ...config,
            hooks: { ...config.hooks, [key]: !current }
        });
    };

    const HOOKS = [
        { id: 'bootMd', name: 'boot-md', desc: 'Charger BOOT.md pour personnaliser votre agent.', rec: true },
        { id: 'commandLogger', name: 'command-logger', desc: 'Logger toutes les commandes exécutées.', rec: true },
        { id: 'sessionMemory', name: 'session-memory', desc: 'Sauvegarde automatique des sessions.', rec: true },
        { id: 'autoTitleSessions', name: 'auto-title-sessions', desc: 'Générer des titres de session automatiquement.', rec: false },
        { id: 'transcriptExport', name: 'transcript-export', desc: 'Exporter les transcripts en markdown.', rec: false },
        { id: 'memoTracker', name: 'memo-tracker', desc: 'Tracker les mémos et notes dans les conversations.', rec: false },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Hooks Système</h2>
                <p className="text-zinc-400 mt-2">Automatisez des actions lors de l'exécution de commandes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HOOKS.map(h => (
                    <div
                        key={h.id}
                        onClick={() => toggle(h.id)}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            // @ts-ignore
                            config.hooks[h.id] ? 'bg-zinc-900 border-emerald-500/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                            }`}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold font-mono text-sm">{h.name}</h3>
                                {h.rec && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">REC</span>}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">{h.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                            // @ts-ignore
                            config.hooks[h.id] ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                            }`}>
                            {/* @ts-ignore */}
                            {config.hooks[h.id] && <Check className="w-3 h-3 text-black" />}
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-xs text-zinc-500">
                💡 Les hooks <span className="text-blue-400">REC</span> sont recommandés pour la plupart des utilisateurs.
            </p>
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
                <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
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
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onOpenDashboard}
                            className="flex-1 py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Ouvrir le Dashboard
                        </button>
                    </div>

                    <p className="text-xs text-zinc-500 text-center">
                        Conservez ce lien pour accéder à OpenClaw Control UI.
                        <br />Docs: <a href="https://docs.openclaw.ai/web/control-ui" className="text-blue-400 hover:underline" target="_blank">docs.openclaw.ai/web/control-ui</a>
                    </p>
                </div>
            )}
        </div>
    );
}
