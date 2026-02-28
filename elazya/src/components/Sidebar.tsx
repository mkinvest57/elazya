import { useState, useEffect } from 'react';
import { OpenClawClient, ChannelStatus } from '@/lib/openclaw-client';
import { Zap, Settings, HardDrive, Cpu, Layers } from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useToast } from "@/components/ToastProvider";

interface SidebarProps {
    onOpenConfig?: () => void;
}

export default function Sidebar({ onOpenConfig }: SidebarProps) {
    const [usage, setUsage] = useState<any>(null);
    const [channels, setChannels] = useState<ChannelStatus[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [provider, setProvider] = useState<string>('...');
    const [model, setModel] = useState<string>('...');
    const { showToast } = useToast();

    useEffect(() => {
        // Initial fetch
        OpenClawClient.getUsageStats().then(setUsage);
        OpenClawClient.getChannelsStatus().then(setChannels);
        OpenClawClient.getInstalledSkills().then(setSkills);
        OpenClawClient.getSetting('elazya_provider').then(p => setProvider(p || 'Inconnu'));
        OpenClawClient.getSetting('elazya_model').then(m => setModel(m || 'Inconnu'));

        // Welcome toast
        setTimeout(() => showToast("Systèmes En Ligne", "success"), 1000);

        // Listen for live updates
        const unlisten = listen('token-usage-update', (event) => {
            setUsage(event.payload);
        });

        // Polling for channels/skills AND usage
        const interval = setInterval(() => {
            OpenClawClient.getChannelsStatus().then(setChannels);
            OpenClawClient.getUsageStats().then(setUsage);
        }, 5000);

        return () => {
            unlisten.then(f => f());
            clearInterval(interval);
        };
    }, []);

    const monthlyTotal = usage?.monthly?.total || 0;
    const monthlyLimit = 2000000; // Updated limit
    const percentUsed = (monthlyTotal / monthlyLimit) * 100;
    const estimatedCost = (monthlyTotal / 1000000) * 0.15; // Flash model is cheap

    // Adaptive UI: Tech Level
    const techLevel = localStorage.getItem('elazya_tech_level') || 'intermediate';
    const isBeginner = techLevel === 'beginner';

    return (
        <div className="w-80 glass-panel border-r border-white/5 h-full flex flex-col z-20 relative">

            {/* macOS Titlebar Drag Region - Fixed at top */}
            <div
                className="h-10 flex-shrink-0"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            />

            {/* Header - Fixed below titlebar */}
            <div className="flex items-center gap-3 px-6 pb-4 flex-shrink-0">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-10 h-10 rounded-lg"
                />
                <h1 className="text-xl font-bold text-white tracking-tight">Elazya</h1>
            </div>


            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-4 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >

                {/* Status Card & Traffic Light */}
                <div onClick={onOpenConfig} className="group cursor-pointer">
                    <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
                        <div className="bg-black/40 rounded-[20px] p-5 border border-white/5 space-y-4 backdrop-blur-md relative overflow-hidden">

                            {/* Status Header */}
                            <div className="flex items-center justify-between z-10 relative">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Système</span>
                                <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full border border-white/5">
                                    <div className={`w-2 h-2 rounded-full ${usage ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-zinc-700'}`}></div>
                                    <div className={`w-2 h-2 rounded-full ${channels.some(c => c.connected) ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'bg-zinc-700'}`}></div>
                                    <div className={`w-2 h-2 rounded-full ${!usage ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-zinc-700'}`}></div>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex items-center gap-3 pt-2 z-10 relative">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                                    <Cpu className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white text-sm font-bold truncate tracking-wide group-hover:text-indigo-400 transition-colors">
                                        {provider === '...' ? 'Initialisation...' : usage ? 'En Ligne' : 'HORS LIGNE'}
                                    </p>
                                    <p className="text-zinc-500 text-[10px] truncate font-mono uppercase tracking-wider">
                                        {usage ? model : 'Vérifiez la connexion'}
                                    </p>
                                </div>
                            </div>

                            {/* Hover Hint (Hidden for beginners) */}
                            {!isBeginner && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-black/80 px-3 py-1 rounded-full border border-indigo-500/20 backdrop-blur-md transform translate-y-8 group-hover:translate-y-6 transition-transform">
                                        Ouvrir les Logs
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Token Usage */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Consommation
                    </h3>
                    <div className="space-y-4 px-1">
                        <div>
                            <div className="flex justify-between text-xs mb-1.5 items-end">
                                <span className="text-zinc-400 font-medium">Quota Mensuel</span>
                                <span className="text-white font-mono font-bold text-sm">
                                    {percentUsed.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-violet-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]" style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
                            </div>
                        </div>

                        {!isBeginner && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Session</p>
                                    <p className="text-lg font-mono font-bold text-white mt-1">
                                        <AnimatedCounter value={usage?.session?.total || 0} />
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Coût</p>
                                    <p className="text-lg font-mono font-bold text-white mt-1">
                                        $<AnimatedCounter value={estimatedCost} prefix="" />
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Channels (Hidden for beginners) */}
                {!isBeginner && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <Layers className="w-3 h-3" /> Intégrations
                        </h3>
                        <div className="space-y-1">
                            {channels.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-all duration-300 border border-transparent hover:border-white/5 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${c.connected ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-600'
                                            }`}>
                                            {c.id === 'whatsapp' ? '💬' : c.id === 'telegram' ? '✈️' : c.id === 'discord' ? '🎮' : '🔌'}
                                        </div>
                                        <span className={`text-sm font-bold transition-colors ${c.connected ? 'text-white' : 'text-zinc-500'}`}>{c.name}</span>
                                    </div>
                                    {c.connected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skils (Hidden for beginners) */}
                {!isBeginner && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 delay-100">
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <HardDrive className="w-3 h-3" /> Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2 px-1">
                            {skills.length === 0 ? (
                                <p className="text-xs text-zinc-600 italic">Aucune.</p>
                            ) : skills.map(s => (
                                <span key={s} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-zinc-400 font-mono hover:bg-white/10 hover:text-white transition-colors cursor-default">
                                    {s.replace('@openclaw/skill-', '')}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            </div>
            {/* End Scrollable Content */}

            {/* Footer - Fixed at bottom */}
            <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-white/5">
                <button
                    onClick={onOpenConfig}
                    className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-all w-full p-3 rounded-xl hover:bg-white/5 group"
                >
                    <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Configuration</span>
                </button>
            </div>
        </div>
    );
}
