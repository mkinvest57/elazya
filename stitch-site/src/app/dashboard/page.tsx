"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Download, Key, LifeBuoy, Users, LogOut, ExternalLink, Copy, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
    return (
        <div className="relative overflow-hidden bg-surface-0 min-h-screen">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-4 py-12 md:py-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16"
                >
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Bienvenue, Sashimi !</h1>
                        <div className="flex items-center gap-2 text-sm text-foreground/40 font-medium">
                            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                            Licence Elazya Pro — Valide à vie
                        </div>
                    </div>
                    <Button variant="outline" className="border-white/5 bg-white/5 backdrop-blur hover:bg-white/10 group">
                        <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Déconnexion
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* License Card (Main) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8"
                    >
                        <Card className="glass-card p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                            <div className="relative z-10">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                                    <Key className="w-4 h-4" /> Ma Clé de Licence
                                </h3>

                                <div className="space-y-6">
                                    <div className="bg-black/60 border border-white/5 rounded-2xl p-6 font-mono text-xl md:text-2xl flex flex-col md:flex-row justify-between items-center gap-4 group/key">
                                        <span className="tracking-tighter text-white">ELZY-8374-KSDJ-9238-LZPF</span>
                                        <Button
                                            variant="ghost"
                                            className="h-12 w-full md:w-auto px-6 border border-white/5 hover:border-primary/50 text-xs uppercase font-black tracking-widest"
                                            onClick={() => {
                                                navigator.clipboard.writeText("ELZY-8374-KSDJ-9238-LZPF")
                                                alert("Clé copiée !")
                                            }}
                                        >
                                            <Copy className="w-3 h-3 mr-2" /> Copier
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5">
                                        <div className="space-y-1">
                                            <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/40">Date d'achat</div>
                                            <div className="text-sm font-bold">29 Jan 2026</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/40">Plan</div>
                                            <div className="text-sm font-bold text-primary">PERPÉTUELL (HT)</div>
                                        </div>
                                        <div className="space-y-1 ml-auto">
                                            <div className="text-[10px] uppercase tracking-widest font-bold text-foreground/40">Status</div>
                                            <div className="text-sm font-bold text-status-success">ACTIF</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Download Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4"
                    >
                        <Card className="glass-card p-8 h-full flex flex-col justify-between border-primary/20">
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <Download className="w-4 h-4 text-secondary" /> Setup Elazya
                                </h4>
                                <div className="mb-10">
                                    <div className="text-4xl font-black mb-2 italic">v2.1.4</div>
                                    <div className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Dernière mise à jour : Hier</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button className="w-full h-16 shadow-glow-cyan">
                                    Télécharger pour Mac
                                </Button>
                                <p className="text-center">
                                    <a href="#" className="text-[10px] uppercase tracking-widest font-black text-foreground/40 hover:text-primary transition-colors flex items-center justify-center gap-2">
                                        Voir toutes les versions <ExternalLink className="w-2 h-2" />
                                    </a>
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Bottom Row */}
                    {[
                        { icon: <LifeBuoy className="w-5 h-5 text-warning" />, title: "Support VIP", desc: "Besoin d'aide ? Notre équipe vous répond en moins de 2h." },
                        { icon: <Users className="w-5 h-5 text-secondary" />, title: "Club Discord", desc: "Rejoignez 4,203 pionniers de l'IA locale sur notre serveur." }
                    ].map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="lg:col-span-6"
                        >
                            <Card className="glass-card p-8 hover:bg-white/[0.05] transition-colors group cursor-pointer">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                                        {card.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-2 tracking-tight">{card.title}</h4>
                                        <p className="text-sm text-foreground/50 leading-relaxed mb-6">{card.desc}</p>
                                        <div className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                            Accéder maintenant <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
