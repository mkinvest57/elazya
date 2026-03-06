"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield, Zap, Terminal, Sparkles, Globe, ArrowRight, Mail, Calendar, Search, PenTool, Folder, MessageSquare, Activity, Bell, FileText, Cpu, Lock, Cloud, Book, ShieldCheck, Brain, Check, X, Music, Moon, ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { GlassBackground } from "@/components/ui/GlassBackground"

/* ─── COUNTDOWN ─── */
const LAUNCH = new Date("2026-04-05T00:00:00+02:00").getTime()
function useCountdown() {
  const calc = useCallback(() => {
    const d = Math.max(0, LAUNCH - Date.now())
    return { days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) }
  }, [])
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [calc])
  return t
}

/* ─── EMAIL MODAL ─── */
function EmailModal({ open, onClose, plan = "solo" }: { open: boolean; onClose: () => void; plan?: string }) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) return
    setState("loading")
    try {
      const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, plan }) })
      const d = await r.json()
      if (!r.ok) { setErrMsg(d.error || "Erreur"); setState("error"); return }
      setState("done")
      setTimeout(onClose, 2500)
    } catch { setErrMsg("Erreur réseau"); setState("error") }
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.15)] border border-slate-200/80">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200/50"><X className="w-4 h-4 text-slate-400" /></button>
            {state === "done" ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-3">✅</p>
                <h3 className="text-lg font-bold text-slate-800 mb-2">C'est envoyé.</h3>
                <p className="text-sm text-slate-500 font-medium">Surveille ta boîte dans les 60 secondes.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Réserve ton accès anticipé</h3>
                  <p className="text-sm text-slate-500 font-medium">Un lien exclusif de réservation t'attend dans ta boîte.</p>
                </div>
                <form onSubmit={submit} className="space-y-4">
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setState("idle") }} placeholder="Ton email" required autoFocus className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary/40 focus:bg-white transition-all" />
                  {state === "error" && <p className="text-sm text-center text-red-500 font-medium">{errMsg}</p>}
                  <motion.button type="submit" disabled={state === "loading"} whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }} className="w-full py-3 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-[0_8px_20px_rgba(15,23,42,0.25)] ring-1 ring-slate-800/20 flex items-center justify-center gap-2">
                    {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recevoir mon accès anticipé"}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── STICKY BANNER ─── */
function StickyBanner({ onCTA, places }: { onCTA: () => void; places: number }) {
  const c = useCountdown()
  return (
    <div className="fixed top-[60px] sm:top-[64px] left-0 right-0 z-[40] bg-white/80 backdrop-blur-2xl border-b border-slate-200/50">
      <div className="container mx-auto px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex text-sm font-bold text-slate-800 items-center gap-1.5"><span>🚀</span><span>Accès Anticipé</span></span>
          <span className="text-[11px] sm:text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/5 border border-primary/15 whitespace-nowrap">{places}/47 places</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {[{ v: c.days, l: "j" }, { v: c.hours, l: "h" }, { v: c.minutes, l: "m" }, { v: c.seconds, l: "s" }].map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center"><span className="font-mono text-base font-bold tabular-nums text-slate-800">{String(u.v).padStart(2, "0")}</span><span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">{u.l}</span></div>
              {i < 3 && <span className="text-slate-300 font-bold text-xs">:</span>}
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={onCTA} className="text-[11px] sm:text-xs px-4 py-2 sm:px-5 sm:py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-full shadow-[0_8px_16px_rgb(15,23,42,0.25)] transition-all ring-1 ring-slate-800/20 whitespace-nowrap">Sécuriser ma place</motion.button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [selectedSkill, setSelectedSkill] = useState<any>(null)
  const [isToggled, setIsToggled] = useState(true)
  const [modal, setModal] = useState(false)
  const [modalPlan, setModalPlan] = useState("solo")
  const openModal = (p: string = "solo") => { setModalPlan(p); setModal(true) }
  const [places, setPlaces] = useState(47)
  useEffect(() => { fetch("/api/waitlist").then(r => r.json()).then(d => setPlaces(d.places || 47)).catch(() => { }) }, [])

  return (
    <>
      <StickyBanner onCTA={() => openModal()} places={places} />
      <EmailModal open={modal} onClose={() => setModal(false)} plan={modalPlan} />
      <main className="min-h-screen text-slate-800 font-sans selection:bg-primary/20 selection:text-slate-900 overflow-hidden">
        <GlassBackground />

        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-16 overflow-hidden bg-transparent">
          <div className="container relative z-10 px-4 sm:px-6 mx-auto">
            <div className="max-w-5xl mx-auto text-center mt-[-4vh] sm:mt-[-8vh]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="flex flex-col items-center">
                <p className="text-xs sm:text-base text-slate-400 font-medium mb-4 sm:mb-6 tracking-wide px-2">⚡️ Le collaborateur IA natif Apple Silicon</p>
                <h1 className="text-4xl sm:text-5xl md:text-[4.5rem] lg:text-[5.5rem] font-semibold tracking-tight mb-6 text-slate-800 leading-[1.15] sm:leading-[1.1]">
                  Arrêtez d'automatiser des APIs.<br />
                  <span className="text-gradient-primary">Automatisez votre Mac.</span>
                </h1>
                <p className="text-sm md:text-lg text-slate-500 font-medium max-w-xl mx-auto mb-8 tracking-wide leading-relaxed px-4">
                  Elazya ne se connecte pas juste à vos outils web.<br className="hidden sm:block" />
                  Il prend le contrôle de macOS en local.<br className="hidden sm:block" />
                  Il lit vos PDF confidentiels, clique dans vos vieux logiciels sans API,<br className="hidden sm:block" />
                  et rédige vos emails natifs. Exactement comme un assistant physique, mais 24/7.
                </p>
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => openModal()} className="bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-3.5 sm:px-8 sm:py-3.5 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place</motion.button>
                <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-4 px-4">47 places · Lancement le 5 avril · Tarif Fondateur garanti sur le prix final</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── SECTION SCÉNARIOS ─── */}
        <section className="py-24 sm:py-32 bg-transparent border-b border-slate-200/50 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 sm:mb-20">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-6 leading-[1.1] max-w-3xl mx-auto">
                  Tu bosses trop.<br />Pas parce que tu manques de talent.<br />Parce que tu passes tes journées à recoller des morceaux.
                </h2>
                <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                  Retrouver où en est chaque dossier client. Vérifier qui t'a payé. Identifier quels projets sont en retard. Chercher quels mails importants tu as laissés sans réponse. Au lieu de diriger ton activité, tu passes ton temps à surveiller le pipeline, le cash qui rentre, et à éteindre des incendies. Elazya fait disparaître cette friction. Définitivement.
                </p>
              </motion.div>
            </div>

            <div className="max-w-3xl mx-auto space-y-20 sm:space-y-28">

              {/* SCÉNARIO 1 — 8h00 */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">9h00</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Un logiciel bloqué sans API ? Pas de problème.</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Vous devez extraire 500 fiches clients d'un vieux CRM local.<br />
                  Elazya ouvre la fenêtre, prend le contrôle de la souris,<br />
                  navigue de page en page grâce à la vision par ordinateur,<br />
                  lit les pixels de l'écran, et copie tout dans un Google Sheet propre. En 10 minutes.
                </p>
                {/* Bulle Telegram */}
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
                <p className="text-sm text-slate-500 font-medium mt-4">Pendant ce temps, vous faisiez autre chose.</p>
              </motion.div>

              {/* SCÉNARIO 2 — Un prospect */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">14h00</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Le chaos des pièces jointes classé. Zéro cloud.</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Un partenaire vous envoie un dossier de 40 PDF lourds.<br />
                  Elazya détecte la réception, lit le contenu 100% en local secrètement<br />
                  grâce à la mémoire de votre puce Apple Silicon,<br />
                  renomme chaque fichier selon vos règles,<br />
                  et les range dans le bon dossier réseau. Aucun document ne part chez OpenAI.
                </p>
                <div className="aspect-video rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center p-6">
                  <p className="text-xs text-slate-400 text-center italic leading-relaxed max-w-md">
                    VIDÉO 2 — Sera ajoutée ici<br />
                    <span className="text-slate-500 text-[11px]">Finder : Dossier "Vrac" se vidant automatiquement, les fichiers sont renommés (ex: "CONTRAT_MAQUIS_2025.pdf") et déplacés instantanément.</span>
                  </p>
                </div>
              </motion.div>

              {/* SCÉNARIO 3 — Facture */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">16h30</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Veille concurrentielle sur des sites fermés aux bots</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Vous voulez scraper les prix d'un concurrent qui bloque Zapier ?<br />
                  Elazya ouvre un vrai navigateur Safari sur votre écran,<br />
                  déplace le curseur comme un humain,<br />
                  contourne les captchas comportementaux, et lit l'écran visuellement pour vous.
                </p>
                <div className="aspect-video rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center p-6">
                  <p className="text-xs text-slate-400 text-center italic leading-relaxed max-w-md">
                    VIDÉO 3 — Sera ajoutée ici<br />
                    <span className="text-slate-500 text-[11px]">Curseur de la souris qui bouge tout seul dans Safari avec une bannière "Agent Safari Actif", parcourant des fiches produits de manière aléatoire.</span>
                  </p>
                </div>
              </motion.div>

              {/* SCÉNARIO 4 — Appel client */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">18h00</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Vous montrez l'écran, il apprend.</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Oubliez la création de scripts JSON complexes.<br />
                  Dites simplement "Quand je reçois ce mail, regarde là, clique ici et remplis ça".<br />
                  Elazya comprend l'instruction visuelle et exécute.
                </p>
                <div className="aspect-video rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center p-6">
                  <p className="text-xs text-slate-400 text-center italic leading-relaxed max-w-md">
                    VIDÉO 4 — Sera ajoutée ici<br />
                    <span className="text-slate-500 text-[11px]">Sélecteur visuel "OpenClaw" dessinant un cadre d'enregistrement sur une fenêtre native. L'humain clique trois fois, l'agent rejoue avec des données variables.</span>
                  </p>
                </div>
              </motion.div>

            </div>

            {/* 2nd CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-20 sm:mt-24">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => openModal()} className="bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place (Tarif Fondateur)</motion.button>
              <p className="text-xs font-medium text-slate-400 mt-3">Sans engagement · Tarif Fondateur garanti · Remboursé si l'app ne sort pas</p>
            </motion.div>
          </div>
        </section>

        {/* Social Proof / Logos */}
        <section className="py-16 border-y border-slate-200/50 bg-transparent relative z-10">
          <div className="container mx-auto px-6">
            <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-widest mb-8">
              Propulsé par les meilleurs modèles d'IA au monde
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
              {['Google Gemini', 'Claude', 'GPT-4', 'Mistral', 'LLaMA', 'Grok'].map((name) => (
                <span key={name} className="text-sm font-semibold text-slate-600 tracking-tight">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Agents Preview */}
        <section className="py-28 relative overflow-hidden border-b border-slate-200/50 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-6 relative">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
                  <span className="text-slate-800">Des agents IA qui</span>
                  {' '}
                  <span className="text-gradient-primary">contrôlent vos apps natives</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                  Elazya agit directement dans Apple Mail, Finder, Calendrier et vos autres applications pour exécuter vos tâches avec 10 agents spécialisés.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  emoji: "📂",
                  name: "Le Démêleur Finder",
                  desc: "Réorganise 10 ans de dossiers chaotiques en triant chaque fichier par son vrai contenu sémantique, lu en local.",
                  savings: "2h/semaine",
                  color: "from-green-50 to-green-50/10",
                  borderColor: "hover:border-green-200",
                  iconBg: "bg-green-100"
                },
                {
                  emoji: "🌐",
                  name: "Le Pilote Safari",
                  desc: "Pilote le navigateur visuellement pour gérer des extranets archaïques où aucune intégration Zapier n'est possible.",
                  savings: "1h/client",
                  color: "from-blue-50 to-blue-50/10",
                  borderColor: "hover:border-blue-200",
                  iconBg: "bg-blue-100"
                },
                {
                  emoji: "✉️",
                  name: "L'Erudit Apple Mail",
                  desc: "Lit les longs fils de discussion dans Apple Mail et croise avec votre disque dur pour le brouillon parfait.",
                  savings: "3h30/semaine",
                  color: "from-sky-50 to-sky-50/10",
                  borderColor: "hover:border-sky-200",
                  iconBg: "bg-sky-100"
                },
              ].map((agent, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ${agent.borderColor} transition-all duration-300 group hover:-translate-y-1`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${agent.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl ${agent.iconBg} flex items-center justify-center mb-5 text-2xl shadow-sm border border-white/50`}>
                      {agent.emoji}
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-slate-800">{agent.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5 font-medium">{agent.desc}</p>
                    <div className="flex items-center gap-2 text-sm bg-white/50 px-3 py-1.5 rounded-full w-max border border-slate-200/50">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-primary font-bold">{agent.savings} sauvées</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/agents">
                <motion.span
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4"
                >
                  Voir les 7 autres agents
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </div>
          </div>
        </section>

        {/* Product Showcase — Bento Grid */}
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
              {/* Large card */}
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
                  Le moteur OpenClaw lit l'écran et clique sur les pixels. Ça le rend compatible avec 100% de vos apps, que ce soit Safari, Excel, Finder, ou le vieux logiciel comptable de 2012. Pas besoin d'intégration API.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Lecture des pixels', 'Reconnaissance visuelle', 'Navigation OCR'].map((tag, i) => (
                    <span key={i} className="text-[11px] font-bold text-slate-600 px-4 py-2 rounded-full bg-slate-100/80 border border-slate-200/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Small top-right card */}
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

              {/* Bottom row */}
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
                  S'il n'y a pas d'API, il tape. C'est un humain numérique caché derrière le Terminal.
                </p>
              </motion.div>

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
                  Pendant qu'un agent lit l'écran, un autre fouille votre disque SSD Finder et un troisième rédige la note finale. Ils communiquent en réseau local instantané, exécutant des scénarios complexes à la vitesse de votre puce ARM.
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

        {/* Comparison Section */}
        <section className="py-28 relative border-t border-slate-200/50 bg-[#f8fbff]/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
                <span className="text-slate-800">Pourquoi un logiciel natif</span>
                {' '}
                <span className="text-gradient-primary">plutôt qu'un cloud ?</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
                Seule une application Mac peut garantir que vos données ne quittent jamais votre ordinateur.
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/80 overflow-hidden bg-white/80 backdrop-blur-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/50">
                      <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest w-1/3">Fonctionnalité</th>
                      <th className="p-6 text-xs font-bold text-primary uppercase tracking-widest">Elazya</th>
                      <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Cloud IA (SaaS)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { feature: "Confidentialité", elazya: "100% locale", cloud: "Données exploitées" },
                      { feature: "Accès système", elazya: "Finder, mails, apps", cloud: "Navigateur uniquement" },
                      { feature: "Mode hors-ligne", elazya: "Fonctionnel", cloud: "Inexploitable" },
                      { feature: "Coût sur 3 ans", elazya: "197€ (Achat unique)", cloud: "~750€ (Abonnement)" },
                      { feature: "Vos données", elazya: "Restent chez vous", cloud: "Servent à l'entraînement" },
                    ].map((row, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 text-slate-600 font-semibold">{row.feature}</td>
                        <td className="p-6">
                          <span className="inline-flex items-center gap-2 text-primary font-bold">
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"><Check className="w-3 h-3" /></span>
                            {row.elazya}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="inline-flex items-center gap-2 text-slate-500 font-medium">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><X className="w-3 h-3 text-slate-400" /></span>
                            {row.cloud}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ─── LES 3 PLANS ─── */}
        <section className="py-24 sm:py-32 border-t border-slate-200/50 bg-transparent relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-4 leading-[1.1]">Choisis ton niveau d'automatisation.</h2>
                <p className="text-base sm:text-lg text-slate-500 font-medium">Sécurise ta place aujourd'hui pour geler le tarif. Le solde s'applique le 5 avril au Tarif Fondateur.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* SOLO */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }} className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-xl p-7 flex flex-col shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">Tu n'es plus seul à tout gérer.</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                  Tu ouvres ton Mac le matin.<br />
                  Ton brief est prêt. Tes factures sont classées.<br />
                  Tes mails clients ont une réponse en brouillon.<br />
                  Tu n'as plus qu'à valider.
                </p>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ce que ça inclut</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Les 10 agents Core qui tournent en local sur ton Mac.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />WhatsApp ou Telegram inclus — tu pilotes tout depuis ton téléphone.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Un morning briefing automatique chaque matin.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Zéro configuration technique : tout se fait depuis l'UI Mac, en français.</li>
                </ul>

                <div className="border-t border-slate-100 pt-5 text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-800 flex flex-col sm:block gap-1 mb-2">
                    <span className="line-through text-slate-400">197€</span>
                    <span className="hidden sm:inline"> · </span>
                    <span className="text-primary">88€</span> le 5 avril
                  </p>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed bg-[#f8fbff] p-3 rounded-lg border border-slate-100 italic shadow-sm">
                    Un assistant humain coûte 1 500€/mois. Elazya Solo, c'est 197€ une seule fois.
                  </p>
                  <button onClick={() => openModal("solo")} className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-3.5 rounded-full font-bold text-sm transition-colors text-center shadow-md">Sécuriser ma place</button>
                </div>
              </motion.div>

              {/* PRO */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="rounded-3xl border-2 border-primary/50 bg-white/90 backdrop-blur-xl p-7 flex flex-col relative scale-[1.02] shadow-xl">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-primary px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm">Le plus populaire</span>
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">Un prospect intéressé devient un client signé sans que tu aies rien fait entre les deux.</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                  Tes agents ne travaillent plus chacun de leur côté.<br />
                  Ils se parlent. Ils s'enchaînent. Ils forment une machine.
                </p>

                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Ce que ça change par rapport au Solo</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />Multi‑agents coordonnés : Qualification Leads alimente automatiquement ton CRM, qui déclenche l'Onboarding Client. Les agents se parlent entre eux.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />Browser automation : l'agent LinkedIn publie vraiment sur ton compte, au lieu de juste générer un texte à copier‑coller.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />Research agent : tu donnes un sujet → tu reçois un brief de 2 000 mots avec ~15 sources, prêt en 3 minutes.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />Proposal agent : tu décris un client → tu reçois un devis PDF envoyable directement.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />CRM post‑appel : transcription → extraction → mise à jour Notion, tu valides en 1 clic.</li>
                </ul>

                <div className="border-t border-slate-100 pt-5 text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-800 flex flex-col sm:block gap-1 mb-2">
                    <span className="line-through text-slate-400">497€</span>
                    <span className="hidden sm:inline"> · </span>
                    <span className="text-primary">238€</span> le 5 avril
                  </p>
                  <p className="text-xs text-slate-600 font-medium mb-5 leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10 italic shadow-sm">
                    Tes agents ne sont plus des îles. Ils forment une équipe.
                  </p>
                  <button onClick={() => openModal("pro")} className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-full font-bold text-sm transition-colors text-center shadow-md">Sécuriser ma place</button>
                </div>
              </motion.div>

              {/* STUDIO */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-xl p-7 flex flex-col shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">Tu ne gères plus une app. Tu diriges une équipe.</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                  Tu deviens CEO de ta propre structure à 1 personne.<br />
                  Strategy, Marketing, Business, Client —<br />chacun a son rôle, ils s'escaladent entre eux.<br />
                  Tu reprends juste les décisions.
                </p>

                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Ce que ça change par rapport au Pro</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Équipe de 4 agents coordonnés, comme les solo founders qui récupèrent 25h par semaine : Strategy · Marketing · Business · Client.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Créateur d'agents visuel : tu décris en français ce que tu veux, Elazya crée le skill OpenClaw correspondant.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Multi‑Mac / multi‑utilisateur : 2 à 5 collaborateurs sur la même instance.</li>
                  <li className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Health monitoring business : chaque semaine, un rapport automatique avec pipeline commercial, factures en attente, tâches prioritaires et opportunités.</li>
                </ul>

                <div className="border-t border-slate-100 pt-5 text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-800 flex flex-col sm:block gap-1 mb-2">
                    <span className="line-through text-slate-400">997€</span>
                    <span className="hidden sm:inline"> · </span>
                    <span className="text-primary">488€</span> le 5 avril
                  </p>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed bg-[#f8fbff] p-3 rounded-lg border border-slate-100 italic shadow-sm">
                    Les solo founders qui utilisent Elazya Studio récupèrent en moyenne 25h par semaine.
                  </p>
                  <button onClick={() => openModal("studio")} className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-3.5 rounded-full font-bold text-sm transition-colors text-center shadow-md">Sécuriser ma place</button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        \n                {/* ─── FAQ ─── */}
        <section className="py-28 border-t border-slate-200/50 bg-transparent relative z-10">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-slate-800">Questions fréquentes</h2>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
                {[
                  { q: "Ça marche sur Windows ?", a: "Non, exclusivement Mac (macOS 12 minimum)." },
                  { q: "Mes données partent sur le cloud ?", a: "Non. Tout tourne en local sur ton Mac. Tes fichiers, mails et données ne quittent jamais ta machine." },
                  { q: "J'ai besoin d'un abonnement IA en plus ?", a: "Tu as besoin d'une clé API. Google Gemini a un plan gratuit qui suffit pour commencer." },
                  { q: "Que se passe-t-il si mon Mac est éteint ?", a: "Les agents s'arrêtent quand le Mac dort. Pour les notifications Telegram et emails en temps réel, ton Mac doit rester allumé." },
                  { q: "Dois-je payer un acompte ?", a: "Oui, un petit dépôt de garantie est demandé pour réserver l'une des 47 places. Il sera intégralement déduit de ton prix final le 5 avril. Si l'app ne sort pas : remboursement intégral, sans conditions." },
                  { q: "Pourquoi seulement 47 places ?", a: "Pour garantir un support de qualité à chaque utilisateur au lancement. Les places suivantes seront au prix normal." },
                  { q: "C'est quoi OpenClaw ?", a: "Le moteur IA qui coordonne les agents d'Elazya sur ton Mac. Il tourne en local. Tu n'as pas besoin de comprendre comment ça marche." },
                ].map((faq, i) => (
                  <div key={i}>
                    <details className="group p-6 rounded-2xl bg-[#f8fbff] border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                      <summary className="flex justify-between items-center font-bold text-slate-800 list-none">
                        <span>{faq.q}</span>
                        <span className="text-slate-400 group-open:text-primary group-open:rotate-180 transition-all ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm">↓</span>
                      </summary>
                      <p className="text-sm font-medium text-slate-600 mt-5 leading-relaxed bg-white p-5 rounded-xl border border-slate-100 shadow-sm">{faq.a}</p>
                    </details>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─── */}
        <section className="py-28 sm:py-32 relative overflow-hidden border-t border-slate-200/50 bg-[#f8fbff]">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
          </div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-6 leading-[1.1]">
                Ce n'est pas une app de plus.<br />
                C'est la dernière dont tu auras besoin.
              </h2>
              <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                Tout est local sur ton Mac. Aucun serveur externe ne stocke tes données. Aucun abonnement. Tu paies une fois, tu possèdes pour toujours. Pendant que tout le monde empile les SaaS à l'abonnement, toi tu as une équipe IA qui travaille pour toi. Définitivement.
              </p>

              {/* Plan recap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10 w-full">
                {[
                  { name: "Solo", after: "88€", save: "109€" },
                  { name: "Pro", after: "238€", save: "259€" },
                  { name: "Studio", after: "488€", save: "509€" },
                ].map((p, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-800 mb-1">{p.name}</p>
                    <p className="text-xs text-slate-500">Tarif sécurisé : {p.after} le 5 avril</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">tu économiseras {p.save}</p>
                  </div>
                ))}
              </div>

              {/* Countdown */}
              <CountdownDisplay />

              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => openModal()} className="mt-8 bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 lg:px-12 lg:py-4 rounded-full font-bold text-base lg:text-lg shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place (Tarif Fondateur)</motion.button>
              <p className="text-xs font-medium text-slate-400 mt-4 max-w-md">Sans engagement · Remboursé si l'app ne sort pas · Déductible du prix final</p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}

/* ─── COUNTDOWN DISPLAY (for final CTA) ─── */
function CountdownDisplay() {
  const c = useCountdown()
  return (
    <div className="flex items-center justify-center gap-3">
      {[{ v: c.days, l: "jours" }, { v: c.hours, l: "heures" }, { v: c.minutes, l: "min" }, { v: c.seconds, l: "sec" }].map((u, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-slate-800">{String(u.v).padStart(2, "0")}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">{u.l}</span>
          </div>
          {i < 3 && <span className="text-slate-300 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  )
}
