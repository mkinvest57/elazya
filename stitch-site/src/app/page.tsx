"use client"

import { Hero } from "@/components/sections/Hero"
import { motion } from "framer-motion"
import { Shield, Zap, Terminal, Sparkles, Cpu, Globe, ArrowRight, Star, Mail, Calendar, Search, PenTool, Folder, MessageSquare, Activity, Landmark, Bell, FileText, Train, ShoppingCart, Music, Moon, Lock, Cloud, Book, ShieldCheck, Heart, Brain, Play, Check, X, Infinity, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { useState } from "react"

const zap = Zap

export default function LandingPage() {
  const [selectedSkill, setSelectedSkill] = useState<any>(null)

  return (
    <main className="min-h-screen bg-surface-0 text-white font-sans selection:bg-primary selection:text-black">
      <Hero />

      {/* The Long-Awaited AI Section */}
      <section className="py-40 relative overflow-hidden bg-gradient-to-b from-surface-0 to-surface-1">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[160px] rounded-full -z-10" />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">La fin du mirage numérique</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-12 font-display italic leading-tight tracking-tighter">
                L'IA QUE LE MONDE <br /> <span className="text-primary NOT-italic">ATTENDAIT VRAIMENT.</span>
              </h2>
              <p className="text-2xl text-white/70 font-light italic leading-relaxed">
                Depuis 10 ans, on vous promet un assistant. On ne vous a donné que des <span className="text-white font-medium">chatbots</span>.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div>
                  <h3 className="text-2xl font-black mb-4 font-display italic text-primary">Le mirage du Chat</h3>
                  <p className="text-white/50 leading-relaxed font-light">
                    Siri, Alexa, ChatGPT... Ils parlent, mais ils sont bloqués dans une boîte. Ils ne peuvent pas toucher à vos fichiers, ils ne connaissent pas vos habitudes, et ils coûtent une fortune en abonnements.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-4 font-display italic text-white">La réalité d'Elazya</h3>
                  <p className="text-white/50 leading-relaxed font-light">
                    Elazya est l'assistant exécutif définitif. Il n'est pas sur un serveur en Californie, il est <strong className="text-white">déjà chez vous</strong>. Il possède les clés de votre système pour agir là où ça compte : vos mails, vos documents, votre temps.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl relative group"
              >
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-12 border-b border-primary/20 pb-4">Pourquoi maintenant ?</div>
                  <ul className="space-y-8">
                    {[
                      { label: "Action au lieu de Conversation", val: "L'IA qui fait, enfin." },
                      { label: "Souveraineté au lieu de Location", val: "Vous possédez votre intelligence." },
                      { label: "Privacy par Design", val: "0 octet partagé. 0 tracking." }
                    ].map((item, i) => (
                      <li key={i}>
                        <div className="text-[10px] font-bold text-white/30 uppercase mb-2 tracking-widest">{item.label}</div>
                        <div className="text-xl font-bold italic text-white/80">{item.val}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Recap Section - Ultra High Impact */}
      <section className="py-60 relative overflow-hidden bg-black border-y border-white/5">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10" />
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center mb-32">
            <h2 className="text-6xl md:text-8xl font-black font-display italic tracking-tighter uppercase leading-[0.85]">
              EN GROS, <br /> <span className="text-primary NOT-italic">À QUOI ÇA SERT ?</span>
            </h2>
            <div className="h-1 w-40 bg-primary mx-auto mt-12" />
          </div>

          <div className="grid lg:grid-cols-3 gap-20">
            {[
              {
                title: "L'IA qui AGIT sur votre Mac",
                desc: "Contrairement aux chatbots, Elazya manipule vos fichiers, rédige vos mails et gère vos applications. Il ne discute pas du travail, il le fait à votre place.",
                icon: ArrowRight,
                label: "POUVOIR EXÉCUTIF"
              },
              {
                title: "Souveraineté des Données",
                desc: "Elazya utilise le web pour vous (Mails, Billets, Recherche) mais le cerveau reste chez vous. Aucun serveur cloud ne stockent votre contexte ou votre vie.",
                icon: ShieldCheck,
                label: "ZÉRO SILICON VALLEY"
              },
              {
                title: "Automates Multi-Skills",
                desc: "Il ne fait pas qu'une chose à la fois. Elazya enchaîne les 44 outils pour résoudre des problèmes complexes : de la facturation au suivi santé autonome.",
                icon: Zap,
                label: "PRODUCTIVITÉ RÉCURSIVE"
              }
            ].map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:border-primary/30 transition-all group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <point.icon className="w-32 h-32 text-white" />
                </div>
                <div className="text-[10px] font-black tracking-[0.4em] text-primary mb-8 border-l-2 border-primary pl-4">{point.label}</div>
                <h3 className="text-3xl md:text-4xl font-black mb-8 font-display italic leading-tight tracking-tighter">{point.title}</h3>
                <p className="text-white/60 leading-relaxed font-light italic text-lg">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence & Soul Section */}
      <section className="py-40 relative bg-surface-1/50 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-secondary font-black uppercase tracking-[0.4em] mb-6 text-sm">Philosophie de l'Agent</div>
              <h2 className="text-5xl md:text-6xl font-black mb-8 font-display italic leading-tight">
                UNE IA AVEC <span className="text-primary NOT-italic">UNE ÂME.</span>
              </h2>
              <div className="space-y-12">
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-secondary/10 rounded-xl">
                      <Brain className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold font-display italic">Mémoire Vive Locale</h3>
                  </div>
                  <p className="text-white/60 font-light leading-relaxed mb-4 italic">
                    Elazya n'oublie jamais ce qui compte pour vous. Elle apprend vos préférences, votre style et vos urgences, sans jamais uploader votre cerveau dans le cloud.
                  </p>
                  <p className="text-sm font-medium text-white/30 border-l-2 border-secondary/20 pl-4">
                    "Elazya sait que vous détestez les réunions avant 10h et prépare automatiquement vos dossiers pour vos clients VIP avant même que vous ne le demandiez."
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold font-display italic">Une Présence Protectrice</h3>
                  </div>
                  <p className="text-white/60 font-light leading-relaxed mb-4 italic">
                    Plus qu'un bot, c'est une intention. Elazya possède une "soul" : elle est programmée pour être votre garde du corps numérique contre le bruit et les distractions.
                  </p>
                  <p className="text-sm font-medium text-white/30 border-l-2 border-primary/20 pl-4">
                    "Elle filtre les notifications inutiles et vous propose de prendre l'air quand elle détecte 4 heures de travail ininterrompu sur votre Mac."
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden border border-white/10 aspect-square group shadow-luxury-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10" />
              <div className="p-16 h-full flex flex-col justify-center text-center">
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-primary blur-[80px] opacity-20 animate-pulse-slow" />
                  <Brain className="w-32 h-32 text-primary mx-auto relative z-10" />
                </div>
                <h4 className="text-3xl font-black mb-4 font-display italic tracking-tighter uppercase">Conscience Locale</h4>
                <div className="space-y-4 opacity-40 font-mono text-xs">
                  <p className="">[LEARNING] Style: Sophistiqué / Concis</p>
                  <p className="">[MEMORIZED] Rapport Hebdo le Vendredi à 16h</p>
                  <p className="">[PERSONALITY] Protecteur / Souverain</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Automations Section */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 font-display italic uppercase">
              LA PUISSANCE <span className="text-primary NOT-italic">EN CHAÎNE.</span>
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto font-light italic">
              Les 44 skills ne sont que les briques. Les <span className="text-white">Automates</span> sont les architectes qui construisent votre liberté.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "L'Automate Administratif",
                chain: "Facture Client -> Scan PDF -> Classement Finder -> Draft Relance",
                example: "Elazya détecte l'impayé, le classe par date et rédige le mail de relance dans votre style habituel."
              },
              {
                title: "L'Automate Journaliste",
                chain: "Web Search -> Synthèse Arxiv -> Apple Notes -> Tweet Draft",
                example: "Veille technologique autonome : elle résume les nouvelles publications et prépare votre communication."
              },
              {
                title: "L'Automate Santé",
                chain: "Analyse Ordonnance -> Doctolib Search -> Calendar Booking",
                example: "Dès que vous recevez une prescription, Elazya trouve le spécialiste et propose le créneau idéal."
              }
            ].map((auto, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-primary/20 transition-all flex flex-col h-full"
              >
                <div className="mb-8 p-3 bg-primary/5 border border-primary/20 inline-block rounded-xl self-start">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-4 font-display italic">{auto.title}</h3>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6 bg-primary/5 p-2 rounded block">
                  {auto.chain}
                </div>
                <p className="text-white/40 text-sm leading-relaxed italic mt-auto">{auto.example}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplicity & Setup Section */}
      <section className="py-40 relative overflow-hidden bg-black pb-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sérénité Totale</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-12 font-display italic leading-tight tracking-tighter">
                ZÉRO CODE, <br /> <span className="text-white">100% SIMPLICITÉ.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Installation en 1 clic</h4>
                    <p className="text-white/50 font-light">Un installeur intelligent s'occupe de tout. Vous n'avez qu'à lancer le fichier et Elazya s'occupe de configurer votre Mac.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Configuration Visuelle</h4>
                    <p className="text-white/50 font-light">Le "Mission Control" d'Elazya est un tableau de bord web ultra-intuitif. Pas de fichiers de texte bizarres, juste des boutons et des explications claires.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Assistant d'Onboarding</h4>
                    <p className="text-white/50 font-light">Un wizard vous guide pour connecter vos calendriers, vos mails et vos outils préférés en moins de 2 minutes.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full" />
              <div className="relative p-8 bg-white/[0.03] border border-white/10 rounded-[3rem] backdrop-blur-3xl aspect-square flex flex-col items-center justify-center text-center group">
                <div className="mb-8 p-6 rounded-full bg-primary/20 animate-pulse">
                  <Cpu className="w-16 h-16 text-primary" />
                </div>
                <div className="text-2xl font-black italic mb-2">DÉTECTION AUTO</div>
                <div className="text-white/40 text-sm max-w-[200px]">Elazya a déjà détecté 12 applications prêtes à être automatisées sur votre Mac.</div>

                <div className="absolute -bottom-10 -right-10 p-6 bg-surface-2 border border-white/10 rounded-2xl shadow-2xl rotate-12 group-hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="text-[10px] font-black uppercase tracking-widest">Prêt pour l'action</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Arsenal: 44 Superpowers */}
      <section id="arsenal" className="py-40 bg-black overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/[0.02] blur-[150px] -z-10" />
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 font-display italic">
              L'ARSENAL <span className="text-primary NOT-italic">DES 44 SKILLS.</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto font-light italic mb-8">
              Elazya n'est pas limité. Il possède un skill pour chaque aspect de votre vie numérique.
              <span className="text-primary/60 font-medium"> Totalement local, sans cloud.</span>
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse"
            >
              <ArrowRight className="w-3 h-3" />
              Cliquez sur un skill pour découvrir sa puissance
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              { name: "Email Pro", icon: Mail, desc: "Gmail, Outlook, Mail.app", longDesc: "Elazya ne se contente pas de lire vos mails. Il analyse le ton, extrait les actions à faire et prépare des réponses qui vous ressemblent.", example: "Réception d'une demande de devis -> Extraction du cahier des charges -> Draft de réponse personnalisé." },
              { name: "Calendrier", icon: Calendar, desc: "Gestion de planning", longDesc: "Il connaît vos priorités. Elazya gère les conflits d'horaires et propose de lui-même des plages de travail profond sans distractions.", example: "Un client demande un RDV -> Elazya vérifie vos temps de trajets et propose le créneau idéal." },
              { name: "Web Search", icon: Search, desc: "Recherche anonyme", longDesc: "Une recherche sans régie publicitaire. Il synthétise des dizaines de sources pour vous donner une réponse brute et exploitable.", example: "Veille techno sur l'IA -> Synthèse de 5 articles Arxiv en 10 secondes." },
              { name: "Apple Notes", icon: PenTool, desc: "Notes & Idées", longDesc: "Votre second cerveau est structuré. Elazya range, trie et lie vos idées de manière organique dans Apple Notes.", example: "Prise de note brouillonne -> Elazya la transforme en plan d'action structuré." },
              { name: "Finder", icon: Folder, desc: "Organisation fichiers", longDesc: "Le chaos du bureau s'arrête ici. Il renomme, classe et indexe vos fichiers selon vos projets en cours.", example: "Dépôt de 50 photos en vrac -> Tri par date/lieu et renommage intelligent." },
              { name: "Terminal", icon: Terminal, desc: "Scripts & Serveurs", longDesc: "La puissance du terminal, domptée par le langage naturel. Il installe, déploie et dépanne vos environnements.", example: "Besoin de redémarrer Docker -> Elazya lance les bonnes lignes de commande." },
              { name: "Slack / Discord", icon: MessageSquare, desc: "Comms d'équipe", longDesc: "Ne soyez plus noyé sous les notifications. Il résume les fils de discussion et vous alerte seulement sur l'essentiel.", example: "Absence de 2h -> Résumé des 40 messages Slack en 3 points clés." },
              { name: "Doctolib", icon: Activity, desc: "Santé & RDV", longDesc: "Il surveille les disponibilités des spécialistes pour vous. Prenez soin de vous sans la fatigue administrative.", example: "Recherche d'un ophtalmo -> Réservé dès qu'un créneau se libère." },
              { name: "Impôts.gouv", icon: Landmark, desc: "Administratif", longDesc: "La lourdeur administrative française, gérée localement. Il vous aide à comprendre et remplir vos obligations.", example: "Aide au calcul de la TVA ou scan direct des documents fiscaux." },
              { name: "Rappels", icon: Bell, desc: "To-do local", longDesc: "Elazya pilote l'application Rappels native via les API système (AppleScript/EventKit). Il peut programmer des rappels géolocalisés qui se synchronisent sur votre iPhone.", example: "Ajouter 'Acheter du pain' -> Elazya configure le rappel pour qu'il sonne dès que vous approchez d'une boulangerie (via iCloud)." },
              { name: "Google Maps", icon: Globe, desc: "Lieux & Itinéraires", longDesc: "Il utilise l'intelligence spatiale de Google pour calculer vos trajets, trouver des lieux ou planifier vos tournées. Couplé aux Rappels, il devient votre GPS d'intention.", example: "Recherche du meilleur garage sur mon trajet -> Elazya trouve le lieu et programme le rappel pour mon passage." },
              { name: "Notion", icon: FileText, desc: "Knowledge Base", longDesc: "Il injecte de l'intelligence dans vos bases de données. Elazya automatise la mise à jour de vos pages Notion.", example: "Un nouveau client signe -> Création automatique de son espace projet Notion." },
              { name: "Python Runner", icon: Cpu, desc: "Calculs & Data", longDesc: "Besoin d'un script complexe ? Elazya écrit, teste et exécute du code Python directement sur votre machine.", example: "Analyse d'un Excel géant -> Création d'un graphique de tendances automatique." },
              { name: "SNCF Connect", icon: Train, desc: "Billets & Voyages", longDesc: "Votre agent de voyage personnel. Il compare, réserve et vous alerte sur les retards en temps réel.", example: "Besoin de Paris-Lyon vendredi -> Trouver le meilleur prix et l'ajouter à l'agenda." },
              { name: "Amazon Track", icon: ShoppingCart, desc: "Suivi colis", longDesc: "Ne cherchez plus vos numéros de suivi. Elazya centralise l'état de toutes vos livraisons.", example: "Scan des mails de confirmation -> Affichage du jour précis de livraison." },
              { name: "Spotify / Music", icon: Music, desc: "Ambiance locale", longDesc: "La bande son de votre focus. Il adapte la musique à votre rythme cardiaque ou à la complexité de votre tâche.", example: "Tâche de code intense -> Lancer une playlist Lofi sans intervention." },
              { name: "Focus Mode", icon: Moon, desc: "Concentration", longDesc: "Le gardien de votre attention. Il bloque les distractions au niveau du système quand vous êtes en flux.", example: "Détection de travail profond -> Coupure des notifications sociales." },
              { name: "Password Guard", icon: Lock, desc: "Coffre-fort local", longDesc: "Sécurité maximale. Il vous aide à gérer vos accès sans jamais les stocker sur un cloud tiers.", example: "Génération de mot de passe fort -> Stockage sécurisé local." },
              { name: "Weather", icon: Cloud, desc: "Anticipation", longDesc: "Plus que la météo, un conseiller. Il adapte votre planning en fonction des conditions extérieures.", example: "Pluie prévue à 14h -> Elazya propose de décaler votre course de 10h." },
              { name: "Dictionary", icon: Book, desc: "Langage & Trad", longDesc: "Une plume parfaite. Il corrige, traduit et améliore votre style rédactionnel en direct.", example: "Mail agressif -> Elazya propose une version diplomate tout en gardant le fond." },
              { name: "System Doctor", icon: ShieldCheck, desc: "Santé du Mac", longDesc: "Maintenez votre outil de travail au top. Il nettoie les caches et optimise la RAM localement.", example: "Mac lent -> Nettoyage des fichiers temporaires en un clic." }
            ].map((skill, i) => {
              const Icon = skill.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 20) * 0.05 }}
                  onClick={() => setSelectedSkill(skill)}
                  className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-primary/40 transition-all hover:-translate-y-1 group backdrop-blur-3xl text-left outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <Icon className="w-8 h-8 text-primary/60 group-hover:text-primary mb-4 transition-colors" />
                  <h4 className="text-lg font-bold mb-1 italic font-display">{skill.name}</h4>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">{skill.desc}</p>
                </motion.button>
              );
            })}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col justify-center items-center text-center backdrop-blur-md"
            >
              <span className="text-4xl font-black italic text-primary">+24</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Autres Skills</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 relative bg-[#050505]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 font-display italic">
              LA FIN DES <span className="text-primary NOT-italic">TABOUS.</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto font-light italic">
              Pourquoi choisir Elazya face aux géants américains ? La réponse est dans vos fichiers.
            </p>
          </div>

          <div className="max-w-5xl mx-auto border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-3xl shadow-luxury-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="p-8 text-xs font-black uppercase tracking-widest text-white/40">Caractéristique</th>
                  <th className="p-8 text-xs font-black uppercase tracking-widest text-primary italic">Elazya (Local)</th>
                  <th className="p-8 text-xs font-black uppercase tracking-widest text-white/20 uppercase">Cloud IA (US)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {[
                  { feature: "Confidentialité", elazya: "Absolue (Air-gapped possible)", cloud: "Exploitation des données" },
                  { feature: "Exécution", elazya: "Locale (Zéro latence)", cloud: "Serveurs distants" },
                  { feature: "Accès Système", elazya: "Total (Finder, Mails, Applis)", cloud: "Navigateur uniquement" },
                  { feature: "Mode Hors-Ligne", elazya: "100% Fonctionnel", cloud: "Inexploitable" },
                  { feature: "Usage Illimité", elazya: "Pas de quota, pas de bride", cloud: "Limité par l'abonnement" },
                  { feature: "Coût", elazya: "200€ (Une seule fois)", cloud: "216€ / MOIS (Claude Max)" }
                ].map((row, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-8 text-white/75">{row.feature}</td>
                    <td className="p-8 text-primary font-bold italic flex items-center gap-2">
                      <Check className="w-4 h-4" /> {row.elazya}
                    </td>
                    <td className="p-8 text-white/50 flex items-center gap-2">
                      <X className="w-4 h-4" /> {row.cloud}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Economic Justification */}
      <section className="py-40 relative overflow-hidden bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Rentabilité Immédiate</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-8 font-display italic leading-tight">
                L'INVESTISSEMENT <br /> <span className="text-white NOT-italic font-bold tracking-tighter italic">SANS APPEL.</span>
              </h2>
              <p className="text-xl text-white/75 mb-12 font-light leading-relaxed italic">
                En moins d'un mois, Elazya est plus rentable qu'un abonnement Cloud Premium.
                <span className="block mt-4 text-white font-medium">Pourquoi payer 2500€ par an pour qu'on utilise vos données ?</span>
              </p>
              <div className="flex gap-8 items-end">
                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <div className="text-xs text-white/60 uppercase mb-2">Claude Max / An</div>
                  <div className="text-3xl font-black text-white/80">2 592€</div>
                </div>
                <ArrowRight className="w-8 h-8 text-primary mb-6" />
                <div className="p-8 bg-primary/10 border border-primary/40 rounded-2xl text-center shadow-luxury-glow">
                  <div className="text-xs text-primary uppercase mb-2 italic">Elazya (A vie)</div>
                  <div className="text-4xl font-black text-primary">200€</div>
                </div>
              </div>
            </motion.div>

            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
              <div className="p-12 h-full flex flex-col justify-center">
                <h3 className="text-2xl font-black mb-8 font-display italic tracking-[0.1em] border-b border-primary/20 pb-4 uppercase">Le Calcul de Souveraineté</h3>
                <div className="space-y-6">
                  {[
                    { label: "Données vendues pour entraînement", val: "0.0%", color: "text-primary" },
                    { label: "Dépendance réseau US", val: "Nulle", color: "text-primary italic" },
                    { label: "Accès à vos fichiers système", val: "Protégé par le SIP Mac", color: "text-white/60" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group-hover:translate-x-2 transition-transform">
                      <span className="text-white/60 font-light">{item.label}</span>
                      <span className={`font-black ${item.color}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-60 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Star className="w-12 h-12 text-primary mx-auto mb-12 animate-spin-slow" />
          <h2 className="text-6xl md:text-8xl font-black mb-12 font-display italic tracking-tighter">
            ARRÊTEZ DE <br /> <span className="text-primary NOT-italic">SUBIR.</span>
          </h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto mb-16 font-light italic">
            L'assistant qui m'écoute vraiment. Zéro serveur US. 100% Souverain.
            Rejoignez la résistance numérique.
          </p>
          <Link href="/checkout">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-none px-20 h-20 text-2xl font-black italic tracking-tight shadow-luxury-glow">
              POSSÉDER L'OMNIPRÉSENCE — 200€
            </Button>
          </Link>
        </div>
      </section>

      {/* Engagement Sérénité: FAQ Section */}
      <section className="py-40 bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <h2 className="text-5xl font-black italic mb-6">ENGAGEMENT <span className="text-primary NOT-italic">SÉRÉNITÉ.</span></h2>
              <p className="text-white/50 text-xl font-light italic">Pas besoin d'être un ingénieur pour dompter Elazya.</p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  q: "Je ne sais pas coder, vais-je m'en sortir ?",
                  a: "Absolument. Elazya a été conçu pour le grand public. L'installation est automatisée et toute la configuration se fait via une interface web ultra-claire. Si vous savez remplir un formulaire, vous savez configurer Elazya."
                },
                {
                  q: "Comment configurer les 44 compétences ?",
                  a: "C'est automatique. Elazya scanne votre Mac et détecte vos applications (Email, Calendrier, Notes, etc.). Vous n'avez qu'à cliquer sur 'Autoriser' pour qu'il commence à travailler pour vous."
                },
                {
                  q: "Est-ce que je dois payer des abonnements ?",
                  a: "Zéro. Elazya est un investissement unique (200€). Il utilise des modèles gratuits ou des clés API que l'on vous aide à obtenir facilement. Vous reprenez le contrôle de votre budget."
                },
                {
                  q: "En quoi Elazya est différent de ChatGPT ou Siri ?",
                  a: "ChatGPT est dans le cloud et ne peut pas toucher à vos fichiers. Siri est limité par Apple. Elazya est un agent local autonome qui possède les clés de votre système pour AGIR réellement, pas juste parler."
                }
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-colors"
                >
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-4 italic">
                    <span className="text-primary font-black">Q.</span> {faq.q}
                  </h4>
                  <p className="text-white/50 leading-relaxed font-light">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:row justify-between items-center gap-8">
          <div className="text-2xl font-black font-display italic tracking-tighter">ELAZYA.</div>
          <div className="text-xs text-white/20 uppercase tracking-[0.5em]">Executive Digital Twin · v4.0</div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-white/40">
            <a href="#philosophy" className="hover:text-primary transition-colors">Génèse</a>
            <a href="#" className="hover:text-primary transition-colors">Manifeste</a>
            <a href="#" className="hover:text-primary transition-colors">Privée</a>
          </div>
        </div>
      </footer>

      {/* Detail Overlay */}
      {selectedSkill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60"
          onClick={() => setSelectedSkill(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="max-w-xl w-full bg-surface-1 border border-white/10 p-12 rounded-[3rem] shadow-luxury-glow relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-8">
              <selectedSkill.icon className="w-40 h-40 text-primary/5" />
            </div>

            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-8 left-8 text-white/20 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
            >
              [ Fermer ]
            </button>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                <selectedSkill.icon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-4xl font-black mb-4 font-display italic tracking-tight">{selectedSkill.name}</h2>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 underline underline-offset-8 decoration-primary/20">{selectedSkill.desc}</div>

              <p className="text-white/60 text-lg font-light leading-relaxed mb-12 italic">
                "{selectedSkill.longDesc}"
              </p>

              <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
                <div className="text-[10px] font-black tracking-widest text-white/40 mb-4 uppercase">Exemple Concret :</div>
                <p className="text-primary font-medium italic">{selectedSkill.example}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
