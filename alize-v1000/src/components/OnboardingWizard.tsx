import { useState, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { ChevronRight, ChevronLeft, Check, Key, Shield, AlertTriangle, Zap, Terminal, Globe, MessageSquare } from 'lucide-react';

interface Props {
    onComplete: () => void;
}

type SetupPart = 'security' | 'mode' | 'provider' | 'channels' | 'keys' | 'hooks' | 'install';

const STEPS: SetupPart[] = ['security', 'mode', 'provider', 'channels', 'keys', 'hooks', 'install'];

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

        // Part 4: Channels
        activeChannels: [] as string[],
        channelConfig: {} as Record<string, { token?: string, userId?: string }>,

        // Part 5: Extra Keys
        extraKeys: {
            googlePlaces: '',
            notion: '',
            openai: '',
            elevenlabs: '',
            brave: ''
        },

        // Part 6: Hooks
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

            // 3. Configure Channels
            for (const channel of config.activeChannels) {
                const conf = config.channelConfig[channel];
                if (conf && conf.token) {
                    log(`📡 Configuration du canal : ${channel}...`);
                    // In a real implementation we would pass the UserID too if supported by the backend command
                    // For now keeping it compatible with existing backend
                    await OpenClawClient.enableChannel(channel, conf.token);
                }
            }

            // 4. Configure Web Search (if key provided)
            if (config.extraKeys.brave) {
                log("🔍 Installation de Brave Search...");
                try {
                    await OpenClawClient.configureWebSearch('brave', config.extraKeys.brave);
                } catch (e) {
                    log(`⚠️ Avertissement config Web Search : ${e}`);
                }
            }

            // 5. Restart Engine
            log("🔄 Redémarrage du Gateway OpenClaw...");
            await OpenClawClient.restartEngine();

            await new Promise(r => setTimeout(r, 2000));
            log("✅ Installation Terminée !");

            await OpenClawClient.setSetting('elazya_configured', 'true');

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
                            Alizé v1000 • {currentStep.toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="text-xs font-mono text-zinc-600">
                    OpenClaw 2026.1.29
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
                    <StepInstall log={installLog} />
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
    const PROVIDERS = [
        { id: 'google', name: 'Google', models: ['google/gemini-3-pro-preview', 'google/gemini-2.5-flash'] },
        { id: 'openai', name: 'OpenAI', models: ['openai/gpt-4o', 'openai/gpt-4-turbo'] },
        { id: 'anthropic', name: 'Anthropic', models: ['anthropic/claude-3-opus', 'anthropic/claude-3-sonnet'] },
        { id: 'moonshot', name: 'Moonshot', models: ['moonshot/kimi-k2-0905-preview', 'moonshot/kimi-k2-thinking'] },
        { id: 'deepseek', name: 'DeepSeek', models: ['deepseek/deepseek-chat', 'deepseek/deepseek-coder'] },
        { id: 'ollama', name: 'Ollama', models: ['ollama/llama3', 'ollama/mistral'] },
    ];

    const handleProviderChange = (p: string) => {
        const defaultModel = PROVIDERS.find(x => x.id === p)?.models[0] || '';
        setConfig({ ...config, provider: p, model: defaultModel });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Fournisseur d'Intelligence</h2>
                <p className="text-zinc-400 mt-2">Sélectionnez le "cerveau" qui propulse OpenClaw.</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {PROVIDERS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handleProviderChange(p.id)}
                            className={`p-4 rounded-xl border text-center font-bold transition-all flex flex-col items-center gap-2 ${config.provider === p.id
                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                        >
                            <span>{p.name}</span>
                            {config.provider === p.id && <Check className="w-4 h-4 text-blue-500" />}
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
                            placeholder={`Entrez votre clé API ${PROVIDERS.find(p => p.id === config.provider)?.name}...`}
                            className="bg-transparent border-none outline-none flex-1 font-mono text-sm"
                        />
                    </div>
                    {config.provider === 'ollama' && <p className="text-xs text-zinc-500">Laissez vide si Ollama tourne localement sans auth.</p>}
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-zinc-500">Modèle</label>
                    <select
                        className="w-full bg-black/50 p-4 rounded-xl border border-white/5 outline-none font-mono text-sm"
                        value={config.model}
                        onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    >
                        {PROVIDERS.find(p => p.id === config.provider)?.models.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

// --- PART 4: CHANNELS ---
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
                            <input
                                type="text"
                                placeholder="Votre User ID Telegram (ex: 7943150201)"
                                className="w-full bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm"
                                value={config.channelConfig['telegram']?.userId || ''}
                                onChange={(e) => updateChannelConfig('telegram', 'userId', e.target.value)}
                            />
                            <p className="text-[10px] text-zinc-500">Utilisez <code>openclaw logs --follow</code> ou @userinfobot pour trouver votre ID.</p>
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

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Hooks Système</h2>
                <p className="text-zinc-400 mt-2">Automatisez des actions lors de l'exécution de commandes.</p>
            </div>

            <div className="space-y-3">
                {[
                    { id: 'bootMd', name: 'boot-md', desc: 'Charger un fichier markdown au démarrage.' },
                    { id: 'commandLogger', name: 'command-logger', desc: 'Logger toutes les commandes dans un fichier.' },
                    { id: 'sessionMemory', name: 'session-memory', desc: 'Auto-sauvegarde des sessions en mémoire.' }
                ].map(h => (
                    <div
                        key={h.id}
                        onClick={() => toggle(h.id)}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            // @ts-ignore
                            config.hooks[h.id] ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800'
                            }`}
                    >
                        <div>
                            <h3 className="font-bold font-mono text-sm">{h.name}</h3>
                            <p className="text-xs text-zinc-500">{h.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                            // @ts-ignore
                            config.hooks[h.id] ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                            }`}>
                            {/* @ts-ignore */}
                            {config.hooks[h.id] && <Check className="w-3 h-3 text-black" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- PART 7: INSTALL ---
function StepInstall({ log }: { log: string[] }) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Installation du Gateway Alizé</h2>
                <p className="text-zinc-400 mt-2">Configuration de votre démon AI local...</p>
            </div>

            <div className="bg-black/80 rounded-2xl p-6 border border-white/10 font-mono text-xs h-96 overflow-y-auto shadow-inner">
                {log.map((line, i) => (
                    <div key={i} className="mb-1 text-zinc-300">
                        {line}
                    </div>
                ))}
                {log.length === 0 && <span className="text-zinc-600 animate-pulse">Initialisation...</span>}
            </div>
        </div>
    );
}
