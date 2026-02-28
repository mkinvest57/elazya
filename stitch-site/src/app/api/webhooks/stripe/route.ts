import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Generate a license key with plan code.
 * Format: ELAZYA-{PLAN}-XXXX-XXXX
 */
function randomSegment(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

function generateLicenseKey(plan: string): string {
    const planCode = plan === "business" ? "BIZ" : plan.toUpperCase()
    return `ELAZYA-${planCode}-${randomSegment()}-${randomSegment()}`
}

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.customer_email) {
            console.error("No email found in session")
            return new NextResponse("No email found", { status: 400 })
        }

        const plan = session.metadata?.plan || "solo"
        const isUpgrade = session.metadata?.isUpgrade === "true"
        const licenseKey = generateLicenseKey(plan)

        console.log(`[Webhook] ${isUpgrade ? "Upgrade" : "New"} purchase — plan: ${plan}, email: ${session.customer_email}, key: ${licenseKey}`)

        // For upgrades from the app, the deep link handler takes care of license.
        // For new purchases, we just log the key (it's generated on /success page too).
        // In production, you'd save to a database and send an email here.

        try {
            // Optional: send email (if email service is configured)
            // await sendWelcomeEmail(session.customer_email, session.metadata?.firstName || "Client", licenseKey)
            console.log(`License generated for ${session.customer_email}: ${licenseKey}`)
        } catch (error) {
            console.error("Error processing webhook:", error)
            return new NextResponse("Internal Server Error", { status: 500 })
        }
    }

    return new NextResponse(null, { status: 200 })
}
