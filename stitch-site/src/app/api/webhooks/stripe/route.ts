import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

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

        // Save new purchase details to the database to ensure the license key is valid
        try {
            const email = session.customer_email

            // Upsert customer with the generated license key if it doesn't already exist or if upgrading
            // If they already exist and we aren't upgrading, we still want to ensure they have a key
            const customer = await prisma.customer.findUnique({ where: { email } })

            // Only generate and save a new key if replacing an old one (upgrade/lost) or no key exists
            let keyToSave = licenseKey
            if (customer?.licenseKey && customer.licenseKey.startsWith("ELAZYA-") && !isUpgrade) {
                keyToSave = customer.licenseKey
                console.log(`[Webhook] Kept existing key for ${email}: ${keyToSave}`)
            } else {
                await prisma.customer.upsert({
                    where: { email },
                    update: { licenseKey: keyToSave },
                    create: {
                        email,
                        firstName: session.metadata?.firstName || "",
                        lastName: session.metadata?.lastName || "",
                        licenseKey: keyToSave,
                    }
                })
                console.log(`[Webhook] Saved license for ${email}: ${keyToSave}`)
            }

            // Optional: send email (if email service is configured)
            // await sendWelcomeEmail(session.customer_email, session.metadata?.firstName || "Client", keyToSave)
        } catch (error) {
            console.error("Error processing webhook:", error)
            return new NextResponse("Internal Server Error", { status: 500 })
        }
    }

    return new NextResponse(null, { status: 200 })
}
