"use client"

import { motion } from "framer-motion"

export function IntegrationsSection() {
  const tools = [
    "Telegram", "WhatsApp", "Google Chrome", "Notion", 
    "Stripe", "Gmail", "Apple Calendar", "Slack"
  ]
  // Doubling the array for infinite marquee effect
  const marqueeItems = [...tools, ...tools, ...tools]

  return (
    <section className="w-full bg-gray-50 py-16 overflow-hidden border-y border-gray-100">
      <div className="max-w-[1200px] mx-auto text-center px-4 mb-8">
        <h2 className="text-sm font-geist font-bold uppercase tracking-widest text-gray-500">
          S'intègre nativement à vos outils de tous les jours.
        </h2>
      </div>

      <div className="relative flex w-full flex-nowrap overflow-hidden">
        {/* Masques de dégradé sur les bords pour fondre le texte */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <motion.div 
          className="flex gap-12 items-center w-max"
          animate={{ x: [0, -1000] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 25 
          }}
        >
          {marqueeItems.map((tool, i) => (
            <div 
              key={i} 
              className="px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center shrink-0"
            >
              <span className="font-geist font-medium text-[#0f172a] text-lg">{tool}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
