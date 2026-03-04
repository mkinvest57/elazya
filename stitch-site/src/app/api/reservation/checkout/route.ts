import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const { email, plan = "solo" } = await req.json()

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Email invalide" }, { status: 400 })
        }

        const validPlans = ["solo", "pro", "studio"]
        const selectedPlan = validPlans.includes(plan) ? plan : "solo"

        // Get current places count
        const { data: configData } = await supabase
            .from("config")
            .select("value")
            .eq("key", "places_restantes")
            .single()

        const placesLeft = parseInt(configData?.value || "0")
        if (placesLeft <= 0) {
            return NextResponse.json({ error: "Plus de places disponibles." }, { status: 400 })
        }

        // Plan descriptions for Stripe receipt
        const planLabels: Record<string, string> = {
            solo: "Solo",
            pro: "Pro",
            studio: "Studio",
        }

        // Create Stripe checkout session with fixed price ID
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID!,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/merci?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/reservation?plan=${selectedPlan}`,
            customer_email: email,
            metadata: {
                plan: selectedPlan,
                email: email.toLowerCase().trim(),
                type: "early_access_reservation",
                plan_label: planLabels[selectedPlan] || "Solo",
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (err: unknown) {
        console.error("Reservation checkout error:", err)
        const message = err instanceof Error ? err.message : "Erreur serveur"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
