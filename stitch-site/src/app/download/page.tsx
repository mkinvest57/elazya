"use client"

import { Download, Copy, Check, ArrowRight, Shield } from "lucide-react"
import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
    solo: { name: "Solo", color: "text-primary" },
    pro: { name: "Pro", color: "text-violet-500" },
    business: { name: "Business", color: "text-indigo-400" },
}

function DownloadContent() {
    const searchParams = useSearchParams()
    const plan = searchParams.get("plan") || "solo"
    const licenseKey = searchParams.get("key") || ""
    const planInfo = PLAN_LABELS[plan] || PLAN_LABELS["solo"]

    const [copied, setCopied] = useState(false)

    const copyKey = () => {
        if (licenseKey) {
            navigator.clipboard.writeText(licenseKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-slate-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-blue-300/[0.2] mix-blend-multiply blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="max-w-2xl mx-auto pt-32 pb-24 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                        <Check className="w-4 h-4" />
                        Paiement confirmé
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-800">
                        Votre licence <span className={planInfo.color}>{planInfo.name}</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Téléchargez Elazya et activez votre licence pour commencer.
                    </p>
                </motion.div>

                {/* License Key */}
                {licenseKey && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm rounded-3xl p-6 md:p-8 mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-primary" />
                            <h2 className="font-bold text-slate-800 text-xl tracking-tight">Votre clé de licence</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <code className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-lg font-mono font-bold text-primary tracking-wider select-all shadow-inner">
                                {licenseKey}
                            </code>
                            <button
                                onClick={copyKey}
                                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
                                title="Copier"
                            >
                                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-500" />}
                            </button>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed">
                            Conservez cette clé précieusement. Elle vous sera demandée à l&apos;ouverture d&apos;Elazya.
                        </p>
                    </motion.div>
                )}

                {/* Download */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm rounded-3xl p-6 md:p-8 mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Download className="w-6 h-6 text-violet-500" />
                        <h2 className="font-bold text-slate-800 text-xl tracking-tight">Télécharger Elazya</h2>
                    </div>
                    <a
                        href="https://github.com/mkinvest57/elazya/releases/download/v2.0.0/Elazya_2.0.0_aarch64.dmg"
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-lg shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:-translate-y-0.5 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        Télécharger pour macOS (.dmg)
                    </a>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-4 text-center">
                        macOS 13+ · Apple Silicon & Intel · ~150 Mo
                    </p>
                </motion.div>

                {/* Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8"
                >
                    <h2 className="font-bold text-slate-800 text-xl tracking-tight mb-8">Installation en 3 étapes</h2>
                    <div className="space-y-6">
                        {[
                            { step: "1", title: "Installez", desc: "Ouvrez le .dmg et glissez Elazya dans Applications" },
                            { step: "2", title: "Activez", desc: "Lancez Elazya et collez votre clé de licence" },
                            { step: "3", title: "Configurez", desc: "Connectez votre IA (OpenAI, Anthropic…) et activez votre premier agent" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-primary font-black text-sm">{item.step}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Help */}
                <div className="text-center mt-16 p-6 md:p-8 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm">
                    <p className="text-slate-600 font-bold mb-2">
                        Besoin d&apos;aide ?
                    </p>
                    <a href="mailto:support@elazya.com" className="text-primary hover:text-primary/80 font-bold text-lg transition-colors underline underline-offset-4">support@elazya.com</a>
                </div>
            </div>
        </div>
    )
}

export default function DownloadPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-slate-400 font-bold animate-pulse text-xl">Chargement de votre téléchargement...</div>
            </div>
        }>
            <DownloadContent />
        </Suspense>
    )
}
