import { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { OpenClawClient } from '@/lib/openclaw-client';
import { setupOpenClawConfig } from '@/lib/setupOpenClaw';
import { Settings, Cpu, Globe, Server, Zap, Key, Save, Loader2, AlertTriangle, ShieldCheck, Code2, CheckCircle2, XCircle, Search, Power, RefreshCw, Rocket } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

function LogViewer() {
    const [logs, setLogs] = useState<string[]>([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unlisten = listen<string>('server-log', (event) => {
            setLogs(prev => [...prev.slice(-99), event.payload]);
        });
        return () => { unlisten.then(f => f()); };
    }, []);

    useEffect(() => {
        if (autoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                    <span className="font-mono">Live Logs (100 lignes)</span>
                    <div className="w-px h-3 bg-white/10 mx-1" />
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="rounded bg-black/40 border-white/20 text-indigo-500 focus:ring-indigo-500/30"
                        />
                        <span>Auto-scroll</span>
                    </label>
                </div>
                <button onClick={() => setLogs([])} className="hover:text-white transition-colors flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Effacer
                </button>
            </div>
            <div className="h-64 overflow-y-auto bg-[#0a0a0c] rounded-xl p-4 font-mono text-[11px] text-zinc-400 border border-white/5 shadow-inner">
                {logs.length === 0 && <div className="text-zinc-600 italic flex items-center justify-center h-full">En attente de logs systèmes...</div>}
                {logs.map((log, i) => (
                    <div key={i} className="break-all whitespace-pre-wrap border-b border-white/[0.02] pb-1 mb-1 last:border-0 hover:bg-white/[0.02] px-1 rounded-sm transition-colors">
                        <span className="text-indigo-500/50 mr-2">{new Date().toLocaleTimeString()}</span>
                        {log}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

export default function ConfigPanel() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [autoStart, setAutoStart] = useState(false);
    const [devMode, setDevMode] = useState(false);

    // LLM Config
    const [llmProvider, setLlmProvider] = useState('google');
    const [llmApiKey, setLlmApiKey] = useState('');
    const [llmModel, setLlmModel] = useState('gemini-2.0-flash');
    const [workspacePath, setWorkspacePath] = useState('~/Documents/Elazya_Workspace');
    const [perms, setPerms] = useState<{ mail: boolean, calendar: boolean, contacts: boolean } | null>(null);

    // Web Search Config
    const [searchProvider, setSearchProvider] = useState('google');
    const [searchApiKey, setSearchApiKey] = useState('');

    // Gateway Config
    const [gatewayPort, setGatewayPort] = useState(3000);
    const [gatewayBind, setGatewayBind] = useState('127.0.0.1');
    const [gatewayAuthMode, setGatewayAuthMode] = useState('none');
    const [gatewayToken, setGatewayToken] = useState('');
    const [gatewayPassword, setGatewayPassword] = useState('');

    // Hooks
    const [bootMd, setBootMd] = useState(true);
    const [commandLogger, setCommandLogger] = useState(true);
    const [sessionMemory, setSessionMemory] = useState(true);

    // Extra Keys
    const [googlePlaces, setGooglePlaces] = useState('');
    const [notion, setNotion] = useState('');
    const [telegramToken, setTelegramToken] = useState('');

    useEffect(() => {
        OpenClawClient.getSetting('elazya_provider').then(v => v && setLlmProvider(v));
        OpenClawClient.getSetting('elazya_model').then(v => v && setLlmModel(v));
        OpenClawClient.getSetting('elazya_workspace_path').then(v => v && setWorkspacePath(v));
        OpenClawClient.getSetting('telegram_bot_token').then(v => v && setTelegramToken(v));

        // Auto-check permissions silently on load
        OpenClawClient.checkMacOSPermissions().then(setPerms).catch(() => { });
    }, []);

    const saveLLM = async () => {
        setLoading('llm');
        try {
            await OpenClawClient.configureLLM(llmProvider, llmApiKey, llmModel);
            await OpenClawClient.setSetting('elazya_provider', llmProvider);
            await OpenClawClient.setSetting('elazya_model', llmModel);
            showToast('Moteur IA mis à jour avec succès', 'success');
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoading(null);
        }
    };

    const saveWebSearch = async () => {
        setLoading('search');
        try {
            await OpenClawClient.configureWebSearch(searchProvider, searchApiKey);
            showToast('Recherche web configurée', 'success');
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoading(null);
        }
    };

    const applyGlobalConfiguration = async () => {
        setLoading('global');
        if (!llmApiKey) {
            showToast('Vous devez fournir une Clé API Google.', 'error');
            return;
        }
        try {
            await setupOpenClawConfig({
                googleApiKey: llmApiKey,
                telegramBotToken: telegramToken,
            });
            showToast('Configuration Initiale Globale Elazya appliquée avec succès ! Gateway redémarrée.', 'success');
        } catch (e) {
            showToast(`Erreur d'application globale: ${e}`, 'error');
        } finally {
            setLoading(null);
        }
    };

    const saveTelegram = async () => {
        setLoading('telegram');
        try {
            await OpenClawClient.setSetting('telegram_bot_token', telegramToken);
            await OpenClawClient.enableChannel('telegram', telegramToken);
            showToast('Telegram configuré avec succès', 'success');
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoading(null);
        }
    };

    const saveGateway = async () => {
        setLoading('gateway');
        try {
            await OpenClawClient.configureGateway(gatewayPort, gatewayBind, gatewayAuthMode, gatewayToken, gatewayPassword);
            showToast('Passerelle API sauvegardée', 'success');
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoading(null);
        }
    };

    const saveHooks = async () => {
        setLoading('hooks');
        try {
            await OpenClawClient.configureHooks(bootMd, commandLogger, sessionMemory);
            showToast('Paramètres système appliqués', 'success');
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoading(null);
        }
    };

    const saveExtraKeys = async () => {
        setLoading('keys');
        try {
            await OpenClawClient.configureExtraKeys(googlePlaces, notion);
            showToast('Clés API enregistrées', 'success');
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoading(null);
        }
    };

    const saveWorkspace = async () => {
        setLoading('workspace');
        try {
            await OpenClawClient.setSetting('elazya_workspace_path', workspacePath);
            showToast('Dossier de travail modifié', 'success');
        } catch {
            showToast('Erreur de sauvegarde', 'error');
        } finally {
            setLoading(null);
        }
    };

    const testPermissions = async () => {
        setLoading('perms');
        try {
            const res = await OpenClawClient.checkMacOSPermissions();
            setPerms(res);
            if (res.mail && res.calendar && res.contacts) {
                showToast('Accès macOS validés !', 'success');
            } else {
                showToast('Des accès macOS sont encore bloqués.', 'error');
            }
        } catch {
            showToast('Impossible de vérifier les accès', 'error');
        } finally {
            setLoading(null);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl bg-black/20 border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all font-medium text-sm";
    const selectClass = "w-full px-4 py-3 rounded-xl bg-black/20 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all font-medium text-sm appearance-none cursor-pointer";

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
            {/* Header & Dev Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-3xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-400" />
                        Réglages
                    </h2>
                    <p className="text-sm text-indigo-200/60 mt-2 font-medium">Personnalisez le cœur de votre assistant Elazya.</p>
                </div>

                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${devMode ? 'text-amber-400' : 'text-zinc-500'}`}>
                        Mode Développeur
                    </span>
                    <button
                        onClick={() => setDevMode(!devMode)}
                        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${devMode ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/10 border-transparent'} border`}
                    >
                        <div className={`w-4 h-4 rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${devMode ? 'translate-x-6 bg-amber-400' : 'translate-x-0 bg-zinc-400'}`}>
                            {devMode && <Code2 className="w-2.5 h-2.5 text-amber-900" />}
                        </div>
                    </button>
                </div>
            </div>

            <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Core AI Provider */}
                <motion.div layout className="col-span-1 lg:col-span-2 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] shadow-xl backdrop-blur-2xl rounded-3xl p-6 lg:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Moteur d'Intelligence Artificielle</h3>
                            <p className="text-xs text-zinc-400 mt-1">Le cerveau de vos agents autonomes.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <FormField label="Fournisseur Privé">
                            <div className="relative">
                                <select value={llmProvider} onChange={e => setLlmProvider(e.target.value)} className={selectClass}>
                                    <option value="google">Google (Gemini Pro/Flash)</option>
                                    <option value="anthropic">Anthropic (Claude 3.5)</option>
                                    <option value="openai">OpenAI (GPT-4o)</option>
                                    <option value="ollama">Ollama (Local / Hors-ligne)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</div>
                            </div>
                        </FormField>
                        <FormField label="Modèle Privilégié">
                            <input type="text" value={llmModel} onChange={e => setLlmModel(e.target.value)} placeholder="ex: gemini-2.0-flash" className={inputClass} />
                        </FormField>
                        <div className="md:col-span-2">
                            <FormField label="Clé API Connectée">
                                <div className="relative">
                                    <input type="password" value={llmApiKey} onChange={e => setLlmApiKey(e.target.value)} placeholder="Collez votre clé secrète ici..." className={`${inputClass} font-mono pl-10 tracking-widest`} />
                                    <Key className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </FormField>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-8 relative z-10 pt-6 border-t border-white/5">
                        <button onClick={saveLLM} disabled={loading === 'llm'} className="flex-[0.5] sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 disabled:opacity-50">
                            {loading === 'llm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-zinc-400" />}
                            Sauvegarder Modèle
                        </button>
                        <button onClick={applyGlobalConfiguration} disabled={loading === 'global'} className="flex-[1.5] sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:shadow-none">
                            {loading === 'global' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                            Initialisation Globale Elazya (Gemini)
                        </button>
                        <button onClick={async () => {
                            setLoading('ping-llm');
                            try {
                                const models = await OpenClawClient.listModels(llmProvider, llmApiKey);
                                if (models && models.length > 0) showToast(`Connexion Parfaite (${models.length} modèles actifs)`, 'success');
                                else showToast('Clé API invalide ou refusée', 'error');
                            } catch {
                                showToast('Impossible de joindre le fournisseur IA', 'error');
                            } finally { setLoading(null); }
                        }} disabled={loading === 'ping-llm'} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 disabled:opacity-50">
                            {loading === 'ping-llm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
                            Tester la connexion
                        </button>
                    </div>
                </motion.div>

                {/* macOS & Workspace */}
                <motion.div layout className="bg-white/[0.02] border border-white/[0.05] shadow-xl backdrop-blur-xl rounded-3xl p-6 lg:p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Environnement & Accès</h3>
                    </div>

                    <div className="space-y-6 flex-1">
                        <FormField label="Dossier de travail Elazya">
                            <input type="text" value={workspacePath} onChange={e => setWorkspacePath(e.target.value)} placeholder="~/Documents/Elazya_Workspace" className={inputClass} />
                        </FormField>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Accès macOS Sécurisés</label>
                                <button onClick={testPermissions} disabled={loading === 'perms'} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 uppercase tracking-wide bg-emerald-500/10 px-2 py-1 rounded">
                                    {loading === 'perms' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Vérifier
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${perms?.mail ? 'bg-emerald-500/[0.05] border-emerald-500/20' : 'bg-black/20 border-white/5'}`}>
                                    {perms?.mail ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-zinc-600" />}
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${perms?.mail ? 'text-emerald-400' : 'text-zinc-500'}`}>Apple Mail</span>
                                </div>
                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${perms?.calendar ? 'bg-emerald-500/[0.05] border-emerald-500/20' : 'bg-black/20 border-white/5'}`}>
                                    {perms?.calendar ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-zinc-600" />}
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${perms?.calendar ? 'text-emerald-400' : 'text-zinc-500'}`}>Calendrier</span>
                                </div>
                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${perms?.contacts ? 'bg-emerald-500/[0.05] border-emerald-500/20' : 'bg-black/20 border-white/5'}`}>
                                    {perms?.contacts ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-zinc-600" />}
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${perms?.contacts ? 'text-emerald-400' : 'text-zinc-500'}`}>Contacts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={saveWorkspace} disabled={loading === 'workspace'} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 disabled:opacity-50">
                        {loading === 'workspace' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Appliquer les chemins
                    </button>
                </motion.div>

                {/* External Services */}
                <motion.div layout className="bg-white/[0.02] border border-white/[0.05] shadow-xl backdrop-blur-xl rounded-3xl p-6 lg:p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Search className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Services Tiers Connectés</h3>
                    </div>

                    <div className="space-y-5 flex-1">
                        <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-cyan-400" /> Recherche Internet</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <select value={searchProvider} onChange={e => setSearchProvider(e.target.value)} className={selectClass}>
                                    <option value="google">Google</option>
                                    <option value="bing">Bing</option>
                                    <option value="duckduckgo">Duck Duck Go</option>
                                </select>
                                <input type="password" value={searchApiKey} onChange={e => setSearchApiKey(e.target.value)} placeholder="Clé API..." className={inputClass} />
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20 space-y-4">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.34-.93.5-1.33.49-.44-.01-1.28-.25-1.9-.45-.77-.25-1.38-.38-1.32-.8.03-.22.34-.44.93-.68 3.62-1.58 6.04-2.62 7.25-3.12 3.45-1.43 4.17-1.68 4.65-1.68.1 0 .34.02.46.12.1.09.13.21.14.3z" />
                                </svg>
                                Télécommande Telegram
                            </h4>
                            <FormField label="Token BotFather">
                                <input type="password" value={telegramToken} onChange={e => setTelegramToken(e.target.value)} placeholder="123456789:AAH..." className={`${inputClass} border-[#0088cc]/20 focus:border-[#0088cc]/50`} />
                            </FormField>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2"><Key className="w-3.5 h-3.5 text-pink-400" /> Extensions d'Agents</h4>
                            <FormField label="Google Places API (Localisation)">
                                <input type="password" value={googlePlaces} onChange={e => setGooglePlaces(e.target.value)} placeholder="AIzaSy..." className={inputClass} />
                            </FormField>
                            <FormField label="Notion API (Notes)">
                                <input type="password" value={notion} onChange={e => setNotion(e.target.value)} placeholder="secret_..." className={inputClass} />
                            </FormField>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        <button onClick={saveWebSearch} disabled={loading === 'search'} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 disabled:opacity-50">
                            {loading === 'search' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Web
                        </button>
                        <button onClick={saveTelegram} disabled={loading === 'telegram'} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] font-bold transition-all border border-[#0088cc]/30 disabled:opacity-50">
                            {loading === 'telegram' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Telegram
                        </button>
                        <button onClick={saveExtraKeys} disabled={loading === 'keys'} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 disabled:opacity-50">
                            {loading === 'keys' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Clés expérientielles
                        </button>
                    </div>
                </motion.div>

                {/* Developer Mode Sections */}
                <AnimatePresence>
                    {devMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="col-span-1 lg:col-span-2 space-y-6 overflow-hidden"
                        >
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent my-4" />

                            <h3 className="text-xl font-black text-amber-500 uppercase tracking-widest text-center my-6 flex items-center justify-center gap-3">
                                <Code2 className="w-5 h-5" /> Panneau Ingénierie
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* API Gateway */}
                                <div className="bg-amber-950/10 border border-amber-500/20 shadow-xl backdrop-blur-xl rounded-3xl p-6 lg:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                            <Server className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">API Gateway OpenClaw</h3>
                                            <p className="text-xs text-amber-500/70">Connectivité locale et headless.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Port d'écoute">
                                                <input type="number" value={gatewayPort} onChange={e => setGatewayPort(Number(e.target.value))} className={`${inputClass} border-amber-500/10 focus:border-amber-500/50 focus:bg-amber-500/5`} />
                                            </FormField>
                                            <FormField label="Interface (Bind)">
                                                <input type="text" value={gatewayBind} onChange={e => setGatewayBind(e.target.value)} className={`${inputClass} border-amber-500/10 focus:border-amber-500/50 focus:bg-amber-500/5`} />
                                            </FormField>
                                        </div>
                                        <FormField label="Mode d'Authentification">
                                            <select value={gatewayAuthMode} onChange={e => setGatewayAuthMode(e.target.value)} className={`${selectClass} border-amber-500/10 focus:border-amber-500/50 focus:bg-amber-500/5`}>
                                                <option value="none">Aucune (Réseau Local Confiant)</option>
                                                <option value="token">Bearer Token (Recommandé)</option>
                                                <option value="password">Basic Password</option>
                                            </select>
                                        </FormField>

                                        <AnimatePresence>
                                            {gatewayAuthMode === 'token' && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                    <FormField label="Token d'Accès">
                                                        <input type="password" value={gatewayToken} onChange={e => setGatewayToken(e.target.value)} className={`${inputClass} border-amber-500/10 focus:border-amber-500/50 focus:bg-amber-500/5 font-mono`} />
                                                    </FormField>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex gap-3 pt-4">
                                            <button onClick={saveGateway} disabled={loading === 'gateway'} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold transition-all border border-amber-500/30 disabled:opacity-50">
                                                {loading === 'gateway' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Patch Gateway
                                            </button>
                                            <button onClick={async () => {
                                                setLoading('ping-oc');
                                                try {
                                                    const res = await OpenClawClient.healthCheck();
                                                    if (res.ok) showToast('Moteur OpenClaw opérationnel sur le port.', 'success');
                                                    else showToast('Le Moteur ne répond pas.', 'error');
                                                } catch {
                                                    showToast('Gateway inaccessible', 'error');
                                                } finally { setLoading(null); }
                                            }} disabled={loading === 'ping-oc'} className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5 disabled:opacity-50">
                                                {loading === 'ping-oc' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* System Hooks & Logs */}
                                <div className="bg-amber-950/10 border border-amber-500/20 shadow-xl backdrop-blur-xl rounded-3xl p-6 lg:p-8 flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">Injection & Diagnostiques</h3>
                                    </div>

                                    <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                                        <Toggle enabled={bootMd} onChange={setBootMd} label="Boot Markdown (Prompt Injection)" description="Forcer l'ingestion d'instructions au démarrage" />
                                        <Toggle enabled={commandLogger} onChange={setCommandLogger} label="Telemetry Logger" description="Journaliser les actions pour le débogage RPC" />
                                        <Toggle enabled={sessionMemory} onChange={setSessionMemory} label="Persistance Vectorielle" description="Stocker l'historique dans LanceDB localement" />
                                    </div>

                                    <div className="flex-1">
                                        <LogViewer />
                                    </div>

                                    <button onClick={saveHooks} disabled={loading === 'hooks'} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold transition-all border border-amber-500/30 disabled:opacity-50">
                                        {loading === 'hooks' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Compiler les Hooks
                                    </button>
                                </div>

                                {/* Danger Zone */}
                                <div className="col-span-1 lg:col-span-2 bg-red-950/20 border border-red-500/30 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />
                                    <h3 className="text-base font-black text-red-400 uppercase tracking-widest px-2 mb-6 flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5" /> Destruction & Boot
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-black/40 rounded-2xl p-5 border border-red-500/20 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-white mb-1">Démarrage Daemon</h3>
                                                <p className="text-xs text-red-200/50">Lancer Elazya silencieusement au boot macOS</p>
                                            </div>
                                            <button
                                                onClick={() => setAutoStart(!autoStart)}
                                                className={`w-14 h-7 mx-2 rounded-full p-1 transition-colors ${autoStart ? 'bg-red-500' : 'bg-red-950/50 border border-red-500/20'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${autoStart ? 'translate-x-7' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <div className="bg-black/40 rounded-2xl p-5 border border-red-500/20 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-white mb-1">Hard Reset</h4>
                                                <p className="text-xs text-red-200/50">Wipe de toutes les bases de données et des clés</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (confirm("🚨 DESTRUCTION TOTALE DES DONNÉES 🚨\n\nToutes vos configurations, mémoires d'agents et clés API seront supprimées de votre disque.\nL'application va se fermer.\nÊtes-vous sûr de vouloir continuer ?")) {
                                                        try {
                                                            localStorage.clear();
                                                            await OpenClawClient.resetApp();
                                                        } catch (e) {
                                                            alert("Erreur critique: " + e);
                                                        }
                                                    }
                                                }}
                                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-xl transition-all text-sm font-black tracking-wide"
                                            >
                                                DÉTRUIRE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}
