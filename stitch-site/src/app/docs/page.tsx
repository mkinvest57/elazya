"use client"

import { Card } from "@/components/ui/Card"
import {
    Book, Code, Terminal, Mail, Calendar, Search, FileText, ChevronRight,
    Download, Shield, Zap, Sparkles, Globe, Cpu, MessageSquare, Bell,
    Cloud, Lock, Moon, Music, ShoppingCart, Train, Activity, Landmark,
    PenTool, Folder, Heart, Brain, ShieldCheck, Settings, Key,
    Smartphone, ArrowRight, AlertTriangle, RefreshCw, HardDrive,
    Eye, Layers, Workflow, Bot, Check
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type DocSection = {
    id: string
    title: string
    group: string
    content: React.ReactNode
}

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("bienvenue")

    const sections: DocSection[] = [
        // ═══════════════════════════════════════════
        // INTRODUCTION
        // ═══════════════════════════════════════════
        {
            id: "bienvenue",
            title: "Bienvenue",
            group: "Introduction",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        <strong className="text-slate-800 font-bold">Elazya</strong> est votre assistant IA personnel, 100% local. Il vit sur votre Mac, respecte votre vie privée et ne nécessite aucun abonnement mensuel.
                    </p>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        Contrairement aux IA cloud comme ChatGPT, Siri ou Alexa, Elazya possède un accès direct à votre système : mails, fichiers, calendrier, terminal. Il ne se contente pas de discuter — il <strong className="text-slate-800 font-bold">agit</strong> pour vous.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        {[
                            { icon: Shield, label: "100% Local", desc: "Aucune donnée envoyée", bg: "bg-emerald-50", color: "text-emerald-600", border: "border-emerald-100" },
                            { icon: Sparkles, label: "44 Skills", desc: "Compétences IA intégrées", bg: "bg-primary/5", color: "text-primary", border: "border-primary/10" },
                            { icon: Zap, label: "Autonome", desc: "Agit sans supervision", bg: "bg-amber-50", color: "text-amber-500", border: "border-amber-100" },
                        ].map((f, i) => (
                            <div key={i} className={`p-5 ${f.bg} border ${f.border} rounded-2xl text-center shadow-sm`}>
                                <f.icon className={`w-6 h-6 ${f.color} mx-auto mb-3`} />
                                <div className="text-sm font-bold text-slate-800 mb-1">{f.label}</div>
                                <div className="text-xs font-semibold text-slate-500">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                    <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl mt-6 shadow-sm">
                        <p className="text-sm text-slate-700 font-medium">
                            <strong className="text-primary font-bold">💡 Bon à savoir :</strong> Elazya utilise des modèles LLM via des clés API (OpenAI, Anthropic, etc.) que vous fournissez. Vos données restent locales, seuls les messages sont envoyés au fournisseur LLM de votre choix.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "installation",
            title: "Installation",
            group: "Introduction",
            content: (
                <div className="space-y-8">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        L'installation d'Elazya prend moins de 2 minutes. Suivez ces étapes :
                    </p>

                    <div className="space-y-6 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm p-8 rounded-3xl">
                        {[
                            { step: "1", title: "Télécharger", desc: "Récupérez le fichier .dmg depuis votre page de confirmation d'achat ou depuis le lien reçu par email." },
                            { step: "2", title: "Installer", desc: "Ouvrez le .dmg et glissez l'icône Elazya dans le dossier Applications." },
                            { step: "3", title: "Autoriser macOS", desc: "macOS peut bloquer l'ouverture car l'app n'est pas signée Apple. Exécutez la commande ci-dessous dans le Terminal.", terminal: true },
                            { step: "4", title: "Lancer", desc: "Double-cliquez sur Elazya dans le dossier Applications. L'assistant de configuration se lance automatiquement." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 shadow-sm flex items-center justify-center text-primary font-bold text-sm shrink-0 mt-0.5">
                                    {item.step}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                                    <p className="text-sm font-medium text-slate-500">{item.desc}</p>
                                    {item.terminal && (
                                        <div className="mt-4 bg-[#0f172a] shadow-inner rounded-xl p-4 font-mono text-sm flex items-center gap-3">
                                            <span className="text-slate-500 select-none">$</span>
                                            <span className="text-emerald-400">xattr -cr /Applications/Elazya.app</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-amber-50 border border-amber-200 shadow-sm rounded-2xl">
                        <p className="text-sm text-slate-700 font-medium">
                            <strong className="text-amber-600 font-bold">⚠️ Important :</strong> Elazya nécessite macOS 12+ et un Mac Apple Silicon (M1/M2/M3/M4). Les Mac Intel ne sont pas supportés.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "premiers-pas",
            title: "Premiers pas",
            group: "Introduction",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Au premier lancement, un assistant de configuration vous guide à travers toutes les étapes :
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: Lock, title: "Sécurité", desc: "Créez votre mot de passe de sécurité pour protéger l'accès à Elazya." },
                            { icon: Settings, title: "Mode d'utilisation", desc: "Choisissez entre le mode Standard (simple) ou Avancé (plus de contrôle)." },
                            { icon: Bot, title: "Fournisseur LLM", desc: "Sélectionnez le modèle IA à utiliser (OpenAI, Anthropic, Google, etc.)." },
                            { icon: Globe, title: "Gateway", desc: "Configuration automatique du moteur local OpenClaw." },
                            { icon: Smartphone, title: "Canaux", desc: "Connectez Telegram, WhatsApp ou Slack pour parler à Elazya." },
                            { icon: Key, title: "Clés API", desc: "Entrez vos clés API pour le fournisseur LLM choisi." },
                            { icon: Sparkles, title: "Skills", desc: "Sélectionnez les compétences que vous souhaitez activer." },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                    <item.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                        Une fois la configuration terminée, Elazya installe automatiquement les composants nécessaires et se lance. Vous pouvez modifier tous ces réglages plus tard dans l'onglet <strong className="text-primary font-bold">Config</strong>.
                    </p>
                </div>
            )
        },

        // ═══════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════
        {
            id: "fournisseurs-llm",
            title: "Fournisseurs LLM",
            group: "Configuration",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Elazya utilise des modèles d'IA via des APIs externes. Vous choisissez le fournisseur et gardez le contrôle total sur vos clés.
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Fournisseur</th>
                                    <th className="text-left p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Modèles recommandés</th>
                                    <th className="text-left p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Coût estimé</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { provider: "Anthropic", models: "Claude 3.5 Sonnet, Claude 3 Opus", cost: "~5-15€/mois" },
                                    { provider: "OpenAI", models: "GPT-4o, GPT-4o-mini", cost: "~5-20€/mois" },
                                    { provider: "Google", models: "Gemini 2.0 Flash, Gemini Pro", cost: "~2-10€/mois" },
                                    { provider: "Mistral", models: "Mistral Large, Pixtral", cost: "~3-8€/mois" },
                                    { provider: "Groq", models: "LLaMA 3 70B (gratuit !)", cost: "Gratuit", special: true },
                                    { provider: "Ollama (local)", models: "LLaMA, Mistral, Phi", cost: "Gratuit" },
                                ].map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800">
                                            {p.provider}
                                            {p.special && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full uppercase tracking-widest font-bold">Conseillé</span>}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{p.models}</td>
                                        <td className="p-4 text-primary font-bold">{p.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm p-8 rounded-3xl mt-8">
                        <h4 className="font-bold text-slate-800 mb-5 text-lg tracking-tight">Comment obtenir une clé API ?</h4>
                        <ol className="space-y-4 text-sm font-medium text-slate-600">
                            <li className="flex gap-3 items-center"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 shadow-sm">1</span> Créez un compte sur le site du fournisseur (ex: platform.openai.com)</li>
                            <li className="flex gap-3 items-center"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 shadow-sm">2</span> Accédez à la section "API Keys" de votre dashboard</li>
                            <li className="flex gap-3 items-center"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 shadow-sm">3</span> Générez une nouvelle clé et copiez-la</li>
                            <li className="flex gap-3 items-center"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 shadow-sm">4</span> Collez-la dans Elazya : <span className="font-mono font-bold text-primary bg-primary/5 border border-primary/20 px-2.5 py-1 rounded shadow-inner">Config → Clé API</span></li>
                        </ol>
                    </div>

                    <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm">
                        <p className="text-sm text-slate-700 font-medium">
                            <strong className="text-primary font-bold">💡 Recommandation :</strong> Pour un usage gratuit, utilisez <strong>Groq</strong> avec LLaMA 3. Pour la meilleure qualité, utilisez <strong>Anthropic Claude 3.5 Sonnet</strong>.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "canaux",
            title: "Canaux de communication",
            group: "Configuration",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Elazya communique avec vous via des messageries. Connectez un ou plusieurs canaux :
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                name: "Telegram",
                                status: "Recommandé",
                                defaultColor: "border-primary/30 ring-1 ring-primary/10 shadow-md",
                                steps: [
                                    "Ouvrez Telegram et cherchez @BotFather",
                                    "Envoyez /newbot et suivez les instructions",
                                    "Copiez le token du bot",
                                    "Collez-le dans Elazya : Config → Canaux → Telegram"
                                ]
                            },
                            {
                                name: "WhatsApp",
                                status: "Disponible",
                                defaultColor: "border-slate-200 shadow-sm",
                                steps: [
                                    "Activez le canal WhatsApp dans Config → Canaux",
                                    "Scannez le QR code affiché avec votre téléphone",
                                    "La connexion se fait automatiquement"
                                ]
                            },
                            {
                                name: "Interface Web",
                                status: "Intégré",
                                defaultColor: "border-slate-200 shadow-sm",
                                steps: [
                                    "Toujours disponible dans l'application Elazya",
                                    "Pas de configuration nécessaire",
                                    "Idéal pour tester les skills"
                                ]
                            }
                        ].map((channel, i) => (
                            <div key={i} className={`p-6 bg-white rounded-3xl border ${channel.defaultColor}`}>
                                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                                    <h4 className="font-bold text-slate-800 text-lg">{channel.name}</h4>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${channel.status === 'Recommandé' ? 'bg-primary border border-primary text-white shadow-sm' : 'bg-slate-100 border border-slate-200 text-slate-500'
                                        }`}>{channel.status}</span>
                                </div>
                                <ol className="space-y-3">
                                    {channel.steps.map((step, j) => (
                                        <li key={j} className="text-sm font-medium text-slate-600 flex gap-3">
                                            <span className="text-slate-400 font-mono text-xs mt-0.5">{j + 1}.</span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "personnalisation",
            title: "Personnalisation",
            group: "Configuration",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Elazya s'adapte à votre style. Modifiez son comportement dans <span className="font-mono font-bold text-primary bg-primary/5 border border-primary/20 shadow-inner px-2 py-0.5 rounded">Config → Personnalité</span>.
                    </p>

                    <div className="space-y-4">
                        {[
                            { title: "Langue", desc: "Français par défaut. Supporte 12 langues dont l'anglais, l'espagnol, l'allemand et l'arabe." },
                            { title: "Ton", desc: "Formel, décontracté ou professionnel. Elazya adapte son style de communication." },
                            { title: "Nom de l'assistant", desc: "Renommez Elazya comme vous le souhaitez : Jarvis, Friday, Max..." },
                            { title: "Instructions personnalisées", desc: "Ajoutez des instructions persistantes. Ex: 'Réponds toujours avec des emojis' ou 'Ne propose jamais de réunions avant 10h'." },
                            { title: "Mémoire", desc: "Elazya retient vos préférences au fil du temps. Vous pouvez consulter et supprimer ses souvenirs." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div className="w-1.5 bg-primary/80 rounded-full shrink-0 shadow-sm" />
                                <div>
                                    <h4 className="font-bold text-base text-slate-800">{item.title}</h4>
                                    <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },

        // ═══════════════════════════════════════════
        // LES 44 SKILLS
        // ═══════════════════════════════════════════
        {
            id: "skills-overview",
            title: "Vue d'ensemble",
            group: "Les 44 Skills",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Les skills sont les compétences d'Elazya. Chaque skill lui donne accès à un service ou une fonctionnalité. Ils peuvent être combinés en <strong className="text-slate-800 font-bold">chaînes automatiques</strong>.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        {[
                            { label: "Productivité", count: 8, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                            { label: "Recherche", count: 4, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
                            { label: "Quotiden", count: 10, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                            { label: "Système", count: 4, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
                        ].map((cat, i) => (
                            <div key={i} className={`p-4 ${cat.bg} border ${cat.border} shadow-sm rounded-2xl text-center transform transition-transform hover:-translate-y-1`}>
                                <div className={`text-3xl font-black ${cat.color} mb-1`}>{cat.count}</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{cat.label}</div>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm font-medium text-slate-500 bg-slate-50 border border-slate-200 p-4 rounded-xl mt-6 leading-relaxed">
                        Chaque skill fonctionne localement. Certains nécessitent un accès réseau (ex: Web Search, Email) mais vos données ne sont jamais stockées sur un serveur tiers. +18 skills supplémentaires sont installables via le marketplace.
                    </p>
                </div>
            )
        },
        {
            id: "skills-productivite",
            title: "Skills Productivité",
            group: "Les 44 Skills",
            content: (
                <div className="space-y-5">
                    <p className="text-slate-500 font-medium mb-6">Les outils essentiels pour automatiser votre travail quotidien.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { icon: Mail, name: "Email Pro", desc: "Lecture, résumé et rédaction automatique de mails. Compatible Gmail, Outlook et Mail.app." },
                            { icon: Calendar, name: "Calendrier", desc: "Gestion intelligente de planning. Détection de conflits, proposition de créneaux." },
                            { icon: PenTool, name: "Apple Notes", desc: "Création, modification et organisation de notes. Plans structurés." },
                            { icon: Folder, name: "Finder", desc: "Organisation de fichiers. Renommage intelligent, classement par projet." },
                            { icon: Terminal, name: "Terminal", desc: "Exécution de commandes shell. Installation de packages, scripts." },
                            { icon: FileText, name: "Notion", desc: "Synchronisation avec vos bases Notion. Création de pages, linking." },
                            { icon: Cpu, name: "Python Runner", desc: "Écriture et exécution de scripts Python. Analyse de données, graphiques." },
                            { icon: MessageSquare, name: "Slack / Discord", desc: "Résumé de conversations, alertes sur l'essentiel, réponses automatiques." },
                        ].map((skill, i) => (
                            <div key={i} className="flex flex-col gap-3 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl hover:-translate-y-1 transition-transform">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                        <skill.icon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg tracking-tight">{skill.name}</h4>
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{skill.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "skills-recherche",
            title: "Skills Recherche",
            group: "Les 44 Skills",
            content: (
                <div className="space-y-5">
                    <p className="text-slate-500 font-medium mb-6">Accédez à l'information sans compromettre votre vie privée.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { icon: Search, name: "Web Search", desc: "Recherche web anonyme et sécurisée. Synthèse de sources multiples." },
                            { icon: Book, name: "Dictionary", desc: "Traduction, correction et amélioration de style rédactionnel. 12+ langues." },
                            { icon: Globe, name: "Google Maps", desc: "Recherche de lieux, calcul d'itinéraires optimisés." },
                            { icon: FileText, name: "Arxiv Scanner", desc: "Veille scientifique automatisée. Résumé de publications récentes." },
                        ].map((skill, i) => (
                            <div key={i} className="flex flex-col gap-3 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl hover:-translate-y-1 transition-transform">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                                        <skill.icon className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg tracking-tight">{skill.name}</h4>
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{skill.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "skills-quotidien",
            title: "Skills Vie Quotidienne",
            group: "Les 44 Skills",
            content: (
                <div className="space-y-5">
                    <p className="text-slate-500 font-medium mb-6">Des compétences pour simplifier chaque aspect de votre vie numérique.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { icon: Cloud, name: "Météo", desc: "Prévisions et conditions météo en temps réel. Adaptation de planning." },
                            { icon: Bell, name: "Rappels", desc: "Programmation de rappels géolocalisés synchronisés avec iPhone." },
                            { icon: Train, name: "SNCF Connect", desc: "Recherche de billets, comparaison de prix, alertes retards." },
                            { icon: ShoppingCart, name: "Amazon Track", desc: "Centralisation et suivi automatique de vos colis en livraison." },
                            { icon: Activity, name: "Doctolib", desc: "Recherche de spécialistes, surveillance des disponibilités, prise de RDV." },
                            { icon: Landmark, name: "Impôts.gouv", desc: "Calcul TVA, scan de documents fiscaux, aide déclarations." },
                            { icon: Music, name: "Spotify / Music", desc: "Contrôle musical intelligent adapté à votre concentration." },
                            { icon: Heart, name: "Santé", desc: "Analyse d'ordonnances, suivi médical, rappels de médicaments." },
                        ].map((skill, i) => (
                            <div key={i} className="flex flex-col gap-3 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl hover:-translate-y-1 transition-transform">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                        <skill.icon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg tracking-tight">{skill.name}</h4>
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{skill.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "skills-systeme",
            title: "Skills Système",
            group: "Les 44 Skills",
            content: (
                <div className="space-y-5">
                    <p className="text-slate-500 font-medium mb-6">Optimisez et protégez votre Mac en profondeur.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { icon: Moon, name: "Focus Mode", desc: "Blocage intelligent des distractions et gestion des notifications." },
                            { icon: ShieldCheck, name: "System Doctor", desc: "Nettoyage caches, RAM, surveillance de l'espace disque." },
                            { icon: Lock, name: "Password Guard", desc: "Génération et gestion de mots de passe forts, coffre-fort chiffré." },
                            { icon: Eye, name: "Privacy Monitor", desc: "Alerte en temps réel sur les accès à vos données et comportements suspects." },
                        ].map((skill, i) => (
                            <div key={i} className="flex flex-col gap-3 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl hover:-translate-y-1 transition-transform">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                                        <skill.icon className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg tracking-tight">{skill.name}</h4>
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{skill.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },

        // ═══════════════════════════════════════════
        // AVANCÉ
        // ═══════════════════════════════════════════
        {
            id: "automates",
            title: "Automates",
            group: "Avancé",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Les <strong className="text-slate-800 font-bold">Automates</strong> sont des chaînes de skills qui s'exécutent automatiquement pour résoudre des problèmes complexes.
                    </p>

                    <div className="space-y-6 mt-6">
                        {[
                            {
                                title: "Automate Administratif",
                                icon: Mail,
                                chain: ["Scan PDF", "Classement", "Draft Relance"],
                                example: "Elazya détecte un impayé, classe la facture et rédige le mail de relance dans votre style."
                            },
                            {
                                title: "Automate Journaliste",
                                icon: PenTool,
                                chain: ["Web Search", "Synthèse", "Apple Notes", "Tweet Draft"],
                                example: "Veille techno autonome : résumé des publications et préparation de votre communication."
                            },
                            {
                                title: "Automate Santé",
                                icon: Activity,
                                chain: ["Ordonnance", "Doctolib", "Calendar"],
                                example: "Réception d'une prescription → recherche du spécialiste → créneau réservé automatiquement."
                            }
                        ].map((auto, i) => (
                            <div key={i} className="p-8 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm rounded-3xl">
                                <h4 className="font-bold text-slate-800 mb-4 text-xl tracking-tight flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                                        <auto.icon className="w-4 h-4 text-slate-600" />
                                    </div>
                                    {auto.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
                                    {auto.chain.map((step, j) => (
                                        <span key={j} className="inline-flex items-center gap-2">
                                            <span className="text-[11px] font-bold tracking-widest uppercase bg-primary text-white px-3 py-1.5 rounded-full shadow-sm">{step}</span>
                                            {j < auto.chain.length - 1 && <ArrowRight className="w-4 h-4 text-slate-400" />}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{auto.example}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm font-medium text-slate-500 bg-emerald-50 border border-emerald-100 text-emerald-700 p-5 rounded-2xl mt-8 shadow-sm">
                        Vous pouvez créer vos propres automates en décrivant simplement le workflow en langage naturel à Elazya en lui demandant de l'automatiser.
                    </p>
                </div>
            )
        },
        {
            id: "depannage",
            title: "Dépannage",
            group: "Avancé",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Solutions aux problèmes courants.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Elazya ne se lance pas",
                                a: "Exécutez xattr -cr /Applications/Elazya.app dans le Terminal. Si le problème persiste, vérifiez que vous êtes sur macOS 12+ avec un Mac Apple Silicon."
                            },
                            {
                                q: "L'IA ne répond pas",
                                a: "Vérifiez votre clé API dans Config → Clé API. Assurez-vous qu'elle est valide et que vous avez du crédit sur le compte du fournisseur LLM."
                            },
                            {
                                q: "Telegram ne se connecte pas",
                                a: "Vérifiez que le token BotFather est correct. Assurez-vous de ne pas avoir d'autre instance connectée au même bot."
                            },
                            {
                                q: "L'application est lente",
                                a: "Utilisez le skill System Doctor pour nettoyer les caches. Si le problème persiste, essayez de redémarrer l'application."
                            },
                            {
                                q: "Comment réinitialiser complètement ?",
                                a: "Allez dans Config → Réinitialiser l'application. Cela supprime toutes les données (DB, état, workspace). Elazya relancera l'assistant de configuration au prochain démarrage."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                                <h4 className="font-bold text-base text-slate-800 mb-3 flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    {faq.q}
                                </h4>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed pl-8">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-200 shadow-inner rounded-3xl mt-8">
                        <h4 className="font-bold text-base text-slate-800 mb-3">Logs de diagnostic</h4>
                        <p className="text-sm font-medium text-slate-500 mb-4">Pour accéder aux logs de l'application :</p>
                        <div className="bg-[#0f172a] shadow-inner rounded-xl p-4 font-mono text-xs text-emerald-400 select-all overflow-x-auto">
                            ~/Library/Application Support/com.elazya.app/logs/
                        </div>
                    </div>
                </div>
            )
        },

        // ═══════════════════════════════════════════
        // SÉCURITÉ
        // ═══════════════════════════════════════════
        {
            id: "architecture-locale",
            title: "Architecture locale",
            group: "Sécurité",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Elazya est conçu autour du principe <strong className="text-slate-800 font-bold">"Privacy by Design"</strong>. Voici comment vos données sont protégées :
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: HardDrive, title: "Base de données locale", desc: "SQLite chiffré stocké dans ~/Library/Application Support. Aucune synchronisation cloud." },
                            { icon: Lock, title: "Chiffrement au repos", desc: "Toutes les données sensibles (clés API, tokens) sont chiffrées localement avec AES-256." },
                            { icon: Shield, title: "Isolation réseau", desc: "Elazya ne communique qu'avec les APIs que vous avez explicitement autorisées (LLM, Email, etc.)." },
                            { icon: Eye, title: "Transparence totale", desc: "Le code source du moteur OpenClaw est auditable. Aucune télémétrie, aucun tracking." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                    <item.icon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 className="font-bold text-slate-800 mt-8 mb-4 text-xl tracking-tight">Flux de données</h4>
                    <div className="p-6 bg-[#0f172a] shadow-lg rounded-3xl font-mono text-xs text-slate-300 space-y-4 font-bold border-4 border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-400">Vous</span>
                            <ArrowRight className="w-4 h-4 text-slate-600" />
                            <span className="text-white">Elazya (local)</span>
                            <ArrowRight className="w-4 h-4 text-slate-600" />
                            <span className="text-violet-400">API LLM</span>
                            <span className="text-slate-500 font-normal ml-2">(messages uniquement)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-400">Fichiers, DB, Config</span>
                            <ArrowRight className="w-4 h-4 text-slate-600" />
                            <span className="text-white">Stockage local uniquement</span>
                            <span className="text-rose-400 font-bold uppercase tracking-widest ml-4 bg-rose-500/10 px-2 py-1 rounded">✕ Jamais envoyé</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "aucun-cloud",
            title: "Aucun cloud",
            group: "Sécurité",
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Elazya ne possède <strong className="text-slate-800 font-bold">aucun serveur</strong>. Aucune infrastructure cloud ne collecte, stocke ou traite vos données.
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Donnée</th>
                                    <th className="text-left p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Stockage</th>
                                    <th className="text-left p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Envoyé ?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { data: "Conversations", storage: "SQLite local", sent: "Non" },
                                    { data: "Clés API", storage: "Chiffré local", sent: "Non" },
                                    { data: "Fichiers scannés", storage: "Disque local", sent: "Non" },
                                    { data: "Messages IA", storage: "Local + API LLM", sent: "Oui (au LLM)" },
                                    { data: "Mémoire / Préférences", storage: "SQLite local", sent: "Non" },
                                    { data: "Télémétrie", storage: "—", sent: "Aucune" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 font-medium transition-colors">
                                        <td className="p-4 text-slate-800 font-bold">{row.data}</td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{row.storage}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${row.sent === 'Non' || row.sent === 'Aucune' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {row.sent}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm text-center">
                        <p className="text-sm text-emerald-700 font-medium">
                            <strong className="font-bold flex items-center justify-center gap-2 mb-2"><Lock className="w-4 h-4"/>Garantie ultime:</strong> Elazya peut fonctionner en mode purement hors-ligne (avec un LLM local type Ollama). Dans ce cas, <strong>zéro octet</strong> ne quitte votre machine.
                        </p>
                    </div>
                </div>
            )
        }
    ]

    const groups = [...new Set(sections.map(s => s.group))]

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/20 text-slate-800">
            {/* Ambient background */}
            <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[80vw] h-[40vh] bg-blue-300/[0.2] mix-blend-multiply blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="container mx-auto px-4 py-28 md:py-36 flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 space-y-6 lg:sticky lg:top-28 h-fit shrink-0">
                    {groups.map(group => (
                        <div key={group}>
                            <h4 className="font-bold mb-3 uppercase text-[10px] tracking-[0.2em] text-slate-400 pl-3">{group}</h4>
                            <ul className="space-y-1">
                                {sections.filter(s => s.group === group).map(section => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`text-sm font-bold flex items-center gap-2 py-2 px-3 rounded-xl transition-all ${activeSection === section.id
                                                    ? 'text-primary bg-primary/10 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                                }`}
                                        >
                                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeSection === section.id ? 'rotate-90 text-primary' : 'text-slate-300'}`} />
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 max-w-4xl space-y-20">
                    {/* Header */}
                    <section>
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 shadow-sm rounded-full px-4 py-1.5 mb-6">
                            <Book className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Documentation v2.0</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-800">
                            Documentation
                        </h1>
                        <p className="text-lg font-medium text-slate-500 mb-10 max-w-xl">
                            Tout ce dont vous avez besoin pour maîtriser votre assistant IA personnel.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-8 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-3xl hover:shadow-md transition-shadow shadow-sm group">
                                <Terminal className="w-8 h-8 text-primary mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
                                <h3 className="font-bold mb-2 text-slate-800 text-lg tracking-tight">Guide de démarrage</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">Installation, configuration et premiers pas en moins de 5 minutes.</p>
                            </div>
                            <div className="p-8 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-3xl hover:shadow-md transition-shadow shadow-sm group">
                                <Code className="w-8 h-8 text-violet-500 mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform" />
                                <h3 className="font-bold mb-2 text-slate-800 text-lg tracking-tight">Référence des Skills</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">Les 44 compétences détaillées, classées par catégorie.</p>
                            </div>
                        </div>
                    </section>

                    {/* Sections */}
                    {sections.map((section, i) => {
                        const isNewGroup = i === 0 || sections[i - 1].group !== section.group
                        return (
                            <div key={section.id}>
                                {isNewGroup && (
                                    <div className="pt-10 pb-6 border-t border-slate-200 mt-10 first:mt-0 first:pt-0 first:border-0">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{section.group}</h3>
                                    </div>
                                )}
                                <section id={section.id} className="scroll-mt-32">
                                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 text-slate-800 tracking-tight">
                                        <span className="w-8 h-8 text-primary font-black text-sm flex items-center justify-center shadow-sm border border-primary/20 rounded-lg bg-primary/10">#</span>
                                        {section.title}
                                    </h2>
                                    <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-slate-100 p-2 md:p-6 shadow-sm">
                                        {section.content}
                                    </div>
                                </section>
                            </div>
                        )
                    })}

                    {/* Footer CTA */}
                    <div className="pt-16 border-t border-slate-200">
                        <div className="p-10 text-center bg-gradient-to-br border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm rounded-3xl">
                            <h3 className="text-2xl font-bold mb-3 text-slate-800">Besoin d&apos;aide supplémentaire ?</h3>
                            <p className="text-slate-500 font-medium mb-8 text-sm">
                                Notre communauté est disponible 24/7 sur Discord.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="https://discord.gg/elazya" target="_blank" rel="noreferrer">
                                    <button className="w-full px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] shadow-[0_4px_14px_0_rgba(88,101,242,0.39)] text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all">
                                        Rejoindre le Discord
                                    </button>
                                </a>
                                <a href="mailto:support@elazya.com">
                                    <button className="w-full px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                                        support@elazya.com
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
