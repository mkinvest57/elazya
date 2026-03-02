/**
 * Elazya 5-Step Onboarding Wizard
 * 0: Welcome
 * 1: License Activation
 * 2: LLM Connection
 * 3: Folders Setup
 * 4: Quick Win (activate agents)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, Zap, Check, AlertCircle, Loader2, ExternalLink, Sparkles,
    ChevronDown, FolderOpen, Rocket, Shield, ArrowRight
} from 'lucide-react';
import { activateLicense, type ElazyaPlan, type LicenseData } from '@/lib/license';
import { OpenClawClient } from '@/lib/openclaw-client';
import { invoke } from '@tauri-apps/api/core';

interface OnboardingProps {
    onComplete: () => void;
}

const TOTAL_STEPS = 5;

// ─── Shared Animations ─────────────────────────────────────
const slideIn = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.3 },
};

// ─── Step Indicator ─────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
    const dots = TOTAL_STEPS;
    return (
        <div className="flex items-center gap-2 justify-center mb-8">
            {Array.from({ length: dots }).map((_, i) => (
                <div
                    key={i}
                    className={`
                        h-1.5 rounded-full transition-all duration-500
                        ${i < current ? 'w-6 bg-green-500' : i === current ? 'w-8 bg-indigo-500' : 'w-4 bg-white/10'}
                    `}
                />
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Step 0 — Welcome
// ═══════════════════════════════════════════════════════════════
function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <motion.div {...slideIn} className="text-center space-y-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(99,102,241,0.3)]"
            >
                <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                    Bienvenue dans Elazya
                </h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                    On va connecter 2-3 choses pour que vos agents puissent travailler.
                    <br />Ça prend 2 minutes.
                </p>
            </div>

            <div className="flex gap-4 justify-center text-xs text-white/30">
                <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    100% local
                </div>
                <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Licence
                </div>
                <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    IA
                </div>
                <div className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Dossiers
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full py-4 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 transition-all"
            >
                Commencer <ArrowRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Step 1 — License
// ═══════════════════════════════════════════════════════════════
function LicenseStep({ onNext }: { onNext: (license: LicenseData) => void }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleActivate = async () => {
        setError('');
        setLoading(true);
        try {
            const license = await activateLicense(key);
            setSuccess(true);
            setTimeout(() => onNext(license), 1000);
        } catch (err: any) {
            setError(err.message || 'Erreur d\'activation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div {...slideIn} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Votre licence</h2>
                <p className="text-white/50 text-sm">Entrez votre clé pour activer votre plan.</p>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Clé de licence</label>
                <input
                    type="text"
                    value={key}
                    onChange={(e) => { setKey(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="ELAZYA-PRO-A3F9-7K2M"
                    className={`
                        w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white font-mono text-lg tracking-wider
                        placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all
                        ${error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'}
                        ${success ? 'border-green-500/50 bg-green-500/5' : ''}
                    `}
                    disabled={loading || success}
                    autoFocus
                />

                {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        Licence activée !
                    </motion.div>
                )}
            </div>

            <button
                onClick={handleActivate}
                disabled={!key.trim() || loading || success}
                className={`
                    w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${key.trim() && !loading && !success
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'}
                `}
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
                ) : success ? (
                    <><Check className="w-4 h-4" /> Activé !</>
                ) : (
                    <><Key className="w-4 h-4" /> Vérifier</>
                )}
            </button>

            <div className="text-center">
                <a href="https://elazya.com/pricing" target="_blank" rel="noopener noreferrer"
                    className="text-indigo-400/60 hover:text-indigo-400 text-xs flex items-center justify-center gap-1 transition-colors">
                    Pas de clé ? Acheter une licence <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Step 2 — LLM Connection
// ═══════════════════════════════════════════════════════════════
const LLM_PROVIDERS = [
    { id: 'anthropic', name: 'Anthropic (Claude)', model: 'claude-sonnet-4-20250514', placeholder: 'sk-ant-api03-...' },
    { id: 'openai', name: 'OpenAI (GPT-4o)', model: 'gpt-4o', placeholder: 'sk-...' },
    { id: 'google', name: 'Google (Gemini)', model: 'gemini-2.5-flash', placeholder: 'AIza...' },
    { id: 'groq', name: 'Groq (Llama 3)', model: 'llama-3.3-70b-versatile', placeholder: 'gsk_...' },
];

function LLMStep({ onNext }: { onNext: () => void }) {
    const [provider, setProvider] = useState(LLM_PROVIDERS[0]);
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const handleTest = async () => {
        setStatus('testing');
        setErrorMsg('');
        try {
            await OpenClawClient.configureLLM(provider.id, apiKey, provider.model);
            const health = await OpenClawClient.healthCheck();
            if (health.ok) {
                setStatus('success');
                setTimeout(() => onNext(), 1000);
            } else {
                throw new Error(health.detail || 'La connexion a échoué');
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || `Vérifiez votre clé API ${provider.name}`);
        }
    };

    return (
        <motion.div {...slideIn} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Fournisseur IA</h2>
                <p className="text-white/50 text-sm">Vos données restent 100% privées via votre propre clé API.</p>
            </div>

            {/* Provider picker */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Fournisseur</label>
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-left flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                        <span className="font-medium">{provider.name}</span>
                        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute z-10 mt-1 w-full rounded-xl bg-zinc-800 border border-white/10 overflow-hidden shadow-2xl"
                            >
                                {LLM_PROVIDERS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setProvider(p); setShowDropdown(false); setApiKey(''); setStatus('idle'); }}
                                        className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors text-sm ${provider.id === p.id ? 'text-indigo-400 bg-white/5' : 'text-white/80'}`}
                                    >
                                        {p.name}
                                        <span className="text-white/30 ml-2 text-xs">{p.model}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* API Key */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Clé API</label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                    placeholder={provider.placeholder}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                    disabled={status === 'testing' || status === 'success'}
                />
            </div>

            {errorMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
                </motion.div>
            )}
            {status === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="w-4 h-4" /> Connexion réussie !
                </motion.div>
            )}

            <button
                onClick={handleTest}
                disabled={!apiKey.trim() || status === 'testing' || status === 'success'}
                className={`
                    w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${apiKey.trim() && status !== 'testing' && status !== 'success'
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'}
                `}
            >
                {status === 'testing' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Test en cours...</>
                ) : status === 'success' ? (
                    <><Check className="w-4 h-4" /> Connecté !</>
                ) : (
                    <><Zap className="w-4 h-4" /> Tester la connexion</>
                )}
            </button>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Step 3 — Folders Setup
// ═══════════════════════════════════════════════════════════════
function FoldersStep({ onNext }: { onNext: () => void }) {
    const [invoiceDir, setInvoiceDir] = useState('~/Documents/Factures');
    const [clientDir, setClientDir] = useState('~/Clients');
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleTest = async () => {
        setStatus('testing');
        setErrorMsg('');

        try {
            // Save the folder paths to agent config
            const settings = JSON.stringify({
                watch_dir: invoiceDir,
                client_dir: clientDir,
            });

            // Save as facturation agent config
            await OpenClawClient.saveAgentConfig('facturation', false, settings);

            // Also save as global settings
            await OpenClawClient.setSetting('default_invoice_dir', invoiceDir);
            await OpenClawClient.setSetting('default_client_dir', clientDir);

            setStatus('success');
            setTimeout(() => onNext(), 1000);
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || 'Erreur lors de la vérification');
        }
    };

    const pickFolder = async (setter: (v: string) => void) => {
        try {
            const { open } = await import('@tauri-apps/plugin-dialog');
            const result = await open({ directory: true, multiple: false });
            if (result) {
                setter(result as string);
                setStatus('idle');
            }
        } catch (e) {
            console.error('Folder picker error:', e);
        }
    };

    return (
        <motion.div {...slideIn} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Vos dossiers</h2>
                <p className="text-white/50 text-sm">Où vos agents doivent chercher et classer les fichiers.</p>
            </div>

            {/* Invoice dir */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">📥 Factures entrantes</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={invoiceDir}
                        onChange={(e) => { setInvoiceDir(e.target.value); setStatus('idle'); }}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                    <button
                        onClick={() => pickFolder(setInvoiceDir)}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <FolderOpen className="w-4 h-4 text-white/60" />
                    </button>
                </div>
                <p className="text-xs text-white/30">Les nouveaux PDF ici déclencheront l'agent Facturation Auto</p>
            </div>

            {/* Client dir */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">📁 Dossiers clients</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={clientDir}
                        onChange={(e) => { setClientDir(e.target.value); setStatus('idle'); }}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                    <button
                        onClick={() => pickFolder(setClientDir)}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <FolderOpen className="w-4 h-4 text-white/60" />
                    </button>
                </div>
                <p className="text-xs text-white/30">Les factures classées seront rangées dans ~/Clients/NomClient/2026/</p>
            </div>

            {errorMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
                </motion.div>
            )}
            {status === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="w-4 h-4" /> Dossiers configurés !
                </motion.div>
            )}

            <button
                onClick={handleTest}
                disabled={!invoiceDir.trim() || !clientDir.trim() || status === 'testing' || status === 'success'}
                className={`
                    w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${invoiceDir.trim() && clientDir.trim() && status !== 'testing' && status !== 'success'
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'}
                `}
            >
                {status === 'testing' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
                ) : status === 'success' ? (
                    <><Check className="w-4 h-4" /> Configuré !</>
                ) : (
                    <><FolderOpen className="w-4 h-4" /> Valider les dossiers</>
                )}
            </button>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Step 4 — Quick Win (activate agents)
// ═══════════════════════════════════════════════════════════════
const QUICK_WIN_AGENTS = [
    { id: 'facturation', name: 'Facturation Auto', emoji: '💰', description: 'Classe vos factures automatiquement' },
    { id: 'onboarding-client', name: 'Onboarding Client Express', emoji: '📧', description: 'Répond aux prospects en 5 min' },
];

function QuickWinStep({ onNext }: { onNext: () => void }) {
    const [selected, setSelected] = useState<Record<string, boolean>>({
        'facturation': true,
        'onboarding-client': true,
    });
    const [activating, setActivating] = useState(false);
    const [done, setDone] = useState(false);

    const handleLaunch = async () => {
        setActivating(true);
        try {
            // Activate selected agents
            for (const agent of QUICK_WIN_AGENTS) {
                if (selected[agent.id]) {
                    await OpenClawClient.toggleAgent(agent.id, true);
                }
            }

            // Mark onboarding as complete
            localStorage.setItem('elazya_v2_configured', 'true');
            await OpenClawClient.setSetting('elazya_onboarding_complete', 'true');

            setDone(true);
            setTimeout(() => onNext(), 1500);
        } catch (err) {
            console.error('Activation error:', err);
            // Still proceed
            localStorage.setItem('elazya_v2_configured', 'true');
            setTimeout(() => onNext(), 500);
        } finally {
            setActivating(false);
        }
    };

    return (
        <motion.div {...slideIn} className="text-center space-y-6">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto"
            >
                <Rocket className="w-8 h-8 text-green-400" />
            </motion.div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Parfait. Vos agents sont prêts.</h2>
                <p className="text-white/50 text-sm">Activez vos premiers agents pour commencer tout de suite.</p>
            </div>

            <div className="space-y-2 text-left">
                {QUICK_WIN_AGENTS.map((agent) => (
                    <button
                        key={agent.id}
                        onClick={() => !activating && !done && setSelected(s => ({ ...s, [agent.id]: !s[agent.id] }))}
                        className={`
                            w-full px-4 py-4 rounded-xl border text-left flex items-center gap-4 transition-all
                            ${selected[agent.id]
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'}
                            ${(activating || done) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        disabled={activating || done}
                    >
                        <div className="text-2xl">{agent.emoji}</div>
                        <div className="flex-1">
                            <div className="font-bold text-white text-sm">{agent.name}</div>
                            <div className="text-white/40 text-xs">{agent.description}</div>
                        </div>
                        <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${selected[agent.id]
                                ? 'bg-green-500 border-green-500'
                                : 'border-white/20 bg-transparent'}
                        `}>
                            {selected[agent.id] && <Check className="w-3 h-3 text-white" />}
                        </div>
                    </button>
                ))}
            </div>

            {done && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-400 text-sm justify-center"
                >
                    <Sparkles className="w-4 h-4" />
                    Agents activés ! Bienvenue dans Elazya.
                </motion.div>
            )}

            <button
                onClick={handleLaunch}
                disabled={activating || done}
                className={`
                    w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${!activating && !done
                        ? 'bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'}
                `}
            >
                {activating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Activation...</>
                ) : done ? (
                    <><Sparkles className="w-4 h-4" /> C'est parti !</>
                ) : (
                    <><Rocket className="w-4 h-4" /> Accéder au tableau de bord</>
                )}
            </button>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Main Onboarding Component
// ═══════════════════════════════════════════════════════════════
export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [license, setLicense] = useState<LicenseData | null>(null);

    const stepLabels = ['Bienvenue', 'Licence', 'IA', 'Dossiers', 'C\'est parti'];

    return (
        <div className="w-full h-full flex items-center justify-center bg-[#09090b]">
            <div className="w-full max-w-md px-8">
                {/* Header badge */}
                {step > 0 && (
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest"
                        >
                            <Sparkles className="w-3 h-3" />
                            Configuration — {step}/{TOTAL_STEPS - 1}
                        </motion.div>
                    </div>
                )}

                {/* Step Indicator */}
                <StepIndicator current={step} />

                {/* Step Content */}
                <div className="glass-panel rounded-2xl p-8 min-h-[400px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <WelcomeStep key="welcome" onNext={() => setStep(1)} />
                        )}
                        {step === 1 && (
                            <LicenseStep key="license" onNext={(lic) => { setLicense(lic); setStep(2); }} />
                        )}
                        {step === 2 && (
                            <LLMStep key="llm" onNext={() => setStep(3)} />
                        )}
                        {step === 3 && (
                            <FoldersStep key="folders" onNext={() => setStep(4)} />
                        )}
                        {step === 4 && (
                            <QuickWinStep key="quickwin" onNext={onComplete} />
                        )}
                    </AnimatePresence>
                </div>

                {/* Step labels */}
                <div className="flex justify-between mt-4 px-2">
                    {stepLabels.map((label, i) => (
                        <span
                            key={i}
                            className={`text-[10px] font-medium transition-colors ${i <= step ? 'text-white/50' : 'text-white/15'}`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
