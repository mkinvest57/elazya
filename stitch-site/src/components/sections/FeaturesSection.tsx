"use client"

import { motion } from "framer-motion"
import { Brain, Lock, Globe, Cpu, ArrowRight } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="py-28 relative border-t border-slate-200/50 bg-[#f8fbff]/50">
      <div className="absolute inset-0 bg-primary/[0.02] grain-light pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              <span className="text-slate-800">Intégré au cœur</span>
              {' '}
              <span className="text-gradient-primary">de macOS.</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Oubliez les copier-coller. Elazya interagit avec vos outils là où ils se trouvent.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Large card — Computer Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 p-6 md:p-10 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vision par ordinateur</span>
            </div>
            <h3 className="text-3xl font-bold mb-4 text-slate-800 tracking-tight">Il voit ce que vous voyez.</h3>
            <p className="text-slate-500 leading-relaxed font-medium mb-8 max-w-xl">
              Le moteur OpenClaw lit l&apos;écran et clique sur les pixels. Ça le rend compatible avec 100% de vos apps, que ce soit Safari, Excel, Finder, ou le vieux logiciel comptable de 2012. Pas besoin d&apos;intégration API.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Lecture des pixels', 'Reconnaissance visuelle', 'Navigation OCR'].map((tag, i) => (
                <span key={i} className="text-[11px] font-bold text-slate-600 px-4 py-2 rounded-full bg-slate-100/80 border border-slate-200/80">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Small — Local Inference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">100% Local Inference</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Confidentialité de niveau militaire sur Mac. Aucune de vos données sensibles ne part entraîner les modèles externes.
            </p>
          </motion.div>

          {/* Small — Keyboard Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">Contrôle Clavier/Souris</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              S&apos;il n&apos;y a pas d&apos;API, il tape. C&apos;est un humain numérique caché derrière le Terminal.
            </p>
          </motion.div>

          {/* Large — Async agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 md:p-10 rounded-3xl bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-xl border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vitesse RAM</span>
            </div>
            <h3 className="text-3xl font-bold mb-4 text-slate-800 tracking-tight">Un cerveau, 10 bras asynchrones.</h3>
            <p className="text-slate-500 leading-relaxed font-medium max-w-xl">
              Pendant qu&apos;un agent lit l&apos;écran, un autre fouille votre disque SSD Finder et un troisième rédige la note finale. Ils communiquent en réseau local instantané, exécutant des scénarios complexes à la vitesse de votre puce ARM.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-mono font-semibold">
              <span className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">Email reçu</span>
              <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
              <span className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">Extraction PDF</span>
              <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
              <span className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">Classement</span>
              <ArrowRight className="w-4 h-4 text-primary hidden sm:block" />
              <span className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">Brouillon réponse</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
