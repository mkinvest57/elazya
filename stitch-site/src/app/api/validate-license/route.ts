import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/validate-license
 * 
 * Validates a license key against the database.
 * Body: { key: string }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { key } = body

        if (!key || typeof key !== 'string') {
            return NextResponse.json(
                { valid: false, error: "License key is required" },
                { status: 400 }
            )
        }

        // Clean up the key
        const normalizedKey = key.trim().toUpperCase()

        // Query the database for the key
        const customer = await prisma.customer.findUnique({
            where: { licenseKey: normalizedKey }
        })

        if (!customer) {
            return NextResponse.json(
                { valid: false, error: "Invalid license key" },
                { status: 404 }
            )
        }

        // Extract plan from the key format ELAZYA-[PLAN]-XXXX-XXXX
        const parts = normalizedKey.split("-")
        let plan = "solo"
        if (parts.length >= 2) {
            const planCode = parts[1]
            if (planCode === "PRO") plan = "pro"
            else if (planCode === "BIZ") plan = "business"
            else if (planCode === "SOLO") plan = "solo"
        }

        return NextResponse.json({
            valid: true,
            plan,
            email: customer.email,
            name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
        })

    } catch (err: any) {
        console.error("Validate License Error:", err)
        return NextResponse.json(
            { valid: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
