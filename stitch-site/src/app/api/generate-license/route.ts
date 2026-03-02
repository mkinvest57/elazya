import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/generate-license?session={CHECKOUT_SESSION_ID}
 * 
 * Verifies the Stripe payment was successful, extracts the plan,
 * generates a license key, and returns it to the download page.
 * 
 * License format: ELAZYA-{PLAN}-XXXX-XXXX
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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get("session")

        if (!sessionId) {
            return NextResponse.json(
                { error: "Missing session parameter" },
                { status: 400 }
            )
        }

        // 1. Retrieve Stripe session
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        // 2. Verify payment succeeded
        if (session.payment_status !== "paid") {
            return NextResponse.json(
                { error: "Payment not completed" },
                { status: 402 }
            )
        }

        const email = session.customer_email
        if (!email) {
            return NextResponse.json(
                { error: "No email associated with session" },
                { status: 400 }
            )
        }

        // 3. Extract plan from metadata
        const plan = session.metadata?.plan || "solo"
        const firstName = session.metadata?.firstName || ""
        const lastName = session.metadata?.lastName || ""

        // 4. Retrieve or generate license key from database
        let customer = await prisma.customer.findUnique({
            where: { email }
        })

        let key = customer?.licenseKey || ""

        // Ensure the existing key is valid or generate a new one
        if (!key || !key.startsWith("ELAZYA-")) {
            key = generateLicenseKey(plan)
            customer = await prisma.customer.upsert({
                where: { email },
                update: { licenseKey: key },
                create: {
                    email,
                    firstName,
                    lastName,
                    licenseKey: key,
                }
            })
        }

        // 5. Return key + plan info
        return NextResponse.json({
            key,
            plan,
            email,
            name: `${firstName} ${lastName}`.trim(),
        })

    } catch (err: any) {
        console.error("Generate License Error:", err)
        return NextResponse.json(
            { error: err.message || "Failed to generate license" },
            { status: 500 }
        )
    }
}
