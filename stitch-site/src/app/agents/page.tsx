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
                            10 Agents Métiers Souverains
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.05]">
                            <span className="text-slate-800">Que peut faire</span><br />
                            <span className="text-gradient-primary">l'application Elazya ?</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Découvrez les scripts automatisés de niveau macOS fournis avec votre licence. Ils contrôlent vos applications locales pour exécuter vos tâches à votre place.
                        </p>

                        {/* Social proof */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 text-slate-600 shadow-sm backdrop-blur-md">
                                <Zap className="w-4 h-4 text-emerald-500" /> Setup en 2 minutes
                            </span>
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 text-slate-600 shadow-sm backdrop-blur-md">
                                <Sparkles className="w-4 h-4 text-primary" /> 2-10h/semaine sauvées
                            </span>
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200 text-slate-600 shadow-sm backdrop-blur-md">
                                🇫🇷 100% local, souverain
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
                                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Agents Core</h2>
                                <p className="text-slate-500 font-medium">Inclus dans Solo, Pro et Business</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-12">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">Solo</span>
                            <span className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">Pro</span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">Business</span>
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
                                        <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Core</span>
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
                                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Agents Pro</h2>
                                <p className="text-slate-500 font-medium">Inclus avec Pro et Business</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-12">
                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">Pro</span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">Business</span>
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
                                {/* Pro badge */}
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <Lock className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">PRO</span>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                        <agent.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{agent.name}</h3>
                                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Pro</span>
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

                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="text-primary font-bold">{agent.savings}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 font-semibold">{agent.setup}</span>
                                    </div>
                                </div>

                                <Link href="/pricing">
                                    <button className="w-full py-3 rounded-xl border border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 transition-colors shadow-sm">
                                        Passer à Pro → 497€
                                    </button>
                                </Link>
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
                                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Agents Business</h2>
                                <p className="text-slate-500 font-medium">Business uniquement</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-12">
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">Business</span>
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
                                {/* Business badge */}
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                                    <Lock className="w-3 h-3 text-slate-500" />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">BUSINESS</span>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                        <agent.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{agent.name}</h3>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Business</span>
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

                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-slate-600" />
                                        <span className="text-slate-700 font-bold">{agent.savings}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500 font-semibold">{agent.setup}</span>
                                    </div>
                                </div>

                                <Link href="/pricing">
                                    <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                                        Passer à Business → 997€
                                    </button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── TOTAL VALUE ──────────────────────────────────── */}
                <section className="max-w-4xl mx-auto mb-32">
                    <motion.div {...fadeUp}>
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-6 md:p-10 rounded-3xl relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-2xl font-bold tracking-tight text-slate-800 mb-3">
                                    10 agents. <span className="text-gradient-primary">Un seul achat.</span>
                                </h3>
                                <p className="text-slate-500 font-medium mb-8 max-w-xl mx-auto">
                                    Chaque agent est configurable en moins de 4 minutes.
                                    Ensemble, ils récupèrent plus de 10 heures par semaine.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                    <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                                        <div className="text-3xl font-black text-emerald-600">5</div>
                                        <div className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Agents Core</div>
                                    </div>
                                    <div className="text-center p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
                                        <div className="text-3xl font-black text-primary">+3</div>
                                        <div className="text-xs font-bold text-primary/70 uppercase tracking-widest mt-1">Agents Pro</div>
                                    </div>
                                    <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                                        <div className="text-3xl font-black text-slate-700">+2</div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Agents Business</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* ── CTA ──────────────────────────────────────────── */}
                <section className="text-center pb-16">
                    <motion.div {...fadeUp}>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-6">Prêt à déléguer ?</h2>
                        <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto">
                            Choisissez votre plan et laissez les agents travailler pour vous dès les premières minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/pricing" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 md:px-10 py-4 w-full sm:w-auto justify-center bg-[#0f172a] text-white font-medium rounded-full shadow-[0_12px_24px_rgb(15,23,42,0.3)] flex items-center gap-2 hover:bg-slate-800 transition-all ring-1 ring-slate-800/20"
                                >
                                    Voir les tarifs
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
