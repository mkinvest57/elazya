import { useState } from 'react';
import { Activity, HardDrive, Radio, MessageCircle, Settings, Zap, Terminal, Server, Database, HelpCircle } from "lucide-react";
import Sidebar from '@/components/Sidebar';
import { useEffect } from "react";
import { listen } from '@tauri-apps/api/event';
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { motion } from "framer-motion";

// Import panels
import SkillsPanel from '@/components/panels/SkillsPanel';
import ChannelsPanel from '@/components/panels/ChannelsPanel';
import ChatPanel from '@/components/panels/ChatPanel';
import ConfigPanel from '@/components/panels/ConfigPanel';
import TokensPanel from '@/components/panels/TokensPanel';
import HelpPanel from '@/components/panels/HelpPanel';

type PanelType = 'overview' | 'skills' | 'channels' | 'chat' | 'config' | 'tokens' | 'help';

const TABS: { id: PanelType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Aperçu', icon: Activity },
    { id: 'skills', label: 'Skills', icon: HardDrive },
    { id: 'channels', label: 'Canaux', icon: Radio },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'tokens', label: 'Tokens', icon: Zap },
    { id: 'help', label: 'Aide', icon: HelpCircle },
    { id: 'config', label: 'Config', icon: Settings },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`glass-card p-6 relative overflow-hidden group ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="relative z-10">{children}</div>
        </div>
    );
}

function OverviewPanel() {
    const [logs, setLogs] = useState<string[]>([]);
    const [uptime, setUptime] = useState<number>(0);

    useEffect(() => {
        setLogs([
            "[SYSTÈME] Interface Elazya Initialisée.",
            "[SYSTÈME] Connexion au moteur OpenClaw...",
        ]);

        const unlisten = listen('engine-log', (event: any) => {
            setLogs(prev => [event.payload, ...prev].slice(0, 100));
        });

        const interval = setInterval(() => setUptime(u => u + 1), 1000);

        return () => {
            unlisten.then(f => f());
            clearInterval(interval);
        }
    }, []);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 ring-1 ring-indigo-500/20">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">Actif</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">État du Moteur</p>
                    <p className="text-3xl font-bold text-white tracking-tight">Opérationnel</p>
                    <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/50 w-full animate-pulse"></div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 ring-1 ring-violet-500/20">
                            <Server className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Temps de Session</p>
                    <p className="text-3xl font-bold text-white tracking-tight font-mono">
                        {formatUptime(uptime)}
                    </p>
                </GlassCard>

                <GlassCard>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400 ring-1 ring-fuchsia-500/20">
                            <Database className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Utilisation Mémoire</p>
                    <div className="text-3xl font-bold text-white tracking-tight">
                        <AnimatedCounter value={72} suffix=" MB" />
                    </div>
                </GlassCard>
            </div>

            {/* Terminal (Hidden for beginners) */}
            {!(localStorage.getItem('elazya_tech_level') === 'beginner') && (
                <div className="glass-panel rounded-2xl overflow-hidden h-[400px] flex flex-col group">
                    <div className="bg-black/20 px-6 py-3 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-4 h-4 text-zinc-500" />
                            <span className="text-zinc-500 text-xs font-bold font-mono uppercase tracking-widest">Journaux Système</span>
                        </div>
                        <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                        </div>
                    </div>
                    <div className="p-6 space-y-2 text-zinc-400 font-mono text-xs overflow-y-auto flex-1 font-medium leading-relaxed">
                        {logs.map((log, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={i}
                                className="border-l-2 border-transparent hover:border-white/10 pl-2 hover:bg-white/5 py-0.5 rounded-r transition-colors"
                            >
                                <span className="text-zinc-600 mr-3">{new Date().toLocaleTimeString()}</span>
                                {log}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const [activePanel, setActivePanel] = useState<PanelType>('overview');

    // Adaptive UI: Tech Level
    const techLevel = (localStorage.getItem('elazya_tech_level') || 'intermediate');
    const isBeginner = techLevel === 'beginner';

    // Filter tabs for beginners
    const visibleTabs = isBeginner
        ? TABS.filter(t => ['overview', 'chat', 'help'].includes(t.id))
        : TABS;

    const renderPanel = () => {
        switch (activePanel) {
            case 'overview': return <OverviewPanel />;
            case 'skills': return <SkillsPanel />;
            case 'channels': return <ChannelsPanel />;
            case 'chat': return <ChatPanel />;
            case 'config': return <ConfigPanel />;
            case 'tokens': return <TokensPanel />;
            case 'help': return <HelpPanel />;
            default: return <OverviewPanel />;
        }
    };

    return (
        <div className="flex h-screen w-screen bg-transparent font-sans">
            <Sidebar onOpenConfig={() => setActivePanel('config')} />
            <main className="flex-1 overflow-hidden flex flex-col relative z-10">
                {/* Header with tabs */}
                <header className="px-12 pt-10 pb-6 border-b border-white/5">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500 font-sans">
                                Centre de Contrôle
                            </h2>
                            <p className="text-zinc-400 font-mono text-sm mt-2 tracking-wide">
                                <span className="text-indigo-400">●</span> EN LIGNE // SYSTÈME v2.0.0
                            </p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
                        {visibleTabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activePanel === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActivePanel(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </header>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-7xl mx-auto">
                        {renderPanel()}
                    </div>
                </div>
            </main>
        </div>
    );
}
