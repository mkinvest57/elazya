import { useState, useEffect } from 'react';
import { OpenClawClient, RequirementsStatus } from '@/lib/openclaw-client';
import { AlertTriangle, CheckCircle, Download, RefreshCw, Terminal } from 'lucide-react';

interface Props {
    onReady: () => void;
}

export default function PrerequisitesCheck({ onReady }: Props) {
    const [status, setStatus] = useState<RequirementsStatus | null>(null);
    const [checking, setChecking] = useState(true);
    const [installing, setInstalling] = useState(false);

    const check = async () => {
        setChecking(true);
        try {
            const res = await OpenClawClient.checkRequirements();
            setStatus(res);
            if (res.node_ok && res.openclaw_installed) {
                setTimeout(onReady, 800); // Small delay for visual confirmation
            }
        } catch (e) {
            console.error("Check failed:", e);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        check();
    }, []);

    const handleInstall = async () => {
        setInstalling(true);
        try {
            await OpenClawClient.installOpenClaw();
            await check();
        } catch (e) {
            console.error("Install failed:", e);
        } finally {
            setInstalling(false);
        }
    };

    if (checking && !status) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Terminal className="w-12 h-12 text-zinc-500" />
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Vérification du système...</p>
                </div>
            </div>
        );
    }

    if (!status) return null;

    if (status.node_ok && status.openclaw_installed) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <h1 className="text-2xl font-bold">Système Prêt</h1>
                    <p className="text-zinc-500">Lancement d'Elazya...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold">Installation Requise</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Pour qu'Elazya fonctionne, nous devons installer le moteur OpenClaw sur votre machine.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Node.js Check */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${status.node_ok ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                        {status.node_ok ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        )}
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">Node.js Runtime</h3>
                            <p className="text-xs text-zinc-500">
                                {status.node_ok ? `Installé (${status.node_version})` : 'Version 22+ requise.'}
                            </p>
                        </div>
                    </div>

                    {/* OpenClaw Check */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${status.openclaw_installed ? 'bg-green-500/5 border-green-500/20' : 'bg-zinc-800 border-zinc-700'}`}>
                        {status.openclaw_installed ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                            <Download className="w-6 h-6 text-blue-500" />
                        )}
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">OpenClaw Engine</h3>
                            <p className="text-xs text-zinc-500">
                                {status.openclaw_installed ? 'Installé' : 'Manquant'}
                            </p>
                        </div>
                    </div>
                </div>

                {!status.node_ok && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-300">
                        Veuillez installer Node.js v22+ manuellement depuis <a href="https://nodejs.org" target="_blank" className="underline font-bold">nodejs.org</a> puis relancer Elazya.
                    </div>
                )}

                {!status.openclaw_installed && status.node_ok && (
                    <button
                        onClick={handleInstall}
                        disabled={installing}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {installing ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Installation en cours...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Installer OpenClaw
                            </>
                        )}
                    </button>
                )}

                <button
                    onClick={check}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-sm text-zinc-400 transition-all"
                >
                    Rafraîchir
                </button>
            </div>
        </div>
    );
}
