"use client"

import { motion } from "framer-motion"

export function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Branchez votre cerveau",
      desc: "Entrez votre propre clé API (Google Gemini ou Anthropic). Vous payez l'IA au prix coûtant, sans marge de notre part."
    },
    {
      step: "2",
      title: "Connectez Telegram",
      desc: "Associez Elazya à votre compte Telegram ou WhatsApp en un clic pour piloter votre Mac à distance."
    },
    {
      step: "3",
      title: "Déléguez vos tâches",
      desc: "Envoyez une simple note vocale. L'agent prend le contrôle de votre navigateur et de vos fichiers locaux pour exécuter la tâche."
    }
  ]

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
    <section className="max-w-[1200px] mx-auto py-24 px-4 text-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="font-geist text-4xl font-medium text-[#0f172a] mb-16"
      >
        Votre équipe IA opérationnelle en 3 étapes.
      </motion.h2>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
      >
        {/* Lignes de connexion visibles sur Desktop uniquement */}
        <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10" />

        {steps.map((s, i) => (
          <motion.div key={i} variants={item} className="flex flex-col items-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6">
              <span className="font-instrument italic text-3xl text-blue-600">{s.step}</span>
            </div>
            <h3 className="font-geist text-xl font-bold text-[#0f172a] mb-4">
              {s.title}
            </h3>
            <p className="font-geist text-[#373a46] opacity-80 leading-relaxed font-medium">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
