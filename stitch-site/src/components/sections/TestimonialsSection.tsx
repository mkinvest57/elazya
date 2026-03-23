"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "On a multiplié notre taux de conversion par 2,4 en 3 semaines grâce aux devis automatisés d'Elazya.",
    name: "Thomas L.",
    role: "Consultant SEO",
    avatar: "T",
    result: "×2,4 conversion"
  },
  {
    quote: "Avoir une vraie IA qui exécute des clics dans mon navigateur au lieu de juste générer du texte a changé mon quotidien.",
    name: "Sarah M.",
    role: "Fondatrice d'Agence",
    avatar: "S",
    result: "15h/sem gagnées"
  },
  {
    quote: "Je branche ma clé API et ça me coûte moins de 2€ par mois. Fini les abonnements Make et Zapier à 200€.",
    name: "Marc D.",
    role: "Développeur Freelance",
    avatar: "M",
    result: "-95% de coût"
  },
  {
    quote: "Elazya gère toute ma prospection LinkedIn pendant que je suis en rendez-vous. Je reçois un récap le soir.",
    name: "Julie P.",
    role: "Business Developer",
    avatar: "J",
    result: "40 leads/sem"
  },
  {
    quote: "Le fait que tout soit local me rassure énormément. Mes clients avocats sont très sensibles à la confidentialité.",
    name: "Antoine R.",
    role: "Consultant IT",
    avatar: "A",
    result: "RGPD compatible"
  },
  {
    quote: "J'ai configuré un agent qui envoie mes factures automatiquement. En 2 semaines, j'ai rattrapé 6 mois de retard.",
    name: "Camille B.",
    role: "Graphiste Freelance",
    avatar: "C",
    result: "6 mois rattrapés"
  },
]

export function TestimonialsSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <section id="avis" className="max-w-[1100px] mx-auto py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-[28px] md:text-[40px] font-geist font-bold text-[#0f172a] leading-tight">
          Ils ont récupéré leurs{" "}
          <span className="font-instrument italic text-blue-600 font-normal">soirées.</span>
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-white border border-gray-200 rounded-[20px] p-7 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
          >
            <div>
              {/* Stars */}
              <div className="flex space-x-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-geist text-[15px] text-[#373a46] leading-relaxed mb-6">
                "{t.quote}"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center font-geist font-bold text-gray-500 text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-geist font-bold text-[#0f172a] text-sm">{t.name}</p>
                  <p className="font-geist text-xs text-gray-500">{t.role}</p>
                </div>
              </div>

              {/* Result badge */}
              <span className="text-xs font-geist font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                {t.result}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
