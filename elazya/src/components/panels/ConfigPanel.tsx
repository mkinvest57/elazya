import { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { OpenClawClient } from '@/lib/openclaw-client';
import { Settings, Cpu, Globe, Server, Zap, Key, Save, Loader2, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, FolderOpen } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/components/ToastProvider';

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = false }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-white/5 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-indigo-400">{icon}</span>
                    <span className="font-bold text-white">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            {isOpen && (
                <div className="p-4 space-y-4 bg-black/20 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
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
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                    <span>Dernières 100 lignes</span>
                    <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="rounded bg-white/10 border-white/20"
                        />
                        <span>Auto-scroll</span>
                    </label>
                </div>
                <button onClick={() => setLogs([])} className="hover:text-white">Effacer</button>
            </div>
            <div className="h-48 overflow-y-auto bg-black/50 rounded-lg p-2 font-mono text-xs text-zinc-400 border border-white/5">
                {logs.length === 0 && <div className="text-zinc-600 italic p-2">En attente de logs...</div>}
                {logs.map((log, i) => (
                    <div key={i} className="break-all whitespace-pre-wrap border-b border-white/5 pb-1 mb-1 last:border-0">
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

    useEffect(() => {
        // Load saved settings
        OpenClawClient.getSetting('elazya_provider').then(v => v && setLlmProvider(v));
        OpenClawClient.getSetting('elazya_model').then(v => v && setLlmModel(v));
        OpenClawClient.getSetting('elazya_workspace_path').then(v => v && setWorkspacePath(v));
    }, []);

    const saveLLM = async () => {
        setLoading('llm');
        try {
            await OpenClawClient.configureLLM(llmProvider, llmApiKey, llmModel);
            await OpenClawClient.setSetting('elazya_provider', llmProvider);
            await OpenClawClient.setSetting('elazya_model', llmModel);
            showToast('Configuration LLM sauvegardée', 'success');
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
            showToast('Configuration recherche sauvegardée', 'success');
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
            showToast('Configuration gateway sauvegardée', 'success');
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
            showToast('Hooks configurés', 'success');
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
            showToast('Clés API sauvegardées', 'success');
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
            showToast('Dossier workspace sauvegardé', 'success');
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
                showToast('Toutes les permissions macOS sont accordées !', 'success');
            } else {
                showToast('Certaines permissions sont manquantes.', 'error');
            }
        } catch {
            showToast('Erreur lors de la vérification', 'error');
        } finally {
            setLoading(null);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50";
    const selectClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Settings className="w-6 h-6 text-amber-400" />
                    Configuration
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Paramètres du moteur Elazya</p>
            </div>

            <div className="space-y-3">
                {/* LLM Provider */}
                <Section title="Fournisseur IA" icon={<Cpu className="w-4 h-4" />} defaultOpen={true}>
                    <FormField label="Fournisseur">
                        <select value={llmProvider} onChange={e => setLlmProvider(e.target.value)} className={selectClass}>
                            <option value="google">Google (Gemini)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="openai">OpenAI (GPT)</option>
                            <option value="ollama">Ollama (Local)</option>
                        </select>
                    </FormField>
                    <FormField label="Clé API">
                        <input type="password" value={llmApiKey} onChange={e => setLlmApiKey(e.target.value)} placeholder="Votre clé API..." className={inputClass} />
                    </FormField>
                    <FormField label="Modèle">
                        <input type="text" value={llmModel} onChange={e => setLlmModel(e.target.value)} placeholder="gemini-2.0-flash" className={inputClass} />
                    </FormField>
                    <div className="flex items-center gap-3">
                        <button onClick={saveLLM} disabled={loading === 'llm'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50">
                            {loading === 'llm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Sauvegarder
                        </button>
                        <button onClick={async () => {
                            setLoading('ping-llm');
                            try {
                                const models = await OpenClawClient.listModels(llmProvider, llmApiKey);
                                if (models && models.length > 0) showToast(`Connexion OK (${models.length} modèles trouvés)`, 'success');
                                else showToast('Modèles indisponibles avec cette clé', 'error');
                            } catch {
                                showToast('Erreur de connexion LLM', 'error');
                            } finally { setLoading(null); }
                        }} disabled={loading === 'ping-llm'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors disabled:opacity-50">
                            {loading === 'ping-llm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Tester la connexion
                        </button>
                    </div>
                </Section>

                {/* Web Search */}
                <Section title="Recherche Web" icon={<Globe className="w-4 h-4" />}>
                    <FormField label="Fournisseur">
                        <select value={searchProvider} onChange={e => setSearchProvider(e.target.value)} className={selectClass}>
                            <option value="google">Google</option>
                            <option value="bing">Bing</option>
                            <option value="duckduckgo">DuckDuckGo</option>
                        </select>
                    </FormField>
                    <FormField label="Clé API">
                        <input type="password" value={searchApiKey} onChange={e => setSearchApiKey(e.target.value)} placeholder="Clé API..." className={inputClass} />
                    </FormField>
                    <button onClick={saveWebSearch} disabled={loading === 'search'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50">
                        {loading === 'search' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder
                    </button>
                </Section>

                {/* Gateway */}
                <Section title="API Gateway" icon={<Server className="w-4 h-4" />}>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Port">
                            <input type="number" value={gatewayPort} onChange={e => setGatewayPort(Number(e.target.value))} className={inputClass} />
                        </FormField>
                        <FormField label="Bind">
                            <input type="text" value={gatewayBind} onChange={e => setGatewayBind(e.target.value)} className={inputClass} />
                        </FormField>
                    </div>
                    <FormField label="Authentification">
                        <select value={gatewayAuthMode} onChange={e => setGatewayAuthMode(e.target.value)} className={selectClass}>
                            <option value="none">Aucune</option>
                            <option value="token">Token</option>
                            <option value="password">Mot de passe</option>
                        </select>
                    </FormField>
                    {gatewayAuthMode === 'token' && (
                        <FormField label="Token">
                            <input type="password" value={gatewayToken} onChange={e => setGatewayToken(e.target.value)} className={inputClass} />
                        </FormField>
                    )}
                    {gatewayAuthMode === 'password' && (
                        <FormField label="Mot de passe">
                            <input type="password" value={gatewayPassword} onChange={e => setGatewayPassword(e.target.value)} className={inputClass} />
                        </FormField>
                    )}
                    <div className="flex items-center gap-3">
                        <button onClick={saveGateway} disabled={loading === 'gateway'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50">
                            {loading === 'gateway' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Sauvegarder
                        </button>
                        <button onClick={async () => {
                            setLoading('ping-oc');
                            try {
                                const res = await OpenClawClient.healthCheck();
                                if (res.ok) showToast('Moteur OpenClaw en ligne !', 'success');
                                else showToast('Moteur hors ligne.', 'error');
                            } catch {
                                showToast('Erreur Moteur', 'error');
                            } finally { setLoading(null); }
                        }} disabled={loading === 'ping-oc'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors disabled:opacity-50">
                            {loading === 'ping-oc' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Ping Moteur
                        </button>
                    </div>
                </Section>

                {/* Hooks */}
                <Section title="Hooks Système" icon={<Zap className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <Toggle enabled={bootMd} onChange={setBootMd} label="Boot Markdown" description="Instructions au démarrage" />
                        <Toggle enabled={commandLogger} onChange={setCommandLogger} label="Command Logger" description="Journaliser les commandes" />
                        <Toggle enabled={sessionMemory} onChange={setSessionMemory} label="Session Memory" description="Mémoriser les conversations" />
                    </div>
                    <button onClick={saveHooks} disabled={loading === 'hooks'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50 mt-4">
                        {loading === 'hooks' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder
                    </button>
                </Section>

                {/* Extra Keys */}
                <Section title="Clés API Supplémentaires" icon={<Key className="w-4 h-4" />}>
                    <FormField label="Google Places API">
                        <input type="password" value={googlePlaces} onChange={e => setGooglePlaces(e.target.value)} placeholder="AIza..." className={inputClass} />
                    </FormField>
                    <FormField label="Notion API">
                        <input type="password" value={notion} onChange={e => setNotion(e.target.value)} placeholder="secret_..." className={inputClass} />
                    </FormField>
                    <button onClick={saveExtraKeys} disabled={loading === 'keys'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50">
                        {loading === 'keys' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder
                    </button>
                </Section>
                {/* Workspace & Permissions */}
                <Section title="Système & Permissions" icon={<ShieldCheck className="w-4 h-4" />}>
                    <FormField label="Dossier Workspace par défaut">
                        <input type="text" value={workspacePath} onChange={e => setWorkspacePath(e.target.value)} placeholder="~/Documents/Elazya_Workspace" className={inputClass} />
                    </FormField>
                    <button onClick={saveWorkspace} disabled={loading === 'workspace'} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50 mb-6">
                        {loading === 'workspace' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder Chemin
                    </button>

                    <div className="pt-4 border-t border-white/10">
                        <h4 className="font-bold text-white mb-3 text-sm flex justify-between items-center">
                            Permissions macOS
                            <button onClick={testPermissions} disabled={loading === 'perms'} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                                {loading === 'perms' && <Loader2 className="w-3 h-3 animate-spin" />}
                                Vérifier les accès
                            </button>
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className={`p-3 rounded-lg border ${perms?.mail ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-400'} flex flex-col items-center gap-1`}>
                                <span className="font-semibold text-xs uppercase tracking-wider">Apple Mail</span>
                                <span className="text-xs">{perms?.mail ? 'Accès Autorisé' : 'Non Vérifié'}</span>
                            </div>
                            <div className={`p-3 rounded-lg border ${perms?.calendar ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-400'} flex flex-col items-center gap-1`}>
                                <span className="font-semibold text-xs uppercase tracking-wider">Calendrier</span>
                                <span className="text-xs">{perms?.calendar ? 'Accès Autorisé' : 'Non Vérifié'}</span>
                            </div>
                            <div className={`p-3 rounded-lg border ${perms?.contacts ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-400'} flex flex-col items-center gap-1`}>
                                <span className="font-semibold text-xs uppercase tracking-wider">Contacts</span>
                                <span className="text-xs">{perms?.contacts ? 'Accès Autorisé' : 'Non Vérifié'}</span>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            {/* System Logs */}
            <Section title="Journaux Système" icon={<Zap className="w-4 h-4" />}>
                <LogViewer />
            </Section>

            {/* Danger Zone */}
            <div className="pt-8 border-t border-red-500/10">
                <h3 className="text-sm font-black text-red-500 uppercase tracking-widest px-2 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Zone de Danger
                </h3>
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-white">Démarrage Automatique</h3>
                            <p className="text-xs text-zinc-500">Lancer Elazya à l'ouverture de session</p>
                        </div>
                        <button
                            onClick={() => setAutoStart(!autoStart)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${autoStart ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${autoStart ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white mb-1">Réinitialiser l'application</h4>
                            <p className="text-sm text-zinc-500">
                                Efface toutes les données, configurations et clés API.
                                <br />L'application redémarrera à zéro.
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm("ÊTES-VOUS SÛR ? Cette action est irréversible. Toutes vos données seront perdues.")) {
                                    try {
                                        localStorage.clear(); // Clear FIRST — backend restart will kill this process
                                        await OpenClawClient.resetApp(); // Backend writes sentinel + restarts app
                                    } catch (e) {
                                        console.error(e);
                                        alert("Erreur lors de la réinitialisation: " + e);
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-bold"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
