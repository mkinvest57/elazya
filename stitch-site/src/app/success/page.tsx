"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { CheckCircle2, Download, MessageCircle, Sparkles, Mail, Key } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function SuccessPage() {
    return (
        <div className="relative overflow-hidden bg-surface-0 min-h-screen flex items-center justify-center">
            {/* Immersive Background */}
            <div className="absolute inset-0 bg-mesh opacity-30 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[150px] -z-10 animate-pulse-slow" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="mb-12 relative inline-block"
                    >
                        <div className="absolute -inset-8 bg-primary/30 blur-3xl rounded-full" />
                        <div className="w-32 h-32 rounded-full border-4 border-primary/50 flex items-center justify-center bg-black/40 backdrop-blur-xl relative z-10 shadow-glow-cyan">
                            <CheckCircle2 className="w-16 h-16 text-primary" />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4 border border-dashed border-primary/20 rounded-full"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase italic leading-none">
                            Bienvenue dans <br />
                            <span className="text-primary drop-shadow-glow-cyan italic">le futur local.</span>
                        </h1>
                        <p className="text-xl text-foreground/60 mb-16 max-w-xl mx-auto leading-relaxed">
                            Votre transaction a été validée. Alizé est prêt à transformer votre flux de travail.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-16"
                    >
                        <Card className="glass-card p-10 relative overflow-hidden group">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                {[
                                    { icon: <Download className="w-5 h-5 text-primary" />, title: "Download Link", desc: "Sent to your inbox" },
                                    { icon: <Key className="w-5 h-5 text-secondary" />, title: "License Key", desc: "Ready in dashboard" },
                                    { icon: <Mail className="w-5 h-5 text-status-warning" />, title: "Welcome Guide", desc: "Basic setup steps" },
                                    { icon: <Sparkles className="w-5 h-5 text-status-success" />, title: "VIP Access", desc: "Discord automation bot" }
                                ].map((item, i) => (
                                    <div key={item.title} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="mt-1">{item.icon}</div>
                                        <div>
                                            <div className="font-bold text-sm tracking-tight">{item.title}</div>
                                            <div className="text-xs text-foreground/40">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <Link href="/dashboard" className="group">
                            <Button size="lg" className="h-20 px-12 text-xl font-black shadow-glow-cyan-strong active:scale-95 transition-all">
                                ACCÉDER AU DASHBOARD
                            </Button>
                        </Link>
                        <Link href="https://discord.gg/example" target="_blank">
                            <Button variant="outline" size="lg" className="h-20 px-10 text-lg border-white/5 bg-white/5 backdrop-blur hover:bg-white/10 text-foreground/70">
                                <MessageCircle className="w-5 h-5 mr-3" /> Rejoindre la Communauté
                            </Button>
                        </Link>
                    </motion.div>

                    <p className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
                        Transaction sécurisée par Stripe & Alizé Private Ops
                    </p>
                </div>
            </div>
        </div>
    )
}
