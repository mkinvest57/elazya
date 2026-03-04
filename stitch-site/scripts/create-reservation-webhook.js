// Creates a Stripe webhook endpoint for early access reservations
// Run: node scripts/create-reservation-webhook.js

const Stripe = require("stripe")
require("dotenv").config({ path: ".env.local" })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function main() {
    try {
        const endpoint = await stripe.webhookEndpoints.create({
            url: "https://elazya.com/api/webhooks/reservation",
            enabled_events: ["checkout.session.completed"],
            description: "Elazya Early Access Reservation Webhook",
        })

        console.log("✅ Webhook endpoint created!")
        console.log(`   ID: ${endpoint.id}`)
        console.log(`   URL: ${endpoint.url}`)
        console.log(`   Secret: ${endpoint.secret}`)
        console.log("")
        console.log("→ Copy the secret above into .env.local as STRIPE_WEBHOOK_SECRET")
    } catch (err) {
        console.error("❌ Error:", err.message)
    }
}

main()
