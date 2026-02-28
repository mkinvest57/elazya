"use client"

import { Hero } from "@/components/sections/Hero"
import { motion } from "framer-motion"
import { Shield, Zap, Terminal, Sparkles, Globe, ArrowRight, Mail, Calendar, Search, PenTool, Folder, MessageSquare, Activity, Bell, FileText, Cpu, Lock, Cloud, Book, ShieldCheck, Brain, Check, X, Music, Moon, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const [selectedSkill, setSelectedSkill] = useState<any>(null)

  return (
    <main className="min-h-screen bg-background text-slate-800 font-sans selection:bg-primary/20 selection:text-slate-900 overflow-hidden">
      <Hero />

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

      {/* FAQ Section */}
      <section className="py-28 border-t border-slate-200/50 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-slate-800">
                Questions fréquentes
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "C'est quoi exactement Elazya ?",
                  a: "Elazya est un assistant IA qui tourne directement sur votre Mac. Il utilise les meilleurs modèles d'IA (Gemini, Claude, GPT-4) tout en gardant vos données 100% locales. Il peut gérer vos emails, organiser vos fichiers, et automatiser vos tâches quotidiennes."
                },
                {
                  q: "Je n'ai aucune compétence technique. C'est faisable ?",
                  a: "Absolument. L'installation se fait en 1 clic et un wizard vous guide pour tout configurer. Si vous savez utiliser un Mac, vous savez utiliser Elazya."
                },
                {
                  q: "Mes données restent vraiment privées ?",
                  a: "Oui. Elazya tourne intégralement sur votre ordinateur. Aucune donnée n'est envoyée à nos serveurs. Vos fichiers, emails et conversations restent chez vous."
                },
                {
                  q: "En quoi c'est différent de ChatGPT ?",
                  a: "ChatGPT est dans le cloud et ne peut pas accéder à vos fichiers ou applications. Elazya est un agent local qui contrôle votre machine : il lit vos emails, gère vos calendriers, organise vos dossiers — le tout sans connexion internet obligatoire."
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <details className="group p-6 rounded-2xl bg-[#f8fbff] border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                    <summary className="flex justify-between items-center font-bold text-slate-800 list-none">
                      <span>{faq.q}</span>
                      <span className="text-slate-400 group-open:text-primary group-open:rotate-180 transition-all ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm">
                        ↓
                      </span>
                    </summary>
                    <p className="text-sm font-medium text-slate-600 mt-5 leading-relaxed bg-white p-5 rounded-xl border border-slate-100 shadow-sm">{faq.a}</p>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden border-t border-slate-200/50 bg-[#f8fbff]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-800 leading-[1.1]">
              Prêt à installer l'IA
              <br />
              sur votre Mac ?
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-lg mx-auto mb-10 tracking-wide">
              Rejoignez les utilisateurs qui l'ont déjà téléchargé.
            </p>
            <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto justify-center bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-4 lg:px-12 lg:py-4 rounded-full font-medium text-base lg:text-lg flex items-center gap-2 shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20"
                >
                  Télécharger Elazya (.dmg)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {[
                "Installation 1 minute",
                "Essai gratuit",
                "Pas de carte requise"
              ].map((t, i) => (
                <span key={i} className="text-sm font-bold text-slate-400 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                    <Check className="w-3 h-3" />
                  </div>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
