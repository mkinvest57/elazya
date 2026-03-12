"use client"

import { motion } from "framer-motion"

export function HeroSection() {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-16 overflow-hidden bg-transparent">
      {/* Background Blobs (Premium styling kept) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container relative z-10 px-4 sm:px-6 mx-auto">
        <div className="max-w-4xl mx-auto text-center mt-[-4vh] sm:mt-[-8vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="flex flex-col items-center">
            
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm mb-8">
              Basé sur le moteur open-source OpenClaw
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-[4.5rem] lg:text-7xl font-extrabold tracking-tight mb-6 text-slate-800 leading-[1.1] max-w-4xl">
              Arrêtez de travailler pour votre entreprise.<br />
              <span className="text-gradient-primary">Laissez votre Mac travailler pour vous.</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 tracking-wide leading-relaxed px-4">
              Déléguez votre prospection, vos devis et votre suivi CRM à une équipe d'agents IA autonomes. 100% local. 0 abonnement mensuel.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={scrollToPricing} 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_12px_24px_rgba(59,130,246,0.3)] transition-all ring-1 ring-primary/20 w-full sm:w-auto"
              >
                Choisir mon plan
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }} 
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-bold text-base shadow-sm transition-all w-full sm:w-auto"
              >
                Voir la démo
              </motion.button>
            </div>
            
          </motion.div>
        </div>
      </div>
    </section>
  )
}
