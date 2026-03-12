"use client"

import { motion } from "framer-motion"
import { Monitor, FolderOpen, Globe, MousePointer } from "lucide-react"

interface ScenariosSectionProps {
  onCTA: () => void
}

export function ScenariosSection({ onCTA }: ScenariosSectionProps) {
  const scenarios = [
    {
      time: "9h00",
      title: "Un logiciel bloqué sans API ? Pas de problème.",
      desc: (
        <>
          Vous devez extraire 500 fiches clients d&apos;un vieux CRM local.<br />
          Elazya ouvre la fenêtre, prend le contrôle de la souris,<br />
          navigue de page en page grâce à la vision par ordinateur,<br />
          lit les pixels de l&apos;écran, et copie tout dans un Google Sheet propre. En 10 minutes.
        </>
      ),
      terminal: (
        <div className="bg-[#1c2b3a] border border-[#2a3f54] rounded-xl p-5 sm:p-6 max-w-lg font-mono text-sm text-[#e8e8e8] leading-relaxed">
          <p className="mb-3 font-sans text-xs text-slate-400 font-semibold uppercase tracking-wider">Mission Control · Elazya</p>
          <p>
            ✓ <strong>EXTRACTION TERMINÉE</strong><br />
            → Temps estimé humain : 4h30<br />
            → Temps Elazya : 8m45s<br />
            → 500 fiches copiées localement<br />
            [Voir le fichier extrait]
          </p>
        </div>
      ),
      footer: "Pendant ce temps, vous faisiez autre chose.",
      icon: Monitor,
      gradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      time: "14h00",
      title: "Le chaos des pièces jointes classé. Zéro cloud.",
      desc: (
        <>
          Un partenaire vous envoie un dossier de 40 PDF lourds.<br />
          Elazya détecte la réception, lit le contenu 100% en local<br />
          grâce à la mémoire de votre puce Apple Silicon,<br />
          renomme chaque fichier selon vos règles,<br />
          et les range dans le bon dossier réseau. Aucun document ne part chez OpenAI.
        </>
      ),
      placeholder: {
        icon: FolderOpen,
        label: "Finder : Dossier « Vrac » se vidant automatiquement, les fichiers sont renommés et déplacés instantanément.",
      },
      icon: FolderOpen,
      gradient: "from-emerald-500/10 to-green-500/10",
    },
    {
      time: "16h30",
      title: "Veille concurrentielle sur des sites fermés aux bots",
      desc: (
        <>
          Vous voulez scraper les prix d&apos;un concurrent qui bloque Zapier ?<br />
          Elazya ouvre un vrai navigateur Safari sur votre écran,<br />
          déplace le curseur comme un humain,<br />
          contourne les captchas comportementaux, et lit l&apos;écran visuellement pour vous.
        </>
      ),
      placeholder: {
        icon: Globe,
        label: "Curseur de la souris qui bouge tout seul dans Safari avec une bannière « Agent Safari Actif », parcourant des fiches produits.",
      },
      icon: Globe,
      gradient: "from-violet-500/10 to-purple-500/10",
    },
    {
      time: "18h00",
      title: "Vous montrez l'écran, il apprend.",
      desc: (
        <>
          Oubliez la création de scripts JSON complexes.<br />
          Dites simplement « Quand je reçois ce mail, regarde là, clique ici et remplis ça ».<br />
          Elazya comprend l&apos;instruction visuelle et exécute.
        </>
      ),
      placeholder: {
        icon: MousePointer,
        label: "Sélecteur visuel « OpenClaw » dessinant un cadre d'enregistrement sur une fenêtre native.",
      },
      icon: MousePointer,
      gradient: "from-orange-500/10 to-amber-500/10",
    },
  ]

  return (
    <section className="py-24 sm:py-32 bg-transparent border-b border-slate-200/50 relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 sm:mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-6 leading-[1.1] max-w-3xl mx-auto">
              Tu bosses trop.<br />Pas parce que tu manques de talent.<br />Parce que tu passes tes journées à recoller des morceaux.
            </h2>
            <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Retrouver où en est chaque dossier client. Vérifier qui t&apos;a payé. Identifier quels projets sont en retard. Chercher quels mails importants tu as laissés sans réponse. Au lieu de diriger ton activité, tu passes ton temps à surveiller le pipeline, le cash qui rentre, et à éteindre des incendies. Elazya fait disparaître cette friction. Définitivement.
            </p>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto space-y-20 sm:space-y-28">
          {scenarios.map((scenario, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">{scenario.time}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{scenario.title}</h3>
              </div>
              <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                {scenario.desc}
              </p>

              {/* Terminal block or styled placeholder */}
              {scenario.terminal ? (
                <>
                  {scenario.terminal}
                  {scenario.footer && <p className="text-sm text-slate-500 font-medium mt-4">{scenario.footer}</p>}
                </>
              ) : scenario.placeholder ? (
                <div className={`aspect-video rounded-2xl bg-gradient-to-br ${scenario.gradient} border border-slate-200/60 flex flex-col items-center justify-center p-8 gap-4 backdrop-blur-sm`}>
                  <div className="w-16 h-16 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm flex items-center justify-center">
                    <scenario.placeholder.icon className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500 text-center italic leading-relaxed max-w-md font-medium">
                    {scenario.placeholder.label}
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Aperçu à venir</span>
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>

        {/* 2nd CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-20 sm:mt-24">
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={onCTA} className="bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place (Tarif Fondateur)</motion.button>
          <p className="text-xs font-medium text-slate-400 mt-3">Sans engagement · Tarif Fondateur garanti · Remboursé si l&apos;app ne sort pas</p>
        </motion.div>
      </div>
    </section>
  )
}
