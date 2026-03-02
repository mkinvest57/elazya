/**
 * AgentDetail — Agent Detail Page (Phase 4 polished)
 *
 * Uses centralized theme tokens. Polished toggle, button press,
 * log slide-in, focus rings, input states.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Play, Save,
    FolderOpen, ToggleLeft, ToggleRight,
    ChevronRight, Sparkles, Zap, Loader2, Beaker
} from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { type AgentDef } from '@/lib/plan-limits';
import { OpenClawClient } from '@/lib/openclaw-client';

// ── Feature descriptions per agent ──────────────────────────
const AGENT_FEATURES: Record<string, string[]> = {
    'facturation': [
        'Lit vos factures PDF et extrait les infos clés',
        'Crée un dossier par client automatiquement',
        'Ajoute la facture dans Notion avec les métadonnées',
        'Crée un rappel automatique avant l\'échéance',
    ],
    'onboarding-client': [
        'Détecte les nouveaux emails de prospects',
        'Génère une réponse personnalisée en 5 minutes',
        'Crée un dossier client avec les infos clés',
        'Propose un créneau de rendez-vous automatiquement',
    ],
    'linkedin-digest': [
        'Analyse votre réseau et les tendances du jour',
        'Génère 1 post LinkedIn optimisé quotidien',
        'Crée 3 commentaires pertinents sur des posts clés',
        'Propose des hashtags et horaires optimaux',
    ],
    'qualification': [
        'Analyse chaque nouveau lead entrant',
        'Score de qualification automatique',
        'Filtre les curieux des vrais prospects',
        'Alerte instantanée pour les leads chauds',
    ],
    'routine-matinale': [
        'Compile les emails importants de la nuit',
        'Résume les tâches prioritaires du jour',
        'Prépare un briefing clair en 30 secondes',
        'Envoie le résumé à 7h30 chaque matin',
    ],
    'crm-prospect': [
        'Centralise tous vos prospects',
        'Suivi automatique : relances, rappels, notes',
        'Aucun lead perdu grâce au tracking',
        'Historique complet de chaque interaction',
    ],
    'devis-express': [
        'Génère un devis professionnel en 10 minutes',
        'S\'adapte au contexte client',
        'Template personnalisable avec votre charte',
        'Export PDF prêt à envoyer',
    ],
    'email-intelligent': [
        'Trie votre inbox automatiquement',
        'Catégorise : urgent, à traiter, info, spam',
        'Génère des suggestions de réponse',
        'Archive le bruit, ne garde que l\'essentiel',
    ],
    'compta-export': [
        'Collecte toutes les factures du mois',
        'Génère un export comptable structuré',
        'Compatible avec les logiciels comptables',
        'Envoi automatique à votre comptable',
    ],
    'content-linkedin': [
        'Transforme 1 idée en 5 posts variés',
        'Adapte le ton : inspirant, éducatif, storytelling',
        'Optimise pour l\'algorithme LinkedIn',
        'Planifie la publication sur la semaine',
    ],
};

interface ConfigFieldDef {
    id: string;
    label: string;
    type: 'text' | 'toggle' | 'select';
    placeholder?: string;
    options?: string[];
}

const AGENT_CONFIG_FIELDS: Record<string, ConfigFieldDef[]> = {
    'facturation': [
        { id: 'watch_dir', label: 'Dossier à surveiller', type: 'text', placeholder: '~/Documents/Factures' },
        { id: 'client_dir', label: 'Dossier clients', type: 'text', placeholder: '~/Clients' },
        { id: 'notion_sync', label: 'Synchroniser avec Notion', type: 'toggle' },
        { id: 'notion_db', label: 'Base de données Notion', type: 'text', placeholder: 'ID de la base Notion' },
    ],
    'onboarding-client': [
        { id: 'email_account', label: 'Compte email à surveiller', type: 'text', placeholder: 'contact@monentreprise.com' },
        { id: 'response_tone', label: 'Ton des réponses', type: 'select', options: ['Professionnel', 'Amical', 'Formel'] },
        { id: 'auto_calendar', label: 'Proposer des créneaux auto', type: 'toggle' },
    ],
    'linkedin-digest': [
        { id: 'linkedin_profile', label: 'Profil LinkedIn', type: 'text', placeholder: 'linkedin.com/in/votre-profil' },
        { id: 'post_tone', label: 'Ton des publications', type: 'select', options: ['Inspirant', 'Éducatif', 'Storytelling', 'Provocateur'] },
        { id: 'auto_publish', label: 'Publication automatique', type: 'toggle' },
    ],
    'qualification': [
        { id: 'crm_source', label: 'Source des leads', type: 'select', options: ['Formulaire web', 'Email', 'LinkedIn', 'Tous'] },
        { id: 'hot_threshold', label: 'Seuil lead chaud', type: 'select', options: ['70%', '80%', '90%'] },
        { id: 'auto_notify', label: 'Notification leads chauds', type: 'toggle' },
    ],
    'routine-matinale': [
        { id: 'send_time', label: 'Heure d\'envoi', type: 'text', placeholder: '07:30' },
        { id: 'include_calendar', label: 'Inclure le calendrier', type: 'toggle' },
        { id: 'include_emails', label: 'Inclure résumé emails', type: 'toggle' },
    ],
};

// ── Animations ──────────────────────────────────────────────
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

// ── Tier Badge ──────────────────────────────────────────────
const TIER_STYLES: Record<string, string> = {
    solo: 'bg-[var(--color-success-bg)] border-[var(--color-success-ring)] text-[var(--color-success)]',
    pro: 'bg-[var(--color-warning-bg)] border-amber-500/20 text-[var(--color-warning)]',
    business: 'bg-[var(--color-indigo-bg)] border-indigo-500/20 text-[var(--color-indigo)]',
};

function TierBadge({ tier }: { tier: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${TIER_STYLES[tier] || TIER_STYLES.solo}`}
            style={{ fontSize: '10px' }}>
            {tier === 'solo' ? 'Core' : tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
    );
}

// ── Main Component ──────────────────────────────────────────
interface AgentDetailProps {
    agent: AgentDef;
    onBack: () => void;
}

export default function AgentDetail({ agent, onBack }: AgentDetailProps) {
    const [isActive, setIsActive] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [logs, setLogs] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const features = AGENT_FEATURES[agent.id] || ['Configuration en cours...'];
    const configFields = AGENT_CONFIG_FIELDS[agent.id] || [];

    const loadData = useCallback(async () => {
        const config = await OpenClawClient.getAgentConfig(agent.id);
        if (config) {
            setIsActive(config.enabled);
            try { setSettings(JSON.parse(config.settings)); } catch { setSettings({}); }
        }
        setLogs(await OpenClawClient.getAgentLogs(agent.id, 10));
    }, [agent.id]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const unlisten = listen<any>('agent-action', (e) => {
            if (e.payload?.agentId === agent.id) loadData();
        });
        return () => { unlisten.then(fn => fn()); };
    }, [agent.id, loadData]);

    async function handleToggle() {
        const newState = !isActive;
        setIsActive(newState);
        await OpenClawClient.toggleAgent(agent.id, newState);
    }

    async function handleSave() {
        setSaving(true); setSaveMsg('');
        try {
            await OpenClawClient.saveAgentConfig(agent.id, isActive, JSON.stringify(settings));
            setSaveMsg('✓ Sauvegardé');
            setTimeout(() => setSaveMsg(''), 2500);
        } catch (e: any) { setSaveMsg('Erreur : ' + (e?.message || e)); }
        setSaving(false);
    }

    async function handleTest() {
        setRunning(true);
        try {
            await OpenClawClient.testAgent(agent.id);
            // Force reload logs to get the test result
            await loadData();
        }
        catch (e) { console.error('Test agent error:', e); }
        setRunning(false);
    }

    function updateSetting(key: string, value: string) {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

    // Safely parse details from recent log
    const getRecentTestDetails = () => {
        if (!logs || logs.length === 0) return null;
        const recent = logs[0];
        if (recent.status !== 'success' || !recent.details) return null;
        try {
            return typeof recent.details === 'string' ? JSON.parse(recent.details) : recent.details;
        } catch {
            return null;
        }
    };

    const testDetails = getRecentTestDetails();

    return (
        <motion.div variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-3xl"
            style={{ padding: 'var(--space-page)' }}
        >
            {/* ── Back ──────────────────────────────────── */}
            <motion.button variants={item} onClick={onBack}
                className="btn-base focus-ring flex items-center gap-1.5 text-white/25 hover:text-white/50 font-medium mb-5 rounded-lg px-2 py-1 -ml-2 transition-colors"
                style={{ fontSize: 'var(--text-body)' }}
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour
            </motion.button>

            {/* ── Header ────────────────────────────────── */}
            <motion.div variants={item}
                className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] backdrop-blur-xl mb-4"
                style={{ padding: 'var(--space-card-pad)' }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-violet-500/[0.02] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-indigo-bg)] flex items-center justify-center ring-1 ring-indigo-500/15 text-xl ${running ? 'animate-status-pulse' : ''}`}>
                            {agent.emoji}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 mb-0.5">
                                <h1 className="font-extrabold text-white" style={{ fontSize: 'var(--text-h1)' }}>{agent.name}</h1>
                                <TierBadge tier={agent.tier} />
                            </div>
                            <p className="text-white/35" style={{ fontSize: 'var(--text-subtitle)' }}>{agent.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                        {/* Toggle */}
                        <button onClick={handleToggle}
                            className={`btn-base focus-ring flex items-center gap-2.5 px-4 py-2 rounded-[var(--radius-md)] font-semibold transition-all ${isActive
                                ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] ring-1 ring-[var(--color-success-ring)]'
                                : 'bg-[var(--surface-overlay)] text-white/25 ring-1 ring-[var(--border-subtle)]'
                                }`}
                            style={{ fontSize: 'var(--text-body)' }}
                        >
                            <motion.div
                                animate={{ rotate: isActive ? 0 : 180 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </motion.div>
                            {isActive ? 'Activé' : 'Désactivé'}
                        </button>

                        {/* Test */}
                        <button onClick={handleTest} disabled={running}
                            className="btn-base focus-ring flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--surface-overlay)] border border-[var(--border-subtle)] text-white/35 hover:text-white/55 hover:bg-[var(--surface-hover)] font-semibold disabled:opacity-35"
                            style={{ fontSize: 'var(--text-body)' }}
                        >
                            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Beaker className="w-3.5 h-3.5" />}
                            {running ? 'Test en cours...' : 'Tester sur un exemple'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Ce que fait cet agent ──────────────────── */}
            <motion.div variants={item}
                className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] backdrop-blur-xl mb-4"
                style={{ padding: 'var(--space-card-pad)' }}
            >
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-success-bg)] flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--color-success)]" />
                    </div>
                    <h2 className="font-bold text-white/55 tracking-wide" style={{ fontSize: 'var(--text-body)' }}>Ce que fait cet agent</h2>
                </div>
                <div className="space-y-2.5">
                    {features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <div className="w-4.5 h-4.5 rounded-md bg-[var(--color-success-bg)] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ width: '18px', height: '18px' }}>
                                <CheckCircle2 className="w-2.5 h-2.5 text-[var(--color-success)]" />
                            </div>
                            <span className="text-white/50 leading-relaxed" style={{ fontSize: 'var(--text-body)' }}>{feat}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Configuration ──────────────────────────── */}
            {configFields.length > 0 && (
                <motion.div variants={item}
                    className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] backdrop-blur-xl mb-4"
                    style={{ padding: 'var(--space-card-pad)' }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-indigo-bg)] flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-[var(--color-indigo)]" />
                            </div>
                            <h2 className="font-bold text-white/55 tracking-wide" style={{ fontSize: 'var(--text-body)' }}>Configuration</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <AnimatePresence>
                                {saveMsg && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`font-medium ${saveMsg.startsWith('✓') ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}
                                        style={{ fontSize: 'var(--text-label)' }}
                                    >
                                        {saveMsg}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <button onClick={handleSave} disabled={saving}
                                className="btn-base focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-indigo-500/12 text-[var(--color-indigo)] font-bold hover:bg-indigo-500/20 ring-1 ring-indigo-500/15 disabled:opacity-35"
                                style={{ fontSize: 'var(--text-label)' }}
                            >
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Sauvegarder
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-[var(--border-subtle)]">
                        {configFields.map((field) => {
                            if (field.type === 'toggle') {
                                const val = settings[field.id] === 'true';
                                return (
                                    <div key={field.id} className="flex items-center justify-between py-3">
                                        <label className="text-white/50 font-medium" style={{ fontSize: 'var(--text-body)' }}>{field.label}</label>
                                        <button onClick={() => updateSetting(field.id, val ? 'false' : 'true')}
                                            className={`relative w-10 h-[22px] rounded-full transition-colors focus-ring`}
                                            style={{ backgroundColor: val ? 'var(--color-indigo)' : 'rgba(255,255,255,0.08)', transitionDuration: 'var(--duration-normal)' }}
                                        >
                                            <motion.div
                                                className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
                                                animate={{ x: val ? 21 : 3 }}
                                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </button>
                                    </div>
                                );
                            }

                            if (field.type === 'select') {
                                return (
                                    <div key={field.id} className="py-3">
                                        <label className="text-white/50 font-medium mb-1.5 block" style={{ fontSize: 'var(--text-body)' }}>{field.label}</label>
                                        <select
                                            value={settings[field.id] || field.options?.[0] || ''}
                                            onChange={(e) => updateSetting(field.id, e.target.value)}
                                            className="input-base focus-ring w-full px-3 py-2 text-white/60 outline-none appearance-none"
                                            style={{ fontSize: 'var(--text-body)' }}
                                        >
                                            {field.options?.map((opt) => (
                                                <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            }

                            return (
                                <div key={field.id} className="py-3">
                                    <label className="text-white/50 font-medium mb-1.5 block" style={{ fontSize: 'var(--text-body)' }}>{field.label}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder={field.placeholder}
                                            value={settings[field.id] || ''}
                                            onChange={(e) => updateSetting(field.id, e.target.value)}
                                            className="input-base focus-ring flex-1 px-3 py-2 text-white/60 placeholder-white/15 outline-none"
                                            style={{ fontSize: 'var(--text-body)' }}
                                        />
                                        {field.id.includes('dir') && (
                                            <button className="btn-base px-3 py-2 rounded-[var(--radius-md)] bg-[var(--surface-overlay)] border border-[var(--border-subtle)] text-white/25">
                                                <FolderOpen className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ── Résultat du test (if available) ──────────────── */}
            <AnimatePresence>
                {testDetails && !running && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="rounded-[var(--radius-lg)] border border-[var(--color-success-ring)] bg-[var(--color-success-bg)] backdrop-blur-xl mb-4 overflow-hidden"
                    >
                        <div style={{ padding: 'var(--space-card-pad)' }}>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-green-500/20 flex items-center justify-center">
                                    <Beaker className="w-3.5 h-3.5 text-[var(--color-success)]" />
                                </div>
                                <h2 className="font-bold text-[var(--color-success)] tracking-wide" style={{ fontSize: 'var(--text-body)' }}>Résultat du test</h2>
                            </div>

                            <div className="space-y-3">
                                {/* Facturation Auto */}
                                {agent.id === 'facturation' && testDetails.parsed && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Source</div>
                                            <div className="font-mono text-xs text-white/70 truncate" title={testDetails.source}>{testDetails.source.split('/').pop()}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Cible (Simulation)</div>
                                            <div className="font-mono text-xs text-[var(--color-success)] truncate" title={testDetails.destination}>{testDetails.destination}</div>
                                        </div>
                                        <div className="col-span-2 bg-white/5 rounded-lg p-3 flex gap-4">
                                            <div className="flex-1">
                                                <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Client détecté</div>
                                                <div className="font-medium text-sm text-white/80">{testDetails.parsed.client}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Montant</div>
                                                <div className="font-medium text-sm text-white/80">{testDetails.parsed.montant} €</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Échéance</div>
                                                <div className="font-medium text-sm text-white/80">{testDetails.parsed.date_echeance}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Onboarding Client Express */}
                                {agent.id === 'onboarding-client' && testDetails.response && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-[10px] text-[var(--color-success)] uppercase font-bold mb-2 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" /> Email généré
                                        </div>
                                        <p className="text-sm text-white/70 italic leading-relaxed">
                                            "{testDetails.response}"
                                        </p>
                                    </div>
                                )}

                                {/* LinkedIn Digest */}
                                {agent.id === 'linkedin-digest' && testDetails.post && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-[10px] text-[var(--color-indigo)] uppercase font-bold mb-2 flex items-center gap-1.5">
                                            Post généré
                                        </div>
                                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap mb-4">
                                            {testDetails.post}
                                        </p>
                                        {testDetails.hashtags && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {testDetails.hashtags.map((tag: string, i: number) => (
                                                    <span key={i} className="text-xs text-[var(--color-indigo)] bg-[var(--color-indigo-bg)] px-2 py-0.5 rounded-full">
                                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {testDetails.comments && testDetails.comments.length > 0 && (
                                            <div className="border-t border-white/5 pt-3">
                                                <div className="text-[10px] text-white/30 uppercase font-bold mb-2">Commentaires suggérés</div>
                                                <ul className="space-y-2">
                                                    {testDetails.comments.map((comment: string, i: number) => (
                                                        <li key={i} className="text-xs text-white/50 italic flex items-start gap-2">
                                                            <span className="text-white/20 mt-0.5">💬</span> {comment}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Qualification Leads */}
                                {agent.id === 'qualification' && testDetails.hot !== undefined && (
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                            <div className="text-2xl font-bold text-white/80 mb-1">{testDetails.total}</div>
                                            <div className="text-[10px] text-white/30 uppercase font-bold">Total leads</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                            <div className="text-2xl font-bold text-[var(--color-warning)] mb-1">{testDetails.warm}</div>
                                            <div className="text-[10px] text-[var(--color-warning)] uppercase font-bold">À recontacter</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                                            <div className="text-2xl font-bold text-[var(--color-success)] mb-1">{testDetails.hot}</div>
                                            <div className="text-[10px] text-[var(--color-success)] uppercase font-bold flex items-center justify-center gap-1">
                                                <Zap className="w-3 h-3" /> Chauds !
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Dernières actions ──────────────────────── */}
            <motion.div variants={item}
                className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] backdrop-blur-xl"
                style={{ padding: 'var(--space-card-pad)' }}
            >
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-violet-bg)] flex items-center justify-center">
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--color-violet)]" />
                    </div>
                    <h2 className="font-bold text-white/55 tracking-wide" style={{ fontSize: 'var(--text-body)' }}>Dernières actions</h2>
                </div>

                <div className="space-y-0.5">
                    {logs.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-white/20" style={{ fontSize: 'var(--text-body)' }}>Aucune action enregistrée</p>
                            <p className="text-white/12 mt-0.5" style={{ fontSize: 'var(--text-label)' }}>Cliquez sur "Tester sur un exemple"</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--surface-overlay)] transition-colors"
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'error' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-success)]'
                                        }`} />
                                    <span className="font-mono text-white/20 w-[130px] flex-shrink-0 tabular-nums" style={{ fontSize: 'var(--text-label)' }}>
                                        {log.timestamp}
                                    </span>
                                    <span className={`flex-1 ${log.status === 'error' ? 'text-[var(--color-error)]/70' : 'text-white/45'}`} style={{ fontSize: 'var(--text-body)' }}>
                                        {log.summary}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
