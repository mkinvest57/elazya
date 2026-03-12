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
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.8 } }
  }

  return (
    <section className="min-h-screen relative flex flex-col justify-start items-center overflow-hidden">
      
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
        className="relative z-10 w-full max-w-[1200px] pt-[290px] flex flex-col items-center gap-[32px] px-4 text-center"
      >
        
        {/* Main Heading H1 */}
        <motion.h1 variants={item} className="text-5xl md:text-[80px] font-geist font-medium tracking-[-0.04em] text-[#0f172a] leading-[1.1] max-w-[1000px]">
          Votre propre <span className="font-instrument text-6xl md:text-[100px] font-normal italic">équipe IA</span> sur votre Mac.
        </motion.h1>

        {/* Description */}
        <motion.p variants={item} className="text-[18px] opacity-80 text-[#373a46] max-w-[554px] leading-relaxed">
          Déléguez votre prospection, vos devis et votre suivi CRM à des agents autonomes. 100% local et privé.
        </motion.p>

        {/* Interactive Component (Email & CTA) */}
        <motion.div variants={item} className="w-full max-w-lg mt-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 rounded-[40px] bg-[#fcfcfc] border border-gray-200 shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)] p-1.5 sm:p-2">
            <input 
              type="email" 
              placeholder="Entrez votre email..." 
              className="flex-1 bg-transparent px-6 py-4 text-base text-[#373a46] placeholder:text-gray-400 outline-none min-w-0" 
            />
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-geist font-medium text-white bg-gradient-to-b from-gray-800 to-black shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)] hover:scale-[1.02] active:scale-[0.98] transition-transform whitespace-nowrap">
              Obtenir Elazya
            </button>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div variants={item} className="flex flex-col md:flex-row items-center gap-3 mt-4">
          <div className="flex -space-x-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-white z-10">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-[#373a46] opacity-80 font-geist">Rejoint par +500 freelances</span>
        </motion.div>

      </motion.div>

    </section>
  )
}
