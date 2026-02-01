"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Lock } from "lucide-react"
import { useState } from "react"

export default function CheckoutPage() {
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
            console.log("Sending checkout request:", formData)
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || "Erreur serveur")
            }

            const data = await res.json()
            if (data.url) {
                console.log("Redirecting to:", data.url)
                window.location.href = data.url
            } else {
                throw new Error("Pas d'URL de redirection reçue.")
            }
        } catch (e: any) {
            console.error("Payment Error:", e)
            alert(`Erreur: ${e.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Finaliser votre commande</h1>
                        <p className="text-foreground/60">Licence perpétuelle Alizé (200€)</p>
                    </div>

                    <Card className="p-8">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="bg-primary text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Vos informations
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prénom</label>
                                    <Input
                                        placeholder="Jean"
                                        value={formData.firstName}
                                        onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom</label>
                                    <Input
                                        placeholder="Dupont"
                                        value={formData.lastName}
                                        onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <p className="text-xs text-foreground/50">Vous recevrez votre clé de licence ici</p>
                            </div>
                        </div>

                        <div className="my-8 h-px bg-surface-3"></div>

                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="bg-primary text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            Paiement Sécurisé
                        </h2>

                        <div className="bg-surface-2 border border-surface-3 rounded-lg p-6 flex flex-col items-center justify-center h-48 mb-6 relative overflow-hidden group">
                            <div className="text-foreground/50 font-medium">Redirection vers Stripe...</div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-pulse"></div>
                        </div>

                        <Button
                            className="w-full h-14 text-lg shadow-glow-primary group"
                            onClick={handlePayment}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span>Chargement...</span>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    Payer 200€ en sécurité
                                </>
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-foreground/40">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> SSL Encrypted</span>
                            <span>•</span>
                            <span>Secured by Stripe</span>
                        </div>
                    </Card>
                </div>

                <div className="hidden lg:block space-y-6">
                    <Card className="p-6 sticky top-24 border-primary/20 bg-surface-1/50">
                        <h3 className="font-bold mb-6 text-xl">Résumé</h3>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="font-bold text-lg">Alizé Licence Perpétuelle</div>
                                <div className="text-sm text-foreground/60">Version Commerciale 2026</div>
                            </div>
                            <div className="font-mono text-lg">200€</div>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm text-foreground/60">
                            <div>TVA (20%)</div>
                            <div>Inclus</div>
                        </div>
                        <div className="h-px bg-surface-3 my-6"></div>
                        <div className="flex justify-between items-center text-xl font-bold">
                            <div>Total</div>
                            <div className="text-primary">200€</div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-surface-3">
                            <h4 className="font-bold text-sm mb-4">Inclus après achat :</h4>
                            <ul className="space-y-2 text-sm text-foreground/70">
                                <li className="flex gap-2"><span>✅</span> Lien téléchargement Alizé v2</li>
                                <li className="flex gap-2"><span>✅</span> Clé de licence unique</li>
                                <li className="flex gap-2"><span>✅</span> Accès Discord VIP</li>
                                <li className="flex gap-2"><span>✅</span> Facture pour notes de frais</li>
                            </ul>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    )
}
