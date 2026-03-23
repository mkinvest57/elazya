"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="border-b border-gray-200 overflow-hidden cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <button className="w-full flex justify-between items-center py-6 text-left focus:outline-none group">
        <span className="text-base md:text-lg font-geist font-bold text-[#0f172a] pr-4 group-hover:text-blue-600 transition-colors">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white"
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
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="pb-8 text-[15px] font-geist text-[#373a46] opacity-80 leading-relaxed pr-12">
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
    {
      q: "Pourquoi ce prix pour un achat unique ?",
      a: "Elazya remplace des outils SaaS à 50-200€/mois (Make, Zapier, assistants virtuels). En un seul achat, vous récupérez l'investissement dès le premier mois. En plus, vous payez l'API IA au prix coûtant — quelques centimes par jour — sans aucune marge de notre part.",
    },
    {
      q: "En combien de temps je vois des résultats ?",
      a: "La plupart de nos clients configurent leur premier agent en moins de 30 minutes et voient un impact mesurable dès la première semaine. Le Morning Briefing et la gestion d'emails sont opérationnels dès le jour 1.",
    },
    {
      q: "Avez-vous des références dans mon secteur ?",
      a: "Nous accompagnons des consultants, freelances, agences et TPE dans plus de 15 secteurs différents (SEO, graphisme, IT, immobilier, juridique…). Pendant votre appel gratuit, on vous montre un cas d'usage spécifique à votre métier.",
    },
    {
      q: "Comment ça se passe concrètement après l'achat ?",
      a: "Vous recevez un lien de téléchargement immédiat. L'installation prend 2 minutes sur Mac. Vous branchez votre clé API, connectez Telegram, et c'est parti. Un guide pas-à-pas et notre Discord privé vous accompagnent.",
    },
    {
      q: "Et si ça ne marche pas pour moi ?",
      a: "Vous êtes couvert par notre garantie 14 jours satisfait ou remboursé. Si Elazya ne vous convient pas, vous êtes remboursé intégralement, sans questions. On prend le risque à votre place.",
    },
  ]

  return (
    <section id="faq" className="max-w-[800px] mx-auto py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-[28px] md:text-[40px] font-geist font-bold text-[#0f172a] leading-tight">
          Questions{" "}
          <span className="font-instrument italic text-blue-600 font-normal">fréquentes.</span>
        </h2>
      </motion.div>

      {/* Guarantee badge — placed near decision point per page-cro Trust principle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2.5 shadow-sm">
          <span className="text-lg">🛡️</span>
          <span className="text-sm font-geist font-bold text-emerald-800">
            Garantie 14 jours satisfait ou remboursé
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} defaultOpen={i === 0} />
        ))}
      </motion.div>
    </section>
  )
}
