import { useState, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { Zap, RefreshCw, TrendingUp, DollarSign, Clock, Loader2 } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

interface UsageData {
    session: { input: number; output: number; total: number };
    monthly: { input: number; output: number; total: number };
}

function StatCard({ title, value, suffix = '', icon: Icon, color }: {
    title: string;
    value: number;
    suffix?: string;
    icon: React.ElementType;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        indigo: 'text-indigo-400 bg-indigo-500/10 ring-indigo-500/20',
        teal: 'text-teal-400 bg-teal-500/10 ring-teal-500/20',
        violet: 'text-violet-400 bg-violet-500/10 ring-violet-500/20',
        amber: 'text-amber-400 bg-amber-500/10 ring-amber-500/20',
    };

    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ring-1 ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white tracking-tight font-mono">
                <AnimatedCounter value={value} />{suffix}
            </p>
        </div>
    );
}

export default function TokensPanel() {
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchUsage = async () => {
        try {
            const data = await OpenClawClient.getUsageStats();
            setUsage(data);
        } catch (err) {
            console.error('Failed to fetch usage:', err);
        }
    };

    useEffect(() => {
        fetchUsage();
        const interval = setInterval(fetchUsage, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUsage();
        setIsRefreshing(false);
    };

    const monthlyLimit = 2000000;
    const monthlyTotal = usage?.monthly?.total || 0;
    const percentUsed = (monthlyTotal / monthlyLimit) * 100;
    const estimatedCost = (monthlyTotal / 1000000) * 0.15; // Gemini Flash pricing approx

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Zap className="w-6 h-6 text-amber-400" />
                        Consommation Tokens
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">Suivi en temps réel de votre utilisation</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                >
                    {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    Actualiser
                </button>
            </div>

            {/* Monthly Progress */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-zinc-400">Quota Mensuel</span>
                    <span className="text-sm font-mono font-bold text-white">
                        {(monthlyTotal / 1000).toFixed(1)}K / {(monthlyLimit / 1000000).toFixed(0)}M
                    </span>
                </div>
                <div className="relative h-4 bg-black/30 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-pulse" />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-zinc-500">{percentUsed.toFixed(2)}% utilisé</span>
                    <span className={`font-bold ${percentUsed > 80 ? 'text-red-400' : percentUsed > 50 ? 'text-amber-400' : 'text-indigo-400'}`}>
                        {percentUsed > 80 ? 'Quota presque atteint' : percentUsed > 50 ? 'Consommation modérée' : 'Consommation normale'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Session Total"
                    value={usage?.session?.total || 0}
                    icon={Clock}
                    color="indigo"
                />
                <StatCard
                    title="Session Input"
                    value={usage?.session?.input || 0}
                    icon={TrendingUp}
                    color="teal"
                />
                <StatCard
                    title="Session Output"
                    value={usage?.session?.output || 0}
                    icon={TrendingUp}
                    color="violet"
                />
                <StatCard
                    title="Coût Estimé"
                    value={estimatedCost}
                    suffix="$"
                    icon={DollarSign}
                    color="amber"
                />
            </div>

            {/* Monthly Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mensuel Total</p>
                    <p className="text-2xl font-bold text-white font-mono">
                        <AnimatedCounter value={usage?.monthly?.total || 0} />
                    </p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mensuel Input</p>
                    <p className="text-2xl font-bold text-indigo-400 font-mono">
                        <AnimatedCounter value={usage?.monthly?.input || 0} />
                    </p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mensuel Output</p>
                    <p className="text-2xl font-bold text-teal-400 font-mono">
                        <AnimatedCounter value={usage?.monthly?.output || 0} />
                    </p>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                <strong>💡 Astuce :</strong> Gemini 2.5 Flash inclut 2 millions de tokens gratuits par mois.
                Le coût affiché est une estimation basée sur les tarifs API standards.
            </div>
        </div>
    );
}
