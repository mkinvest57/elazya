import { useState, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { Play, Pause, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { listen } from '@tauri-apps/api/event';

interface ChainData {
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
    totalExecutions: number;
    timeSavedMinutes: number;
    lastRun: string | null;
    consecutiveFailures: number;
}

interface ChainLogEntry {
    id: number;
    chainId: string;
    timestamp: string;
    message: string;
    status: 'success' | 'error' | 'info';
}

export default function ChainsPanel() {
    const [chains, setChains] = useState<ChainData[]>([]);
    const [logs, setLogs] = useState<ChainLogEntry[]>([]);
    const [toggling, setToggling] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [chainsData, logsData] = await Promise.all([
                OpenClawClient.getChains(),
                OpenClawClient.getChainLogs(undefined, 20),
            ]);
            setChains(chainsData as ChainData[]);
            setLogs(logsData as ChainLogEntry[]);
        } catch (err) {
            console.error('[ChainsPanel] Load error:', err);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);

        // Listen for real-time chain events
        const unlisten = listen('chain-log', (event: any) => {
            const payload = event.payload as ChainLogEntry;
            setLogs(prev => [payload, ...prev].slice(0, 30));
        });

        return () => {
            clearInterval(interval);
            unlisten.then(f => f());
        };
    }, []);

    const handleToggle = async (chainId: string) => {
        setToggling(chainId);
        try {
            await OpenClawClient.toggleChain(chainId);
            await loadData();
        } catch (err) {
            console.error('Toggle error:', err);
        } finally {
            setToggling(null);
        }
    };

    const formatTimeSaved = (minutes: number) => {
        if (minutes < 60) return `${minutes}min`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h${m}m` : `${h}h`;
    };

    const formatLastRun = (ts: string | null) => {
        if (!ts) return 'Jamais';
        try {
            const date = new Date(ts + 'Z');
            return date.toLocaleString('fr-FR', { 
                day: '2-digit', month: '2-digit', 
                hour: '2-digit', minute: '2-digit' 
            });
        } catch {
            return ts;
        }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'success': return '✅';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Vos Agents</h2>
                    <p className="text-sm text-zinc-500 mt-1">Automatisez vos tâches répétitives</p>
                </div>
                <button 
                    onClick={loadData}
                    className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Chain Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {chains.map(chain => (
                    <div 
                        key={chain.id}
                        className={`
                            relative rounded-2xl border backdrop-blur-md p-6
                            transition-all duration-300
                            ${chain.enabled 
                                ? 'bg-gradient-to-b from-indigo-500/5 to-transparent border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                                : 'bg-zinc-900/40 border-zinc-800/50'}
                            ${chain.consecutiveFailures >= 3 ? 'border-red-500/30' : ''}
                        `}
                    >
                        {/* Status dot */}
                        <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${
                            chain.consecutiveFailures >= 3 
                                ? 'bg-red-500 animate-pulse' 
                                : chain.enabled 
                                    ? 'bg-emerald-500 animate-pulse' 
                                    : 'bg-zinc-600'
                        }`} />

                        {/* Icon + Name */}
                        <div className="flex items-start gap-3 mb-4">
                            <span className="text-3xl">{chain.icon}</span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white text-lg leading-tight">{chain.name}</h3>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{chain.description}</p>
                            </div>
                        </div>

                        {/* Error indicator */}
                        {chain.consecutiveFailures >= 3 && (
                            <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                <span className="text-xs text-red-400">Auto-pausé après échecs répétés</span>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="text-center">
                                <p className="text-lg font-bold text-white">{chain.totalExecutions}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Exécutions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-indigo-400">{formatTimeSaved(chain.timeSavedMinutes)}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Économisé</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-medium text-zinc-300 mt-0.5">{formatLastRun(chain.lastRun)}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Dernier run</p>
                            </div>
                        </div>

                        {/* Toggle Button */}
                        <button
                            onClick={() => handleToggle(chain.id)}
                            disabled={toggling === chain.id}
                            className={`
                                w-full py-2.5 rounded-xl font-bold text-sm tracking-wide
                                transition-all duration-200 flex items-center justify-center gap-2
                                ${chain.enabled
                                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}
                                ${toggling === chain.id ? 'opacity-50 cursor-wait' : ''}
                            `}
                        >
                            {toggling === chain.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : chain.enabled ? (
                                <><Pause className="w-4 h-4" /> Pause</>
                            ) : (
                                <><Play className="w-4 h-4" /> Activer</>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Activity Log */}
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Activité récente</span>
                    </div>
                    <span className="text-xs text-zinc-600">{logs.length} entrées</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-zinc-600 text-sm">
                            Aucune activité pour l'instant. Activez un agent pour commencer.
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div 
                                key={log.id || i} 
                                className="px-6 py-3 border-b border-zinc-800/30 flex items-start gap-3 hover:bg-zinc-800/20 transition-colors"
                            >
                                <span className="text-sm flex-shrink-0 mt-0.5">{statusIcon(log.status)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-300">{log.message}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-indigo-400 font-bold uppercase">{log.chainId}</span>
                                        <span className="text-[10px] text-zinc-600">
                                            {new Date(log.timestamp + 'Z').toLocaleTimeString('fr-FR', {
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
