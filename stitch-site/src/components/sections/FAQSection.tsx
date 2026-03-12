"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 overflow-hidden text-left" onClick={() => setOpen(!open)}>
      <button className="w-full flex justify-between items-center py-6 text-left focus:outline-none">
        <span className="text-lg font-geist font-medium text-[#0f172a]">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-[#fcfcfc]"
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="pb-8 text-base font-geist text-[#373a46] opacity-80 leading-relaxed pr-10">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  const faqs = [
    { q: "Faut-il savoir coder ?", a: "Non. L'interface Elazya gère toute la complexité d'OpenClaw en arrière-plan. Zéro ligne de commande." },
    { q: "Mes données sont-elles privées ?", a: "Oui. La mémoire, les historiques et les fichiers restent stockés localement sur votre Mac." },
    { q: "Dois-je payer l'API en plus ?", a: "Vous connectez votre propre clé (Google Gemini ou Anthropic). Cela vous coûte quelques centimes par jour, sans marge de notre part." },
  ]

  return (
    <section className="max-w-[800px] mx-auto py-24 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl font-geist font-medium text-[#0f172a]">Questions fréquentes</h2>
      </motion.div>

      <div className="space-y-0">
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>
    </section>
  )
}
