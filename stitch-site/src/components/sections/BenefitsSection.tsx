"use client"

import { motion } from "framer-motion"
import { Zap, Shield, BrainCircuit, BarChart3, MessageSquare, ArrowRight } from "lucide-react"

const benefits = [
    {
        icon: Zap,
        title: "12h récupérées par semaine",
        desc: "Devis, emails, relances — votre agent travaille 24/7 sans pause café.",
        large: true,
        gradient: "from-blue-50 to-indigo-50/50",
        borderColor: "border-blue-100",
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100/80",
    },
    {
        icon: Shield,
        title: "100% Local, 0 données cloud",
        desc: "Tout tourne sur votre Mac. Aucune donnée ne quitte jamais votre machine.",
        large: true,
        gradient: "from-emerald-50 to-green-50/50",
        borderColor: "border-emerald-100",
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-100/80",
    },
    {
        icon: BrainCircuit,
        title: "IA qui apprend votre style",
        desc: "Plus vous l'utilisez, plus elle vous ressemble. Vos templates, votre ton, vos habitudes.",
        large: false,
        gradient: "from-violet-50 to-purple-50/50",
        borderColor: "border-violet-100",
        iconColor: "text-violet-600",
        iconBg: "bg-violet-100/80",
    },
    {
        icon: BarChart3,
        title: "CRM toujours à jour",
        desc: "Pipeline, deals, follow-ups — tout est synchronisé automatiquement.",
        large: false,
        gradient: "from-amber-50 to-orange-50/50",
        borderColor: "border-amber-100",
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100/80",
    },
    {
        icon: MessageSquare,
        title: "Piloté par Telegram",
        desc: "Commandez votre IA depuis votre poche. Dictez, elle exécute.",
        large: false,
        gradient: "from-sky-50 to-cyan-50/50",
        borderColor: "border-sky-100",
        iconColor: "text-sky-600",
        iconBg: "bg-sky-100/80",
    },
]

export function BenefitsSection() {
    return (
        <section id="benefits" className="max-w-[1100px] mx-auto py-20 md:py-28 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-14"
            >
                <h2 className="text-[28px] md:text-[40px] font-geist font-bold text-[#0f172a] leading-tight">
                    Ce qu'Elazya change{" "}
                    <span className="font-instrument italic text-blue-600 font-normal">concrètement.</span>
                </h2>
            </motion.div>

            {/* 2 large cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {benefits.filter(b => b.large).map((b, i) => {
                    const Icon = b.icon
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
                            className={`group relative bg-gradient-to-br ${b.gradient} border ${b.borderColor} rounded-[20px] p-8 md:p-10 cursor-default hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                        >
                            <div className={`w-12 h-12 rounded-2xl ${b.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <Icon className={`w-6 h-6 ${b.iconColor}`} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-geist font-bold text-[#0f172a] mb-3 leading-snug">
                                {b.title}
                            </h3>
                            <p className="text-sm md:text-base font-geist text-[#373a46] opacity-70 leading-relaxed max-w-sm">
                                {b.desc}
                            </p>
                        </motion.div>
                    )
                })}
            </div>

            {/* 3 small cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {benefits.filter(b => !b.large).map((b, i) => {
                    const Icon = b.icon
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (i + 2) * 0.1, type: "spring", stiffness: 100, damping: 20 }}
                            className={`group relative bg-gradient-to-br ${b.gradient} border ${b.borderColor} rounded-[20px] p-7 cursor-default hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                        >
                            <div className={`w-10 h-10 rounded-xl ${b.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <Icon className={`w-5 h-5 ${b.iconColor}`} />
                            </div>
                            <h3 className="text-base font-geist font-bold text-[#0f172a] mb-2 leading-snug">
                                {b.title}
                            </h3>
                            <p className="text-sm font-geist text-[#373a46] opacity-70 leading-relaxed">
                                {b.desc}
                            </p>
                        </motion.div>
                    )
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 text-center"
            >
                <a
                    href="#booking"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-geist font-semibold text-white text-sm bg-gradient-to-b from-gray-800 to-[#0f172a] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:scale-[1.02] transition-all duration-300"
                >
                    En profiter maintenant
                    <ArrowRight className="w-4 h-4" />
                </a>
            </motion.div>
        </section>
    )
}
