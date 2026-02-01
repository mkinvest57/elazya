"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Terminal, Sparkles, Cpu, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

import Link from 'next/link'

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-40 overflow-hidden bg-surface-0">
            {/* Abyssal Background with Deep Glows */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
                            <Cpu className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Intelligence Autonome · v4.0</span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter mb-8 font-display italic">
                            VOTRE IA <br />
                            <span className="text-primary NOT-italic">PERSONNELLE.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed max-w-xl mb-12 font-light">
                            L'IA qui vit **chez vous**, pas dans un serveur américain.
                            Française. Locale. 44 super-pouvoirs pour agir sur votre machine.
                            <span className="block mt-4 text-white/80 font-medium italic">Zéro cloud, zéro abonnement, zéro donnée envoyée ailleurs.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/checkout">
                                <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-none px-12 h-16 text-lg font-black italic group tracking-tight">
                                    POSSÉDER ELAZYA — 200€
                                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="#philosophy">
                                <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-none px-12 h-16 text-lg font-bold italic tracking-tight backdrop-blur-md text-white">
                                    L'ÉTHIQUE LOCALE
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {[
                                { icon: Shield, label: "100% Souverain", sub: "Données locales" },
                                { icon: Terminal, label: "System Master", sub: "Contrôle Direct" },
                                { icon: Zap, label: "Zéro Latence", sub: "Moteur Hybride" }
                            ].map((feat, i) => (
                                <div key={i} className="group">
                                    <feat.icon className="w-5 h-5 text-primary mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-sm font-black uppercase tracking-widest text-white/90">{feat.label}</div>
                                    <div className="text-xs text-white/30">{feat.sub}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative mx-auto w-[400px] h-[820px] bg-[#080808] rounded-[4rem] border-[12px] border-[#1a1a1a] shadow-luxury-card overflow-hidden">
                            <div className="absolute inset-0 rounded-[3.2rem] overflow-hidden bg-black isolate">
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover opacity-90 scale-[1.01] grayscale-[0.2] hue-rotate-[-45deg]"
                                >
                                    <source src="/animations/alize-explainer-portrait.mp4" type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />
                                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black to-transparent opacity-40 pointer-events-none" />
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full border border-white/5" />
                                <div className="absolute top-20 left-8 right-8 flex justify-between items-center opacity-40">
                                    <div className="text-[10px] font-black tracking-widest uppercase text-white">System Core</div>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:200ms]" />
                                    </div>
                                </div>
                                <motion.div
                                    animate={{
                                        x: [200, 100, 300, 200],
                                        y: [400, 200, 600, 400]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute w-6 h-6 rounded-full bg-primary/20 blur-md pointer-events-none"
                                />
                            </div>
                        </div>

                        <div className="absolute -right-20 top-40 w-64 p-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl animate-float">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Autonomie Active</span>
                                <Globe className="w-4 h-4 text-white/20" />
                            </div>
                            <div className="text-xl font-bold mb-1 text-white font-display">Shadow Executive</div>
                            <div className="text-xs text-white/40 leading-relaxed font-light">
                                Analyse des contrats juridiques détectée. Synthèse prête.
                            </div>
                        </div>

                        <div className="absolute -left-20 bottom-40 w-64 p-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl animate-float [animation-delay:2s]">
                            <Zap className="w-6 h-6 text-primary mb-4" />
                            <div className="text-xl font-bold mb-1 text-white font-display">System Master</div>
                            <div className="text-xs text-white/40 leading-relaxed font-light">
                                42 tâches OS automatisées aujourd'hui.
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
