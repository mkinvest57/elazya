"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { MessageCircle, Twitter, Github, Users, Heart, ArrowRight, Star, Globe } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
    { value: "4,200+", label: "Utilisateurs actifs" },
    { value: "12k+", label: "Messages Discord" },
    { value: "98%", label: "Satisfaction" },
    { value: "24h", label: "Temps de réponse" },
]

const testimonials = [
    {
        quote: "Elazya a changé ma façon de travailler. L'IA locale est l'avenir.",
        author: "Thomas L.",
        role: "Développeur Full-Stack",
    },
    {
        quote: "Je ne reviendrais jamais à un assistant cloud. La confidentialité n'a pas de prix.",
        author: "Marie C.",
        role: "Avocate",
    },
    {
        quote: "L'intégration Telegram est incroyable. J'ai Elazya partout avec moi.",
        author: "Karim B.",
        role: "Entrepreneur",
    },
]

const channels = [
    {
        icon: MessageCircle,
        name: "Discord",
        desc: "Support prioritaire, bêtas exclusives, discussions techniques et partage de workflows.",
        members: "4,200+ membres",
        color: "text-primary",
        bg: "bg-primary/10",
        link: "https://discord.gg/elazya",
        cta: "Rejoindre Discord",
        primary: true,
    },
    {
        icon: Twitter,
        name: "Twitter / X",
        desc: "Annonces en temps réel, démos vidéo et mises à jour de développement.",
        members: "2,800+ abonnés",
        color: "text-slate-800",
        bg: "bg-slate-100",
        link: "https://twitter.com/ElazyaAI",
        cta: "Suivre @ElazyaAI",
        primary: false,
    },
    {
        icon: Github,
        name: "GitHub",
        desc: "Contribuez au développement, signalez des bugs et proposez des améliorations.",
        members: "Open Source",
        color: "text-slate-600",
        bg: "bg-slate-100",
        link: "https://github.com/elazya",
        cta: "Voir le dépôt",
        primary: false,
    },
]

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-slate-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-blue-300/[0.2] mix-blend-multiply blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="container mx-auto px-4 py-32 md:py-40 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20 max-w-2xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Communauté</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
                        <span className="text-slate-800">Rejoignez le</span>
                        {' '}
                        <span className="text-gradient-primary">mouvement.</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Des milliers de passionnés construisent ensemble le futur de l'IA locale et privée.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-3xl mx-auto"
                >
                    {stats.map(s => (
                        <div key={s.label} className="text-center p-6 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="text-3xl font-black text-primary mb-1">{s.value}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Channels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
                    {channels.map((ch, i) => (
                        <motion.div
                            key={ch.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                        >
                            <Card className="p-8 h-full flex flex-col bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className={`w-12 h-12 ${ch.bg} rounded-xl flex items-center justify-center mb-5 border border-slate-100 shadow-sm`}>
                                    <ch.icon className={`w-6 h-6 ${ch.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{ch.name}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-4 leading-relaxed flex-1">{ch.desc}</p>
                                <p className="text-xs font-bold text-slate-400 mb-6">{ch.members}</p>
                                <a href={ch.link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                                    <Button className={`w-full group font-bold tracking-wide ${ch.primary ? 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                                        {ch.cta}
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </a>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 mt-16">
                        Ce qu'ils en disent
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                            >
                                <Card className="p-8 h-full bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex gap-1.5 mb-5">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{t.author}</div>
                                        <div className="text-xs font-medium text-slate-500 mt-0.5">{t.role}</div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
