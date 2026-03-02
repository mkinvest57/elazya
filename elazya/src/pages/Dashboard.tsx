/**
 * Dashboard — Elazya (Phase 4 polished)
 *
 * Main layout with polished sidebar using theme tokens.
 * Smooth nav transitions, hover states, btn-base on all buttons.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Shield, BarChart3,
    MessageCircle, Plus,
} from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { OpenClawClient } from '@/lib/openclaw-client';
import { getCurrentPlan, type ElazyaPlan } from '@/lib/license';
import {
    getAvailableAgents, getLockedAgents,
    getLimitsForPlan,
    type AgentDef
} from '@/lib/plan-limits';

import ChatPanel from '@/components/panels/ChatPanel';
import ConfigPanel from '@/components/panels/ConfigPanel';
import MissionControl from '@/components/MissionControl';
import AgentDetail from '@/components/AgentDetail';

// ─── Tier Badge ─────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
    solo: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-ring)]',
    pro: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-amber-500/20',
    business: 'bg-[var(--color-indigo-bg)] text-[var(--color-indigo)] border-indigo-500/20',
};

function TierBadgeSmall({ tier }: { tier: string }) {
    return (
        <span className={`px-1.5 py-px rounded font-bold uppercase tracking-wider border ${TIER_COLORS[tier] || TIER_COLORS.solo}`}
            style={{ fontSize: '9px' }}>
            {tier === 'solo' ? 'Core' : tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
    );
}

type DashboardView = 'overview' | 'agent' | 'chat' | 'config';

export default function Dashboard() {
    const [plan, setPlan] = useState<ElazyaPlan>('solo');
    const [view, setView] = useState<DashboardView>('overview');
    const [selectedAgent, setSelectedAgent] = useState<AgentDef | null>(null);
    const [activeAgentCount, setActiveAgentCount] = useState(0);
    const [engineStatus, setEngineStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [agentStatuses, setAgentStatuses] = useState<Record<string, boolean>>({});

    const loadAgentStatuses = useCallback(async () => {
        const available = getAvailableAgents(plan);
        const statuses: Record<string, boolean> = {};
        for (const agent of available) {
            const config = await OpenClawClient.getAgentConfig(agent.id);
            statuses[agent.id] = config?.enabled ?? false;
        }
        setAgentStatuses(statuses);
        setActiveAgentCount(Object.values(statuses).filter(Boolean).length);
    }, [plan]);

    useEffect(() => {
        getCurrentPlan().then(p => { if (p) setPlan(p); });
        const unsub = OpenClawClient.onStatusChange((status) => setEngineStatus(status));
        return unsub;
    }, []);

    useEffect(() => { loadAgentStatuses(); }, [loadAgentStatuses]);

    useEffect(() => {
        const unlisten = listen<any>('agent-action', (event) => {
            if (event.payload?.type === 'toggle') {
                setAgentStatuses(prev => ({ ...prev, [event.payload.agentId]: event.payload.enabled }));
                setActiveAgentCount(prev => event.payload.enabled ? prev + 1 : Math.max(0, prev - 1));
            }
        });
        return () => { unlisten.then(fn => fn()); };
    }, []);

    const limits = getLimitsForPlan(plan);
    const available = getAvailableAgents(plan);
    const locked = getLockedAgents(plan);

    function openAgent(agent: AgentDef) { setSelectedAgent(agent); setView('agent'); }
    function goOverview() { setSelectedAgent(null); setView('overview'); }

    function NavItem({ icon: Icon, label, viewKey }: { icon: React.ElementType; label: string; viewKey: DashboardView }) {
        const active = view === viewKey;
        return (
            <button
                onClick={() => { setView(viewKey); setSelectedAgent(null); }}
                className={`btn-base focus-ring w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-left font-medium ${active
                        ? 'bg-[var(--surface-active)] text-white'
                        : 'text-white/35 hover:bg-[var(--surface-overlay)] hover:text-white/55'
                    }`}
                style={{ fontSize: 'var(--text-body)' }}
            >
                <Icon className="w-4 h-4" />
                {label}
            </button>
        );
    }

    return (
        <div className="w-full h-full flex">
            {/* ════════════════ SIDEBAR ════════════════ */}
            <div className="w-[250px] border-r border-[var(--border-subtle)] flex flex-col bg-black/30 backdrop-blur-sm">

                {/* ── Logo + Plan ──────────────────────── */}
                <div className="px-5 pt-5 pb-3.5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-lg font-extrabold text-white tracking-tight">Elazya</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${limits.badgeColor}`}
                            style={{ fontSize: '10px' }}>
                            {limits.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/20 font-medium" style={{ fontSize: 'var(--text-label)' }}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${engineStatus === 'connected' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'
                            }`}
                            style={{ transitionDuration: 'var(--duration-normal)' }}
                        />
                        {engineStatus === 'connected' ? 'Moteur en ligne' : 'Moteur hors ligne'}
                    </div>
                </div>

                {/* ── Navigation ───────────────────────── */}
                <div className="px-3 pt-3 pb-1.5 space-y-0.5">
                    <NavItem icon={BarChart3} label="Mission Control" viewKey="overview" />
                    <NavItem icon={MessageCircle} label="Chat" viewKey="chat" />
                    <NavItem icon={Settings} label="Configuration" viewKey="config" />
                </div>

                <div className="mx-4 my-1 h-px bg-[var(--border-subtle)]" />

                {/* ── Agent List ───────────────────────── */}
                <div className="flex-1 overflow-y-auto px-3 pt-1 pb-2">
                    <div className="px-2 py-1.5 font-bold text-white/15 uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>
                        Agents
                    </div>

                    {available.map((agent) => {
                        const isActive = agentStatuses[agent.id] ?? false;
                        const isSelected = view === 'agent' && selectedAgent?.id === agent.id;

                        return (
                            <button
                                key={agent.id}
                                onClick={() => openAgent(agent)}
                                className={`btn-base focus-ring w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-[var(--radius-md)] text-left group mb-px transition-all ${isSelected ? 'bg-[var(--surface-active)]' : 'hover:bg-[var(--surface-overlay)]'
                                    }`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all ${isSelected ? 'bg-[var(--color-indigo-bg)] ring-1 ring-indigo-500/15' : 'bg-[var(--surface-overlay)]'
                                    }`}
                                    style={{ transitionDuration: 'var(--duration-fast)' }}
                                >
                                    {agent.emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-medium truncate transition-colors ${isSelected ? 'text-white' : 'text-white/45 group-hover:text-white/65'
                                        }`}
                                        style={{ fontSize: 'var(--text-body)', transitionDuration: 'var(--duration-fast)' }}
                                    >
                                        {agent.name}
                                    </div>
                                    <div className="mt-px">
                                        <TierBadgeSmall tier={agent.tier} />
                                    </div>
                                </div>
                                <motion.div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    animate={{
                                        backgroundColor: isActive ? 'var(--color-success)' : 'rgba(255,255,255,0.08)',
                                        boxShadow: isActive ? '0 0 6px rgba(52,211,153,0.4)' : '0 0 0px transparent',
                                    }}
                                    transition={{ duration: 0.2 }}
                                />
                            </button>
                        );
                    })}

                    {locked.length > 0 && (
                        <>
                            <div className="px-2 py-1.5 mt-2.5 font-bold text-white/12 uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>
                                Verrouillés
                            </div>
                            {locked.map((agent) => (
                                <div key={agent.id}
                                    className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[var(--radius-md)] opacity-30 cursor-not-allowed mb-px"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-overlay)] flex items-center justify-center text-sm flex-shrink-0">
                                        {agent.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white/25 truncate" style={{ fontSize: 'var(--text-body)' }}>{agent.name}</div>
                                        <div className="mt-px"><TierBadgeSmall tier={agent.tier} /></div>
                                    </div>
                                    <Shield className="w-3 h-3 text-white/12 flex-shrink-0" />
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* ── Add agent ────────────────────────── */}
                <div className="px-3 pb-3 pt-1">
                    <button className="btn-base focus-ring w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] text-white/20 hover:text-white/35 hover:border-[var(--border-default)] font-medium"
                        style={{ fontSize: 'var(--text-body)' }}>
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter un agent
                    </button>
                </div>
            </div>

            {/* ════════════════ MAIN CONTENT ════════════════ */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {view === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }} className="h-full overflow-y-auto">
                            <MissionControl plan={plan} activeAgentCount={activeAgentCount} onOpenConfig={() => setView('config')} />
                        </motion.div>
                    )}
                    {view === 'agent' && selectedAgent && (
                        <motion.div key={`agent-${selectedAgent.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }} className="h-full overflow-y-auto">
                            <AgentDetail agent={selectedAgent} onBack={goOverview} />
                        </motion.div>
                    )}
                    {view === 'chat' && (
                        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }} className="h-full">
                            <ChatPanel />
                        </motion.div>
                    )}
                    {view === 'config' && (
                        <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }} className="h-full overflow-y-auto">
                            <ConfigPanel />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
