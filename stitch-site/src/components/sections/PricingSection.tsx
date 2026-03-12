"use client"

import { motion } from "framer-motion"

export function PricingSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.6 } }
  }

  return (
    <section id="pricing" className="py-24 scroll-mt-20">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-8 px-6"
      >
        {/* PLAN SOLO */}
        <motion.div variants={item} className="bg-white border border-gray-200 rounded-[32px] p-10 flex flex-col hover:shadow-sm transition-shadow">
          <h3 className="text-xl font-geist font-medium text-[#373a46] mb-2">L'Assistant.</h3>
          <div className="mb-10">
            <span className="text-5xl font-geist font-medium text-[#0f172a]">197€</span>
            <span className="block text-sm text-gray-500 mt-2 tracking-wide font-geist">ACHAT UNIQUE</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            {["10 agents Core inclus", "Morning Briefing auto", "Pilotage Telegram"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-base text-[#373a46] font-geist">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-full font-geist font-medium text-[#0f172a] bg-transparent border border-gray-200 hover:bg-gray-50 transition-colors">
            Obtenir Solo
          </button>
        </motion.div>

        {/* PLAN PRO */}
        <motion.div variants={item} className="bg-[#fcfcfc] border border-gray-300 md:scale-105 rounded-[32px] p-10 flex flex-col relative z-10 shadow-lg">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[11px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm">
            Populaire
          </div>
          <h3 className="text-xl font-geist font-medium text-[#0f172a] mb-2">Le Commercial.</h3>
          <div className="mb-10">
            <span className="text-5xl font-geist font-medium text-[#0f172a]">497€</span>
            <span className="block text-sm text-gray-500 mt-2 tracking-wide font-geist">ACHAT UNIQUE</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="font-geist font-medium text-[#0f172a] border-b border-gray-200 pb-4 mb-2">
              Tout le Solo
            </li>
            {["Pipeline Auto (Qualif -> CRM)", "Browser Automation LinkedIn", "Générateur de Devis PDF"].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-[#373a46] font-geist">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-800 shrink-0 mt-2" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-full font-geist font-medium text-white bg-gradient-to-b from-gray-800 to-black shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
            Obtenir Pro
          </button>
        </motion.div>

        {/* PLAN STUDIO */}
        <motion.div variants={item} className="bg-white border border-gray-200 rounded-[32px] p-10 flex flex-col hover:shadow-sm transition-shadow">
          <h3 className="text-xl font-geist font-medium text-[#373a46] mb-2">L'Équipe IA.</h3>
          <div className="mb-10">
            <span className="text-5xl font-geist font-medium text-[#0f172a]">997€</span>
            <span className="block text-sm text-gray-500 mt-2 tracking-wide font-geist">ACHAT UNIQUE</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="font-geist font-medium text-[#0f172a] border-b border-gray-100 pb-4 mb-2">
              Tout le Pro
            </li>
            {["4 agents coordonnés en équipe", "Créateur d'agents visuel", "Multi-utilisateurs (2-5 pers)"].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-[#373a46] font-geist">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-2" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-full font-geist font-medium text-[#0f172a] bg-transparent border border-gray-200 hover:bg-gray-50 transition-colors">
            Obtenir Studio
          </button>
        </motion.div>

      </motion.div>
    </section>
  )
}
