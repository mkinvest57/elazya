"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ArrowRight, Loader2 } from "lucide-react"

const questions = [
    {
        id: "role",
        title: "Tu es...",
        options: [
            { id: "freelance", label: "Freelance / indépendant" },
            { id: "business", label: "Dirigeant d'une petite structure (1 à 5 personnes)" },
            { id: "other", label: "Autre" }
        ]
    },
    {
        id: "hours",
        title: "Combien d'heures par semaine sur des tâches répétitives ?",
        options: [
            { id: "less_2h", label: "Moins de 2h" },
            { id: "2_to_5h", label: "Entre 2h et 5h" },
            { id: "more_5h", label: "Plus de 5h" }
        ]
    },
    {
        id: "interest",
        title: "Ce qui t'intéresse le plus ?",
        options: [
            { id: "finance", label: "Automatiser mes factures et ma compta" },
            { id: "crm", label: "Gérer mes prospects et clients automatiquement" },
            { id: "linkedin", label: "Générer mon contenu LinkedIn sans effort" },
            { id: "all", label: "Tout à la fois" }
        ]
    },
    {
        id: "plan",
        title: "Quel plan t'attire le plus ?",
        options: [
            { id: "solo", label: "Solo → 9€ maintenant · 88€ le 5 avril" },
            { id: "pro", label: "Pro → 9€ maintenant · 238€ le 5 avril" },
            { id: "studio", label: "Studio → 9€ maintenant · 488€ le 5 avril" }
        ]
    }
]

function QCMContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState<string | null>(null)

    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const emailParam = searchParams.get("email")
        if (emailParam) setEmail(emailParam)

        const planParam = searchParams.get("plan")
        if (planParam && ["solo", "pro", "studio"].includes(planParam)) {
            setAnswers(prev => ({ ...prev, plan: planParam }))
        }
    }, [searchParams])

    const handleSelect = (optionId: string) => {
        const questionId = questions[currentStep].id
        setAnswers(prev => ({ ...prev, [questionId]: optionId }))

        setTimeout(() => {
            if (currentStep < questions.length - 1) {
                setCurrentStep(prev => prev + 1)
            } else {
                submitQCM({ ...answers, [questionId]: optionId })
            }
        }, 400)
    }

    const submitQCM = async (finalAnswers: Record<string, string>) => {
        if (!email) return router.push("/")

        setIsSubmitting(true)

        try {
            await fetch("/api/qcm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    role: finalAnswers.role,
                    hours: finalAnswers.hours,
                    interest: finalAnswers.interest,
                    plan: finalAnswers.plan
                })
            })

            const selectedPlan = finalAnswers.plan || "solo"
            router.push(`/reservation?email=${encodeURIComponent(email)}&plan=${selectedPlan}`)
        } catch (err) {
            console.error("QCM submission failed:", err)
            router.push(`/reservation?email=${encodeURIComponent(email)}&plan=solo`)
        }
    }

    if (!email) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
                <p className="text-white/60">Lien invalide ou expiré.</p>
            </div>
        )
    }

    const currentQ = questions[currentStep]
    const progress = ((currentStep) / questions.length) * 100

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-6 font-sans">

            <div className="fixed top-0 left-0 right-0 h-1 bg-white/5">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <div className="w-full max-w-xl mx-auto">
                <div className="mb-12 text-center text-white/50 text-sm font-medium uppercase tracking-widest">
                    Question {currentStep + 1} / {questions.length}
                </div>

                <AnimatePresence mode="wait">
                    {!isSubmitting ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-3xl sm:text-4xl font-semibold mb-10 text-center tracking-tight text-white/90">
                                {currentQ.title}
                            </h1>

                            <div className="space-y-3">
                                {currentQ.options.map((option, idx) => {
                                    const isSelected = answers[currentQ.id] === option.id
                                    return (
                                        <motion.button
                                            key={option.id}
                                            onClick={() => handleSelect(option.id)}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between ${isSelected
                                                ? "bg-white/10 border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                                : "bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white"
                                                }`}
                                        >
                                            <span className="text-lg font-medium">{option.label}</span>
                                            {isSelected ? (
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-black" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border border-white/20" />
                                            )}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <Loader2 className="w-10 h-10 animate-spin text-white/40 mx-auto mb-6" />
                            <h2 className="text-2xl font-semibold text-white/90 mb-2">Préparation de ton espace...</h2>
                            <p className="text-white/50">Redirection vers la page de réservation sécurisée.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isSubmitting && currentStep > 0 && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="mt-8 text-sm text-white/40 hover:text-white/80 transition-colors mx-auto block"
                    >
                        ← Retour
                    </motion.button>
                )}
            </div>
        </main>
    )
}

export default function QCMPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/40 mx-auto" />
            </div>
        }>
            <QCMContent />
        </Suspense>
    )
}
