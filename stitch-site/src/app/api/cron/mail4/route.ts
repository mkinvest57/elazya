import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Hardcoded final payment links for the remaining 50%
const FINAL_PAYMENT_LINKS: Record<string, string> = {
    solo: 'https://buy.stripe.com/test_solo_final', // TODO: REPLACE WITH REAL LINKS
    pro: 'https://buy.stripe.com/test_pro_final',
    studio: 'https://buy.stripe.com/test_studio_final'
}

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Find paid entries to receive mail 4 (Launch day)
        const { data: paidUsers, error: fetchError } = await supabase
            .from('waitlist')
            .select('*')
            .eq('status', 'paid')
            .eq('mail4_sent', false)

        if (fetchError) {
            console.error('Error fetching for mail 4:', fetchError)
            return NextResponse.json({ error: 'DB Error' }, { status: 500 })
        }

        if (!paidUsers || paidUsers.length === 0) {
            return NextResponse.json({ message: 'No emails to send' })
        }

        console.log(`Sending Mail 4 to ${paidUsers.length} paid users...`)

        for (const user of paidUsers) {

            const userPlan = user.qcm_plan || user.plan || 'solo'
            let finalPrice = "88€";
            let planName = "Solo";

            if (userPlan === "pro") { finalPrice = "238€"; planName = "Pro"; }
            if (userPlan === "studio") { finalPrice = "488€"; planName = "Studio"; }

            const paymentLink = FINAL_PAYMENT_LINKS[userPlan] || FINAL_PAYMENT_LINKS.solo

            try {
                await resend.emails.send({
                    from: 'Elazya <no-reply@elazya.com>',
                    to: user.email,
                    subject: `⚡ Elazya est en ligne. Ton lien de paiement final est ici.`,
                    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fbff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
Bonjour,<br><br>
C'est le jour J. Elazya 1.0 est disponible.<br>
Ta place n°<strong>${user.position}</strong> est toujours la tienne.
</p>

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 24px;">
Finalise ton accès maintenant (le tarif expire ce soir à 23h59) :<br>
→ ${planName} : <strong>${finalPrice}</strong>
</p>

<div style="margin-bottom:32px;">
<a href="${paymentLink}" style="display:inline-block;background:#0f172a;color:#fff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">Finaliser mon accès ${planName} →</a>
</div>

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 32px;">
Ton lien de téléchargement et ta clé de licence<br>
arriveront dans les minutes qui suivent ton paiement.<br><br>
Si tu as la moindre question, réponds directement à cet email.<br><br>
Bienvenue dans l'équipe. 🚀
</p>

<div style="text-align:left;padding:16px 0;border-top:1px solid #e2e8f0;">
<p style="font-size:12px;color:#94a3b8;margin:8px 0 0;">
Elazya · L'app Mac qui tourne ta structure pendant que tu dors.
</p>
</div>

</div>
</body>
</html>`
                })

                // Mark as sent
                await supabase
                    .from('waitlist')
                    .update({ mail4_sent: true })
                    .eq('id', user.id)

            } catch (err) {
                console.error(`Failed to send Mail 4 to ${user.email}:`, err)
            }
        }

        return NextResponse.json({ success: true, processed: paidUsers.length })
    } catch (err) {
        console.error('Cron Mail 4 error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
