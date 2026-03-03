/**
 * AgentDetail — Agent Detail Page (Phase 4 polished)
 *
 * Uses centralized theme tokens. Polished toggle, button press,
 * log slide-in, focus rings, input states.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Play, Save, Copy,
    FolderOpen, ToggleLeft, ToggleRight,
    ChevronRight, Sparkles, Zap, Loader2, Beaker,
    Users, Building2, FileText
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
    options?: { value: string; label: string }[] | string[];
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
        { id: 'calendly_url', label: 'Lien de rendez-vous (Calendly)', type: 'text', placeholder: 'https://calendly.com/votre-profil' },
        { id: 'notion_sync', label: 'Activer l\'enregistrement CRM (Notion)', type: 'toggle' },
        { id: 'notion_db', label: 'ID Base de données Notion', type: 'text', placeholder: 'ID de la base prospects' },
    ],
    'linkedin-digest': [
        { id: 'themes', label: 'Thèmes / Angle (séparés par des virgules)', type: 'text', placeholder: 'Ex: IA en agence, SEO, React' },
        { id: 'schedule_time', label: 'Heure d\'exécution quotidienne', type: 'text', placeholder: '08:00' },
        { id: 'post_tone', label: 'Ton des publications', type: 'select', options: ['Inspirant', 'Éducatif', 'Storytelling', 'Provocateur'] },
    ],
    'qualification': [
        { id: 'hot_threshold', label: 'Score minimum (Lead Chaud) %', type: 'text', placeholder: 'Ex: 80' },
        { id: 'calendly_url', label: 'Lien Calendly (pour leads chauds)', type: 'text', placeholder: 'https://calendly.com/vous' },
        { id: 'notion_sync', label: 'Ajouter les leads tièdes/froids à Notion', type: 'toggle' },
    ],
    'routine-matinale': [
        { id: 'send_time', label: 'Heure d\'exécution quotidienne', type: 'text', placeholder: '07:30' },
        { id: 'include_calendar', label: 'Inclure le calendrier', type: 'toggle' },
        { id: 'include_emails', label: 'Inclure le résumé des emails', type: 'toggle' },
    ],
    'crm-prospect': [
        { id: 'watch_folder', label: 'Dossier à surveiller', type: 'text', placeholder: '~/Downloads/Prospects' },
        { id: 'notion_db_id', label: 'Base de données Notion (ID)', type: 'text', placeholder: 'xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
        { id: 'auto_tag', label: 'Création automatique (Notion)', type: 'toggle' },
    ],
    'devis-express': [
        { id: 'watch_folder', label: 'Dossier des briefs (à surveiller)', type: 'text', placeholder: '~/Documents/Briefs' },
        { id: 'tarifs', label: 'Grille tarifaire de base', type: 'text', placeholder: 'Site vitrine : 2500€, Logo : 800€, Taux horaire : 500€' },
        { id: 'auto_draft', label: 'Préparer le brouillon email Auto', type: 'toggle' },
    ],
    'email-intelligent': [
        { id: 'watch_folder', label: 'Boîte aux lettres', type: 'text', placeholder: 'Apple Mail (Inbox)' },
        { id: 'keywords', label: 'Mots-clés urgents', type: 'text', placeholder: 'urgent, asap, erreur, plantage, facture' },
        { id: 'auto_draft', label: 'Créer les brouillons automatiquement', type: 'toggle' },
    ],
    'compta-export': [
        { id: 'watch_folder', label: 'Dossier Factures', type: 'text', placeholder: '~/Documents/Factures' },
        { id: 'email_comptable', label: 'Email Expert-Comptable', type: 'text', placeholder: 'expert@cabinet.fr' },
        {
            id: 'format', label: 'Format d\'export', type: 'select', options: [
                { value: 'Pennylane', label: 'Pennylane (CSV)' },
                { value: 'Indy', label: 'Indy (CSV)' },
                { value: 'Standard', label: 'Standard (SCV)' }
            ]
        }
    ],
    'content-linkedin': [
        { id: 'idea', label: 'Idée ou Thème de la semaine', type: 'text', placeholder: 'Ex: L\'importance de l\'automatisation...' },
        { id: 'auto_schedule', label: 'Générer automatiquement le lundi', type: 'toggle' },
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
                                            value={settings[field.id] || (field.options?.[0] && typeof field.options[0] === 'object' ? (field.options[0] as any).value : field.options?.[0]) || ''}
                                            onChange={(e) => updateSetting(field.id, e.target.value)}
                                            className="input-base focus-ring w-full px-3 py-2 text-white/60 outline-none appearance-none"
                                            style={{ fontSize: 'var(--text-body)' }}
                                        >
                                            {field.options?.map((opt: any, i: number) => {
                                                const value = typeof opt === 'string' ? opt : opt.value;
                                                const label = typeof opt === 'string' ? opt : opt.label;
                                                return <option key={value || i} value={value} className="bg-zinc-900">{label}</option>;
                                            })}
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
                                {agent.id === 'onboarding-client' && testDetails.generated_response && (
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-white/5 rounded-lg p-4 pb-3">
                                            <div className="text-[10px] text-[var(--color-success)] uppercase font-bold mb-2 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3 h-3" /> Brouillon d'email préparé
                                            </div>
                                            <p className="text-sm text-white/70 italic leading-relaxed whitespace-pre-wrap">
                                                "{testDetails.generated_response}"
                                            </p>
                                        </div>

                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="text-[10px] text-white/30 uppercase font-bold mb-2 flex items-center gap-1.5">
                                                <FolderOpen className="w-3 h-3" /> Informations CRM Extraites
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div><span className="text-white/40">Nom :</span> <span className="text-white/80 font-medium">{testDetails.prospect_name}</span></div>
                                                <div><span className="text-white/40">Société :</span> <span className="text-white/80 font-medium">{testDetails.company}</span></div>
                                                <div><span className="text-white/40">Projet :</span> <span className="text-white/80 font-medium">{testDetails.project_type}</span></div>
                                                <div><span className="text-white/40">Budget :</span> <span className="text-white/80 font-medium">{testDetails.budget}</span></div>
                                                <div><span className="text-white/40">Délais :</span> <span className="text-white/80 font-medium">{testDetails.deadline}</span></div>
                                                <div><span className="text-white/40">Intérêt :</span>
                                                    <span className={`ml-1 font-medium ${testDetails.interest_level?.toLowerCase() === 'chaud' ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                                                        {testDetails.interest_level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* LinkedIn Digest */}
                                {agent.id === 'linkedin-digest' && testDetails.post && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-[10px] text-[var(--color-indigo)] uppercase font-bold flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3" /> Post généré du jour
                                            </div>
                                            <button onClick={() => navigator.clipboard.writeText(testDetails.post)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white/80 transition-colors bg-white/5 px-2 py-1 rounded"
                                            >
                                                <Copy className="w-3 h-3" /> Copier
                                            </button>
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
                                            <div className="border-t border-white/5 pt-4 mt-2">
                                                <div className="text-[10px] text-white/40 uppercase font-bold mb-3 flex items-center gap-1.5">
                                                    <ToggleRight className="w-3 h-3" /> Commentaires suggérés
                                                </div>
                                                <ul className="space-y-3">
                                                    {testDetails.comments.map((comment: string, i: number) => (
                                                        <li key={i} className="text-xs flex items-start justify-between gap-3 bg-black/20 p-2.5 rounded border border-white/5">
                                                            <span className="text-white/60 italic leading-relaxed">
                                                                <span className="text-white/20 mr-1 not-italic">💬</span> {comment}
                                                            </span>
                                                            <button onClick={() => navigator.clipboard.writeText(comment)}
                                                                className="flex items-center gap-1 text-[10px] font-bold text-white/30 hover:text-white/70 transition-colors shrink-0 pt-0.5"
                                                            >
                                                                <Copy className="w-3 h-3" /> Copier
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Qualification Leads */}
                                {agent.id === 'qualification' && testDetails.score !== undefined && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-3">
                                            {/* Score Gauge */}
                                            <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex-shrink-0 w-32 border border-white/5">
                                                <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">Score Lead</div>
                                                <div className={`text-4xl font-black mb-1 ${testDetails.score >= 80 ? 'text-[var(--color-success)] drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]' :
                                                    testDetails.score >= 40 ? 'text-[var(--color-warning)] drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]' :
                                                        'text-white/40'
                                                    }`}>
                                                    {testDetails.score}
                                                </div>
                                                <div className="flex items-center justify-center gap-1.5 mt-1">
                                                    {testDetails.score >= 80 ? (
                                                        <><Zap className="w-3 h-3 text-[var(--color-success)]" /><span className="text-[10px] uppercase font-bold text-[var(--color-success)]">Chaud</span></>
                                                    ) : testDetails.score >= 40 ? (
                                                        <span className="text-[10px] uppercase font-bold text-[var(--color-warning)]">Tiède</span>
                                                    ) : (
                                                        <span className="text-[10px] uppercase font-bold text-white/40">Froid</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Attributes */}
                                            <div className="bg-white/5 rounded-lg p-4 flex-1 border border-white/5 hidden sm:block">
                                                <div className="text-[10px] text-white/30 uppercase font-bold mb-3 flex items-center gap-1.5">
                                                    <Beaker className="w-3 h-3" /> Analyse LLM
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center bg-black/20 px-2.5 py-1.5 rounded">
                                                        <span className="text-xs text-white/50">Budget estimé</span>
                                                        <span className="text-sm font-medium text-white/80">{testDetails.budget}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-black/20 px-2.5 py-1.5 rounded">
                                                        <span className="text-xs text-white/50">Délai projet</span>
                                                        <span className="text-sm font-medium text-white/80">{testDetails.delai}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Recommended */}
                                        <div className="bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent rounded-lg p-3 border-l-2 border-l-[var(--color-indigo)] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-indigo)] opacity-5 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                                            <div className="text-[10px] text-[var(--color-indigo)] uppercase font-bold mb-1 flex items-center gap-1.5">
                                                Action suggérée : <span className="text-white/80">{testDetails.action}</span>
                                            </div>
                                            <p className="text-xs text-white/60 italic leading-relaxed mt-2 pr-4 pl-1">
                                                "{testDetails.raison}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Routine Matinale Auto */}
                                {agent.id === 'routine-matinale' && testDetails.brief_markdown && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-[10px] text-[var(--color-success)] uppercase font-bold flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3 h-3" /> Briefing Matinal Généré
                                            </div>
                                            <button onClick={() => navigator.clipboard.writeText(testDetails.brief_markdown)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white/80 transition-colors bg-white/5 px-2 py-1 rounded"
                                            >
                                                <Copy className="w-3 h-3" /> Copier
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-black/20 rounded p-3 text-center border border-white/5">
                                                <div className="text-2xl font-black text-[var(--color-warning)] mb-1">
                                                    {testDetails.urgent_emails_count}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-white/40">Emails Urgents</div>
                                            </div>
                                            <div className="bg-black/20 rounded p-3 flex flex-col items-center justify-center border border-white/5 text-center">
                                                <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Priorité du Jour</div>
                                                <div className="text-sm font-medium text-[var(--color-indigo)] leading-snug">
                                                    {testDetails.top_priority}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-black/30 rounded p-3 border border-white/5 max-h-64 overflow-y-auto custom-scrollbar">
                                            <p className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed font-mono">
                                                {testDetails.brief_markdown}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* CRM Prospect Auto */}
                                {agent.id === 'crm-prospect' && testDetails.contacts && (
                                    <div className="bg-white/5 rounded-lg p-0 overflow-hidden border border-white/5">
                                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                                            <div className="flex flex-col">
                                                <div className="text-[10px] text-[var(--color-violet)] uppercase font-bold flex items-center gap-1.5 mb-1">
                                                    <Users className="w-3 h-3" /> Contacts Extraits
                                                </div>
                                                <div className="text-sm font-medium text-white/80">
                                                    Fichier : <span className="font-mono text-white/50 text-xs">{testDetails.file}</span>
                                                </div>
                                            </div>
                                            <div className="bg-[var(--color-violet)]/20 text-[var(--color-violet)] px-2.5 py-1 rounded text-xs font-bold border border-[var(--color-violet)]/30">
                                                {testDetails.total_extracted} trouvés
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30 bg-black/30">
                                                        <th className="px-4 py-2 font-medium">Nom</th>
                                                        <th className="px-4 py-2 font-medium">Email</th>
                                                        <th className="px-4 py-2 font-medium">Société</th>
                                                        <th className="px-4 py-2 font-medium text-right">Action Notion</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {testDetails.contacts.map((c: any, i: number) => (
                                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-4 py-2.5 font-medium text-white/80">{c.nom || '-'}</td>
                                                            <td className="px-4 py-2.5 text-white/50">{c.email || '-'}</td>
                                                            <td className="px-4 py-2.5 text-white/50 flex items-center gap-1.5">
                                                                <Building2 className="w-3 h-3 text-white/20" /> {c.societe || '-'}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${c.status === 'Créé'
                                                                    ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20'
                                                                    : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20'
                                                                    }`}>
                                                                    {c.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Devis Express Auto */}
                                {agent.id === 'devis-express' && testDetails.quote_markdown && (
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-[10px] text-[var(--color-success)] uppercase font-bold flex items-center gap-1.5">
                                                <FileText className="w-3 h-3" /> Devis Généré
                                            </div>
                                            <button onClick={() => navigator.clipboard.writeText(testDetails.quote_markdown)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white/80 transition-colors bg-white/5 px-2 py-1 rounded"
                                            >
                                                <Copy className="w-3 h-3" /> Copier le Markdown
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-black/20 rounded p-3 text-center border border-white/5">
                                                <div className="text-sm font-medium text-[var(--color-warning)] mb-1">
                                                    {testDetails.parsed_brief?.budget || 'Non précisé'}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-white/40">Budget Identifié</div>
                                            </div>
                                            <div className="bg-black/20 rounded p-3 text-center border border-white/5">
                                                <div className="text-sm font-medium text-[var(--color-indigo)] mb-1">
                                                    {testDetails.parsed_brief?.delai || 'Non précisé'}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-white/40">Délai Estimé</div>
                                            </div>
                                        </div>

                                        <div className="bg-black/30 rounded p-3 border border-white/5 max-h-64 overflow-y-auto custom-scrollbar">
                                            <p className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed font-mono">
                                                {testDetails.quote_markdown}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Email Intelligent Auto */}
                                {agent.id === 'email-intelligent' && testDetails.counts && (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="bg-white/5 border border-[var(--color-error)]/20 rounded-lg p-3 text-center">
                                                <div className="text-xl font-bold text-[var(--color-error)] mb-0.5">{testDetails.counts.urgent}</div>
                                                <div className="text-[9px] uppercase font-bold text-white/40">Urgents</div>
                                            </div>
                                            <div className="bg-white/5 border border-[var(--color-warning)]/20 rounded-lg p-3 text-center">
                                                <div className="text-xl font-bold text-[var(--color-warning)] mb-0.5">{testDetails.counts.todo}</div>
                                                <div className="text-[9px] uppercase font-bold text-white/40">À Faire</div>
                                            </div>
                                            <div className="bg-white/5 border border-[var(--color-indigo)]/20 rounded-lg p-3 text-center">
                                                <div className="text-xl font-bold text-[var(--color-indigo)] mb-0.5">{testDetails.counts.draft}</div>
                                                <div className="text-[9px] uppercase font-bold text-white/40">Brouillons</div>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center opacity-50">
                                                <div className="text-xl font-bold text-white mb-0.5">{testDetails.counts.spam}</div>
                                                <div className="text-[9px] uppercase font-bold text-white/40">Spam</div>
                                            </div>
                                        </div>

                                        <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                            <div className="px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Mails Traités</span>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                                {testDetails.processed?.map((item: any, i: number) => {
                                                    const cat = item.analysis.categorie || '';
                                                    let dotColor = 'bg-white/20';
                                                    if (cat.includes('Urgent')) dotColor = 'bg-[var(--color-error)] shadow-[0_0_8px_var(--color-error)]';
                                                    else if (cat.includes('faire')) dotColor = 'bg-[var(--color-warning)]';
                                                    else if (cat.includes('simple')) dotColor = 'bg-[var(--color-indigo)]';

                                                    return (
                                                        <div key={i} className="p-3 hover:bg-white/[0.02] transition-colors">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-0.5">
                                                                        <span className="text-xs font-medium text-white/90 truncate pr-2">
                                                                            {item.original.sender}
                                                                        </span>
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 whitespace-nowrap">
                                                                            {item.analysis.action_suggeree}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-white/60 truncate mb-1.5">
                                                                        {item.original.subject}
                                                                    </div>
                                                                    {item.analysis.draft_genere && (
                                                                        <div className="mt-2 bg-black/40 border border-white/5 rounded p-2 relative group">
                                                                            <p className="text-[11px] text-white/50 italic leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                                                                                <span className="text-[var(--color-indigo)] font-bold non-italic">↳ Draft : </span>
                                                                                "{item.analysis.draft_genere}"
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Compta Export Auto */}
                                {agent.id === 'compta-export' && testDetails.factures && (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-white/5 border border-[var(--color-success)]/20 rounded-lg p-3 text-center">
                                                <div className="text-xl font-bold text-[var(--color-success)] mb-0.5">{testDetails.factures.length}</div>
                                                <div className="text-[9px] uppercase font-bold text-white/40">Factures Période</div>
                                            </div>
                                            <div className="bg-white/5 border border-[var(--color-primary)]/20 rounded-lg p-3 text-center">
                                                <div className="text-xl font-bold text-[var(--color-primary)] mb-0.5">{testDetails.total_ht} €</div>
                                                <div className="text-[9px] uppercase font-bold text-white/40">CA Total HT</div>
                                            </div>
                                            <div className="bg-white/5 border border-[var(--color-indigo)]/20 rounded-lg p-3 text-center">
                                                <div className="text-xl font-bold text-[var(--color-indigo)] mb-0.5">{testDetails.total_tva} €</div>
                                                <div className="text-[9px] uppercase font-bold text-white/40">TVA Collectée</div>
                                            </div>
                                        </div>

                                        <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                            <div className="px-3 py-2 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Aperçu CSV ({testDetails.format || 'Standard'})</span>
                                                <span className="text-[10px] text-[var(--color-primary)] font-medium">~/Desktop/Compta_Export</span>
                                            </div>
                                            <div className="max-h-64 overflow-x-auto overflow-y-auto custom-scrollbar">
                                                <table className="w-full text-left text-xs whitespace-nowrap">
                                                    <thead className="bg-white/5 text-white/40 uppercase text-[9px] sticky top-0 backdrop-blur-md">
                                                        <tr>
                                                            <th className="px-3 py-2 font-medium">N° Facture</th>
                                                            <th className="px-3 py-2 font-medium">Client</th>
                                                            <th className="px-3 py-2 font-medium">Date</th>
                                                            <th className="px-3 py-2 font-medium text-right">HT</th>
                                                            <th className="px-3 py-2 font-medium text-right">TVA</th>
                                                            <th className="px-3 py-2 font-medium text-right">TTC</th>
                                                            <th className="px-3 py-2 font-medium">Statut</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-white/70">
                                                        {testDetails.factures.map((f: any, i: number) => (
                                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-3 py-2 font-mono text-[10px] text-white/50">{f.num}</td>
                                                                <td className="px-3 py-2 font-medium text-white/90">{f.client}</td>
                                                                <td className="px-3 py-2">{f.date}</td>
                                                                <td className="px-3 py-2 text-right">{f.ht} €</td>
                                                                <td className="px-3 py-2 text-right text-white/40">{f.tva} €</td>
                                                                <td className="px-3 py-2 text-right text-[var(--color-success)] font-bold">{f.ttc} €</td>
                                                                <td className="px-3 py-2">
                                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${f.statut?.toLowerCase().includes('pay') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                                                        {f.statut}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Content LinkedIn Auto */}
                                {agent.id === 'content-linkedin' && testDetails.posts && (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                            <div className="text-sm font-medium text-white/90">
                                                5 variations générées
                                            </div>
                                            <div className="text-[10px] text-white/40 font-mono flex items-center gap-1.5">
                                                <FolderOpen className="w-3 h-3" />
                                                ~/Desktop/LinkedIn_Content
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                            {testDetails.posts.map((post: any, i: number) => {
                                                const typeColors: Record<string, string> = {
                                                    'question': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                                                    'liste': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                                    'hottake': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                                                    'story': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                                    'data': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                                                };

                                                const tColor = typeColors[post.type?.toLowerCase()] || 'text-white/60 bg-white/5 border-white/10';

                                                return (
                                                    <div key={i} className="group relative bg-black/40 border border-white/5 rounded-xl p-3 hover:border-white/20 transition-all overflow-hidden flex flex-col items-start gap-2 h-[200px]">
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${tColor}`}>
                                                                {post.type}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(`${post.title}\n\n${post.content}\n\n${post.hashtags}`);
                                                                    // Flash effect would be nice here, but simple alert for the demo
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all active:scale-95"
                                                                title="Copier le post complet"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="text-xs font-bold text-white/90 line-clamp-2 mt-1">
                                                            {post.title}
                                                        </div>

                                                        <div className="text-[11px] text-white/60 line-clamp-4 flex-1 whitespace-pre-wrap font-mono leading-relaxed mt-1">
                                                            {post.content}
                                                        </div>

                                                        <div className="text-[10px] text-[var(--color-primary)] font-medium mt-auto w-full truncate">
                                                            {post.hashtags}
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
            </motion.div >
        </motion.div >
    );
}
