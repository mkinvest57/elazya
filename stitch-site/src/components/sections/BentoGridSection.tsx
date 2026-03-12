"use client"

import { motion } from "framer-motion"

export function BentoGridSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <section className="max-w-[1200px] mx-auto py-32 px-4">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="text-[32px] md:text-[40px] font-geist font-medium text-[#0f172a] text-center mb-16"
      >
        Ce qu'Elazya peut faire <span className="font-instrument italic text-blue-600">pour vous.</span>
      </motion.h2>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* CARTE 1 (Large - Colspan 2) */}
        <motion.div variants={item} className="md:col-span-2 bg-white border border-gray-200 rounded-[32px] p-10 flex flex-col justify-end hover:shadow-xl transition-shadow min-h-[250px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 opacity-60" />
          <h3 className="font-geist text-2xl font-bold text-[#0f172a] mb-3">Routine matinale (Morning Briefing)</h3>
          <p className="font-geist text-lg text-[#373a46] opacity-80 leading-relaxed font-medium max-w-2xl">
            À 8h00 pile, recevez un résumé de vos emails urgents, vos tâches Notion et vos factures en retard directement sur votre téléphone.
          </p>
        </motion.div>

        {/* CARTE 2 (Carrée) */}
        <motion.div variants={item} className="bg-white border border-gray-200 rounded-[32px] p-10 flex flex-col justify-end hover:shadow-xl transition-shadow min-h-[300px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60" />
          <h3 className="font-geist text-2xl font-bold text-[#0f172a] mb-3">Browser Automation</h3>
          <p className="font-geist text-base text-[#373a46] opacity-80 leading-relaxed font-medium">
            L'agent navigue sur le web, extrait des leads sur LinkedIn et remplit vos CRM de manière autonome.
          </p>
        </motion.div>

        {/* CARTE 3 (Carrée) */}
        <motion.div variants={item} className="bg-white border border-gray-200 rounded-[32px] p-10 flex flex-col justify-end hover:shadow-xl transition-shadow min-h-[300px] relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2 opacity-60" />
          <h3 className="font-geist text-2xl font-bold text-[#0f172a] mb-3">Génération de Devis PDF</h3>
          <p className="font-geist text-base text-[#373a46] opacity-80 leading-relaxed font-medium">
            Décrivez le projet du client par audio, l'agent rédige la proposition et crée le PDF sur votre disque dur.
          </p>
        </motion.div>

        {/* CARTE 4 (Large - Colspan 2) */}
        <motion.div variants={item} className="md:col-span-2 bg-[#fcfcfc] border border-gray-200 rounded-[32px] p-10 flex flex-col justify-end hover:shadow-xl transition-shadow min-h-[250px] relative overflow-hidden">
          <h3 className="font-geist text-2xl font-bold text-[#0f172a] mb-3">100% Local & Sécurisé</h3>
          <p className="font-geist text-lg text-[#373a46] opacity-80 leading-relaxed font-medium max-w-2xl">
            Basé sur le moteur OpenClaw. Vos données d'entreprise et vos factures ne quittent jamais votre Mac. Tout tourne en local.
          </p>
        </motion.div>

      </motion.div>
    </section>
  )
}
