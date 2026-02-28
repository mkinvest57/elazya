/**
 * Mission Control Dashboard — Elazya
 * 
 * Main dashboard with sidebar agent list + dashboard widgets.
 * Replaces the old tab-based Dashboard.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Bot, Clock, ArrowUpRight, Settings,
    ChevronRight, Zap, Shield, Sparkles, BarChart3,
    FileText, Mail, Newspaper, Linkedin, Receipt,
    Users, FolderOpen, PenTool, Calculator, UserPlus,
    MessageCircle, HelpCircle, RefreshCw, Terminal,
    ExternalLink
} from 'lucide-react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { getCurrentPlan, getLicense, type ElazyaPlan } from '@/lib/license';
import {
    ALL_AGENTS, getAvailableAgents, getLockedAgents,
    getLimitsForPlan, getUpgradeSuggestion, canActivateAgent,
    type AgentDef
} from '@/lib/plan-limits';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/panels/ChatPanel';
import ConfigPanel from '@/components/panels/ConfigPanel';

// Icon mapping for agents
const AGENT_ICONS: Record<string, React.ElementType> = {
    FileText, Mail, Newspaper, Linkedin: Linkedin, Receipt,
    Users, FolderOpen, PenTool, Calculator, UserPlus,
};

function getAgentIcon(iconName: string) {
    return AGENT_ICONS[iconName] || Bot;
}

// ---- Activity Log Item ----
interface ActivityItem {
    id: string;
    agent: string;
    action: string;
    time: Date;
    status: 'success' | 'running' | 'error';
}

// ---- Active Agents Widget ----
function ActiveAgentsWidget({ plan, activeCount }: { plan: ElazyaPlan; activeCount: number }) {
    const limits = getLimitsForPlan(plan);
    const percentage = (activeCount / limits.maxAgents) * 100;
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white text-sm">Agents Actifs</h3>
            </div>

            <div className="flex items-center gap-6">
                {/* Donut chart */}
                <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="transform -rotate-90 w-20 h-20" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle
                            cx="40" cy="40" r="36" fill="none"
                            stroke="url(#gradient)" strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-white">{activeCount}</span>
                    </div>
                </div>

                <div>
                    <div className="text-2xl font-black text-white">
                        {activeCount}<span className="text-white/30 text-lg">/{limits.maxAgents}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">agents activés</div>
                    {activeCount >= limits.maxAgents && (
                        <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            Limite atteinte
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ---- Time Saved Widget ----
function TimeSavedWidget({ activeCount }: { activeCount: number }) {
    // Estimate: ~2h/week per active agent
    const weeklyHours = activeCount * 2;
    const monthlyHours = weeklyHours * 4;

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="font-bold text-white text-sm">Temps Gagné</h3>
            </div>

            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                {monthlyHours}h<span className="text-lg text-white/30">/mois</span>
            </div>
            <div className="text-xs text-white/40 mt-1">
                ~{weeklyHours}h par semaine · {activeCount} agent{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </div>
        </div>
    );
}

// ---- Activity Log Widget ----
function ActivityLogWidget({ activities }: { activities: ActivityItem[] }) {
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) return 'à l\'instant';
        if (diff < 3600000) return `il y a ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `il y a ${Math.floor(diff / 3600000)}h`;
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-violet-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Activité récente</h3>
                </div>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {activities.length === 0 ? (
                    <div className="text-center py-8">
                        <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-2" />
                        <p className="text-white/30 text-sm">Aucune activité pour le moment</p>
                        <p className="text-white/20 text-xs mt-1">Vos agents commencent à travailler dès leur activation</p>
                    </div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                item.status === 'success' ? 'bg-green-500' :
                                item.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                                'bg-red-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-white/80">
                                    <span className="font-medium text-white">{item.agent}</span>
                                    {' '}{item.action}
                                </div>
                                <div className="text-xs text-white/30 mt-0.5">{formatTime(item.time)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ---- Upgrade Banner ----
function UpgradeBanner({ plan }: { plan: ElazyaPlan }) {
    const suggestion = getUpgradeSuggestion(plan);
    if (!suggestion) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-violet-500/5"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">{suggestion.label}</h4>
                        <p className="text-xs text-white/40">Débloquez plus d'agents — {suggestion.price}€</p>
                    </div>
                </div>
                <a
                    href={`https://elazya.com/checkout?plan=upgrade-${plan === 'solo' ? 'solo-pro' : 'pro-business'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                >
                    Upgrade
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </motion.div>
    );
}

