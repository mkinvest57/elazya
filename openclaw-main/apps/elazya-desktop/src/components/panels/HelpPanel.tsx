import { HelpCircle, Book, Terminal, AlertTriangle, ExternalLink } from 'lucide-react';

function GuideSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                <span className="text-indigo-400">{icon}</span>
                <h3 className="font-bold text-white">{title}</h3>
            </div>
            <div className="p-4 space-y-4 text-sm text-zinc-300">
                {children}
            </div>
        </div>
    );
}

export default function HelpPanel() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-indigo-400" />
                    Centre d'Aide
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                    Guides de démarrage et troubleshooting pour Elazya.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Getting Started */}
                <GuideSection title="Démarrage Rapide" icon={<Book className="w-4 h-4" />}>
                    <ol className="list-decimal list-inside space-y-2 marker:text-indigo-500 marker:font-bold">
                        <li>
                            <strong className="text-white">Configuration IA</strong>:
                            Allez dans <span className="text-indigo-400 font-mono text-xs px-1 bg-white/10 rounded">Config &gt; Fournisseur IA</span>.
                            Utilisez Google (Gemini) pour commencer, c'est gratuit et performant.
                        </li>
                        <li>
                            <strong className="text-white">Connecter Telegram</strong>:
                            Ouvrez l'onglet <span className="text-indigo-400 font-mono text-xs px-1 bg-white/10 rounded">Canaux</span>.
                            Parlez à <span className="text-blue-400">@BotFather</span> sur Telegram pour créer un bot et coller le token ici.
                        </li>
                        <li>
                            <strong className="text-white">Installer un Skill</strong>:
                            Dans l'onglet <span className="text-indigo-400 font-mono text-xs px-1 bg-white/10 rounded">Compétences</span>,
                            installez "Météo" ou "Recherche Web" pour tester.
                        </li>
                    </ol>
                </GuideSection>

                {/* Common Issues */}
                <GuideSection title="Problèmes Fréquents" icon={<AlertTriangle className="w-4 h-4" />}>
                    <ul className="space-y-3">
                        <li className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <strong className="text-red-400 block mb-1">Le Bot ne répond pas</strong>
                            1. Vérifiez que la pastille "Système" est verte (Sidebar).<br />
                            2. Allez dans <span className="text-white font-bold">Config &gt; Journaux Système</span>.<br />
                            3. Si vous voyez "Unauthorized", vérifiez votre Token.
                        </li>
                        <li className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                            <strong className="text-amber-400 block mb-1">Erreur d'installation de Skill</strong>
                            Vérifiez que Node.js est bien installé sur votre machine. Elazya utilise `npm` pour installer les skills.
                        </li>
                    </ul>
                </GuideSection>

                {/* Advanced */}
                <GuideSection title="Commandes Avancées" icon={<Terminal className="w-4 h-4" />}>
                    <p>Elazya comprend le langage naturel, mais vous pouvez forcer certaines actions :</p>
                    <ul className="space-y-2 mt-2 font-mono text-xs bg-black/30 p-2 rounded-lg">
                        <li><span className="text-fuchsia-400">/reset</span> : Oublier la conversation actuelle.</li>
                        <li><span className="text-fuchsia-400">system status</span> : Demander l'état du moteur.</li>
                    </ul>
                </GuideSection>

                {/* Links */}
                <div className="space-y-2">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group">
                        <span className="font-bold text-white">Obtenir une clé Gemini</span>
                        <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    </a>
                    <a href="https://t.me/BotFather" target="_blank" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group">
                        <span className="font-bold text-white">Créer un Bot Telegram</span>
                        <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    </a>
                </div>

            </div>
        </div>
    );
}
