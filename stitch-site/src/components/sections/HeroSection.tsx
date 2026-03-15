"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

export function HeroSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <section className="min-h-screen relative flex flex-col justify-center items-center overflow-hidden pt-[120px] md:pt-[290px] pb-24">
      
      {/* Background Video */}
      <video 
        autoPlay loop muted playsInline 
        className="absolute inset-0 w-full h-full object-cover [transform:scaleY(-1)] -z-20"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4" 
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[26.416%] to-white to-[66.943%] -z-10" />

      {/* Main Container */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[1200px] flex flex-col items-center gap-[32px] px-4 text-center"
      >
        
        {/* Main Heading H1 */}
        <motion.h1 variants={item} className="text-5xl md:text-[90px] leading-[1.1] md:leading-none font-geist tracking-tighter text-gray-900 font-extrabold mb-6 max-w-[1000px]">
          ChatGPT discute. Elazya <span className="font-instrument italic text-blue-600 font-normal tracking-normal">exécute.</span>
        </motion.h1>

        {/* Description H2 */}
        <motion.p variants={item} className="text-lg md:text-[20px] font-geist text-[#373a46] opacity-80 max-w-[650px] mx-auto leading-relaxed mb-10">
          Ne générez plus de texte, générez des actions. Déléguez la création de vos devis, l'envoi de vos emails et la gestion de votre CRM à un agent IA autonome qui clique et travaille à votre place sur votre Mac.
        </motion.p>

        {/* Interactive Component (Email & CTA) */}
        <motion.div variants={item} className="w-full max-w-lg mt-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 rounded-[40px] bg-[#fcfcfc] border border-gray-200 shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)] p-2">
            <input 
              type="email" 
              placeholder="Entrez votre email..." 
              className="flex-1 bg-transparent px-6 py-4 text-base font-geist text-[#373a46] placeholder:text-gray-400 outline-none w-full" 
            />
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-geist font-medium text-white bg-gradient-to-b from-gray-800 to-black shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)] hover:scale-105 transition-all duration-300 whitespace-nowrap">
              Obtenir Elazya
            </button>
          </div>
        </motion.div>

        {/* Arcade Demo Showcase */}
        <motion.div 
          variants={item} 
          className="w-full max-w-[1000px] mx-auto mt-20 relative z-20"
        >
          <div className="aspect-[16/9] bg-white border border-gray-200 rounded-[24px] shadow-[0px_20px_60px_rgba(0,0,0,0.08)] overflow-hidden transition-transform duration-500 hover:scale-[1.01]">
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-geist">
              Intégration Arcade.software ici
            </div>
          </div>
        </motion.div>

        {/* Social Proof — below the Arcade demo */}
        <motion.div variants={item} className="flex flex-col items-center gap-3 mt-24">
          <span className="text-sm font-medium text-[#373a46] opacity-80 font-geist">Rejoint par +500 freelances et agences</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
            ))}
          </div>
        </motion.div>

      </motion.div>

    </section>
  )
}
