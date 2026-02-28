"use client"

import { Card } from "@/components/ui/Card"
import { Sparkles, Zap, Shield, Globe, Brain, Cpu, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

const versions = [
    {
        version: "v4.0",
        date: "10 Février 2026",
        title: "Intelligence Autonome",
        highlight: true,
        changes: [
            "Nouveau moteur d'IA autonome — Elazya planifie et exécute des séquences d'actions complexes",
            "Support de 18 fournisseurs LLM (OpenAI, Anthropic, Gemini, Groq, Mistral, Ollama...)",
            "Système de mémoire contextuelle amélioré avec persistance longue durée",
            "Interface repensée avec nouveau design premium indigo/violet",
            "Performance du système de skills multiplié par 3x",
        ],
        badges: ["Majeur", "IA", "Performance"],
    },
    {
        version: "v3.2",
        date: "28 Janvier 2026",
        title: "Multi-Canal & Telegram",
        highlight: false,
        changes: [
            "Intégration Telegram complète — discutez avec Elazya depuis votre téléphone",
            "Nouveau skill WhatsApp Business pour la gestion de messages",
            "Amélioration du scheduling avec support des fuseaux horaires",
            "Correction de bugs mineurs sur le skill Email",
        ],
        badges: ["Canaux", "Intégration"],
    },
    {
        version: "v3.0",
        date: "15 Janvier 2026",
        title: "Plateforme Skills v2",
        highlight: false,
        changes: [
            "Architecture de skills entièrement repensée pour plus de modularité",
            "44 compétences disponibles, contre 28 précédemment",
            "Nouveau skill Finder pour la gestion intelligente de fichiers",
            "Skill Notes pour l'interaction avec Apple Notes",
            "Skill Calendar pour la gestion avancée d'événements",
        ],
        badges: ["Majeur", "Skills"],
    },
    {
        version: "v2.1",
        date: "29 Décembre 2025",
        title: "La révolution Next.js",
        highlight: false,
        changes: [
            "Migration vers Next.js 14 App Router pour des performances fulgurantes",
            "Nouveau système de design Elazya 2.0",
            "Intégration Stripe pour un checkout en 1 clic",
            "Page documentation complète avec 8 sections",
        ],
        badges: ["Infrastructure"],
    },
    {
        version: "v2.0",
        date: "10 Décembre 2025",
        title: "Lancement Public",
        highlight: false,
        changes: [
            "Première version publique d'Elazya",
            "28 skills de base (Email, Recherche, Terminal, etc.)",
            "Support macOS natif avec installation en 1 clic",
            "Dashboard de gestion de licence intégré",
        ],
        badges: ["Lancement"],
    },
]

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-slate-800">
            {/* Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-purple-300/[0.2] mix-blend-multiply blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="container mx-auto px-4 py-32 md:py-40 max-w-4xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 shadow-sm rounded-full px-4 py-1.5 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Changelog</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
                        <span className="text-slate-800">Journal des</span>
                        {' '}
                        <span className="text-gradient-primary">mises à jour</span>
                    </h1>
                    <p className="text-lg font-medium text-slate-500 max-w-lg mx-auto">
                        Chaque version rapproche Elazya de l'assistant IA parfait. Suivez notre progression.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="space-y-12 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-primary via-slate-200 to-transparent" />

                    {versions.map((v, i) => (
                        <motion.div
                            key={v.version}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative pl-14"
                        >
                            {/* Dot */}
                            <div className={`absolute left-[12px] top-3 w-4 h-4 rounded-full border-4 border-background ${v.highlight ? 'bg-primary ring-4 ring-primary/20' : 'bg-slate-300'
                                }`} />

                            {/* Version Header */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={`font-bold text-lg ${v.highlight ? 'text-primary' : 'text-slate-500'}`}>
                                    {v.version}
                                </span>
                                <span className="text-slate-300 text-sm">·</span>
                                <span className="text-slate-400 font-medium text-sm">{v.date}</span>
                                <div className="flex gap-2 ml-auto">
                                    {v.badges.map(b => (
                                        <span key={b} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-slate-500 shadow-sm">
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Card */}
                            <div className={`p-8 rounded-3xl transition-shadow ${v.highlight ? 'bg-white border border-primary/30 shadow-[0_8px_30px_-4px_rgba(99,102,241,0.15)] ring-1 ring-primary/10' : 'bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-md'}`}>
                                <h3 className={`font-bold text-xl mb-5 ${v.highlight ? 'text-slate-800' : 'text-slate-700'}`}>{v.title}</h3>
                                <ul className="space-y-4">
                                    {v.changes.map((change, j) => (
                                        <li key={j} className="flex items-start gap-3 text-[15px] font-medium text-slate-600 leading-relaxed">
                                            <ArrowUpRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                                            {change}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
