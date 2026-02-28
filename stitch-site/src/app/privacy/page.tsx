"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Server, Eye, Trash2, Globe } from "lucide-react"

const highlights = [
    { icon: Lock, label: "Chiffrement local", desc: "Vos données sont chiffrées sur votre machine" },
    { icon: Server, label: "Zéro cloud", desc: "Aucun serveur ne stocke vos données" },
    { icon: Eye, label: "Transparence totale", desc: "Code auditable, architecture ouverte" },
]

const sections = [
    {
        title: "1. Principe Fondamental",
        content: "Elazya est un logiciel d'intelligence artificielle fonctionnant intégralement en local sur votre machine. Par conception, aucune donnée personnelle — emails, fichiers, notes, conversations, calendrier — n'est envoyée à nos serveurs. Vos données restent exclusivement sur votre ordinateur, sous votre contrôle total."
    },
    {
        title: "2. Données Collectées",
        content: "Dans le cadre de la gestion des abonnements, nous collectons uniquement : votre adresse email (pour l'authentification et la communication), les informations de facturation traitées par Stripe (nous ne stockons jamais vos données de carte bancaire), et des logs d'erreur anonymisés si vous activez explicitement cette option dans les réglages."
    },
    {
        title: "3. Utilisation des Modèles IA",
        content: "Lorsque vous utilisez un fournisseur LLM externe (OpenAI, Anthropic, Google Gemini, etc.), vos messages sont envoyés directement à ces fournisseurs via HTTPS depuis votre machine. Elazya AI n'intercepte, ne stocke et ne lit jamais ces échanges. La politique de confidentialité du fournisseur LLM choisi s'applique à ces données. Pour un usage entièrement hors-ligne, utilisez un modèle local via Ollama."
    },
    {
        title: "4. Stockage Local",
        content: "Toutes les données d'Elazya (préférences, mémoire contextuelle, historique de conversation, fichiers de configuration) sont stockées dans le répertoire ~/Library/Application Support/Elazya sur votre Mac. Ces fichiers sont chiffrés avec AES-256 et ne sont accessibles qu'avec votre compte utilisateur macOS."
    },
    {
        title: "5. Cookies et Trackers",
        content: "Le site web elazya.com utilise uniquement des cookies techniques essentiels au fonctionnement du site (session d'authentification, préférences de langue). Nous n'utilisons aucun tracker publicitaire, aucun pixel de suivi, et aucun outil d'analytics tiers. Aucune donnée de navigation n'est revendue."
    },
    {
        title: "6. Partage de Données",
        content: "Nous ne partageons, ne vendons et ne louons jamais vos données personnelles à des tiers. Les seuls transferts de données sont : vers Stripe pour le traitement des paiements, et vers le fournisseur LLM de votre choix (uniquement les messages de conversation, à votre initiative)."
    },
    {
        title: "7. Droits de l'Utilisateur",
        content: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Pour exercer ces droits, contactez-nous à rayan@elazya.com. Nous répondons sous 48h ouvrées. La suppression de votre compte entraîne l'effacement irréversible de toutes vos données de nos systèmes."
    },
    {
        title: "8. Sécurité",
        content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement de bout en bout, accès restreint aux systèmes, audits de sécurité réguliers, et absence de stockage cloud de données utilisateur. En cas de violation de données, nous nous engageons à vous notifier sous 72 heures conformément au RGPD."
    },
    {
        title: "9. Hébergement",
        content: "Le site web et les services d'authentification sont hébergés chez IONOS (OVH Group) en France, dans des datacenters certifiés ISO 27001. Le logiciel Elazya lui-même fonctionne exclusivement sur votre machine et ne nécessite aucun hébergement cloud."
    },
    {
        title: "10. Contact DPO",
        content: "Pour toute question relative à la protection de vos données personnelles, contactez notre délégué à la protection des données à l'adresse : rayan@elazya.com"
    },
]

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-slate-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-blue-300/[0.2] mix-blend-multiply blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="container mx-auto px-4 py-32 md:py-40 max-w-3xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Conforme RGPD</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-800">Politique de Confidentialité</h1>
                    <p className="text-slate-400 font-medium mb-10 text-sm uppercase tracking-widest">Dernière mise à jour : 11 février 2026</p>
                </motion.div>

                {/* Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16"
                >
                    {highlights.map(h => (
                        <div key={h.label} className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl text-center shadow-sm">
                            <h.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                            <div className="text-sm font-bold text-slate-800 mb-1">{h.label}</div>
                            <div className="text-xs font-medium text-slate-500 leading-relaxed">{h.desc}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map((section, i) => (
                        <motion.section
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + 0.04 * i }}
                            className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm p-8 rounded-3xl"
                        >
                            <h2 className="text-xl font-bold tracking-tight mb-3 text-primary">{section.title}</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">{section.content}</p>
                        </motion.section>
                    ))}
                </div>
            </div>
        </div>
    )
}
