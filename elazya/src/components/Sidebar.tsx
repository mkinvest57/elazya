import { useState, useEffect } from 'react';
import { OpenClawClient, ChannelStatus } from '@/lib/openclaw-client';
import { Zap, Settings, HardDrive, Cpu, Layers } from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { AnimatedCounter, PulseIndicator } from "@/components/AnimatedCounter";
import { useToast } from "@/components/ToastProvider";

export default function Sidebar() {
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

    return (
        <div className="w-80 glass-panel border-r border-white/5 h-full flex flex-col p-6 space-y-10 overflow-y-auto z-20 relative">

            {/* Header */}
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center text-black font-black">
                    E
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Elazya</h1>
            </div>

            {/* Status Card */}
            <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
                <div className="bg-black/40 rounded-[20px] p-5 border border-white/5 space-y-4 backdrop-blur-md">
                    <div className="flex items-center gap-3 justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Système</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400 tracking-wide">EN LIGNE</span>
                            <PulseIndicator active={true} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center ring-1 ring-white/10">
                            <Cpu className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-sm font-bold truncate tracking-wide">{provider === '...' ? 'Initialisation...' : provider}</p>
                            <p className="text-zinc-500 text-[10px] truncate font-mono uppercase tracking-wider">{model}</p>
                        </div>
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
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
                        </div>
                    </div>

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
                </div>
            </div>

            {/* Channels */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Intégrations
                </h3>
                <div className="space-y-1">
                    {channels.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-all duration-300 border border-transparent hover:border-white/5 cursor-default">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${c.connected ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-600'
                                    }`}>
                                    {c.id === 'whatsapp' ? '💬' : c.id === 'telegram' ? '✈️' : c.id === 'discord' ? '🎮' : '🔌'}
                                </div>
                                <span className={`text-sm font-bold transition-colors ${c.connected ? 'text-white' : 'text-zinc-500'}`}>{c.name}</span>
                            </div>
                            {c.connected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Skils */}
            <div className="space-y-4">
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

            <div className="mt-auto pt-6 border-t border-white/5">
                <button className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-all w-full p-3 rounded-xl hover:bg-white/5 group">
                    <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Configuration</span>
                </button>
            </div>
        </div>
    );
}
