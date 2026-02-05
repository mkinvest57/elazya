"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function PricingPage() {
    return (
        <div className="relative overflow-hidden bg-surface-0 min-h-screen">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />

            <div className="container mx-auto px-4 py-32 md:py-48 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest mb-6">
                        Paiement Unique • Usage Perpétuel
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter">
                        Un investissement <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">pour la vie.</span>
                    </h1>
                    <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
                        Elazya n'est pas un service. C'est un actif numérique qui vous appartient pour toujours.
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

                    {/* Left side info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tight">Ce qui est inclus</h3>
                            <p className="text-sm text-foreground/50">Tout ce dont vous avez besoin pour automatiser votre travail en local.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { icon: <Zap className="w-4 h-4" />, text: "44+ Skills Intégrés" },
                                { icon: <ShieldCheck className="w-4 h-4" />, text: "100% Confidentialité Locale" },
                                { icon: <Sparkles className="w-4 h-4" />, text: "Tokens Gemini Gratuits" }
                            ].map((item, i) => (
                                <motion.div
                                    key={item.text}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-surface-1/50 border border-white/5"
                                >
                                    <div className="text-primary">{item.icon}</div>
                                    <span className="text-sm font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* The Golden Ticket Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-3 relative group"
                    >
                        {/* Golden Glow Background */}
                        <div className="absolute -inset-4 bg-primary/20 hover:bg-primary/30 blur-[60px] rounded-[3rem] transition-colors duration-700" />

                        <Card className="relative overflow-hidden p-8 md:p-12 glass-card hover:border-primary/50 transition-colors duration-500">
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-noise" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="bg-primary text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-glow-cyan-strong">
                                    Meilleure Valeur • Licence Pro
                                </div>

                                <h3 className="text-3xl font-bold mb-4">Elazya Perpetual</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-7xl font-black italic tracking-tighter text-white">200€</span>
                                    <span className="text-sm text-foreground/40 font-bold uppercase tracking-widest">HT</span>
                                </div>

                                <Link href="/checkout" className="w-full mb-8">
                                    <Button size="lg" className="w-full h-16 text-lg font-bold shadow-glow-primary group">
                                        ACHETER MAINTENANT
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>

                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full border-t border-white/10 pt-8">
                                    {[
                                        "Tokens illimités*",
                                        "Updates à vie",
                                        "Discord VIP",
                                        "Support 24/7",
                                        "Open Source",
                                        "30j Garantie"
                                    ].map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs font-medium text-foreground/60">
                                            <Check className="w-3 h-3 text-primary" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Corner Reflections */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-3xl translate-x-1/2 translate-y-1/2" />
                        </Card>
                    </motion.div>
                </div>

                {/* Secure Trust Badges */}
                <div className="mt-24 flex justify-center items-center gap-8 opacity-30">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> SSL Secured
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <Zap className="w-4 h-4" /> Stripe Certified
                    </div>
                </div>
            </div>
        </div>
    )
}
