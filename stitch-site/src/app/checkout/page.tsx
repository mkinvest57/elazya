"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Lock, Check, ArrowRight } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"

// Define plan details mapping
const PLANS: Record<string, { name: string; price: number; type: "one-time" | "annual" | "subscription"; features: string[] }> = {
    solo: {
        name: "Elazya Solo",
        price: 197,
        type: "one-time",
        features: ["5 agents Core", "1 utilisateur", "1 machine", "Support email 72h"]
    },
    pro: {
        name: "Elazya Pro",
        price: 497,
        type: "one-time",
        features: ["8 agents (Core + Pro)", "3 utilisateurs", "3 machines", "Support email 48h"]
    },
    business: {
        name: "Elazya Business",
        price: 997,
        type: "one-time",
        features: ["10 agents + suite complète", "10 utilisateurs", "Machines illimitées", "Support 24h + call mensuel"]
    }
}

function CheckoutContent() {
    const searchParams = useSearchParams()
    const planId = searchParams.get("plan") || "solo"
    const selectedPlan = PLANS[planId] || PLANS["solo"]

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: ""
    })

    const handlePayment = async () => {
        if (!formData.email || !formData.firstName || !formData.lastName) {
            alert("Veuillez remplir tous les champs.")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    plan: planId
                })
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                alert("Erreur lors de l'initialisation du paiement.")
                setIsLoading(false)
            }
        } catch (error) {
            console.error("Payment Error:", error)
            alert("Une erreur est survenue.")
            setIsLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">Finaliser votre commande</h1>
                    <p className="text-slate-500 font-medium tracking-wide">Sécurisé par Stripe</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm p-8 rounded-3xl">
                    <h2 className="text-base font-bold mb-6 flex items-center gap-3 text-slate-800">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">1</span>
                        Vos informations
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Prénom</label>
                                <Input
                                    placeholder="Jean"
                                    value={formData.firstName}
                                    onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nom</label>
                                <Input
                                    placeholder="Dupont"
                                    value={formData.lastName}
                                    onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email</label>
                            <Input
                                type="email"
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm"
                            />
                            <p className="text-xs text-slate-500 font-medium">Vous recevrez votre confirmation sur cette adresse</p>
                        </div>
                    </div>

                    <div className="my-8 h-px bg-slate-200"></div>

                    <h2 className="text-base font-bold mb-6 flex items-center gap-3 text-slate-800">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">2</span>
                        Paiement sécurisé
                    </h2>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-center h-40 mb-6 shadow-inner">
                        <div className="text-slate-400 font-bold text-sm flex flex-col items-center gap-2">
                            <Lock className="w-5 h-5 text-slate-300" />
                            Redirection vers Stripe...
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 text-base font-bold group bg-[#0f172a] hover:bg-slate-800 text-white shadow-[0_4px_14px_0_rgb(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] border-none"
                        onClick={handlePayment}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span>Chargement...</span>
                        ) : (
                            <>
                                <Lock className="w-4 h-4 mr-2" />
                                Payer {selectedPlan.price}€
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 mt-5 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> SSL</span>
                        <span>·</span>
                        <span>Stripe</span>
                        <span>·</span>
                        <span>30j remboursement</span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden lg:block relative"
            >
                <div className="sticky top-28">
                    <div className="bg-white/80 backdrop-blur-xl border border-primary/20 shadow-[0_8px_30px_-4px_rgba(99,102,241,0.15)] p-8 rounded-3xl">
                        <h3 className="font-bold tracking-tight mb-6 text-lg text-slate-800">Résumé</h3>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="font-bold text-xl text-primary tracking-tight">{selectedPlan.name}</div>
                                <div className="text-sm font-semibold text-slate-400 mt-1">
                                    {selectedPlan.type === "annual" ? "Extension annuelle" : selectedPlan.type === "subscription" ? "Abonnement mensuel" : "Licence à vie"}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-800 tracking-tight">{selectedPlan.price}€{selectedPlan.type === "annual" ? "/an" : selectedPlan.type === "subscription" ? "/mo" : ""}</div>
                        </div>
                        <div className="h-px bg-slate-200 my-5"></div>
                        <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                            <div>Total à payer</div>
                            <div className="text-primary text-2xl tracking-tight">{selectedPlan.price}€</div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Inclus</h4>
                            <ul className="space-y-3">
                                {selectedPlan.features.map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Decorative element behind */}
                    <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-primary mix-blend-multiply opacity-10 blur-[100px] rounded-full"></div>
                </div>
            </motion.div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800">
            <div className="fixed inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-300 blur-[150px] rounded-full"></div>
            </div>
            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="container relative z-10 mx-auto px-4 py-24 md:py-32">
                <Suspense fallback={<div className="text-center font-bold text-slate-500">Chargement du checkout...</div>}>
                    <CheckoutContent />
                </Suspense>
            </div>
        </div>
    )
}
