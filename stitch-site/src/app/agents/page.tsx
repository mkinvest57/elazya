"use client"

import {
    ArrowRight,
    FileText,
    Mail,
    Linkedin,
    Target,
    Sun,
    Users,
    Receipt,
    Brain,
    BarChart3,
    PenTool,
    Clock,
    CheckCircle2,
    Lock,
    Zap,
    Building2,
    Sparkles,
    X,
    Terminal,
    MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

// ── Agent Data ────────────────────────────────────────────────────────

const coreAgents = [
    {
        id: "facturation",
        name: "Facturation Auto",
        emoji: "💰",
        icon: FileText,
        color: "from-green-400 to-emerald-600",
        tagline: "Classe vos factures, relances si impayés",
        features: [
            "OCR automatique",
            "Dossiers clients créés",
            "Reminders macOS 7j avant échéance",
            "Email de relance auto si retard",
        ],
        savings: "2h/semaine",
        setup: "2 minutes",
        example: "Un client a un retard de paiement. L'agent scanne ta banque et ton outil de facturation, détecte le retard, et lui rédige un email de relance poli et personnalisé. Tu n'as littéralement plus qu'à cliquer sur 'Envoyer'.",
    },
    {
        id: "onboarding-client",
        name: "Onboarding Client Express",
        emoji: "📧",
        icon: Mail,
        color: "from-blue-400 to-indigo-600",
        tagline: "Répondez aux prospects en 5 min",
        features: [
            "Email personnalisé auto",
            "Calendly envoyé",
            "Contrat + paiement préparés",
            "CRM Notion mis à jour",
        ],
        savings: "1h/client",
        setup: "3 minutes",
        example: "Un prospect accepte ton devis. L'agent crée automatiquement son dossier client, prépare son contrat avec ses infos, lui envoie un email de bienvenue avec les prochaines étapes et met à jour ton Notion.",
    },
    {
        id: "linkedin-digest",
        name: "LinkedIn Digest",
        emoji: "📱",
        icon: Linkedin,
        color: "from-sky-400 to-blue-600",
        tagline: "Contenu quotidien sans effort",
        features: [
            "5 posts pertinents résumés",
            "3 commentaires générés",
            "1 post original prêt",
            "Clipboard + Apple Note",
        ],
        savings: "3h30/semaine",
        setup: "1 minute",
        example: "L'agent analyse ton fil d'actualité, repère les 5 posts stratégiques dans ton industrie, te fais un résumé, et te propose 3 commentaires pertinents pour t'aider à te rendre visible sans y passer des heures.",
    },
    {
        id: "qualification",
        name: "Qualification Leads Auto",
        emoji: "🎯",
        icon: Target,
        color: "from-orange-400 to-red-600",
        tagline: "Triez les vrais prospects des curieux",
        features: [
            "IA détecte leads chauds/froids",
            "Réponses auto adaptées",
            "Timewasters archivés",
            "Focus sur vrais projets",
        ],
        savings: "5h/semaine",
        setup: "2 minutes",
        example: "Tu reçois 10 demandes de devis. L'agent lit les emails, identifie que 3 n'ont pas de budget, leur répond par la négative poliment, et te prépare des réponses ultra-personnalisées pour les 7 vrais projets.",
    },
    {
        id: "routine-matinale",
        name: "Routine Matinale Auto",
        emoji: "🏃",
        icon: Sun,
        color: "from-amber-400 to-yellow-600",
        tagline: "Commencez la journée immédiatement",
        features: [
            "Gmail scanné (emails urgents)",
            "Notion tasks du jour copiées",
            "LinkedIn feed résumé",
            'Note "Morning Brief" générée',
        ],
        savings: "30min/jour",
        setup: "1 minute",
        example: "À 8h du matin, avant que tu n'ouvres ton Mac, l'agent regroupe tes emails urgents, tes tâches Notion du jour et un récap des news de ton secteur. Il t'envoie un 'Morning Brief' pour démarrer la journée efficacement.",
    },
]

const proAgents = [
    {
        id: "crm-prospect",
        name: "CRM Prospect Auto",
        emoji: "🎨",
        icon: Users,
        color: "from-pink-400 to-rose-600",
        tagline: "Jamais de lead perdu",
        features: [
            "Extraction contact auto",
            "Ajout Notion CRM",
            "Tags chaud/froid IA",
            "Reminders de suivi",
        ],
        savings: "+30% conversion leads",
        setup: "3 minutes",
        example: "Après un appel découverte, l'agent prend la transcription, extrait les besoins exacts du prospect, son budget, et met à jour ta base CRM Notion avec ces infos structurées.",
    },
    {
        id: "devis-express",
        name: "Devis Express",
        emoji: "📄",
        icon: Receipt,
        color: "from-teal-400 to-cyan-600",
        tagline: "Propositions en 10min vs 2h",
        features: [
            "Brief email parsé",
            "Template personnalisé IA",
            "PDF généré",
            "Email draft prêt",
        ],
        savings: "+20% taux conversion",
        setup: "2 minutes",
        example: "Un client demande une proposition pour 'Refonte Site Web'. L'agent pioche dans tes anciens prix, remplit ton template PDF Apple Pages, l'exporte et drafte l'email d'envoi. Tu révises le PDF et tu envoies.",
    },
    {
        id: "email-intelligent",
        name: "Email Intelligent",
        emoji: "💼",
        icon: Brain,
        color: "from-violet-400 to-purple-600",
        tagline: "Inbox traitée automatiquement",
        features: [
            "Gmail catégorisé",
            "Réponses simples draftées",
            "Devis → tâche Notion",
            "Drafts dans Mail.app",
        ],
        savings: "1h/jour",
        setup: "4 minutes (Gmail API)",
        example: "L'agent trie tes 40 nouveaux emails en 3 catégories : Urgences, Newsletters, À traiter. Il brouillonise une réponse pour les 10 plus urgents. Ta boîte de réception n'est plus une source de stress.",
    },
]

const businessAgents = [
    {
        id: "compta-export",
        name: "Compta Export",
        emoji: "📊",
        icon: BarChart3,
        color: "from-emerald-400 to-green-600",
        tagline: "Export comptable mensuel auto",
        features: [
            "Scan factures émises/reçues",
            "CSV format français",
            "Compatible Pennylane/Indy",
            "Email auto à l'expert-comptable",
        ],
        savings: "2h/mois",
        setup: "3 minutes",
        example: "Le dernier jour du mois, l'agent rassemble tes factures de dépenses (Uber, AWS, etc.), les renomme proprement (Année-Mois-Nom), et génère un export propre pour ton expert-comptable.",
    },
    {
        id: "content-linkedin",
        name: "Content Auto LinkedIn",
        emoji: "🚀",
        icon: PenTool,
        color: "from-fuchsia-400 to-pink-600",
        tagline: "1 idée → 5 posts variations",
        features: [
            "Question",
            "Liste (thread Twitter-style)",
            "Hot take",
            "Story + Data-driven",
        ],
        savings: "4h/semaine",
        setup: "1 minute",
        example: "Tu fournis une idée simple d'une phrase. L'agent te génère 5 formats de posts différents : une story émotionnelle, un thread bullet-points, une question ouverte, etc. Prêts à être publiés.",
    },
]


const otherFaculties = [
    {
        id: "multi-agent",
        name: "Multi-agents coordonnés",
        emoji: "🤝",
        icon: Users,
        color: "from-indigo-400 to-violet-600",
        tagline: "Un vrai travail d'équipe",
        features: [
            "Les agents se parlent",
            "Passage de relais auto",
            "Maintien du contexte",
            "Résolution complexe",
        ],
        example: "L'agent Qualification alimente automatiquement ton CRM avec un nouveau lead chaud. L'agent CRM le voit immédiatement et déclenche l'Onboarding Client pour lui envoyer un devis. Tout s'enchaîne de manière fluide et transparente.",
        savings: "Zéro friction",
        setup: "Natif",
    },
    {
        id: "browser-automation",
        name: "Browser Automation",
        emoji: "🌐",
        icon: Target,
        color: "from-teal-400 to-emerald-600",
        tagline: "Navigation humaine authentique",
        features: [
            "Contrôle Safari/Chrome",
            "Clics et saisies naturels",
            "Contourne les API limitées",
            "Publication directe",
        ],
        example: "Contrairement aux outils SaaS qui utilisent l'API LinkedIn (souvent restreinte), l'agent Elazya ouvre vraiment ton navigateur sur ton Mac, tape le post que tu as validé, et clique sur 'Publier', exactement comme tu le ferais.",
        savings: "100% natif",
        setup: "Natif",
    },
    {
        id: "research-agent",
        name: "Research Agent Profond",
        emoji: "🔎",
        icon: Brain,
        color: "from-blue-400 to-sky-600",
        tagline: "L'analyste de l'équipe",
        features: [
            "Exploration web profonde",
            "Analyses multi-sources",
            "Synthèse de >2 000 mots",
            "Sourcing académique",
        ],
        example: "Tu lui donnes un sujet technique ou un concurrent à analyser. Il explore 15 sources sur le web pendant 3 minutes et te rédige un brief détaillé de 2 000 mots avec toutes ses sources citées.",
        savings: "5h de tracas",
        setup: "Natif",
    },
    {
        id: "visual-creator",
        name: "Créateur d'agents visuel",
        emoji: "🏗️",
        icon: PenTool,
        color: "from-fuchsia-400 to-pink-600",
        tagline: "Crée tes propres agents",
        features: [
            "Aucun code requis",
            "Description en français",
            "Scripts générés par l'IA",
            "Personnalisation totale",
        ],
        example: "Tu a besoin d'un agent 'Extracteur de factures AWS' ? Décris-lui ce qu'il doit faire en langage naturel : 'Connecte-toi à mon espace, récupère les PDF de facturation.' Elazya crée la compétence (skill) correspondante pour toi.",
        savings: "Zéro dev",
        setup: "Natif",
    },
    {
        id: "multi-mac",
        name: "Multi-Utilisateur",
        emoji: "💻",
        icon: Building2,
        color: "from-slate-600 to-slate-800",
        tagline: "Pour toute l'équipe",
        features: [
            "Une instance, plusieurs accès",
            "Jusqu'à 5 collaborateurs",
            "Séparation des données",
            "Mode serveur sur Mac Mini",
        ],
        example: "Tu installes Elazya sur un Mac Mini distant (au bureau). Toi et 4 de tes collaborateurs pouvez piloter la même équipe d'agents en envoyant des requêtes depuis vos téléphones ou vos ordis respectifs.",
        savings: "+5 licences gratuites",
        setup: "Natif",
    },
    {
        id: "health-monitoring",
        name: "Health Monitoring Business",
        emoji: "📈",
        icon: BarChart3,
        color: "from-orange-400 to-red-600",
        tagline: "Coup d'œil sur la santé",
        features: [
            "Rapport hebdomadaire auto",
            "Vue pipeline commercial",
            "État de la facturation",
            "Priorités de la semaine",
        ],
        example: "Chaque lundi matin, l'agent Strategy t'envoie un message récapitulatif avec l'état exact de ton entreprise : le pipeline de ventes, les factures en retard, et les tâches urgentes, sans que tu aies besoin d'ouvrir le moindre Dashboard.",
        savings: "Tranquillité",
        setup: "Natif",
    },
]

const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
}

