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
      <div className="container mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><span>🚀</span><span className="hidden sm:inline">Accès Anticipé</span></span>
          <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/5 border border-primary/15">{places}/47 places restantes</span>
          <span className="text-xs font-medium text-slate-400">Lancement le 5 avril</span>
        </div>
        <div className="flex items-center gap-2">
          {[{ v: c.days, l: "j" }, { v: c.hours, l: "h" }, { v: c.minutes, l: "m" }, { v: c.seconds, l: "s" }].map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center"><span className="font-mono text-base font-bold tabular-nums text-slate-800">{String(u.v).padStart(2, "0")}</span><span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">{u.l}</span></div>
              {i < 3 && <span className="text-slate-300 font-bold text-xs">:</span>}
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={onCTA} className="text-xs px-5 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-full shadow-[0_8px_16px_rgb(15,23,42,0.25)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place — 9€</motion.button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [selectedSkill, setSelectedSkill] = useState<any>(null)
  const [modal, setModal] = useState(false)
  const [modalPlan, setModalPlan] = useState("solo")
  const openModal = (p: string = "solo") => { setModalPlan(p); setModal(true) }
  const [places, setPlaces] = useState(47)
  useEffect(() => { fetch("/api/waitlist").then(r => r.json()).then(d => setPlaces(d.places || 47)).catch(() => { }) }, [])

  return (
    <>
      <StickyBanner onCTA={() => openModal()} places={places} />
      <EmailModal open={modal} onClose={() => setModal(false)} plan={modalPlan} />
      <main className="min-h-screen bg-background text-slate-800 font-sans selection:bg-primary/20 selection:text-slate-900 overflow-hidden">

        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-36 overflow-hidden bg-background">
          <GlassBackground />
          <div className="container relative z-10 px-6 mx-auto">
            <div className="max-w-5xl mx-auto text-center mt-[-8vh]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col items-center">
                <p className="text-sm sm:text-base text-slate-400 font-medium mb-6 tracking-wide">Tu passes encore des heures sur tes factures, tes prospects et tes emails ?</p>
                <h1 className="text-4xl sm:text-5xl md:text-[5.5rem] lg:text-[6.5rem] font-semibold tracking-tight mb-6 text-slate-800 leading-[1.1]">
                  L'app Mac qui tourne
                  <br className="hidden md:block" />
                  <span className="text-slate-400 font-medium tracking-tight">ta structure pendant </span>
                  <span className="text-slate-800 font-bold tracking-tighter">que tu dors.</span>
                </h1>
                <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl mx-auto mb-8 tracking-wide leading-relaxed">
                  10 agents IA coordonnés s'occupent de tes factures, tes prospects, ton LinkedIn et tes emails. Tout automatisé. Tout local sur ton Mac. Tu reprends juste les décisions.
                </p>
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => openModal()} className="bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place — 9€</motion.button>
                <p className="text-xs font-medium text-slate-400 mt-3">47 places · Lancement le 5 avril · -50% · 9€ déduits du prix final</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── SECTION SCÉNARIOS ─── */}
        <section className="py-24 sm:py-32 bg-background border-b border-slate-200/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 sm:mb-20">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-4 leading-[1.1]">
                  Voici ce qui se passe quand<br className="hidden sm:block" /> Elazya tourne pour toi.
                </h2>
                <p className="text-base sm:text-lg text-slate-500 font-medium">Des situations réelles. Pas des promesses.</p>
              </motion.div>
            </div>

            <div className="max-w-3xl mx-auto space-y-20 sm:space-y-28">

              {/* SCÉNARIO 1 — 8h00 */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">8h00</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Tu te réveilles</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Avant même d'ouvrir ton ordi, tout est résumé sur ton téléphone.
                </p>
                {/* Bulle Telegram */}
                <div className="bg-[#1c2b3a] border border-[#2a3f54] rounded-xl p-5 sm:p-6 max-w-lg font-mono text-sm text-[#e8e8e8] leading-relaxed">
                  <p className="mb-3 font-sans text-xs text-slate-400 font-semibold uppercase tracking-wider">Telegram · Elazya Bot</p>
                  <p>
                    ☀️ <strong>BRIEF DU 04/03</strong><br />
                    → 2 emails urgents (Client X, Prospect Paul)<br />
                    → 3 tâches prioritaires du jour<br />
                    → Facture FAC-002 en retard — relance envoyée automatiquement<br />
                    → Ton post LinkedIn du jour est prêt à poster
                  </p>
                </div>
                <p className="text-sm text-slate-500 font-medium mt-4">Tu sais exactement quoi faire. En 30 secondes.</p>
              </motion.div>

              {/* SCÉNARIO 2 — Un prospect */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">14h00</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Un prospect t'écrit</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Tu ne le vois même pas tout de suite.<br />
                  Elazya a détecté que c'est un lead chaud,<br />
                  préparé une réponse personnalisée,<br />
                  proposé un créneau Calendly,<br />
                  créé sa fiche dans ton CRM.<br />
                  Il ne reste plus qu'à appuyer sur Envoyer.
                </p>
                <div className="aspect-video rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center p-6">
                  <p className="text-xs text-slate-400 text-center italic leading-relaxed max-w-md">
                    VIDÉO 2 — Sera ajoutée ici<br />
                    <span className="text-slate-500 text-[11px]">Email prospect reçu, Mission Control log visible, draft Apple Mail rédigé automatiquement, notification Telegram : « Lead chaud · Réponse prête. » Durée : 20-25s.</span>
                  </p>
                </div>
              </motion.div>

              {/* SCÉNARIO 3 — Facture */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">16h30</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Une facture arrive dans ton dossier</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Tu n'ouvres pas le PDF.<br />
                  Elazya l'a lu, classé dans le bon dossier,<br />
                  mis à jour ton suivi,<br />
                  créé un rappel 7 jours avant l'échéance.
                </p>
                <div className="aspect-video rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center p-6">
                  <p className="text-xs text-slate-400 text-center italic leading-relaxed max-w-md">
                    VIDÉO 3 — Sera ajoutée ici<br />
                    <span className="text-slate-500 text-[11px]">PDF glissé dans dossier Mac, Mission Control log : « Facture FAC-001 · 1250€ · classée · rappel 12/04 ». Durée : 15s.</span>
                  </p>
                </div>
              </motion.div>

              {/* SCÉNARIO 4 — Appel client */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">18h00</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Après un appel client</h3>
                </div>
                <p className="text-base text-slate-500 font-medium mb-6 leading-relaxed">
                  Tu envoies tes notes vocales sur Telegram.<br />
                  Elazya transcrit, met à jour le CRM,<br />
                  crée le rappel dans ton calendrier. En 20 secondes.
                </p>
                <div className="aspect-video rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center p-6">
                  <p className="text-xs text-slate-400 text-center italic leading-relaxed max-w-md">
                    VIDÉO 4 — Sera ajoutée ici<br />
                    <span className="text-slate-500 text-[11px]">Note vocale Telegram envoyée, réponse agent : « Appel Client X · Devis avant 07/03 · Rappel créé. » Durée : 15s.</span>
                  </p>
                </div>
              </motion.div>

            </div>

            {/* 2nd CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-20 sm:mt-24">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => openModal()} className="bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place — 9€</motion.button>
              <p className="text-xs font-medium text-slate-400 mt-3">9€ maintenant · -50% le 5 avril · Remboursé si l'app ne sort pas</p>
            </motion.div>
          </div>
        </section>

        {/* Social Proof / Logos */}
        <section className="py-16 border-y border-slate-200/50 bg-background relative z-10">
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
        <section className="py-28 relative overflow-hidden border-b border-slate-200/50">
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
                  emoji: "💰",
                  name: "Facturation Auto",
                  desc: "PDF facture reçue → classée, Notion mise à jour, reminder créé.",
                  savings: "2h/semaine",
                  color: "from-green-50 to-green-50/10",
                  borderColor: "hover:border-green-200",
                  iconBg: "bg-green-100"
                },
                {
                  emoji: "📧",
                  name: "Onboarding Client",
                  desc: "Prospect intéressé → Calendly envoyé, contrat préparé, paiement ready.",
                  savings: "1h/client",
                  color: "from-blue-50 to-blue-50/10",
                  borderColor: "hover:border-blue-200",
                  iconBg: "bg-blue-100"
                },
                {
                  emoji: "📱",
                  name: "LinkedIn Quotidien",
                  desc: "Chaque matin → 3 posts prêts, 5 commentaires générés, feed résumé.",
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

        {/* Features Section */}
        <section id="features" className="py-28 relative overflow-hidden bg-white/30 backdrop-blur-3xl">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 blur-[140px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
                  <span className="text-slate-800">Un logiciel IA qui agit</span>
                  {' '}
                  <span className="text-gradient-primary">vraiment sur votre Mac.</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                  Elazya ne se contente pas de répondre à vos questions dans une fenêtre de chat. Il ouvre vos dossiers, lit vos PDF, et prépare des brouillons directement dans Apple Mail.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Terminal,
                  title: "Il agit dans vos applications",
                  desc: "Elazya manipule vos fichiers, rédige vos mails et gère vos rendez-vous. Il ne discute pas du travail — il le fait pour de vrai.",
                  gradient: "from-primary/5 to-transparent",
                  color: "text-primary"
                },
                {
                  icon: ShieldCheck,
                  title: "Souveraineté totale",
                  desc: "Le cerveau reste chez vous. Aucun serveur cloud ne stocke votre contexte. Pas de tracking, pas de collecte.",
                  gradient: "from-accent/5 to-transparent",
                  color: "text-accent"
                },
                {
                  icon: Zap,
                  title: "44 compétences",
                  desc: "Email, calendrier, terminal, recherche web, Notion, Spotify... Elazya enchaîne les outils pour résoudre des problèmes complexes.",
                  gradient: "from-emerald-500/5 to-transparent",
                  color: "text-emerald-500"
                }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                      <feat.icon className={`w-6 h-6 ${feat.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">{feat.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
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
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mémoire contextuelle</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-slate-800 tracking-tight">Il vous connaît, sans cloud.</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-8 max-w-xl">
                  Elazya apprend vos préférences, votre style et vos habitudes. Tout est stocké localement sur votre machine — rien ne quitte jamais votre Mac.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Préférences personnelles', 'Habitudes de travail', 'Style rédactionnel'].map((tag, i) => (
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
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">Multi-canal</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Telegram, WhatsApp, Slack, Email — communiquez avec Elazya depuis n'importe où.
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
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Lock className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">Application native .dmg</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  S'installe comme un logiciel normal. Pas de lignes de commande complexes.
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
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Automatisations</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-slate-800 tracking-tight">Des chaînes d'action intelligentes</h3>
                <p className="text-slate-500 leading-relaxed font-medium max-w-xl">
                  Elazya ne fait pas qu'une chose à la fois. Il enchaîne ses compétences pour résoudre des problèmes complexes : de l'analyse de factures à la veille technologique.
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

        {/* Skills Arsenal */}
        <section id="arsenal" className="py-28 relative overflow-hidden border-t border-slate-200/50 bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
                <span className="text-slate-800">44 applications connectées.</span>
                {' '}
                <span className="text-gradient-primary">Zéro plugin nécessaire.</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                Elazya comprend et pilote nativement vos outils locaux via des permissions d'accessibilité sécurisées.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {[
                { name: "Email Pro", icon: Mail, desc: "Gmail, Outlook, Mail.app" },
                { name: "Calendrier", icon: Calendar, desc: "Gestion de planning" },
                { name: "Recherche Web", icon: Search, desc: "Recherche anonyme" },
                { name: "Notes", icon: PenTool, desc: "Notes & idées" },
                { name: "Finder", icon: Folder, desc: "Organisation fichiers" },
                { name: "Terminal", icon: Terminal, desc: "Scripts & serveurs" },
                { name: "Slack / Discord", icon: MessageSquare, desc: "Communication" },
                { name: "Santé / RDV", icon: Activity, desc: "Doctolib & soins" },
                { name: "Rappels", icon: Bell, desc: "To-do local" },
                { name: "Notion", icon: FileText, desc: "Knowledge base" },
                { name: "Python", icon: Cpu, desc: "Calculs & data" },
                { name: "Spotify", icon: Music, desc: "Contrôle musical" },
                { name: "Focus Mode", icon: Moon, desc: "Concentration" },
                { name: "Sécurité", icon: Lock, desc: "Mots de passe" },
                { name: "Météo", icon: Cloud, desc: "Prévisions" },
                { name: "Traduction", icon: Book, desc: "Langues & style" },
                { name: "Système", icon: ShieldCheck, desc: "Santé du Mac" },
                { name: "Shopping", icon: ShoppingCart, desc: "Suivi colis" },
                { name: "Maps", icon: Globe, desc: "Lieux & trajets" },
                { name: "Sparkles", icon: Sparkles, desc: "Et bien plus..." },
              ].map((skill, i) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 10) * 0.03 }}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-[0_8px_30px_-4px_rgba(99,102,241,0.1)] transition-all duration-300 group cursor-default text-center flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-[13px] font-bold text-slate-700 mb-1">{skill.name}</div>
                    <div className="text-[11px] font-medium text-slate-500">{skill.desc}</div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <span className="px-6 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-bold text-slate-500 shadow-sm">
                + 24 autres compétences incluses
              </span>
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
        <section className="py-24 sm:py-32 border-t border-slate-200/50 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-4 leading-[1.1]">Choisis ton niveau d'automatisation.</h2>
                <p className="text-base sm:text-lg text-slate-500 font-medium">9€ maintenant pour sécuriser ta place. Le reste le 5 avril à -50%.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* SOLO */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }} className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-1">SOLO</h3>
                <p className="text-sm text-slate-500 font-medium mb-5">Ton Mac qui travaille pour toi, 24/7.</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {["Brief Telegram chaque matin, tout résumé", "Factures classées automatiquement", "Prospects qualifiés, fiches créées", "Posts LinkedIn générés chaque jour", "Zéro abonnement. Tout local sur ton Mac."].map((b, i) => (
                    <li key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{b}</li>
                  ))}
                </ul>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm font-bold text-slate-800">9€ aujourd'hui · <span className="text-primary">88€</span> le 5 avril <span className="line-through text-slate-400">197€</span></p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Tu économises 109€</p>
                  <button onClick={() => openModal("solo")} className="mt-4 text-sm font-bold text-primary hover:text-primary-hover transition-colors">→ Sécuriser ma place pour 9€</button>
                </div>
              </motion.div>

              {/* PRO */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="rounded-2xl border-2 border-primary bg-white p-7 flex flex-col relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-primary px-4 py-1 rounded-full">Le plus populaire</span>
                <h3 className="text-xl font-bold text-slate-800 mb-1">PRO</h3>
                <p className="text-sm text-slate-500 font-medium mb-5">Tes agents forment une vraie équipe.</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {["Tout le Solo +", "Agents enchaînés automatiquement (prospect → CRM → réponse)", "LinkedIn publie directement sur ton compte", "Brief de recherche complet en 3 min sur demande", "Devis PDF envoyable en 20 min", "CRM mis à jour avec tes notes vocales"].map((b, i) => (
                    <li key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{b}</li>
                  ))}
                </ul>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm font-bold text-slate-800">9€ aujourd'hui · <span className="text-primary">238€</span> le 5 avril <span className="line-through text-slate-400">497€</span></p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Tu économises 259€</p>
                  <button onClick={() => openModal("pro")} className="mt-4 text-sm font-bold text-primary hover:text-primary-hover transition-colors">→ Sécuriser ma place pour 9€</button>
                </div>
              </motion.div>

              {/* STUDIO */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-1">STUDIO</h3>
                <p className="text-sm text-slate-500 font-medium mb-5">Tu diriges une équipe IA, pas une app.</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {["Tout le Pro +", "4 agents coordonnés (Strategy, Marketing, Business, Client)", "Rapport business complet chaque lundi", "Crée tes propres agents en décrivant ce que tu veux", "Jusqu'à 5 utilisateurs sur le même compte", "1 agent personnalisé créé pour toi par an", "Setup guidé 1-to-1"].map((b, i) => (
                    <li key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{b}</li>
                  ))}
                </ul>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm font-bold text-slate-800">9€ aujourd'hui · <span className="text-primary">488€</span> le 5 avril <span className="line-through text-slate-400">997€</span></p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Tu économises 509€</p>
                  <button onClick={() => openModal("studio")} className="mt-4 text-sm font-bold text-primary hover:text-primary-hover transition-colors">→ Sécuriser ma place pour 9€</button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-28 border-t border-slate-200/50 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-slate-800">Questions fréquentes</h2>
              </div>
              <div className="space-y-4">
                {[
                  { q: "Ça marche sur Windows ?", a: "Non, exclusivement Mac (macOS 12 minimum)." },
                  { q: "Mes données partent sur le cloud ?", a: "Non. Tout tourne en local sur ton Mac. Tes fichiers, mails et données ne quittent jamais ta machine." },
                  { q: "J'ai besoin d'un abonnement IA en plus ?", a: "Tu as besoin d'une clé API. Google Gemini a un plan gratuit qui suffit pour commencer." },
                  { q: "Que se passe-t-il si mon Mac est éteint ?", a: "Les agents s'arrêtent quand le Mac dort. Pour les notifications Telegram et emails en temps réel, ton Mac doit rester allumé." },
                  { q: "À quoi servent les 9€ ?", a: "C'est un dépôt pour sécuriser ta place parmi les 47 disponibles. Ces 9€ sont déduits intégralement du prix final le 5 avril. Si l'app ne sort pas : remboursement intégral, sans conditions." },
                  { q: "Pourquoi seulement 47 places ?", a: "Pour garantir un support de qualité à chaque utilisateur au lancement. Les places suivantes seront au prix normal." },
                  { q: "C'est quoi OpenClaw ?", a: "Le moteur IA qui coordonne les agents d'Elazya sur ton Mac. Il tourne en local. Tu n'as pas besoin de comprendre comment ça marche." },
                ].map((faq, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <details className="group p-6 rounded-2xl bg-[#f8fbff] border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                      <summary className="flex justify-between items-center font-bold text-slate-800 list-none">
                        <span>{faq.q}</span>
                        <span className="text-slate-400 group-open:text-primary group-open:rotate-180 transition-all ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm">↓</span>
                      </summary>
                      <p className="text-sm font-medium text-slate-600 mt-5 leading-relaxed bg-white p-5 rounded-xl border border-slate-100 shadow-sm">{faq.a}</p>
                    </details>
                  </motion.div>
                ))}
              </div>
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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-4 leading-[1.1]">47 places. 9€ pour sécuriser la tienne.</h2>
              <p className="text-base sm:text-lg text-slate-500 font-medium max-w-lg mx-auto mb-10">Le 5 avril, tu payes le reste à -50%. Après cette date, les prix remontent définitivement.</p>

              {/* Plan recap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10 w-full">
                {[
                  { name: "Solo", now: "9€", after: "88€", save: "109€" },
                  { name: "Pro", now: "9€", after: "238€", save: "259€" },
                  { name: "Studio", now: "9€", after: "488€", save: "509€" },
                ].map((p, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-800 mb-1">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.now} maintenant · {p.after} le 5 avril</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">tu économises {p.save}</p>
                  </div>
                ))}
              </div>

              {/* Countdown */}
              <CountdownDisplay />

              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => openModal()} className="mt-8 bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 lg:px-12 lg:py-4 rounded-full font-bold text-base lg:text-lg shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20">Sécuriser ma place — 9€</motion.button>
              <p className="text-xs font-medium text-slate-400 mt-4 max-w-md">Paiement sécurisé via Stripe · Remboursé si l'app ne sort pas · 9€ déduits du prix final</p>
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
