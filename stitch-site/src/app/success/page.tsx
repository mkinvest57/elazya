"use client"

import React, { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Download, MessageCircle, Home, Check, Sparkles, Shield, Zap, Copy, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from "next/navigation"

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
    solo: { name: "Solo", color: "text-emerald-600" },
    pro: { name: "Pro", color: "text-primary" },
    business: { name: "Business", color: "text-slate-800" },
}

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")

    const [licenseKey, setLicenseKey] = useState<string | null>(null)
    const [plan, setPlan] = useState<string>("solo")
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(!!sessionId)
    const [error, setError] = useState<string | null>(null)

    // Fetch license key from API using session ID
    useEffect(() => {
        if (!sessionId) return

        fetch(`/api/generate-license?session=${sessionId}`)
            .then(res => {
                if (!res.ok) throw new Error("Payment verification failed")
                return res.json()
            })
            .then(data => {
                setLicenseKey(data.key)
                setPlan(data.plan || "solo")
                setLoading(false)
            })
            .catch(err => {
                console.error("License fetch error:", err)
                setError("Impossible de vérifier le paiement. Contactez support@elazya.com")
                setLoading(false)
            })
    }, [sessionId])

    const planInfo = PLAN_LABELS[plan] || PLAN_LABELS["solo"]

    const copyKey = () => {
        if (licenseKey) {
            navigator.clipboard.writeText(licenseKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-background text-slate-800 relative overflow-hidden">
            {/* Minimalist Grid & Blur Background */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-blue-300/[0.3] blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
            <div className="absolute top-[40%] right-[-10%] w-[30vw] h-[30vw] bg-purple-300/[0.3] blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="relative z-10 pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-2xl">

                    {/* Success badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Check className="w-10 h-10 text-white stroke-[3]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Headings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/70 border border-slate-200 shadow-sm rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
                            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">v2.0.0</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
                            <span className="text-slate-800">Votre licence</span>
                            <br />
                            <span className={planInfo.color}>Elazya {planInfo.name}</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                            Téléchargez Elazya et collez votre clé de licence pour commencer.
                        </p>
                    </motion.div>

                    {/* License Key Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="relative group mb-6"
                    >
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-400 via-primary/40 to-emerald-400 rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-[2px]" />
                        <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-bold text-lg text-slate-800">Votre clé de licence</h3>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                                    <span className="ml-3 text-slate-500 font-medium">Vérification du paiement...</span>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-red-600 text-sm font-medium shadow-inner">
                                    {error}
                                </div>
                            ) : licenseKey ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <code className="flex-1 bg-slate-50 border border-slate-200 shadow-inner rounded-xl px-5 py-4 text-lg font-mono text-slate-800 font-bold tracking-wider select-all">
                                            {licenseKey}
                                        </code>
                                        <button
                                            onClick={copyKey}
                                            className="p-4 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white transition-colors shadow-sm"
                                            title="Copier"
                                        >
                                            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-white" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4 font-medium">
                                        Conservez cette clé précieusement. Elle vous sera demandée à l&apos;ouverture d&apos;Elazya.
                                    </p>
                                </>
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 shadow-inner rounded-xl px-5 py-4 text-slate-500 font-medium text-sm">
                                    Session de paiement non trouvée. Vérifiez votre email pour votre clé.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Download Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group mb-6"
                    >
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-[2px]" />
                        <div className="relative bg-white/90 backdrop-blur-xl border border-primary/20 shadow-[0_8px_30px_-4px_rgba(99,102,241,0.15)] rounded-3xl p-8 md:p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                                    <Download className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Téléchargez Elazya</h3>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">v2.0.0 • macOS Universal</p>
                                </div>
                            </div>

                            <a
                                href="https://elazya.com/downloads/Elazya_2.0.0_aarch64.dmg"
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-lg transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5"
                            >
                                <Download className="w-5 h-5" />
                                Télécharger le DMG
                                <span className="text-sm font-normal opacity-80 ml-1">~184 MB (Mis à jour le 3 Mars 2026 à 21:44)</span>
                            </a>

                            {/* Feature badges */}
                            <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                                {[
                                    { icon: Sparkles, label: '10 Agents IA', color: 'text-primary', bg: 'bg-primary/10' },
                                    { icon: Shield, label: '100% Local', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { icon: Zap, label: 'Autonome', color: 'text-amber-500', bg: 'bg-amber-50' },
                                ].map((feat, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 py-2">
                                        <div className={`w-9 h-9 rounded-lg ${feat.bg} flex items-center justify-center border border-slate-100`}>
                                            <feat.icon className={`w-4 h-4 ${feat.color}`} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{feat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Installation Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm mb-6"
                    >
                        <h4 className="text-base font-bold mb-6 text-slate-800">Installation en 4 étapes</h4>
                        <div className="space-y-6">
                            {[
                                { step: '1', text: <>Ouvrez le fichier <code className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-primary text-xs font-mono shadow-inner">.dmg</code> téléchargé</> },
                                { step: '2', text: <>Glissez <strong className="text-slate-800">Elazya</strong> dans le dossier <strong className="text-slate-800">Applications</strong></> },
                                { step: '3', text: <>Lancez <strong className="text-slate-800">Elazya</strong> et collez votre <strong className="text-emerald-600">clé de licence</strong></> },
                                { step: '4', text: <>Configurez vos <strong className="text-slate-800">premiers agents</strong> et c&apos;est parti !</> },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-sm border border-primary/20">
                                        {item.step}
                                    </div>
                                    <div className="pt-1">
                                        <span className="text-sm font-medium text-slate-600">{item.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Gatekeeper Warning */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="p-8 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm mb-6"
                    >
                        <h4 className="text-base font-bold mb-3 text-amber-600 flex items-center gap-2 tracking-tight">
                            <Shield className="w-5 h-5" />
                            Erreur « L&apos;application est endommagée » ?
                        </h4>
                        <p className="text-sm text-slate-600 font-medium mb-5 leading-relaxed">
                            Si macOS affiche ce message lors du premier lancement, c&apos;est la sécurité <strong>Gatekeeper</strong> qui bloque l&apos;application car elle n&apos;est pas encore signée par Apple. Pour corriger cela :
                        </p>
                        <div className="bg-[#0f172a] rounded-xl p-4 font-mono text-xs text-amber-300 relative group flex items-center justify-between shadow-inner">
                            <code>xattr -cr /Applications/Elazya.app</code>
                            <button
                                onClick={() => navigator.clipboard.writeText("xattr -cr /Applications/Elazya.app")}
                                className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                                title="Copier"
                            >
                                <Copy className="w-4 h-4 text-amber-300" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-4">
                            Ouvrez l&apos;application <strong className="text-slate-700">Terminal</strong> de votre Mac, collez cette commande et appuyez sur Entrée. Vous pourrez ensuite lancer Elazya normalement.
                        </p>
                    </motion.div>

                    {/* What's included */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm mb-10"
                    >
                        <h4 className="text-base font-bold mb-5 text-slate-800">Inclus avec votre licence</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                'Elazya v2.0.0 pour macOS',
                                'Mises à jour à vie',
                                '10 agents IA spécialisés',
                                'Facture professionnelle',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <a href="https://discord.gg/elazya" target="_blank" rel="noreferrer">
                            <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-full font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all">
                                <MessageCircle className="w-4 h-4 mr-2 text-primary" />
                                Rejoindre le Discord
                            </Button>
                        </a>
                        <Link href="/">
                            <Button variant="ghost" className="w-full sm:w-auto h-12 px-6 rounded-full font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
                                <Home className="w-4 h-4 mr-2" />
                                Retour à l&apos;accueil
                            </Button>
                        </Link>
                    </div>

                    {/* Footer note */}
                    <div className="text-center text-sm text-slate-400 font-medium space-y-1">
                        <p>Un email de confirmation contenant votre facture a été envoyé.</p>
                        <p>Besoin d&apos;aide ? <a href="mailto:support@elazya.com" className="text-primary hover:text-primary/80 transition-colors font-bold">support@elazya.com</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-slate-400 font-bold animate-pulse">Chargement de votre achat...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
