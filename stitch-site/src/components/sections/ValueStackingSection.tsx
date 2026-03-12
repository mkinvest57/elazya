"use client"

import { motion } from "framer-motion"

export function ValueStackingSection() {
  const items = [
    { label: "Assistant virtuel (Leads & Devis)", price: "800€ / mois" },
    { label: "Community Manager (Veille LinkedIn)", price: "500€ / mois" },
    { label: "Abonnements SaaS", price: "150€ / mois" }
  ]

  return (
    <section className="px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="max-w-[800px] mx-auto bg-[#fcfcfc] border border-gray-200 rounded-[32px] p-8 md:p-12 my-24 shadow-sm"
      >
        <h3 className="font-geist text-2xl md:text-3xl font-medium text-[#0f172a] text-center mb-8">
          Le coût réel d'une équipe humaine :
        </h3>
        
        <div className="flex flex-col">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center border-b border-gray-100 py-4 text-[#373a46] font-geist text-base md:text-lg">
              <span>{item.label}</span>
              <span className="font-medium">{item.price}</span>
            </div>
          ))}
        </div>
        
        <div className="line-through text-gray-400 text-right mt-4 font-geist font-medium block">
          Valeur perçue : +17 000€ / an
        </div>
        
        <div className="font-instrument italic text-2xl md:text-3xl text-blue-600 text-center mt-8 block">
          L'offre Elazya : Une fraction du prix, accès à vie.
        </div>
      </motion.div>
    </section>
  )
}
