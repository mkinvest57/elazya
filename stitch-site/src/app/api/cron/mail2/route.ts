import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
    // Basic super-simple authorization for cron jobs
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Find unpaid entries older than 24 hours that haven't received mail 2 yet
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: pendingUsers, error: fetchError } = await supabase
            .from('waitlist')
            .select('*')
            .eq('status', 'pending')
            .eq('mail2_sent', false)
            .lt('created_at', twentyFourHoursAgo)

        if (fetchError) {
            console.error('Error fetching for mail 2:', fetchError)
            return NextResponse.json({ error: 'DB Error' }, { status: 500 })
        }

        if (!pendingUsers || pendingUsers.length === 0) {
            return NextResponse.json({ message: 'No emails to send' })
        }

        // Get places left
        const { data: configData } = await supabase
            .from('config')
            .select('value')
            .eq('key', 'places_restantes')
            .single()

        const placesLeft = parseInt(configData?.value || '47')
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elazya.com'

        console.log(`Sending Mail 2 to ${pendingUsers.length} users...`)

        // Iterate and send emails
        for (const user of pendingUsers) {
            const reservationLink = `${siteUrl}/reservation?plan=${user.plan || 'solo'}&email=${encodeURIComponent(user.email)}`

            try {
                await resend.emails.send({
                    from: 'Elazya <no-reply@elazya.com>',
                    to: user.email,
                    subject: `Tu es encore n°${user.position}. Mais pour combien de temps ?`,
                    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fbff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
Bonjour,<br><br>
Ta place n°<strong>${user.position}</strong> n'est toujours pas sécurisée.
</p>

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
Il reste <strong>${placesLeft} places restantes</strong> sur 47.<br>
Chaque place prise par quelqu'un d'autre<br>
est une place perdue pour toi.
</p>

<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:24px;">
<p style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 12px;">Après le 5 avril :</p>
<ul style="margin:0;padding-left:20px;color:#334155;font-size:15px;line-height:1.6;">
  <li><strong>Solo :</strong> 197€ au lieu de 88€</li>
  <li><strong>Pro :</strong> 497€ au lieu de 238€</li>
  <li><strong>Studio :</strong> 997€ au lieu de 488€</li>
</ul>
</div>

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
Pour mémoire, ce que font tes agents dès le premier matin :<br>
<em>"☀️ Brief reçu sur Telegram.<br>
→ 2 emails urgents traités automatiquement.<br>
→ 1 facture classée, rappel créé.<br>
→ Ton post LinkedIn du jour est prêt."</em><br>
Tout ça sans que tu aies rien fait.
</p>

<div style="margin:32px 0;">
<a href="${reservationLink}" style="display:inline-block;background:#0f172a;color:#fff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">Sécuriser ma place n°${user.position} — 9€ →</a>
</div>

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
                    .update({ mail2_sent: true })
                    .eq('id', user.id)

            } catch (err) {
                console.error(`Failed to send Mail 2 to ${user.email}:`, err)
            }
        }

        return NextResponse.json({ success: true, processed: pendingUsers.length })
    } catch (err) {
        console.error('Cron Mail 2 error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
