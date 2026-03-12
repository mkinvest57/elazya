"use client"

import { motion } from "framer-motion"

export function ValueStackingSection() {
  return (
    <section className="py-24 max-w-4xl mx-auto px-6 relative z-10 border-b border-slate-200/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-[2rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(59,130,246,0.1)] backdrop-blur-xl"
      >
        <h3 className="text-3xl font-bold text-slate-800 text-center mb-10 tracking-tight">
          Combien vous coûterait cette équipe dans la vraie vie ?
        </h3>
        
        <div className="space-y-0 text-lg">
          <div className="flex justify-between items-center border-b border-slate-200/60 py-5">
            <span className="text-slate-600 font-medium">Assistant virtuel (Lead & Devis)</span>
            <span className="font-mono text-slate-500 font-semibold">800€ / mois</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200/60 py-5">
            <span className="text-slate-600 font-medium">Community Manager (Veille LinkedIn)</span>
            <span className="font-mono text-slate-500 font-semibold">500€ / mois</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200/60 py-5">
            <span className="text-slate-600 font-medium">Abonnements SaaS (Zapier, CRM IA)</span>
            <span className="font-mono text-slate-500 font-semibold">150€ / mois</span>
          </div>
        </div>

        <div className="text-right text-slate-400 line-through mt-8 font-mono text-xl font-bold">
          Valeur perçue : +17 000€ / an.
        </div>
        
        <div className="text-center text-xl md:text-2xl font-extrabold text-primary mt-8">
          L'offre Elazya : Une fraction du prix, à vie.
        </div>
      </motion.div>
    </section>
  )
}
