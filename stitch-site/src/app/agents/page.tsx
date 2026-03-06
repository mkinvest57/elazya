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
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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
                                className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md rounded-3xl p-6 md:p-8 group hover:scale-[1.02] transition-all flex flex-col"
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
                                className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl group hover:scale-[1.02] transition-all flex flex-col relative overflow-hidden border border-primary/20 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)]"
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
                                className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md rounded-3xl p-6 md:p-8 group hover:scale-[1.02] transition-all flex flex-col relative overflow-hidden"
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
        </div>
    )
}
