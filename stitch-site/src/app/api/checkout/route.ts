import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(req: Request) {
    try {
        const { email, firstName, lastName } = await req.json()

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Elazya - Licence Perpétuelle",
                            description: "Assistant IA Personnel (Version Commerciale)",
                            images: ["https://elazya.com/opengraph-image.png"],
                        },
                        unit_amount: 20000, // 200.00 EUR
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
            customer_email: email,
            metadata: {
                firstName,
                lastName,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error("Stripe Checkout Error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
