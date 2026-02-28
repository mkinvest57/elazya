const Stripe = require('stripe');

// Load env vars manually or assume they are set. 
// User said "Tu as déjà les clés Stripe, utilise-les."
// I found them in .env: STRIPE_SECRET_KEY=...

const stripe = new Stripe('sk_live_...');

const PRODUCTS = [
    {
        name: 'Elazya Solo',
        description: 'License for 1 user, 5 agents',
        amount: 19700, // 197€
        currency: 'eur',
        metadata: { planCode: 'SOLO' }
    },
    {
        name: 'Elazya Pro',
        description: 'License for 5 users, 20 agents',
        amount: 49700, // 497€
        currency: 'eur',
        metadata: { planCode: 'PRO' }
    },
    {
        name: 'Elazya Business',
        description: 'License for 20 users, unlimited agents',
        amount: 99700, // 997€
        currency: 'eur',
        metadata: { planCode: 'BUSINESS' }
    },
    {
        name: 'Upgrade Solo -> Pro',
        description: 'Upgrade license from Solo to Pro',
        amount: 30000, // 300€
        currency: 'eur',
        metadata: { planCode: 'UPGRADE_SOLO_PRO' }
    },
    {
        name: 'Upgrade Pro -> Business',
        description: 'Upgrade license from Pro to Business',
        amount: 50000, // 500€
        currency: 'eur',
        metadata: { planCode: 'UPGRADE_PRO_BUSINESS' }
    }
];

async function main() {
    console.log('🚀 Creating Stripe products for Elazya...');
    
    // Check account
    try {
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Connected to Stripe account: ${account.business_profile?.name || account.email || account.id}`);
    } catch (e) {
        console.error('❌ Failed to connect to Stripe:', e.message);
        process.exit(1);
    }

    const createdIds = {};

    for (const p of PRODUCTS) {
        try {
            console.log(`\n📦 Creating ${p.name}...`);
            
            // Create Product
            const product = await stripe.products.create({
                name: p.name,
                description: p.description,
                metadata: p.metadata
            });

            // Create Price
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: p.amount,
                currency: p.currency,
            });

            console.log(`   ✅ Created! Product: ${product.id} | Price: ${price.id}`);
            createdIds[p.metadata.planCode] = price.id;

        } catch (e) {
            console.error(`   ❌ Error creating ${p.name}:`, e.message);
        }
    }

    console.log('\n\n🎉 Done! Update your checkout/route.ts with these Price IDs:');
    console.log('-----------------------------------------------------------');
    console.log('const PLANS = {');
    console.log(`    SOLO: '${createdIds.SOLO || "..."}',`);
    console.log(`    PRO: '${createdIds.PRO || "..."}',`);
    console.log(`    BUSINESS: '${createdIds.BUSINESS || "..."}',`);
    console.log(`    UPGRADE_SOLO_PRO: '${createdIds.UPGRADE_SOLO_PRO || "..."}',`);
    console.log(`    UPGRADE_PRO_BUSINESS: '${createdIds.UPGRADE_PRO_BUSINESS || "..."}'`);
    console.log('};');
    console.log('-----------------------------------------------------------');
    
    console.log('\n⚠️  Success URL Configuration:');
    console.log('In Stripe Dashboard > Developers > API Keys > Restricted keys (or webhooks), ensure you handle:');
    console.log('Webhook Endpoint: https://elazya.com/api/webhooks/stripe');
    console.log('Events: checkout.session.completed');
}

main();
