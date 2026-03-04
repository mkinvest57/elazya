"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Suspense } from "react"

function MerciContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const [position, setPosition] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!sessionId) { setLoading(false); return }

        // Poll for the webhook to have processed (may take a few seconds)
        let attempts = 0
        const maxAttempts = 10

        const poll = async () => {
            try {
                const { data } = await supabase
                    .from("waitlist")
                    .select("position")
                    .eq("stripe_session_id", sessionId)
                    .single()

                if (data?.position) {
                    setPosition(data.position)
                    setLoading(false)
                    return
                }
            } catch {
                // Webhook may not have processed yet
            }

            attempts++
            if (attempts < maxAttempts) {
                setTimeout(poll, 2000) // Retry every 2 seconds
            } else {
                setLoading(false) // Give up after 20 seconds
            }
        }

        poll()
    }, [sessionId])

    return (
        <main className="min-h-screen bg-[#f8fbff] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-lg w-full text-center"
            >
                <p className="text-6xl mb-6">🎉</p>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 mb-4">
                    Ta place est sécurisée.
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Confirmation en cours...</p>
                    </div>
                ) : position ? (
                    <p className="text-lg text-slate-600 font-medium mb-6">
                        Tu es la personne <span className="text-primary font-bold">n°{position}</span> sur 47.
                    </p>
                ) : (
                    <p className="text-lg text-slate-600 font-medium mb-6">
                        Ton paiement est confirmé.
                    </p>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 space-y-3">
                    <p className="text-sm text-slate-600 font-medium">
                        ✉️ Tu recevras un email de confirmation dans les prochaines minutes.
                    </p>
                    <p className="text-sm text-slate-600 font-medium">
                        📅 Le 5 avril, ton lien d'accès arrivera dans ta boîte.
                    </p>
                </div>

                <a
                    href="/"
                    className="inline-block text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                >
                    ← Retour au site
                </a>
            </motion.div>
        </main>
    )
}

export default function MerciPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f8fbff]" />}>
            <MerciContent />
        </Suspense>
    )
}
