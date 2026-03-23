"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight, Sparkles } from "lucide-react"

const plans = [
  {
    name: "L'Assistant",
    label: "STARTER",
    price: "197€",
    billing: "ACHAT UNIQUE",
    desc: "Pour démarrer avec l'IA autonome",
    features: [
      "10 agents Core",
      "Morning Briefing auto",
      "Pilotage Telegram",
      "100% Local sur Mac",
    ],
    highlighted: false,
    cta: "Acheter Solo",
  },
  {
    name: "Le Commercial",
    label: "PRO",
    price: "497€",
    billing: "ACHAT UNIQUE",
    desc: "Pour les professionnels qui veulent scaler",
    features: [
      "Tout le plan Solo",
      "Pipeline Auto (Qualif → CRM)",
      "Browser Automation LinkedIn",
      "Générateur de Devis PDF",
      "Support prioritaire",
    ],
    highlighted: true,
    cta: "Acheter Pro",
    badge: "Le plus populaire",
  },
  {
    name: "L'Équipe IA",
    label: "SCALE",
    price: "997€",
    billing: "ACHAT UNIQUE",
    desc: "Pour scaler avec une équipe d'agents",
    features: [
      "Tout le plan Pro",
      "4 agents coordonnés en équipe",
      "Health Monitoring hebdo",
      "Créateur d'agents visuel",
      "Multi-utilisateurs (2-5 pers)",
    ],
    highlighted: false,
    cta: "Acheter Studio",
  },
]

export function PricingSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <section id="pricing" className="py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-[28px] md:text-[40px] font-geist font-bold text-[#0f172a] leading-tight">
          Un investissement,{" "}
          <span className="font-instrument italic text-blue-600 font-normal">pas un abonnement.</span>
        </h2>
        <p className="mt-4 text-base font-geist text-[#373a46] opacity-70 max-w-lg mx-auto">
          Payez une fois, utilisez pour toujours. Aucun frais caché.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
      >
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            variants={item}
            className={`relative rounded-[24px] flex flex-col ${plan.highlighted ? "md:scale-105 z-10" : ""
              }`}
          >
            {/* Animated gradient border for Pro plan — Magic UI pattern */}
            {plan.highlighted && (
              <div className="absolute -inset-[1.5px] bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500 rounded-[25px] animate-[spin-slow_6s_linear_infinite] opacity-70 blur-[1px]" />
            )}

            <div className={`relative rounded-[24px] p-8 md:p-9 flex flex-col flex-1 ${plan.highlighted
                ? "bg-[#0f172a] text-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
                : "bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              }`}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[11px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              <div className="mb-1">
                <span className={`text-xs font-geist font-bold uppercase tracking-widest ${plan.highlighted ? "text-blue-400" : "text-gray-400"}`}>
                  {plan.label}
                </span>
              </div>

              <h3 className={`text-xl font-geist font-bold mb-2 ${plan.highlighted ? "text-white" : "text-[#0f172a]"}`}>
                {plan.name}
              </h3>

              <p className={`text-sm font-geist mb-6 ${plan.highlighted ? "text-gray-400" : "text-[#373a46] opacity-70"}`}>
                {plan.desc}
              </p>

              <div className="mb-8">
                <span className={`text-5xl font-geist font-bold ${plan.highlighted ? "text-white" : "text-[#0f172a]"}`}>
                  {plan.price}
                </span>
                <span className={`block text-xs mt-2 tracking-wide font-geist font-medium ${plan.highlighted ? "text-gray-500" : "text-gray-500"}`}>
                  {plan.billing}
                </span>
              </div>

              <ul className="space-y-3.5 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className={`flex items-start gap-3 text-sm font-geist ${plan.highlighted ? "text-gray-300" : "text-[#373a46]"}`}>
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? "text-blue-400" : "text-gray-400"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA — shimmer effect on Pro */}
              <button
                className={`group relative w-full py-4 rounded-full font-geist font-semibold text-sm transition-all duration-300 overflow-hidden ${plan.highlighted
                    ? "text-[#0f172a] bg-white hover:bg-gray-50 shadow-sm"
                    : "text-[#0f172a] bg-transparent border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {plan.highlighted && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {plan.cta}
                  {plan.highlighted && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
