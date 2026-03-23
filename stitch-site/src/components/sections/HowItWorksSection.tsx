"use client"

import { motion } from "framer-motion"
import { PhoneCall, Settings, Rocket, ArrowRight } from "lucide-react"

const steps = [
  {
    num: "01",
    icon: PhoneCall,
    title: "Appel Stratégique",
    badge: "30 min gratuites",
    desc: "On analyse votre workflow et on identifie les 3-5 tâches qui vous font perdre le plus de temps.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconBg: "bg-blue-100/80",
  },
  {
    num: "02",
    icon: Settings,
    title: "Configuration sur mesure",
    badge: "Même jour",
    desc: "On configure vos agents IA selon vos templates, votre CRM, et votre ton de communication.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    iconBg: "bg-violet-100/80",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Autonomie complète",
    badge: "Dès le jour 1",
    desc: "Votre agent exécute vos tâches automatiquement. Vous récupérez 12h par semaine, dès le premier jour.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100/80",
  },
]

export function HowItWorksSection() {
  return (
    <section id="processus" className="max-w-[1100px] mx-auto py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <h2 className="text-[28px] md:text-[40px] font-geist font-bold text-[#0f172a] leading-tight">
          Opérationnel en{" "}
          <span className="font-instrument italic text-blue-600 font-normal">3 étapes.</span>
        </h2>
      </motion.div>

      {/* CTA above steps — for pre-convinced visitors */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <a
          href="#booking"
          className="inline-flex items-center gap-2 text-sm font-geist font-semibold text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer"
        >
          Déjà convaincu ? Réserver l'appel directement
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>

      <div className="relative">
        {/* Connector line — desktop */}
        <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100, damping: 20 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Step number + icon */}
                <div className={`group w-[88px] h-[88px] rounded-[24px] ${step.bg} border-2 ${step.border} flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300 cursor-default shadow-sm`}>
                  <Icon className={`w-8 h-8 ${step.color} group-hover:rotate-12 transition-transform duration-300`} />
                </div>

                {/* Step number badge */}
                <div className={`absolute top-0 right-1/2 translate-x-[52px] -translate-y-2 w-7 h-7 rounded-full bg-white border-2 ${step.border} flex items-center justify-center shadow-sm`}>
                  <span className={`text-[10px] font-geist font-bold ${step.color}`}>{step.num}</span>
                </div>

                {/* Badge */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-geist font-bold ${step.bg} ${step.color} border ${step.border} mb-4 uppercase tracking-wider`}>
                  {step.badge}
                </span>

                <h3 className="text-lg font-geist font-bold text-[#0f172a] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm font-geist text-[#373a46] opacity-70 leading-relaxed max-w-[280px]">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