// ---- Agent List (Sidebar content) ----
function AgentList({ plan, agents, onSelect }: {
    plan: ElazyaPlan;
    agents: AgentDef[];
    onSelect: (agent: AgentDef) => void;
}) {
    const available = getAvailableAgents(plan);
    const locked = getLockedAgents(plan);

    return (
        <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-white/30 uppercase tracking-widest">
                Agents
            </div>
            {available.map((agent) => {
                const Icon = getAgentIcon(agent.icon);
                return (
                    <button
                        key={agent.id}
                        onClick={() => onSelect(agent)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group text-left"
                    >
                        <div className="w-7 h-7 rounded-md bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                            <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <span className="text-sm text-white/70 group-hover:text-white transition-colors flex-1">{agent.name}</span>
                        <div className="w-2 h-2 rounded-full bg-green-500/60" />
                    </button>
                );
            })}
            {locked.length > 0 && (
                <>
                    <div className="px-3 py-2 mt-3 text-xs font-bold text-white/20 uppercase tracking-widest">
                        Verrouillés
                    </div>
                    {locked.map((agent) => {
                        const Icon = getAgentIcon(agent.icon);
                        return (
                            <div
                                key={agent.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed"
                            >
                                <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
                                    <Icon className="w-3.5 h-3.5 text-white/30" />
                                </div>
                                <span className="text-sm text-white/30 flex-1">{agent.name}</span>
                                <Shield className="w-3 h-3 text-white/20" />
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

// ---- Main Dashboard ----
type DashboardView = 'overview' | 'chat' | 'config';

export default function Dashboard() {
    const [plan, setPlan] = useState<ElazyaPlan>('solo');
    const [view, setView] = useState<DashboardView>('overview');
    const [activeAgentCount, setActiveAgentCount] = useState(0);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [engineStatus, setEngineStatus] = useState<'connected' | 'disconnected'>('disconnected');

    // Load plan and status
    useEffect(() => {
        getCurrentPlan().then(p => {
            if (p) setPlan(p);
        });

        // Listen for engine status
        const unsub = OpenClawClient.onStatusChange((status) => {
            setEngineStatus(status);
        });

        // Get installed skills count
        OpenClawClient.getInstalledSkills().then(skills => {
            setActiveAgentCount(skills.length);
        }).catch(() => {});

        return unsub;
    }, []);

    const limits = getLimitsForPlan(plan);

    return (
        <div className="w-full h-full flex">
            {/* Left sidebar */}
            <div className="w-64 border-r border-white/5 flex flex-col bg-black/20">
                {/* Plan badge */}
                <div className="px-4 pt-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-black text-white">Elazya</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${limits.badgeColor}`}>
                            {limits.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/30">
                        <div className={`w-2 h-2 rounded-full ${engineStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {engineStatus === 'connected' ? 'En ligne' : 'Hors ligne'}
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-3 pt-4 space-y-1">
                    <button
                        onClick={() => setView('overview')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm ${
                            view === 'overview' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Mission Control
                    </button>
                    <button
                        onClick={() => setView('chat')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm ${
                            view === 'chat' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                        }`}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                    </button>
                    <button
                        onClick={() => setView('config')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm ${
                            view === 'config' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        Configuration
                    </button>
                </div>

                {/* Agent List */}
                <div className="flex-1 overflow-y-auto px-3 pt-4">
                    <AgentList
                        plan={plan}
                        agents={getAvailableAgents(plan)}
                        onSelect={() => {}}
                    />
                </div>

                {/* Add agent button */}
                {canActivateAgent(plan, activeAgentCount) && (
                    <div className="px-3 pb-4">
                        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-colors text-sm">
                            <Zap className="w-3.5 h-3.5" />
                            Ajouter un agent
                        </button>
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {view === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-8 max-w-4xl mx-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-2xl font-black text-white">Mission Control</h1>
                                    <p className="text-white/40 text-sm mt-1">
                                        {activeAgentCount} agent{activeAgentCount !== 1 ? 's' : ''} en service · Plan {limits.label}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        OpenClawClient.getInstalledSkills().then(skills => {
                                            setActiveAgentCount(skills.length);
                                        }).catch(() => {});
                                    }}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    title="Actualiser"
                                >
                                    <RefreshCw className="w-4 h-4 text-white/40" />
                                </button>
                            </div>

                            {/* Widgets Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <ActiveAgentsWidget plan={plan} activeCount={activeAgentCount} />
                                <TimeSavedWidget activeCount={activeAgentCount} />
                            </div>

                            {/* Activity Log */}
                            <div className="mb-6">
                                <ActivityLogWidget activities={activities} />
                            </div>

                            {/* Upgrade Banner */}
                            <UpgradeBanner plan={plan} />
                        </motion.div>
                    )}

                    {view === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <ChatPanel />
                        </motion.div>
                    )}

                    {view === 'config' && (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full overflow-y-auto"
                        >
                            <ConfigPanel />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
