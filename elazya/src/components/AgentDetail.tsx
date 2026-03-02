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
    ChevronRight, Sparkles, Zap, Loader2,
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

    async function handleRun() {
        setRunning(true);
        try { await OpenClawClient.runAgent(agent.id); }
        catch (e) { console.error('Run agent error:', e); }
        setRunning(false);
    }

    function updateSetting(key: string, value: string) {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

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

                        {/* Run */}
                        <button onClick={handleRun} disabled={running}
                            className="btn-base focus-ring flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--surface-overlay)] border border-[var(--border-subtle)] text-white/35 hover:text-white/55 hover:bg-[var(--surface-hover)] font-semibold disabled:opacity-35"
                            style={{ fontSize: 'var(--text-body)' }}
                        >
                            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            {running ? 'Exécution...' : 'Tester sur un exemple'}
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
