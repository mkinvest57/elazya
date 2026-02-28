/**
 * Elazya 3-Step Onboarding Wizard
 * Step 1: License Activation
 * Step 2: LLM Connection
 * Step 3: First Agent
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, Zap, Bot, Check, ArrowRight, AlertCircle, Copy,
    ChevronDown, Loader2, ExternalLink, Sparkles
} from 'lucide-react';
import { activateLicense, validateKeyFormat, type ElazyaPlan, type LicenseData } from '@/lib/license';
import { getAvailableAgents, getLimitsForPlan, type AgentDef } from '@/lib/plan-limits';
import { OpenClawClient } from '@/lib/openclaw-client';

interface OnboardingProps {
    onComplete: () => void;
}

// ----- Step Indicator -----
function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center gap-3 mb-8">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                        ${i < current
                            ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : i === current
                                ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-pulse-glow'
                                : 'bg-white/5 text-white/30 border border-white/10'
                        }
                    `}>
                        {i < current ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < total - 1 && (
                        <div className={`w-16 h-0.5 transition-colors duration-500 ${i < current ? 'bg-green-500/50' : 'bg-white/10'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ----- Step 1: License -----
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
            setTimeout(() => onNext(license), 1200);
        } catch (err: any) {
            setError(err.message || 'Erreur d\'activation');
        } finally {
            setLoading(false);
        }
    };

    const isValid = key.trim().length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Bienvenue dans Elazya</h2>
                <p className="text-white/50 text-sm">Entrez votre clé de licence pour activer votre plan.</p>
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
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-400 text-sm"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-green-400 text-sm"
                    >
                        <Check className="w-4 h-4" />
                        Licence activée !
                    </motion.div>
                )}
            </div>

            <button
                onClick={handleActivate}
                disabled={!isValid || loading || success}
                className={`
                    w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${isValid && !loading && !success
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'}
                `}
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Activation...</>
                ) : success ? (
                    <><Check className="w-4 h-4" /> Activé !</>
                ) : (
                    <><Key className="w-4 h-4" /> Activer</>
                )}
            </button>

            <div className="text-center">
                <a
                    href="https://elazya.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400/60 hover:text-indigo-400 text-xs flex items-center justify-center gap-1 transition-colors"
                >
                    Pas de clé ? Acheter une licence
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </motion.div>
    );
}

// ----- Step 2: LLM Connection -----

const LLM_PROVIDERS = [
    { id: 'anthropic', name: 'Anthropic', model: 'claude-sonnet-4-20250514', placeholder: 'sk-ant-api03-...' },
    { id: 'openai', name: 'OpenAI', model: 'gpt-4o', placeholder: 'sk-...' },
    { id: 'google', name: 'Google', model: 'gemini-2.5-flash', placeholder: 'AIza...' },
    { id: 'groq', name: 'Groq', model: 'llama-3.3-70b-versatile', placeholder: 'gsk_...' },
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
            // Configure LLM via OpenClaw
            await OpenClawClient.configureLLM(provider.id, apiKey, provider.model);

            // Quick health check to verify it works
            const health = await OpenClawClient.healthCheck();
            if (health.ok) {
                setStatus('success');
                setTimeout(() => onNext(), 1200);
            } else {
                throw new Error(health.detail || 'La connexion a échoué');
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || `Vérifiez votre clé API sur le site de ${provider.name}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Connectez votre IA</h2>
                <p className="text-white/50 text-sm">Elazya utilise votre propre clé API. Vos données restent privées.</p>
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

            {/* Status messages */}
            {errorMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                </motion.div>
            )}

            {status === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="w-4 h-4" />
                    Connexion réussie ! ({provider.model})
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

// ----- Step 3: First Agent -----
function AgentStep({ plan, onNext }: { plan: ElazyaPlan; onNext: () => void }) {
    const agents = getAvailableAgents(plan).slice(0, 5); // Show first 5 for selection
    const [selected, setSelected] = useState<string | null>(null);
    const [installing, setInstalling] = useState(false);
    const [installed, setInstalled] = useState(false);

    const handleInstall = async () => {
        if (!selected) return;
        setInstalling(true);

        try {
            // Install the agent skill via OpenClaw
            await OpenClawClient.installSkill(selected);
            setInstalled(true);

            // Mark onboarding as complete
            localStorage.setItem('elazya_v2_configured', 'true');
            await OpenClawClient.setSetting('elazya_onboarding_complete', 'true');

            setTimeout(() => onNext(), 1500);
        } catch (err) {
            console.error('Failed to install agent:', err);
            // Still proceed — agent install can be retried from dashboard
            localStorage.setItem('elazya_v2_configured', 'true');
            await OpenClawClient.setSetting('elazya_onboarding_complete', 'true');
            setTimeout(() => onNext(), 500);
        } finally {
            setInstalling(false);
        }
    };

    // Icon mapping
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'FileText': return '📄';
            case 'Mail': return '📧';
            case 'Newspaper': return '📰';
            case 'Linkedin': return '💼';
            case 'Receipt': return '🧾';
            default: return '🤖';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Activez votre premier agent</h2>
                <p className="text-white/50 text-sm">
                    Agents disponibles ({getLimitsForPlan(plan).label}) — vous pourrez en ajouter d&apos;autres ensuite.
                </p>
            </div>

            <div className="space-y-2">
                {agents.map((agent) => (
                    <button
                        key={agent.id}
                        onClick={() => !installing && !installed && setSelected(agent.id)}
                        className={`
                            w-full px-4 py-3.5 rounded-xl border text-left flex items-center gap-4 transition-all
                            ${selected === agent.id
                                ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'}
                            ${(installing || installed) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        disabled={installing || installed}
                    >
                        <div className="text-2xl">{getIcon(agent.icon)}</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-sm">{agent.name}</div>
                            <div className="text-white/40 text-xs">{agent.description}</div>
                        </div>
                        {selected === agent.id && !installed && (
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                        {selected === agent.id && installed && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                            >
                                <Check className="w-3 h-3 text-white" />
                            </motion.div>
                        )}
                    </button>
                ))}
            </div>

            {installed && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-400 text-sm justify-center"
                >
                    <Sparkles className="w-4 h-4" />
                    Agent installé ! Bienvenue dans Elazya.
                </motion.div>
            )}

            <button
                onClick={handleInstall}
                disabled={!selected || installing || installed}
                className={`
                    w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                    ${selected && !installing && !installed
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'}
                `}
            >
                {installing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Installation...</>
                ) : installed ? (
                    <><Sparkles className="w-4 h-4" /> C&apos;est parti !</>
                ) : (
                    <><Bot className="w-4 h-4" /> Installer cet agent</>
                )}
            </button>
        </motion.div>
    );
}

// ----- Main Onboarding Component -----
export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [license, setLicense] = useState<LicenseData | null>(null);

    const stepLabels = ['Licence', 'IA', 'Agent'];

    return (
        <div className="w-full h-full flex items-center justify-center bg-[#09090b]">
            <div className="w-full max-w-md px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <Sparkles className="w-3 h-3" />
                        Configuration
                    </motion.div>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center mb-8">
                    <StepIndicator current={step} total={3} />
                </div>

                {/* Step Content */}
                <div className="glass-panel rounded-2xl p-8 min-h-[380px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <LicenseStep
                                key="license"
                                onNext={(lic) => {
                                    setLicense(lic);
                                    setStep(1);
                                }}
                            />
                        )}
                        {step === 1 && (
                            <LLMStep
                                key="llm"
                                onNext={() => setStep(2)}
                            />
                        )}
                        {step === 2 && license && (
                            <AgentStep
                                key="agent"
                                plan={license.plan}
                                onNext={onComplete}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Step labels */}
                <div className="flex justify-between mt-4 px-4">
                    {stepLabels.map((label, i) => (
                        <span
                            key={i}
                            className={`text-xs font-medium transition-colors ${i <= step ? 'text-white/50' : 'text-white/20'}`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
