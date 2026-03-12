"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useCallback } from "react"

const LAUNCH = new Date("2026-04-05T00:00:00+02:00").getTime()

function useCountdown() {
  const calc = useCallback(() => {
    const d = Math.max(0, LAUNCH - Date.now())
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    }
  }, [])
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])
  return t
}

function CountdownDisplay() {
  const c = useCountdown()
  return (
    <div className="flex items-center justify-center gap-3">
      {[
        { v: c.days, l: "jours" },
        { v: c.hours, l: "heures" },
        { v: c.minutes, l: "min" },
        { v: c.seconds, l: "sec" },
      ].map((u, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-slate-800">{String(u.v).padStart(2, "0")}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">{u.l}</span>
          </div>
          {i < 3 && <span className="text-slate-300 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  )
}

interface FinalCTASectionProps {
  onCTA: () => void
}

export function FinalCTASection({ onCTA }: FinalCTASectionProps) {
  return (
    <section className="py-28 sm:py-32 relative overflow-hidden border-t border-slate-200/50 bg-[#f8fbff]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
      </div>
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-6 leading-[1.1]">
            Ce n&apos;est pas une app de plus.<br />
            C&apos;est la dernière dont tu auras besoin.
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Tout est local sur ton Mac. Aucun serveur externe ne stocke tes données. Aucun abonnement. Tu paies une fois, tu possèdes pour toujours. Pendant que tout le monde empile les SaaS à l&apos;abonnement, toi tu as une équipe IA qui travaille pour toi. Définitivement.
          </p>

          {/* Plan recap */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10 w-full">
            {[
              { name: "Solo", after: "88€", save: "109€" },
              { name: "Pro", after: "238€", save: "259€" },
              { name: "Studio", after: "488€", save: "509€" },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 text-center hover:border-primary/30 hover:shadow-sm transition-all">
                <p className="text-sm font-bold text-slate-800 mb-1">{p.name}</p>
                <p className="text-xs text-slate-500">Tarif sécurisé : {p.after} le 5 avril</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">tu économiseras {p.save}</p>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <CountdownDisplay />

          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={onCTA} className="mt-8 bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 lg:px-12 lg:py-4 rounded-full font-bold text-base lg:text-lg shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place (Tarif Fondateur)</motion.button>
          <p className="text-xs font-medium text-slate-400 mt-4 max-w-md">Sans engagement · Remboursé si l&apos;app ne sort pas · Déductible du prix final</p>
        </motion.div>
      </div>
    </section>
  )
}
