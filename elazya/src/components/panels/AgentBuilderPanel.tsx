import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Bot, Save, PlusCircle, AlertCircle } from 'lucide-react';

export default function AgentBuilderPanel() {
    const [agentId, setAgentId] = useState('');
    const [agentPrompt, setAgentPrompt] = useState('');
    const [tools, setTools] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agentId || !agentPrompt) {
            setStatus({ type: 'error', message: "Identifiant et Instructions sont requis." });
            return;
        }

        setStatus({ type: 'loading' });
        try {
            // Nettoyer l'ID
            const cleanId = agentId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            // Nettoyer les outils (séparés par virgule)
            const parsedTools = tools.split(',').map(t => t.trim()).filter(t => t.length > 0);

            const identityMarkdown = `# IDENTITY.md - Agent ${cleanId}\n\n${agentPrompt}`;

            await invoke('create_custom_agent', {
                id: cleanId,
                identity: identityMarkdown,
                tools: parsedTools
            });

            setStatus({ type: 'success', message: `L'agent "${cleanId}" a été créé et activé avec succès dans OpenClaw !` });
            setAgentId('');
            setAgentPrompt('');
            setTools('');

            // Reset success message after 5 seconds
            setTimeout(() => setStatus({ type: 'idle' }), 5000);
        } catch (err: any) {
            console.error(err);
            setStatus({ type: 'error', message: err.toString() || "Erreur lors de la création de l'agent." });
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-neutral-400" />
                <div>
                    <h2 className="text-2xl font-semibold text-white">Créateur d'Agents (No-Code)</h2>
                    <p className="text-neutral-400">Générez dynamiquement de nouveaux agents OpenClaw dans votre écosystème en écrivant simplement des instructions en langage naturel.</p>
                </div>
            </div>

            <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                <form onSubmit={handleCreateAgent} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                            Nom de l'Agent (Identifiant)
                        </label>
                        <input
                            type="text"
                            value={agentId}
                            onChange={(e) => setAgentId(e.target.value)}
                            placeholder="ex: expert-seo, redacteur-blog"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neutral-500"
                        />
                        <p className="text-xs text-neutral-500 mt-1">L'identifiant sera normalisé (lettres minuscules et tirets uniquement).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                            Instructions (IDENTITY.md)
                        </label>
                        <textarea
                            value={agentPrompt}
                            onChange={(e) => setAgentPrompt(e.target.value)}
                            placeholder="Tu es l'expert SEO de l'équipe. Ton rôle est de... Tes objectifs : 1. Analyser les mots clés. 2. Optimiser les titres."
                            rows={6}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neutral-500 font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                            Outils (Optionnel)
                        </label>
                        <input
                            type="text"
                            value={tools}
                            onChange={(e) => setTools(e.target.value)}
                            placeholder="ex: message, browser, web_search"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neutral-500"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Séparez les noms des outils par des virgules (laissez vide pour aucun outil spécifique).</p>
                    </div>

                    {status.type === 'error' && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm">{status.message}</p>
                        </div>
                    )}

                    {status.type === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
                            <Bot className="w-5 h-5" />
                            <p className="text-sm">{status.message}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={status.type === 'loading'}
                            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status.type === 'loading' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4" />
                                    Déployer l'Agent
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
