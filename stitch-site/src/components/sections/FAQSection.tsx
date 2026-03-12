"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ShieldCheck } from "lucide-react"

const faqs = [
  { q: "Faut-il savoir coder ?", a: "Non. L'interface Elazya gère toute la complexité d'OpenClaw en arrière-plan. Zéro ligne de commande." },
  { q: "Mes données sont-elles privées ?", a: "Oui. La mémoire, les historiques et les fichiers restent stockés localement sur votre Mac." },
  { q: "Dois-je payer l'API en plus ?", a: "Vous connectez votre propre clé (Google Gemini ou Anthropic). Cela vous coûte quelques centimes par jour, sans marge de notre part." },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-2xl bg-[#f8fbff] border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center p-6 font-bold text-slate-800">
        <span className="text-lg">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm"
        >
          <ChevronDown className={`w-4 h-4 transition-colors ${open ? 'text-primary' : 'text-slate-400'}`} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <p className="text-base font-medium text-slate-600 mx-6 mb-6 leading-relaxed bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  return (
    <section className="py-24 border-b border-slate-200/50 bg-transparent relative z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex justify-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white border border-slate-200 shadow-sm px-6 py-3 rounded-full font-bold text-slate-700 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Garantie 14 jours satisfait ou remboursé
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
