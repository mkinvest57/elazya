import { useState, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { open } from '@tauri-apps/plugin-shell';
import { ChevronRight, ChevronLeft, Check, Key, Shield, AlertTriangle, Zap, Terminal, RefreshCw, ExternalLink, Copy, CheckCircle, Sparkles, User, Cpu } from 'lucide-react';

// Generate random hex token (like OpenClaw's randomToken)
function generateToken(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

interface Props {
    onComplete: () => void;
}

type SetupPart = 'welcome' | 'security' | 'mode' | 'provider' | 'profiling' | 'skills' | 'gateway' | 'channels' | 'hooks' | 'install';

const STEPS: SetupPart[] = ['welcome', 'security', 'mode', 'provider', 'profiling', 'skills', 'gateway', 'channels', 'hooks', 'install'];

const STEP_LABELS: Record<SetupPart, string> = {
    welcome: 'BIENVENUE',
    security: 'SÉCURITÉ',
    mode: 'MODE',
    provider: 'FOURNISSEUR IA',
    profiling: 'VOTRE PROFIL',
    skills: 'COMPÉTENCES',
    gateway: 'GATEWAY',
    channels: 'CANAUX',
    hooks: 'HOOKS',
    install: 'INSTALLATION'
};

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
            token: 'elazya-v1000-internal-token', // Fixed internal token
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

        // Part 6b: Skills to install
        selectedSkills: ['weather', 'spotify-player'] as string[],

        // Part 7: Hooks
        hooks: {
            bootMd: true,
            commandLogger: true,
            sessionMemory: true
        },

        // Part NEW: User Profile (questionnaire)
        profile: {
            domain: [] as string[],
            tools: [] as string[],
            devices: [] as string[],
            smartHome: '',
            expectations: [] as string[],
            techLevel: '',
            socials: [] as string[],
            managesTeams: false,
            audience: [] as string[],
            interactionStyle: [] as string[]
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
                        conf.dmPolicy || 'open' // Default to open for easy onboard
                    );
                }
            }

            // 5. Install Selected Skills
            for (const skill of config.selectedSkills) {
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
            // Persist Tech Level for Adaptive Interface
            const techLevel = config.profile.techLevel || 'intermediate';
            localStorage.setItem('elazya_tech_level', techLevel);
            await OpenClawClient.setSetting('elazya_tech_level', techLevel);

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
                    Elazya v1.2.3
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full relative z-10">
                {currentStep === 'welcome' && (
                    <StepWelcomeV2 />
                )}
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
                {currentStep === 'profiling' && (
                    <StepProfiling config={config} setConfig={setConfig} />
                )}
                {currentStep === 'skills' && (
                    <StepRecommendedSkills config={config} setConfig={setConfig} />
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
                            (currentStep === 'security' && !config.securityAck) ||
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

// --- HELPER: Profile → Skill Recommendations ---
function getRecommendedSkills(profile: any): { id: string, reason: string }[] {
    const recs: { id: string, reason: string }[] = [];

    // Core recommendations based on expectations
    // if (profile.expectations.includes('research') || profile.expectations.includes('productivity')) {
    //     recs.push({ id: 'web-search', reason: 'Recherche instantanée sur le web pour trouver des infos en temps réel.' });
    // }
    if (profile.expectations.includes('productivity') || profile.managesTeams) {
        recs.push({ id: 'apple-reminders', reason: 'Programmer des rappels et ne jamais oublier une échéance.' });
    }
    recs.push({ id: 'weather', reason: 'Météo locale pour planifier vos journées.' });

    // Tools-based
    if (profile.tools.includes('notion')) {
        recs.push({ id: 'notion', reason: 'Synchroniser vos notes et bases de données Notion.' });
    }
    // if (profile.tools.includes('todoist')) {
    //     recs.push({ id: 'todoist-integration', reason: 'Gérer vos tâches Todoist par la voix ou le texte.' });
    // }
    if (profile.tools.includes('spotify')) {
        recs.push({ id: 'spotify-player', reason: 'Contrôler votre musique Spotify directement depuis Elazya.' });
    }
    // if (profile.tools.includes('google-docs')) {
    //     recs.push({ id: 'google-workspace', reason: 'Accéder à vos Google Docs, Sheets et Drive.' });
    // }

    // Smart home
    // if (profile.smartHome === 'yes') {
    //     recs.push({ id: 'home-assistant', reason: 'Contrôler vos appareils connectés (lumières, thermostat...).' });
    // }

    // Domain-based
    // if (profile.domain.includes('creative')) {
    //     recs.push({ id: 'calculator', reason: 'Calculs rapides pour vos devis et budgets créatifs.' });
    // }
    // if (profile.domain.includes('student')) {
    //     recs.push({ id: 'translate', reason: 'Traduction instantanée pour vos cours et recherches.' });
    // }
    // if (profile.domain.includes('developer')) {
    //     recs.push({ id: 'code-runner', reason: 'Exécuter du code et automatiser des tâches dev.' });
    // }

    // Social / channels
    // if (profile.socials.includes('telegram') || profile.socials.includes('discord')) {
    //     recs.push({ id: 'news', reason: 'Résumés d\'actualités pour alimenter vos communautés.' });
    // }

    // Deduplicate
    const seen = new Set<string>();
    return recs.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
    });
}

// --- PROFILING QUESTIONS DATA ---
const PROFILING_QUESTIONS = [
    {
        key: 'domain',
        question: 'Quel est votre domaine d\'activité ?',
        subtitle: 'Sélectionnez un ou plusieurs domaines.',
        type: 'multi' as const,
        options: [
            { id: 'creative', label: 'Créatif', emoji: '🎨', hint: 'Design, musique, vidéo, écriture' },
            { id: 'business', label: 'Business', emoji: '💼', hint: 'Entrepreneur, freelance, commerce' },
            { id: 'student', label: 'Étudiant', emoji: '🎓', hint: 'Études, recherche, apprentissage' },
            { id: 'developer', label: 'Développeur', emoji: '💻', hint: 'Code, DevOps, data' },
            { id: 'personal', label: 'Particulier', emoji: '🏠', hint: 'Usage personnel, famille' },
        ]
    },
    {
        key: 'tools',
        question: 'Quels outils utilisez-vous au quotidien ?',
        subtitle: 'On adaptera Elazya à vos habitudes.',
        type: 'multi' as const,
        options: [
            { id: 'notion', label: 'Notion', emoji: '📝' },
            { id: 'todoist', label: 'Todoist', emoji: '✅' },
            { id: 'slack', label: 'Slack', emoji: '💬' },
            { id: 'spotify', label: 'Spotify', emoji: '🎵' },
            { id: 'google-docs', label: 'Google Docs', emoji: '📄' },
            { id: 'other', label: 'Autre', emoji: '🔧' },
        ]
    },
    {
        key: 'devices',
        question: 'Quels appareils utilisez-vous ?',
        subtitle: 'Pour optimiser la compatibilité.',
        type: 'multi' as const,
        options: [
            { id: 'mac', label: 'Mac', emoji: '🍎' },
            { id: 'iphone', label: 'iPhone', emoji: '📱' },
            { id: 'ipad', label: 'iPad', emoji: '📱' },
            { id: 'pc', label: 'PC Windows', emoji: '🖥️' },
            { id: 'android', label: 'Android', emoji: '🤖' },
        ]
    },
    {
        key: 'smartHome',
        question: 'Avez-vous une maison connectée ?',
        subtitle: 'Lumières, thermostats, enceintes...',
        type: 'single' as const,
        options: [
            { id: 'yes', label: 'Oui', emoji: '🏠' },
            { id: 'no', label: 'Non', emoji: '❌' },
            { id: 'unknown', label: 'Je ne sais pas', emoji: '🤷' },
        ]
    },
    {
        key: 'expectations',
        question: 'Qu\'attendez-vous d\'Elazya ?',
        subtitle: 'Vos objectifs principaux.',
        type: 'multi' as const,
        options: [
            { id: 'productivity', label: 'Productivité', emoji: '⚡' },
            { id: 'research', label: 'Recherche', emoji: '🔍' },
            { id: 'automation', label: 'Automatisation', emoji: '🤖' },
            { id: 'fun', label: 'Divertissement', emoji: '🎮' },
            { id: 'learning', label: 'Apprentissage', emoji: '📚' },
        ]
    },
    {
        key: 'techLevel',
        question: 'Quel est votre niveau technique ?',
        subtitle: 'Pour adapter la complexité de l\'interface.',
        type: 'single' as const,
        options: [
            { id: 'beginner', label: 'Débutant', emoji: '🌱', hint: 'Je découvre l\'IA' },
            { id: 'intermediate', label: 'Intermédiaire', emoji: '🌿', hint: 'J\'utilise ChatGPT/Gemini' },
            { id: 'advanced', label: 'Avancé', emoji: '🌳', hint: 'J\'ai déjà codé avec des APIs' },
        ]
    },
    {
        key: 'socials',
        question: 'Quels réseaux / messageries utilisez-vous ?',
        subtitle: 'Pour connecter Elazya à vos canaux.',
        type: 'multi' as const,
        options: [
            { id: 'telegram', label: 'Telegram', emoji: '✈️' },
            { id: 'discord', label: 'Discord', emoji: '🎮' },
            { id: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
            { id: 'twitter', label: 'Twitter/X', emoji: '🐦' },
        ]
    },
    {
        key: 'managesTeams',
        question: 'Gérez-vous des projets ou une équipe ?',
        subtitle: 'Pour activer les fonctionnalités de gestion.',
        type: 'single' as const,
        options: [
            { id: 'yes', label: 'Oui', emoji: '👥' },
            { id: 'no', label: 'Non', emoji: '👤' },
        ]
    },
    {
        key: 'audience',
        question: 'Qui est votre public / audience ?',
        subtitle: 'Pour personnaliser les interactions.',
        type: 'multi' as const,
        options: [
            { id: 'clients', label: 'Clients', emoji: '🤝' },
            { id: 'students', label: 'Étudiants', emoji: '🎓' },
            { id: 'family', label: 'Famille', emoji: '👨‍👩‍👧‍👦' },
            { id: 'community', label: 'Communauté', emoji: '🌍' },
            { id: 'myself', label: 'Moi-même', emoji: '🧘' },
        ]
    },
    {
        key: 'interactionStyle',
        question: 'Comment préférez-vous interagir ?',
        subtitle: 'Elazya s\'adapte à votre style.',
        type: 'multi' as const,
        options: [
            { id: 'text', label: 'Commandes texte', emoji: '⌨️' },
            { id: 'natural', label: 'Conversation naturelle', emoji: '💬' },
            { id: 'shortcuts', label: 'Raccourcis rapides', emoji: '⚡' },
            { id: 'voice', label: 'Voix', emoji: '🎤' },
        ]
    },
];

// --- PART 0: WELCOME ---
// --- PART 4.5: PROFILING QUESTIONNAIRE ---
function StepProfiling({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const q = PROFILING_QUESTIONS[currentQ];

    const toggleOption = (optionId: string) => {
        const profile = { ...config.profile };
        if (q.type === 'single') {
            if (q.key === 'managesTeams') {
                profile[q.key] = optionId === 'yes';
            } else {
                profile[q.key] = optionId;
            }
        } else {
            const arr = [...(profile[q.key] || [])];
            const idx = arr.indexOf(optionId);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(optionId);
            profile[q.key] = arr;
        }
        setConfig({ ...config, profile });
    };

    const isSelected = (optionId: string) => {
        const val = config.profile[q.key];
        if (q.type === 'single') {
            if (q.key === 'managesTeams') return (optionId === 'yes') === val;
            return val === optionId;
        }
        return Array.isArray(val) && val.includes(optionId);
    };

    const nextQ = () => {
        if (currentQ < PROFILING_QUESTIONS.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            // Auto-recommend skills based on profile
            const recommended = getRecommendedSkills(config.profile);
            const skillIds = recommended.map(r => r.id);
            setConfig({ ...config, selectedSkills: skillIds });
            setShowSummary(true);
        }
    };

    const prevQ = () => {
        if (showSummary) {
            setShowSummary(false);
        } else if (currentQ > 0) {
            setCurrentQ(currentQ - 1);
        }
    };

    // Summary view after all questions
    if (showSummary) {
        const p = config.profile;
        const recommended = getRecommendedSkills(p);
        const domainLabels: Record<string, string> = { creative: 'créatif', business: 'entrepreneur', student: 'étudiant', developer: 'développeur', personal: 'particulier' };
        const primaryDomain = p.domain[0] ? domainLabels[p.domain[0]] || p.domain[0] : 'utilisateur';

        return (
            <div className="space-y-8">
                <div className="text-center space-y-3">
                    <div className="inline-block p-3 rounded-full bg-fuchsia-500/10 mb-2">
                        <User className="w-10 h-10 text-fuchsia-400" />
                    </div>
                    <h2 className="text-3xl font-black">Votre Profil Elazya</h2>
                    <p className="text-zinc-400">Voilà ce que nous avons compris de vos besoins.</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-6 space-y-4">
                    <p className="text-white leading-relaxed">
                        D'après vos réponses, vous êtes un(e) <span className="text-fuchsia-400 font-bold">{primaryDomain}</span>
                        {p.tools.length > 0 && <> qui utilise <span className="text-violet-400 font-bold">{p.tools.slice(0, 3).join(', ')}</span></>}
                        {p.expectations.length > 0 && <> et cherche à <span className="text-indigo-400 font-bold">{p.expectations.map((e: string) => {
                            const labels: Record<string, string> = { productivity: 'être plus productif', research: 'rechercher efficacement', automation: 'automatiser des tâches', fun: 's\'amuser', learning: 'apprendre' };
                            return labels[e] || e;
                        }).join(', ')}</span></>}.
                    </p>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                        {recommended.length} compétences recommandées pour vous
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {recommended.map(r => (
                            <div key={r.id} className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-fuchsia-500/20 rounded-xl p-3">
                                <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
                                <div className="flex-1">
                                    <span className="font-bold text-sm text-white">{r.id}</span>
                                    <p className="text-xs text-zinc-500">{r.reason}</p>
                                </div>
                                <Check className="w-4 h-4 text-fuchsia-400" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={prevQ}
                        className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-sm"
                    >
                        ← Modifier mes réponses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Progress */}
            <div className="flex items-center gap-2">
                {PROFILING_QUESTIONS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${i < currentQ ? 'bg-fuchsia-500' : i === currentQ ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-zinc-800'}`}
                    />
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-xs text-fuchsia-400 font-bold uppercase tracking-widest">
                    Question {currentQ + 1} / {PROFILING_QUESTIONS.length}
                </p>
                <h2 className="text-2xl font-black">{q.question}</h2>
                <p className="text-zinc-500 text-sm">{q.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {q.options.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => toggleOption(opt.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${isSelected(opt.id)
                            ? 'bg-fuchsia-500/10 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]'
                            : 'bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20'
                            }`}
                    >
                        <span className="text-2xl block mb-2">{opt.emoji}</span>
                        <span className={`font-bold text-sm ${isSelected(opt.id) ? 'text-fuchsia-300' : 'text-white'}`}>
                            {opt.label}
                        </span>
                        {'hint' in opt && opt.hint && (
                            <p className="text-[10px] text-zinc-500 mt-1">{opt.hint}</p>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={prevQ}
                    disabled={currentQ === 0}
                    className="px-4 py-2 text-zinc-500 hover:text-white disabled:opacity-0 transition-colors text-sm font-bold"
                >
                    ← Précédent
                </button>
                <button
                    onClick={nextQ}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-xl font-bold text-sm hover:from-indigo-400 hover:to-fuchsia-400 transition-all active:scale-95"
                >
                    {currentQ === PROFILING_QUESTIONS.length - 1 ? 'Voir mes recommandations' : 'Suivant →'}
                </button>
            </div>
        </div>
    );
}

// --- PART 4.6: RECOMMENDED SKILLS (Profile-based) ---
// --- PART 4.6: RECOMMENDED SKILLS (Profile-based) ---
function StepRecommendedSkills({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
    const recommended = getRecommendedSkills(config.profile);
    const recommendedIds = new Set(recommended.map(r => r.id));

    const ALL_SKILLS = [
        { id: 'weather', name: 'Météo', desc: 'Prévisions et conditions météo', emoji: '🌤️' },
        { id: 'apple-reminders', name: 'Rappels', desc: 'Rappels Apple Reminders', emoji: '⏰' },
        { id: 'notion', name: 'Notion', desc: 'Notes et bases de données', emoji: '📝' },
        { id: 'spotify-player', name: 'Spotify', desc: 'Contrôle musical', emoji: '🎵' },
        { id: 'slack', name: 'Slack', desc: 'Messagerie Slack', emoji: '💬' },
        { id: 'discord', name: 'Discord', desc: 'Messagerie Discord', emoji: '🎮' },
        // { id: 'web-search', name: 'Recherche Web', desc: 'Rechercher sur Internet', emoji: '🔍' }, // Removed: No matching skill dir found
        // { id: 'calculator', name: 'Calculatrice', desc: 'Calculs et conversions', emoji: '🧮' }, // Removed: No matching skill dir found
        // { id: 'news', name: 'Actualités', desc: 'Flux d\'actualités', emoji: '📰' }, // Removed: No matching skill dir found
        // { id: 'translate', name: 'Traduction', desc: 'Traduire entre langues', emoji: '🌐' }, // Removed: No matching skill dir found
        // { id: 'home-assistant', name: 'Maison Connectée', desc: 'Domotique et IoT', emoji: '🏠' }, // Removed: No matching skill dir found
        // { id: 'code-runner', name: 'Code Runner', desc: 'Exécuter du code', emoji: '💻' }, // Removed: No matching skill dir found
    ];

    const toggleSkill = (id: string, e?: React.MouseEvent) => {
        // Prevent toggling when clicking input
        if (e && (e.target as HTMLElement).tagName === 'INPUT') return;

        const selected = config.selectedSkills.includes(id)
            ? config.selectedSkills.filter((s: string) => s !== id)
            : [...config.selectedSkills, id];
        setConfig({ ...config, selectedSkills: selected });
    };

    const updateExtraKey = (key: string, val: string) => {
        setConfig({
            ...config,
            extraKeys: { ...config.extraKeys, [key]: val }
        });
    };

    const recommendedSkills = ALL_SKILLS.filter(s => recommendedIds.has(s.id));
    const otherSkills = ALL_SKILLS.filter(s => !recommendedIds.has(s.id));

    const renderSkillRow = (skill: typeof ALL_SKILLS[0], isRecommendedSection: boolean) => {
        const isSelected = config.selectedSkills.includes(skill.id);
        const rec = recommended.find(r => r.id === skill.id);

        return (
            <div
                key={skill.id}
                onClick={(e) => toggleSkill(skill.id, e)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                    ? isRecommendedSection ? 'bg-fuchsia-500/10 border-fuchsia-500/30' : 'bg-indigo-500/10 border-indigo-500/30'
                    : 'bg-black/40 backdrop-blur-xl/50 border-white/10 hover:border-white/20'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{skill.emoji}</span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm">{skill.name}</h3>
                                {isRecommendedSection && (
                                    <span className="text-[9px] bg-fuchsia-500/20 text-fuchsia-400 px-1.5 py-0.5 rounded font-bold">POUR VOUS</span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {isRecommendedSection ? (rec?.reason || skill.desc) : skill.desc}
                            </p>
                        </div>
                    </div>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected
                        ? (isRecommendedSection ? 'bg-fuchsia-500 border-fuchsia-500' : 'bg-indigo-500 border-indigo-500')
                        : 'border-zinc-600'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                </div>

                {/* Inline API Keys */}
                {isSelected && skill.id === '@anthropic/web-search' && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Clé API Brave Search (Gratuit)</label>
                        <input
                            type="password"
                            value={config.extraKeys.brave || ''}
                            onChange={(e) => updateExtraKey('brave', e.target.value)}
                            placeholder="Entrez votre clé Brave..."
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500/50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <a href="https://api.search.brave.com/app/keys" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline mt-1 inline-block" onClick={(e) => e.stopPropagation()}>
                            Obtenir une clé gratuitement →
                        </a>
                    </div>
                )}

                {isSelected && skill.id === 'notion-integration' && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Clé d'intégration Notion</label>
                        <input
                            type="password"
                            value={config.extraKeys.notion || ''}
                            onChange={(e) => updateExtraKey('notion', e.target.value)}
                            placeholder="secret_..."
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500/50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline mt-1 inline-block" onClick={(e) => e.stopPropagation()}>
                            Créer une intégration Notion →
                        </a>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black">Compétences Recommandées</h2>
                <p className="text-zinc-400 mt-2">
                    Basé sur votre profil, voici les compétences qu'Elazya peut activer pour vous.
                </p>
            </div>

            {/* Personalized recommendations */}
            {recommendedSkills.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-fuchsia-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">
                            Sélectionnées pour vous
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {recommendedSkills.map(skill => renderSkillRow(skill, true))}
                    </div>
                </div>
            )}

            {/* Other available skills */}
            {otherSkills.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                        Autres compétences disponibles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {otherSkills.map(skill => renderSkillRow(skill, false))}
                    </div>
                </div>
            )}

            <p className="text-xs text-zinc-600 text-center">
                💡 Vous pourrez modifier vos compétences à tout moment dans l'onglet <span className="text-violet-400">Compétences</span>.
            </p>
        </div>
    );
}

// --- PART 1: SECURITY ---
function StepSecurity({ ack, toggleAck }: { ack: boolean, toggleAck: () => void }) {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-block p-4 rounded-full bg-fuchsia-500/10 mb-4">
                    <Shield className="w-12 h-12 text-fuchsia-500" />
                </div>
                <h2 className="text-3xl font-black">Sécurité — Veuillez Lire</h2>
                <p className="text-zinc-400">OpenClaw est puissant et s'exécute localement. Un grand pouvoir implique de grandes responsabilités.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-fuchsia-400">
                        <AlertTriangle className="w-5 h-5" /> Risques
                    </h3>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-2">
                            <span className="text-fuchsia-500">✓</span>
                            <span>L'agent peut lire les fichiers de votre système.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-fuchsia-500">✓</span>
                            <span>L'agent peut exécuter des commandes et des actions.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-fuchsia-500">✓</span>
                            <span>Un prompt malveillant pourrait le tromper.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-violet-500/5 border border-violet-500/20 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-violet-400">
                        <Shield className="w-5 h-5" /> Recommandations
                    </h3>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-2">
                            <span className="text-violet-500">●</span>
                            <span>Utilisez des listes blanches pour contrôler l'accès.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-violet-500">●</span>
                            <span>Gardez les secrets sensibles hors de l'espace de travail.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-violet-500">●</span>
                            <span>Utilisez le modèle le plus performant possible (Gemini Pro/GPT-4).</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div
                onClick={toggleAck}
                className={`p-4 rounded-xl border flex items-center justify-center gap-3 cursor-pointer transition-all ${ack ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-white' : 'bg-zinc-800/50 border-white/20 text-zinc-400 hover:border-zinc-500'}`}
            >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${ack ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-zinc-500'}`}>
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
                        : 'bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20'}`}
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
                        : 'bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20'}`}
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
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
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
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
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
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
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
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
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
                            <p className="text-[10px] text-zinc-500">Consultez la <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" className="text-green-400 underline">documentation Meta</a> pour obtenir vos identifiants.</p>
                        </div>
                    )}
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
                            config.hooks[h.id] ? 'bg-black/40 backdrop-blur-xl border-violet-500/30' : 'bg-black/40 backdrop-blur-xl/50 border-white/10 hover:border-white/20'
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
                            config.hooks[h.id] ? 'bg-violet-500 border-violet-500' : 'border-zinc-600'
                            }`}>
                            {/* @ts-ignore */}
                            {config.hooks[h.id] && <Check className="w-3 h-3 text-white" />}
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
                        <br />Docs: <a href="https://docs.openclaw.ai/web/control-ui" className="text-blue-400 hover:underline" target="_blank">docs.openclaw.ai/web/control-ui</a>
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

            {/* Feature Showcase (Glassmorphism V2) */}
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
