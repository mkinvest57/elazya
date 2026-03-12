"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 scroll-mt-20 relative z-10 border-b border-slate-200/50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* PLAN SOLO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-slate-500 mb-2">L'Assistant.</h3>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-800">197€</span>
              <span className="text-sm font-semibold text-slate-400 ml-2 block mt-1 uppercase tracking-wide">Achat unique</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "10 agents Core inclus",
                "Morning Briefing auto",
                "Pilotage Telegram",
                "100% Local sur Mac"
              ].map((ft, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 font-medium">{ft}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-full transition-colors border border-slate-200 shadow-sm">
              Obtenir Solo
            </button>
          </motion.div>

          {/* PLAN PRO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-2xl border-2 border-primary rounded-3xl p-8 flex flex-col h-full transform md:scale-105 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] relative z-10"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm">
              Recommandé
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Le Commercial.</h3>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-800">497€</span>
              <span className="text-sm font-semibold text-primary/60 ml-2 block mt-1 uppercase tracking-wide">Achat unique</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 border-b border-slate-100 pb-4 mb-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-slate-800 font-bold">Tout le Solo</span>
              </li>
              {[
                "Pipeline Auto (Qualif -> CRM)",
                "Browser Automation LinkedIn",
                "Générateur de Devis PDF"
              ].map((ft, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-slate-600 font-medium">{ft}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full transition-colors shadow-lg shadow-primary/30">
              Obtenir Pro
            </button>
          </motion.div>

          {/* PLAN STUDIO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-indigo-500 mb-2">L'Équipe IA.</h3>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-800">997€</span>
              <span className="text-sm font-semibold text-slate-400 ml-2 block mt-1 uppercase tracking-wide">Achat unique</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 border-b border-slate-100 pb-4 mb-2">
                <Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-slate-800 font-bold">Tout le Pro</span>
              </li>
              {[
                "4 agents coordonnés en équipe",
                "Health Monitoring hebdo",
                "Créateur d'agents visuel",
                "Multi-utilisateurs (2-5 pers)"
              ].map((ft, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 font-medium">{ft}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-4 rounded-full transition-colors shadow-md">
              Obtenir Studio
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
