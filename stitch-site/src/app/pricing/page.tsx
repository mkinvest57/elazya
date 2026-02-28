"use client"

import { Button } from "@/components/ui/Button"
import {
    CheckCircle2,
    ArrowRight,
    Zap,
    Wallet,
    Package,
    ShieldCheck,
    WifiOff,
    Lock,
    ChevronDown,
    ChevronUp,
    Users,
    Clock,
    FileText,
    Mail,
    Search,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { GlassBackground } from "@/components/ui/GlassBackground"

// Sovereign Theme Constants (adjusted for light theme)
const GOLD = "#EAB308"
const INDIGO = "#6366F1"

export default function PricingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index)
    }

    return (
        <div className="bg-background min-h-screen font-sans text-slate-800 overflow-x-hidden selection:bg-primary/20">
            {/* Minimalist Grid & Blur Background specifically for Pricing Page if GlassBackground is not used, 
                but we use GlassBackground for consistency. */}
            <div className="fixed inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-400 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-400 blur-[150px] rounded-full"></div>
            </div>
            
            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="relative z-10 pt-32 pb-24 px-6 mt-10">

                {/* Hero Section */}
                <header className="max-w-5xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Souveraineté Numérique Totale
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-bold mb-8 tracking-tight leading-[1.05]">
                            <span className="text-slate-800">Obtenez votre</span><br />
                            <span className="text-gradient-primary">licence macOS.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium tracking-wide">
                            Une application native qui automatise vos tâches. 100% local, sans abonnement mensuel caché pour l'outil.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/checkout?plan=solo" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full sm:w-auto justify-center px-6 md:px-10 py-4 bg-[#0f172a] hover:bg-slate-800 text-white font-medium rounded-full shadow-[0_12px_24px_rgb(15,23,42,0.3)] flex items-center gap-2 text-base transition-all ring-1 ring-slate-800/20"
                                >
                                    ACHETER LA LICENCE (197€)
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                            <Link href="/checkout?plan=trial" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full sm:w-auto justify-center px-6 md:px-10 py-4 bg-white/70 border border-slate-200 shadow-sm font-medium rounded-full text-slate-700 hover:text-slate-900 transition-all backdrop-blur-md"
                                >
                                    ESSAI 14 JOURS
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </header>

                {/* ROI Highlight */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mb-32"
                >
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] p-6 md:p-10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all duration-700"></div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3 justify-center md:justify-start">
                                    <span className="p-2 bg-slate-100 rounded-xl"><Wallet className="text-slate-700 w-6 h-6" /></span>
                                    Rentabilisé en 21 jours
                                </h3>
                                <p className="text-slate-500 font-medium">Coût unique Elazya (197€) <span className="text-slate-300 px-2 font-normal">vs</span> ChatGPT Pro (240€/an)</p>
                            </div>
                            <div className="text-center md:text-right">
                                <div className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
                                    +2 500€ / AN
                                </div>
                                <div className="text-primary font-bold text-xs uppercase tracking-[0.2em] mt-2">Économie & Productivité</div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Licenses Section */}
                <main className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex items-center justify-center gap-4 text-slate-800">
                            Achetez <span className="text-gradient-primary">Elazya</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto">
                            Payez une seule fois. Des agents métiers qui travaillent pour vous sans retenue.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Solo */}
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md p-6 md:p-8 rounded-3xl transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Solo</h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Freelance solo · 5 agents Core, 1 utilisateur</p>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tight">197€</div>
                                    <div className="text-xs font-semibold text-slate-400 text-right mt-1 uppercase tracking-widest">TTC · une fois</div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6 text-slate-600 font-medium">
                                <li className="flex items-center gap-3"><FileText className="text-green-500 w-5 h-5 flex-shrink-0" /> 💰 Facturation Auto</li>
                                <li className="flex items-center gap-3"><Mail className="text-green-500 w-5 h-5 flex-shrink-0" /> 📧 Onboarding Client Express</li>
                                <li className="flex items-center gap-3"><Search className="text-green-500 w-5 h-5 flex-shrink-0" /> 📱 LinkedIn Digest + 🎯 Qualification + 🏃 Routine</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" /> 5 agents IA activés</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" /> 1 machine, 1 utilisateur</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" /> Support email 72h</li>
                            </ul>
                            <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100">
                                <Clock className="text-green-600 w-4 h-4" />
                                <span className="text-green-700 text-sm font-bold">ROI : 3h/semaine récupérées</span>
                            </div>
                            <Link href="/checkout?plan=solo">
                                <button className="w-full py-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">Commander Solo</button>
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl relative border border-primary/20 shadow-[0_8px_30px_-4px_rgba(99,102,241,0.15)] overflow-hidden scale-100 md:scale-[1.02]">
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-sm">Populaire</div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight text-primary">Pro</h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Agence 2–10 pers. · 8 agents, 3 utilisateurs</p>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tight">497€</div>
                                    <div className="text-xs font-semibold text-slate-400 text-right mt-1 uppercase tracking-widest">TTC · une fois</div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6 text-slate-600 font-medium">
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" /> Tout Solo (5 agents Core) +</li>
                                <li className="flex items-center gap-3"><Zap className="text-primary w-5 h-5 flex-shrink-0" /> 🎨 CRM Prospect Auto</li>
                                <li className="flex items-center gap-3"><Zap className="text-primary w-5 h-5 flex-shrink-0" /> 📄 Devis Express</li>
                                <li className="flex items-center gap-3"><Zap className="text-primary w-5 h-5 flex-shrink-0" /> 💼 Email Intelligent</li>
                                <li className="flex items-center gap-3"><Users className="text-primary w-5 h-5 flex-shrink-0" /> 3 utilisateurs, 3 machines</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" /> Support email 48h</li>
                            </ul>
                            <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
                                <Clock className="text-primary w-4 h-4" />
                                <span className="text-primary text-sm font-bold">ROI : 10h/semaine récupérées</span>
                            </div>
                            <Link href="/checkout?plan=pro">
                                <button className="w-full py-4 rounded-xl bg-[#0f172a] text-white font-bold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                    Obtenir la Licence Pro <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>

                        {/* Business */}
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md p-6 md:p-8 rounded-3xl transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Business</h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1">PME 10–50 pers. · 10 agents, 10 utilisateurs</p>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tight">997€</div>
                                    <div className="text-xs font-semibold text-slate-400 text-right mt-1 uppercase tracking-widest">TTC · une fois</div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6 text-slate-600 font-medium">
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400 w-5 h-5 flex-shrink-0" /> Tout Pro (8 agents) +</li>
                                <li className="flex items-center gap-3"><Zap className="text-indigo-400 w-5 h-5 flex-shrink-0" /> 📊 Compta Export</li>
                                <li className="flex items-center gap-3"><Zap className="text-indigo-400 w-5 h-5 flex-shrink-0" /> 🚀 Content Auto LinkedIn</li>
                                <li className="flex items-center gap-3"><Users className="text-indigo-400 w-5 h-5 flex-shrink-0" /> 10 utilisateurs, machines illimitées</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400 w-5 h-5 flex-shrink-0" /> Logs & exports conformité</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400 w-5 h-5 flex-shrink-0" /> Support email 24h + call mensuel</li>
                            </ul>
                            <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                                <Clock className="text-indigo-600 w-4 h-4" />
                                <span className="text-indigo-700 text-sm font-bold">ROI : 15h/semaine pour l&apos;équipe</span>
                            </div>
                            <Link href="/checkout?plan=business">
                                <button className="w-full py-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">Commander Business</button>
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center gap-3 mt-16 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 shadow-sm w-fit mx-auto"
                >
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-slate-700 font-bold text-sm tracking-wide">Paiement unique — aucun abonnement caché</span>
                </motion.div>

                {/* Agents per Plan Table */}
                <section className="max-w-5xl mx-auto mt-32 mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-center mb-4">Ce que vous obtenez <span className="text-gradient-primary">par plan</span></h2>
                        <p className="text-center text-slate-500 font-medium mb-12 max-w-xl mx-auto text-sm">10 agents IA spécialisés, répartis par plan. Tous configurables en 1 à 4 minutes.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm"
                    >
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/80">
                                    <th className="p-5 font-bold text-slate-500 pl-8">Agent</th>
                                    <th className="p-5 font-bold text-slate-700 text-center">Solo<br/><span className="text-xs font-semibold text-slate-400">197€</span></th>
                                    <th className="p-5 font-bold text-primary text-center">Pro<br/><span className="text-xs font-semibold text-primary/60">497€</span></th>
                                    <th className="p-5 font-bold text-slate-700 text-center">Business<br/><span className="text-xs font-semibold text-slate-400">997€</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Section: Core */}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={4} className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Agents Core</td>
                                </tr>
                                {[
                                    { name: "💰 Facturation Auto", solo: true, pro: true, biz: true },
                                    { name: "📧 Onboarding Client Express", solo: true, pro: true, biz: true },
                                    { name: "📱 LinkedIn Digest", solo: true, pro: true, biz: true },
                                    { name: "🎯 Qualification Leads Auto", solo: true, pro: true, biz: true },
                                    { name: "🏃 Routine Matinale Auto", solo: true, pro: true, biz: true },
                                ].map((row, i) => (
                                    <tr key={`core-${i}`} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-4 text-slate-700 text-sm font-medium">{row.name}</td>
                                        <td className="px-5 py-4 text-center text-green-500 text-lg">{row.solo ? "✅" : "—"}</td>
                                        <td className="px-5 py-4 text-center text-green-500 text-lg">{row.pro ? "✅" : "—"}</td>
                                        <td className="px-5 py-4 text-center text-green-500 text-lg">{row.biz ? "✅" : "—"}</td>
                                    </tr>
                                ))}

                                {/* Section: Pro */}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={4} className="px-8 py-3 text-[11px] font-bold text-primary/60 uppercase tracking-widest">Agents Pro</td>
                                </tr>
                                {[
                                    { name: "🎨 CRM Prospect Auto", solo: false, pro: true, biz: true },
                                    { name: "📄 Devis Express", solo: false, pro: true, biz: true },
                                    { name: "💼 Email Intelligent", solo: false, pro: true, biz: true },
                                ].map((row, i) => (
                                    <tr key={`pro-${i}`} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-4 text-slate-700 text-sm font-medium">{row.name}</td>
                                        <td className="px-5 py-4 text-center text-slate-300 text-sm font-bold">{row.solo ? "✅" : "—"}</td>
                                        <td className="px-5 py-4 text-center text-green-500 text-lg">{row.pro ? "✅" : "—"}</td>
                                        <td className="px-5 py-4 text-center text-green-500 text-lg">{row.biz ? "✅" : "—"}</td>
                                    </tr>
                                ))}

                                {/* Section: Business */}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={4} className="px-8 py-3 text-[11px] font-bold text-slate-500/60 uppercase tracking-widest">Agents Business</td>
                                </tr>
                                {[
                                    { name: "📊 Compta Export", solo: false, pro: false, biz: true },
                                    { name: "🚀 Content Auto LinkedIn", solo: false, pro: false, biz: true },
                                ].map((row, i) => (
                                    <tr key={`biz-${i}`} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-4 text-slate-700 text-sm font-medium">{row.name}</td>
                                        <td className="px-5 py-4 text-center text-slate-300 text-sm font-bold">—</td>
                                        <td className="px-5 py-4 text-center text-slate-300 text-sm font-bold">{row.pro ? "✅" : "—"}</td>
                                        <td className="px-5 py-4 text-center text-green-500 text-lg">{row.biz ? "✅" : "—"}</td>
                                    </tr>
                                ))}

                                {/* Section: Limites */}
                                <tr className="bg-slate-100/50 border-t border-slate-200">
                                    <td colSpan={4} className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Limites & Services</td>
                                </tr>
                                <tr className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-8 py-4 text-slate-700 text-sm font-bold">Utilisateurs</td>
                                    <td className="px-5 py-4 text-center text-slate-600 text-sm font-bold bg-white">1</td>
                                    <td className="px-5 py-4 text-center text-slate-900 text-sm font-bold bg-primary/5">3</td>
                                    <td className="px-5 py-4 text-center text-slate-900 text-sm font-bold bg-white">10</td>
                                </tr>
                                <tr className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-8 py-4 text-slate-700 text-sm font-bold">Machines</td>
                                    <td className="px-5 py-4 text-center text-slate-600 text-sm font-bold bg-white">1</td>
                                    <td className="px-5 py-4 text-center text-slate-900 text-sm font-bold bg-primary/5">3</td>
                                    <td className="px-5 py-4 text-center text-slate-900 text-sm font-bold bg-white">Illimité</td>
                                </tr>
                                <tr className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-8 py-4 text-slate-700 text-sm font-bold">Support</td>
                                    <td className="px-5 py-4 text-center text-slate-500 text-xs font-medium bg-white">Email 72h</td>
                                    <td className="px-5 py-4 text-center text-slate-800 text-xs font-bold bg-primary/5">Email 48h</td>
                                    <td className="px-5 py-4 text-center text-slate-800 text-xs font-bold bg-white">Email 24h + Call</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    </motion.div>

                    <p className="text-center text-slate-500 text-sm mt-6 font-medium">
                        💡 Tous les agents sont configurables en 1-4 minutes.{' '}
                        <Link href="/agents" className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4">
                            Voir le détail de chaque agent →
                        </Link>
                    </p>
                </section>

                {/* Comparison Table */}
                <section className="max-w-6xl mx-auto mt-16 mb-24">
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-16 text-slate-800">Le choix de la <span className="text-gradient-primary">liberté</span></h2>
                    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="p-6 font-bold text-slate-500 pl-10 uppercase tracking-widest text-xs">Fonctionnalité</th>
                                    <th className="p-6 font-bold text-slate-900 w-1/3 uppercase tracking-widest text-xs">ELAZYA IA</th>
                                    <th className="p-6 font-bold text-slate-400 w-1/3 uppercase tracking-widest text-xs">CLOUD IA (SaaS)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { k: "Confidentialité", v1: "100% Locale & Privée", v2: "Données analysées", good: true },
                                    { k: "Connexion Internet", v1: "Non requise (Offline)", v2: "Obligatoire", good: true },
                                    { k: "Coût sur 3 ans", v1: "197€ (Fixe)", v2: "~750€ (Abonnement)", good: true },
                                    { k: "Accès Fichiers", v1: "Natif (OS Level)", v2: "Upload manuel", good: true },
                                    { k: "Censure", v1: "Aucune (Modèle Ouvert)", v2: "Filtrage Strict", good: true },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6 text-slate-600 pl-10 font-bold">{row.k}</td>
                                        <td className="p-6 text-slate-800 font-medium flex items-center gap-2">
                                            {row.good ? <ShieldCheck className="text-emerald-500 w-5 h-5 bg-emerald-50 rounded-full p-0.5 border border-emerald-100" /> : null}
                                            {row.v1}
                                        </td>
                                        <td className="p-6 text-slate-400 font-medium">{row.v2}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="max-w-3xl mx-auto mb-32">
                    <h2 className="text-3xl font-bold text-center mb-12 tracking-tight text-slate-800">FAQ</h2>
                    <div className="space-y-4">
                        {[
                            { q: "Est-ce vraiment un paiement unique ?", a: "Oui. Vous achetez la licence logicielle une fois, comme un logiciel classique. Aucun abonnement caché, aucune surprise." },
                            { q: "Puis-je changer de plan plus tard ?", a: "Oui. Passez de Solo à Pro (300€) ou de Pro à Business (500€) directement depuis l'application. La différence de prix est déduite." },
                            { q: "Proposez-vous des agents sur-mesure ?", a: "Oui. Agent Custom : 1 500€. Contactez-nous à sales@elazya.com pour un devis personnalisé adapté à votre métier." },
                            { q: "Quelle configuration Mac faut-il ?", a: "Nous recommandons un Mac M1/M2/M3/M4 avec 16 Go de RAM minimum. Les puces Apple Silicon offrent les meilleures performances." },
                            { q: "Puis-je l'installer sur plusieurs machines ?", a: "Solo : 1 poste. Pro : jusqu'à 3 postes. Business : postes illimités. La même licence fonctionne sur toutes vos machines." },
                            { q: "Et si la technologie évolue ?", a: "Vous recevez toutes les mises à jour logicielles gratuitement. Les nouveaux modèles d'IA peuvent être téléchargés séparément." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-slate-800">{item.q}</span>
                                    {openFaq === i ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-slate-400" />}
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pb-6 text-slate-500 font-medium text-sm leading-relaxed"
                                        >
                                            {item.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="text-center pb-32">
                    <div className="inline-block relative group">
                        <Link href="/checkout?plan=solo">
                            <motion.button 
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative px-8 sm:px-12 py-5 bg-[#0f172a] text-white text-base sm:text-lg font-bold rounded-full shadow-[0_12px_24px_rgb(15,23,42,0.3)] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 mx-auto ring-1 ring-slate-800/20"
                            >
                                TELECHARGER POUR MAC
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </Link>
                    </div>
                    <p className="mt-8 text-slate-500 font-medium text-sm">Garantie satisfait ou remboursé 30 jours.</p>
                </section>

            </div>
        </div>
    )
}
