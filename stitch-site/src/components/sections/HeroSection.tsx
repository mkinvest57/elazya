"use client"

import { motion } from "framer-motion"
import { Star, ArrowRight } from "lucide-react"

const trustLogos = ["Stripe", "Google", "Notion", "Vercel", "Apple", "Meta"]

export function HeroSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <section className="min-h-screen relative flex flex-col justify-center items-center overflow-hidden pt-[120px] md:pt-[290px] pb-24">

      {/* Premium animated gradient orbs — spatial depth per antigravity-design-expert */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-100/60 to-indigo-100/40 blur-[80px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-100/50 to-purple-100/30 blur-[80px] animate-[float_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-sky-100/40 to-blue-50/30 blur-[60px] animate-[float_12s_ease-in-out_infinite_4s]" />
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-white -z-10" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[1100px] flex flex-col items-center gap-6 px-4 text-center"
      >
        {/* Social proof badge — glassmorphism per magic-ui */}
        <motion.div variants={item} className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xl border border-white/50 rounded-full px-5 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex -space-x-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
            ))}
          </div>
          <span className="text-sm font-geist font-semibold text-[#0f172a]">
            Rejoint par +500 freelances et agences
          </span>
        </motion.div>

        {/* H1 — original copy preserved */}
        <motion.h1
          variants={item}
          className="text-5xl md:text-[90px] leading-[1.1] md:leading-none font-geist tracking-tighter text-gray-900 font-extrabold mb-6 max-w-[1000px]"
        >
          ChatGPT discute. Elazya{" "}
          <span className="font-instrument italic text-blue-600 font-normal tracking-normal">
            exécute.
          </span>
        </motion.h1>

        {/* Subtitle — original copy preserved */}
        <motion.p
          variants={item}
          className="text-lg md:text-[20px] font-geist text-[#373a46] opacity-80 max-w-[650px] mx-auto leading-relaxed mb-10"
        >
          Ne générez plus de texte, générez des actions. Déléguez la création de vos devis, l'envoi de vos emails et la gestion de votre CRM à un agent IA autonome qui clique et travaille à votre place sur votre Mac.
        </motion.p>

        {/* Shimmer CTA — Magic UI inspired animated border */}
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-3">
          {/* Primary CTA with shimmer effect */}
          <a
            href="#booking"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-geist font-semibold text-white text-sm overflow-hidden"
          >
            {/* Animated gradient border */}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full" />
            <span className="absolute inset-[1.5px] bg-[#0f172a] rounded-full" />
            {/* Shimmer sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-2">
              Planifier un Appel Gratuit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a
            href="#avis"
            className="px-8 py-4 rounded-full font-geist font-medium text-[#373a46] bg-white/70 backdrop-blur-sm border border-gray-200/80 hover:bg-white hover:shadow-md transition-all duration-300 text-sm"
          >
            Voir les réalisations
          </a>
        </motion.div>

        {/* Email capture — interactive component with glassmorphism */}
        <motion.div variants={item} className="w-full max-w-lg mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 rounded-[40px] bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-[0_10px_40px_5px_rgba(194,194,194,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] p-2">
            <input
              type="email"
              placeholder="Entrez votre email..."
              className="flex-1 bg-transparent px-6 py-4 text-base font-geist text-[#373a46] placeholder:text-gray-400 outline-none w-full"
            />
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-geist font-semibold text-white bg-gradient-to-b from-gray-800 to-[#0f172a] shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all duration-300 whitespace-nowrap text-sm">
              Obtenir Elazya
            </button>
          </div>
        </motion.div>

        {/* Demo showcase — empty placeholder for later */}
        <motion.div
          variants={item}
          className="w-full max-w-[1000px] mx-auto mt-20 relative"
        >
          <div className="aspect-[16/9] bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden transition-transform duration-500 hover:scale-[1.005]">
            <div className="w-full h-full flex items-center justify-center bg-gray-50/50 text-gray-300 font-geist text-sm">
              Intégration Arcade.software ici
            </div>
          </div>
        </motion.div>

        {/* Social proof — below demo */}
        <motion.div variants={item} className="flex flex-col items-center gap-3 mt-16">
          <span className="text-sm font-medium text-[#373a46] opacity-60 font-geist">Rejoint par +500 freelances et agences</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
            ))}
          </div>
        </motion.div>

        {/* Trust bar — logos */}
        <motion.div variants={item} className="mt-8 flex flex-col items-center gap-4">
          <span className="text-xs font-geist font-medium text-gray-400 uppercase tracking-widest">
            Compatible avec vos outils
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustLogos.map((name) => (
              <span
                key={name}
                className="text-base font-geist font-bold text-gray-300 hover:text-gray-500 transition-colors duration-300 select-none cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
