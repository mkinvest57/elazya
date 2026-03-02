/**
 * MissionControl — Premium Dashboard Overview (Phase 4 polished)
 *
 * Uses centralized theme tokens. Counter pulse on value change.
 * Real-time log entry slide-in animation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Clock, Shield, Activity, ArrowUpRight,
    Settings, CheckCircle2, AlertTriangle, Hourglass,
    ExternalLink, Sparkles,
} from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { OpenClawClient } from '@/lib/openclaw-client';
import { getLimitsForPlan, getUpgradeSuggestion } from '@/lib/plan-limits';
import type { ElazyaPlan } from '@/lib/license';

// ─── Animations ─────────────────────────────────────────────
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Stat Card Shell ────────────────────────────────────────
function StatCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            variants={item}
            className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] backdrop-blur-xl transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] group ${className}`}
            style={{ padding: 'var(--space-card-pad)' }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-violet-500/[0.03]" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

// ─── Donut Ring ─────────────────────────────────────────────
function DonutRing({ value, max }: { value: number; max: number }) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(value / max, 1);
    const offset = circumference - pct * circumference;

    return (
        <div className="relative w-[100px] h-[100px] flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--surface-overlay)" strokeWidth="6" />
                <circle
                    cx="50" cy="50" r={radius} fill="none"
                    stroke="url(#donutGrad)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-all duration-700"
                    style={{ transitionTimingFunction: 'var(--ease-out)' }}
                />
                <defs>
                    <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-indigo)" />
                        <stop offset="100%" stopColor="var(--color-violet)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white leading-none">{value}</span>
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider mt-0.5">/ {max}</span>
            </div>
        </div>
    );
}

// ─── Animated counter value ─────────────────────────────────
function PulseValue({ value, className = '' }: { value: string | number; className?: string }) {
    const [pulse, setPulse] = useState(false);
    const prevRef = useRef(value);

    useEffect(() => {
        if (prevRef.current !== value) {
            setPulse(true);
            prevRef.current = value;
            const t = setTimeout(() => setPulse(false), 600);
            return () => clearTimeout(t);
        }
    }, [value]);

    return (
        <span className={`inline-block rounded-lg px-1 -mx-1 transition-colors ${pulse ? 'animate-pulse-value' : ''} ${className}`}>
            {value}
        </span>
    );
}

// ─── Agent name lookup ──────────────────────────────────────
const AGENT_NAMES: Record<string, { name: string; emoji: string }> = {
    'facturation': { name: 'Facturation Auto', emoji: '💰' },
    'onboarding-client': { name: 'Onboarding Client', emoji: '📧' },
    'linkedin-digest': { name: 'LinkedIn Digest', emoji: '📱' },
    'qualification': { name: 'Qualification Leads', emoji: '🎯' },
    'routine-matinale': { name: 'Routine Matinale', emoji: '🏃' },
    'crm-prospect': { name: 'CRM Prospect', emoji: '🎨' },
    'devis-express': { name: 'Devis Express', emoji: '📄' },
    'email-intelligent': { name: 'Email Intelligent', emoji: '💼' },
    'compta-export': { name: 'Compta Export', emoji: '📊' },
    'content-linkedin': { name: 'Content LinkedIn', emoji: '🚀' },
};

// ─── Main Export ─────────────────────────────────────────────
interface MissionControlProps {
    plan: ElazyaPlan;
    activeAgentCount: number;
    onOpenConfig: () => void;
}

export default function MissionControl({ plan, activeAgentCount: initialCount, onOpenConfig }: MissionControlProps) {
    const limits = getLimitsForPlan(plan);
    const [activeCount, setActiveCount] = useState(initialCount);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [errorCount, setErrorCount] = useState(0);

    const loadData = useCallback(async () => {
        const count = await OpenClawClient.getActiveAgentCount();
        setActiveCount(count);
        const logs = await OpenClawClient.getRecentLogs(20);
        setRecentLogs(logs);
        setErrorCount(logs.filter((l: any) => l.status === 'error').length);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const unlisten = listen<any>('agent-action', () => loadData());
        return () => { unlisten.then(fn => fn()); };
    }, [loadData]);

    const weeklyHours = activeCount * 2;
    const monthlyHours = weeklyHours * 4;

    return (
        <motion.div variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-5xl"
            style={{ padding: 'var(--space-page)' }}
        >
            {/* ── Header ────────────────────────────────── */}
            <motion.div variants={item} className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-extrabold text-white tracking-tight" style={{ fontSize: 'var(--text-h1)' }}>
                        Mission Control
                    </h1>
                    <p className="text-white/35 mt-1 font-medium" style={{ fontSize: 'var(--text-subtitle)' }}>
                        <PulseValue value={activeCount} /> agent{activeCount !== 1 ? 's' : ''} en service · Plan {limits.label}
                    </p>
                </div>
                <button
                    onClick={onOpenConfig}
                    className="btn-base focus-ring flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] bg-[var(--surface-overlay)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-white/40 hover:text-white/60 font-semibold"
                    style={{ fontSize: 'var(--text-label)' }}
                >
                    <Settings className="w-3.5 h-3.5" />
                    Configuration
                </button>
            </motion.div>

            {/* ── 3 Stat Cards ──────────────────────────── */}
            <div className="grid grid-cols-3 mb-5" style={{ gap: 'var(--space-cards)' }}>
                {/* Card 1: Agents actifs */}
                <StatCard>
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-indigo-bg)] flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-[var(--color-indigo)]" />
                        </div>
                        <h3 className="font-bold text-white/55 tracking-wide" style={{ fontSize: 'var(--text-body)' }}>Agents actifs</h3>
                    </div>
                    <div className="flex items-center gap-5">
                        <DonutRing value={activeCount} max={limits.maxAgents} />
                        <div>
                            <div className="text-3xl font-extrabold text-white">
                                <PulseValue value={activeCount} />
                                <span className="text-sm font-bold text-white/20 ml-1">/ {limits.maxAgents}</span>
                            </div>
                            <div className="text-white/30 mt-1" style={{ fontSize: 'var(--text-label)' }}>agents activés</div>
                            {activeCount >= limits.maxAgents && (
                                <div className="text-amber-400 mt-2 flex items-center gap-1 font-semibold" style={{ fontSize: 'var(--text-label)' }}>
                                    <ArrowUpRight className="w-3 h-3" />
                                    Limite atteinte
                                </div>
                            )}
                        </div>
                    </div>
                </StatCard>

                {/* Card 2: Temps gagné */}
                <StatCard>
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-success-bg)] flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-success)]" />
                        </div>
                        <h3 className="font-bold text-white/55 tracking-wide" style={{ fontSize: 'var(--text-body)' }}>Temps gagné</h3>
                    </div>
                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 leading-tight">
                        <PulseValue value={monthlyHours} className="bg-clip-text" />h
                        <span className="text-lg font-bold text-white/20 bg-clip-text bg-none ml-1">/mois</span>
                    </div>
                    <div className="text-white/30 mt-1.5" style={{ fontSize: 'var(--text-label)' }}>
                        ~ {weeklyHours}h / semaine avec {activeCount} agent{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-end gap-[3px] mt-4 h-5">
                        {[40, 55, 35, 65, 50, 80, 70, 90, 60, 75, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 rounded-sm bg-emerald-500/15" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </StatCard>

                {/* Card 3: État général */}
                <StatCard>
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-violet-bg)] flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5 text-[var(--color-violet)]" />
                        </div>
                        <h3 className="font-bold text-white/55 tracking-wide" style={{ fontSize: 'var(--text-body)' }}>État général</h3>
                    </div>
                    <div className="space-y-2.5">
                        {[
                            { icon: CheckCircle2, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-bg)]', label: 'Agents OK', value: `${activeCount} / ${activeCount}` },
                            { icon: AlertTriangle, color: errorCount > 0 ? 'text-[var(--color-warning)]' : 'text-white/20', bg: errorCount > 0 ? 'bg-[var(--color-warning-bg)]' : 'bg-white/[0.03]', label: 'Erreurs récentes', value: errorCount === 0 ? 'Aucune' : `${errorCount}` },
                            { icon: Hourglass, color: 'text-white/20', bg: 'bg-white/[0.03]', label: 'Tâches en attente', value: 'Aucune' },
                        ].map((r, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-md ${r.bg} flex items-center justify-center`}>
                                    <r.icon className={`w-3 h-3 ${r.color}`} />
                                </div>
                                <span className="flex-1 text-white/45" style={{ fontSize: 'var(--text-body)' }}>{r.label}</span>
                                <span className="font-semibold text-white/70" style={{ fontSize: 'var(--text-body)' }}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                </StatCard>
            </div>

            {/* ── Activity Feed ─────────────────────────── */}
            <motion.div variants={item}
                className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] backdrop-blur-xl mb-5"
                style={{ padding: 'var(--space-card-pad)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-violet-bg)] flex items-center justify-center">
                            <Activity className="w-3.5 h-3.5 text-[var(--color-violet)]" />
                        </div>
                        <h3 className="font-bold text-white/55 tracking-wide" style={{ fontSize: 'var(--text-body)' }}>Activité récente</h3>
                    </div>
                    <span className="text-white/20 font-medium" style={{ fontSize: 'var(--text-label)' }}>
                        {recentLogs.length} entrée{recentLogs.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="space-y-0.5">
                    {recentLogs.length === 0 ? (
                        <div className="text-center py-10">
                            <Sparkles className="w-7 h-7 text-white/[0.05] mx-auto mb-2.5" />
                            <p className="text-white/20 font-medium" style={{ fontSize: 'var(--text-body)' }}>Aucune activité</p>
                            <p className="text-white/12 mt-0.5" style={{ fontSize: 'var(--text-label)' }}>Activez un agent et testez-le</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {recentLogs.map((log: any) => {
                                const agentInfo = AGENT_NAMES[log.agent_id] || { name: log.agent_id, emoji: '🤖' };
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--surface-overlay)] transition-colors"
                                    >
                                        <span className="font-mono text-white/20 w-[130px] flex-shrink-0 tabular-nums" style={{ fontSize: 'var(--text-label)' }}>
                                            {log.timestamp}
                                        </span>
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'error' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-success)]'
                                            }`} />
                                        <span className="text-sm flex-shrink-0">{agentInfo.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-white/55" style={{ fontSize: 'var(--text-body)' }}>{agentInfo.name}</span>
                                            <span className="text-white/30 ml-2" style={{ fontSize: 'var(--text-body)' }}>{log.summary}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>

            {/* ── Upgrade Card ──────────────────────────── */}
            {(() => {
                const suggestion = getUpgradeSuggestion(plan);
                if (!suggestion) return null;
                return (
                    <motion.div
                        variants={item}
                        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-indigo-500/10 bg-gradient-to-r from-indigo-500/[0.03] via-violet-500/[0.02] to-indigo-500/[0.03] p-5"
                    >
                        <div className="absolute -right-16 -top-16 w-40 h-40 bg-indigo-500/[0.06] rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-indigo-500/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-[var(--color-indigo)]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white" style={{ fontSize: 'var(--text-body)' }}>Débloquez plus d'agents</h4>
                                    <p className="text-white/30 mt-0.5" style={{ fontSize: 'var(--text-label)' }}>{suggestion.benefits} — {suggestion.price}€</p>
                                </div>
                            </div>
                            <a
                                href={`https://elazya.com/checkout?plan=upgrade-${plan === 'solo' ? 'solo-pro' : 'pro-business'}&source=app`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-base focus-ring px-4 py-2 rounded-[var(--radius-md)] bg-indigo-500/12 text-[var(--color-indigo)] font-bold hover:bg-indigo-500/20 flex items-center gap-1.5 ring-1 ring-indigo-500/15 whitespace-nowrap"
                                style={{ fontSize: 'var(--text-label)' }}
                            >
                                Voir les plans
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </motion.div>
                );
            })()}
        </motion.div>
    );
}