// ── Component ─────────────────────────────────────────────────────────

export default function AgentsPage() {
    const [selectedAgent, setSelectedAgent] = useState<any>(null)

    useEffect(() => {
        if (selectedAgent) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => { document.body.style.overflow = "unset" }
    }, [selectedAgent])

    return (
        <div className="bg-background min-h-screen font-sans text-slate-800 overflow-x-hidden selection:bg-primary/20">
            {/* Minimalist Grid & Blur Background */}
            <div className="fixed inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-400 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-400 blur-[150px] rounded-full"></div>
            </div>

            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="relative z-10 pt-32 pb-24 px-6 mt-10">

                {/* ── Hero ─────────────────────────────────────────── */}
                <header className="max-w-5xl mx-auto text-center mb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Ton équipe IA. Locale et souveraine.
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.05]">
                            <span className="text-slate-800">Voici de quoi est capable</span><br />
                            <span className="text-gradient-primary">ton nouveau staff.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Découvre les membres de ton équipe virtuelle. Tous s'exécutent en local sur ton Mac, sans cloud ni abonnement. Tu ne gères plus des tâches, tu gères des résultats.
                        </p>

                        {/* Social proof */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium mt-10">
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 text-slate-600 shadow-sm backdrop-blur-md">
                                <Zap className="w-4 h-4 text-emerald-500" /> Sans configuration technique
                            </span>
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 text-slate-600 shadow-sm backdrop-blur-md">
                                <Sparkles className="w-4 h-4 text-primary" /> Multi-agents coordonnés
                            </span>
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 text-slate-600 shadow-sm backdrop-blur-md">
                                🇫🇷 100% privé sur ton Mac
                            </span>
                        </div>
                    </motion.div>
                </header>

                {/* ── CORE AGENTS ──────────────────────────────────── */}
                <section className="max-w-6xl mx-auto mb-32">
                    <motion.div {...fadeUp}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Ton équipe de base</h2>
                                <p className="text-slate-500 font-medium">L'essentiel pour automatiser le quotidien</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coreAgents.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md rounded-3xl p-6 md:p-8 group hover:scale-[1.02] transition-all flex flex-col cursor-pointer" onClick={() => setSelectedAgent(agent)}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                        <agent.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{agent.name}</h3>
                                        <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Automatisé</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{agent.tagline}</p>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {agent.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        <span className="text-emerald-600 font-bold">{agent.savings}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 font-semibold">{agent.setup}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Core ROI */}
                    <motion.div {...fadeUp} className="mt-10">
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold tracking-tight text-slate-800 mb-1">ROI total estimé — Agents Core</h3>
                                <p className="text-slate-500 font-medium text-sm">Basé sur nos utilisateurs freelance</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-black text-emerald-600 tracking-tight">~12h / semaine</div>
                                <div className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Temps récupéré</div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* ── PRO AGENTS ───────────────────────────────────── */}
                <section className="max-w-6xl mx-auto mb-32">
                    <motion.div {...fadeUp}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20 shadow-sm">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Le pôle Avancé</h2>
                                <p className="text-slate-500 font-medium">Pour accélérer la génération de revenus</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {proAgents.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl group hover:scale-[1.02] transition-all flex flex-col relative overflow-hidden border border-primary/20 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] cursor-pointer" onClick={() => setSelectedAgent(agent)}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                        <agent.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{agent.name}</h3>
                                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Intelligent</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{agent.tagline}</p>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {agent.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="text-primary font-bold">{agent.savings}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 font-semibold">{agent.setup}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── BUSINESS AGENTS ──────────────────────────────── */}
                <section className="max-w-6xl mx-auto mb-32">
                    <motion.div {...fadeUp}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-slate-800 text-white p-2.5 rounded-xl shadow-sm">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Le pôle Stratégie</h2>
                                <p className="text-slate-500 font-medium">Pour prendre du recul sur son activité</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {businessAgents.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md rounded-3xl p-6 md:p-8 group hover:scale-[1.02] transition-all flex flex-col relative overflow-hidden cursor-pointer" onClick={() => setSelectedAgent(agent)}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                        <agent.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{agent.name}</h3>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stratégique</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{agent.tagline}</p>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {agent.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-slate-600" />
                                        <span className="text-slate-700 font-bold">{agent.savings}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 font-semibold">{agent.setup}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>


                {/* ── AUTRES CAPACITÉS MOTEUR ──────────────────────────────── */}
                <section className="max-w-6xl mx-auto mb-32">
                    <motion.div {...fadeUp}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-slate-100 text-slate-800 p-2.5 rounded-xl border border-slate-200 shadow-sm">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Les facultés du moteur</h2>
                                <p className="text-slate-500 font-medium">Ce qu'Elazya est capable de faire sous le capot.</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherFaculties.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md rounded-3xl p-6 md:p-8 group hover:scale-[1.02] transition-all flex flex-col relative overflow-hidden cursor-pointer" onClick={() => setSelectedAgent(agent)}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                        <agent.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{agent.name}</h3>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Moteur</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed flex-1">{agent.tagline}</p>

                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 font-bold hover:text-primary transition-colors">Voir l'exemple complet →</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── ADVANTAGES ──────────────────────────────────── */}
                <section className="max-w-6xl mx-auto mb-32 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div {...fadeUp} className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm p-8 rounded-3xl flex flex-col items-start text-left group hover:scale-[1.02] transition-all">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                            <Lock className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">100% Privé, 100% sur ton Mac</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            Contrairement aux SaaS classiques qui engloutissent tes données sur leurs serveurs, ton équipe IA tourne en local. Tes factures, tes emails, tes contacts : tout reste sur ton disque dur.
                        </p>
                    </motion.div>

                    <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm p-8 rounded-3xl flex flex-col items-start text-left group hover:scale-[1.02] transition-all">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                            <Receipt className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">Aucun abonnement mensuel</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            Tu paies l'application une seule fois. Pas de récurrence, pas de surprise sur ta carte chaque mois. Tu es propriétaire de ton outil pour toujours.
                        </p>
                    </motion.div>

                    <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm p-8 rounded-3xl flex flex-col items-start text-left group hover:scale-[1.02] transition-all">
                        <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
                            <Terminal className="w-6 h-6 text-sky-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">Contrôle tes applications natives</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            Elazya ne triche pas avec de fausses intégrations incomplètes. L'équipe clique, tape et utilise les vraies applications de ton Mac (Mail, Finder, Pages, Notion) comme un humain le ferait.
                        </p>
                    </motion.div>

                    <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm p-8 rounded-3xl flex flex-col items-start text-left group hover:scale-[1.02] transition-all">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">Discute avec ton équipe</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            Connecte ton équipe à WhatsApp ou Telegram. Envoie un simple mémo vocal : "Génère la facture pour le client Dupont", et tes agents s'exécutent immédiatement sur ton Mac resté à la maison.
                        </p>
                    </motion.div>
                </section>

                {/* ── CTA ──────────────────────────────────────────── */}
                <section className="text-center pb-16">
                    <motion.div {...fadeUp}>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-6">Prêt à embaucher ton équipe ?</h2>
                        <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto">
                            Découvre nos formules à paiement unique et commence à déléguer tes tâches dès aujourd'hui.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/#pricing" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 md:px-10 py-4 w-full sm:w-auto justify-center bg-[#0f172a] text-white font-medium rounded-full shadow-[0_12px_24px_rgb(15,23,42,0.3)] flex items-center gap-2 hover:bg-slate-800 transition-all ring-1 ring-slate-800/20"
                                >
                                    Voir les offres
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

            </div>

            {/* ── MODAL AGENT ─────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedAgent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    >
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedAgent(null)} />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className={`h-32 bg-gradient-to-br ${selectedAgent.color} relative`}>
                                <button
                                    onClick={() => setSelectedAgent(null)}
                                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="absolute -bottom-8 left-8 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                                    <selectedAgent.icon className={`w-8 h-8 text-slate-800`} />
                                </div>
                            </div>
                            
                            <div className="px-8 pt-12 pb-8 overflow-y-auto">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedAgent.name}</h2>
                                    <span className="text-2xl">{selectedAgent.emoji}</span>
                                </div>
                                <p className="text-slate-500 font-medium mb-8 text-lg">{selectedAgent.tagline}</p>

                                <div className="mb-8">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Ce qu'il fait concrètement</h4>
                                    <ul className="space-y-3">
                                        {selectedAgent.features.map((f: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full mix-blend-multiply pointer-events-none"></div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                                        <Sparkles className="w-4 h-4 text-primary" /> Exemple concret
                                    </h4>
                                    <p className="text-slate-600 font-medium text-sm leading-relaxed relative z-10">
                                        {selectedAgent.example}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Gain de temps</span>
                                        <span className="text-emerald-700 font-bold text-lg">{selectedAgent.savings}</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Setup Initial</span>
                                        <span className="text-slate-700 font-bold text-lg">{selectedAgent.setup}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
