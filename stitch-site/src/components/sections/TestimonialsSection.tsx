"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Je passe mes appels clients dans la voiture, j'envoie un vocal à Elazya sur Telegram, et le devis est prêt sur mon Mac en rentrant. Magique.",
      name: "Thomas",
      role: "Consultant SEO",
      avatar: "T"
    },
    {
      quote: "Avoir une vraie IA qui exécute des clics dans mon navigateur au lieu de juste me générer du texte a complètement changé mon business.",
      name: "Sarah",
      role: "Fondatrice d'Agence",
      avatar: "S"
    },
    {
      quote: "La promesse du paiement unique est tenue. Je branche ma clé API et ça me coûte moins de 2€ par mois en requêtes. Fini les abonnements Zapier et Make hors de prix.",
      name: "Marc",
      role: "Développeur Freelance",
      avatar: "M"
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
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <section className="max-w-[1200px] mx-auto py-24 px-4">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="text-center text-[32px] md:text-4xl font-geist font-medium text-[#0f172a] mb-16"
      >
        Ils ont récupéré leurs soirées.
      </motion.h2>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {testimonials.map((testi, i) => (
          <motion.div 
            key={i} 
            variants={item}
            className="bg-white border border-gray-200 rounded-[24px] p-8 flex flex-col justify-between hover:shadow-lg transition-shadow"
          >
            <div className="flex space-x-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="font-geist text-[#373a46] opacity-90 leading-relaxed font-medium text-base mb-8 flex-1">
              "{testi.quote}"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center font-geist font-bold text-gray-500 text-lg shrink-0">
                {testi.avatar}
              </div>
              <div>
                <h4 className="font-geist font-bold text-[#0f172a]">{testi.name}</h4>
                <span className="font-geist text-sm text-gray-500 font-medium">{testi.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
