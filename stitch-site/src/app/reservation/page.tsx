"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Suspense } from "react"

/* ─── COUNTDOWN ─── */
const LAUNCH = new Date("2026-04-05T00:00:00+02:00").getTime()
function useCountdown() {
    const calc = useCallback(() => {
        const d = Math.max(0, LAUNCH - Date.now())
        return { days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) }
    }, [])
    const [t, setT] = useState(calc)
    useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [calc])
    return t
}

/* ─── PLANS DATA ─── */
const PLANS = [
    { id: "solo", name: "SOLO", pitch: "Tu ouvres Elazya le matin. Tout est déjà fait.", now: "9€", after: "88€", full: "197€" },
    { id: "pro", name: "PRO", pitch: "Tes agents travaillent ensemble, pas juste chacun de leur côté.", now: "9€", after: "238€", full: "497€" },
    { id: "studio", name: "STUDIO", pitch: "Elazya tourne ta structure pendant que tu dors.", now: "9€", after: "488€", full: "997€" },
]

function ReservationContent() {
    const searchParams = useSearchParams()
    const preselected = searchParams.get("plan") || "solo"
    const [selected, setSelected] = useState(preselected)
    const [email, setEmail] = useState(searchParams.get("email") || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [places, setPlaces] = useState(47)
    const c = useCountdown()

    useEffect(() => {
        fetch("/api/waitlist").then(r => r.json()).then(d => setPlaces(d.places || 47)).catch(() => { })
    }, [])

    const handleCheckout = async () => {
        if (!email.includes("@")) { setError("Email invalide"); return }
        setLoading(true)
        setError("")
        try {
            const r = await fetch("/api/reservation/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.toLowerCase().trim(), plan: selected }),
            })
            const d = await r.json()
            if (!r.ok) { setError(d.error || "Erreur"); setLoading(false); return }
            if (d.url) window.location.href = d.url
        } catch {
            setError("Erreur réseau")
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#f8fbff] text-slate-800 font-sans">
            {/* Warning banner */}
            <div className="bg-amber-50 border-b border-amber-200">
                <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                    <span className="text-sm font-bold text-amber-800">⚠️ {places} places sur 47 restantes · Offre valable jusqu'au 5 avril minuit</span>
                    <div className="flex items-center gap-2">
                        {[{ v: c.days, l: "j" }, { v: c.hours, l: "h" }, { v: c.minutes, l: "m" }, { v: c.seconds, l: "s" }].map((u, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span className="font-mono text-sm font-bold tabular-nums text-amber-900">{String(u.v).padStart(2, "0")}{u.l}</span>
                                {i < 3 && <span className="text-amber-400">:</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-6">
                            Sécurise ta place Accès Anticipé.
                        </h1>
                    </motion.div>

                    {/* 4 steps */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                        {[
                            "Tu déposes 9€ maintenant pour bloquer ta place.",
                            "Ces 9€ sont déduits de ton prix final le 5 avril.",
                            "Le 5 avril, tu reçois ton lien d'accès avec -50% sur le plan de ton choix.",
                            "Si l'app ne sort pas : remboursement intégral des 9€, sans conditions.",
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                                <p className="text-sm text-slate-600 font-medium">{step}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Plan selection */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {PLANS.map((plan) => {
                                const isSelected = selected === plan.id
                                const isPreselected = preselected === plan.id
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelected(plan.id)}
                                        className={`relative p-5 rounded-xl border-2 text-left transition-all ${isSelected
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                    >
                                        {isPreselected && (
                                            <span className="absolute -top-2.5 left-4 text-[10px] font-bold text-white bg-primary px-2.5 py-0.5 rounded-full">Ton choix</span>
                                        )}
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{plan.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium mb-3">{plan.pitch}</p>
                                        <div className="border-t border-slate-100 pt-3">
                                            <p className="text-sm font-bold text-slate-800">{plan.now} maintenant</p>
                                            <p className="text-xs text-slate-500">{plan.after} le 5 avril <span className="line-through">{plan.full}</span></p>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>

                    {/* Email + CTA */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-md mx-auto mb-6">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError("") }}
                            placeholder="Ton email"
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary/40 transition-all mb-4"
                        />
                        {error && <p className="text-sm text-red-500 font-medium mb-4 text-center">{error}</p>}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full py-4 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-base shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Réserver ma place"}
                        </motion.button>
                    </motion.div>

                    <p className="text-xs text-center font-medium text-slate-400 max-w-md mx-auto">
                        Paiement sécurisé via Stripe · 9€ déduits du prix final · Remboursé si l'app ne sort pas
                    </p>
                </div>
            </div>
        </main>
    )
}

export default function ReservationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f8fbff]" />}>
            <ReservationContent />
        </Suspense>
    )
}
