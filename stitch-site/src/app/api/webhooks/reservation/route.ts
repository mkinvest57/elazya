import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"
import Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error(`Webhook signature error: ${message}`)
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        // Only process early access reservations
        if (session.metadata?.type !== "early_access_reservation") {
            return new NextResponse(null, { status: 200 })
        }

        const email = session.metadata?.email || session.customer_email
        const plan = session.metadata?.plan || "solo"

        if (!email) {
            console.error("[Webhook] No email found in session")
            return new NextResponse("No email found", { status: 400 })
        }

        console.log(`[Webhook] Early access payment — plan: ${plan}, email: ${email}`)

        try {
            // 1. Get current places count
            const { data: configData } = await supabase
                .from("config")
                .select("value")
                .eq("key", "places_restantes")
                .single()

            const currentPlaces = parseInt(configData?.value || "47")
            const position = 48 - currentPlaces // position 1 = first buyer

            // 2. Update waitlist entry to paid
            const { data: existingEntry } = await supabase
                .from("waitlist")
                .select("id")
                .eq("email", email.toLowerCase().trim())
                .single()

            if (existingEntry) {
                // Update existing entry
                await supabase
                    .from("waitlist")
                    .update({
                        status: "paid",
                        plan,
                        position,
                        stripe_session_id: session.id,
                        paid_at: new Date().toISOString(),
                    })
                    .eq("email", email.toLowerCase().trim())
            } else {
                // Insert new entry if they bypassed the email step
                await supabase
                    .from("waitlist")
                    .insert({
                        email: email.toLowerCase().trim(),
                        plan,
                        status: "paid",
                        position,
                        stripe_session_id: session.id,
                        paid_at: new Date().toISOString(),
                    })
            }

            // 3. Decrement places counter
            const newPlaces = Math.max(0, currentPlaces - 1)
            await supabase
                .from("config")
                .update({ value: String(newPlaces) })
                .eq("key", "places_restantes")

            console.log(`[Webhook] ✅ ${email} is position #${position}. Places left: ${newPlaces}`)
        } catch (error) {
            console.error("[Webhook] Error processing payment:", error)
            return new NextResponse("Internal Server Error", { status: 500 })
        }
    }

    return new NextResponse(null, { status: 200 })
}
