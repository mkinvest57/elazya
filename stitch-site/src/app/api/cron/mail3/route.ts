import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Find paid entries to receive mail 3
        const { data: paidUsers, error: fetchError } = await supabase
            .from('waitlist')
            .select('*')
            .eq('status', 'paid')
            .eq('mail3_sent', false)

        if (fetchError) {
            console.error('Error fetching for mail 3:', fetchError)
            return NextResponse.json({ error: 'DB Error' }, { status: 500 })
        }

        if (!paidUsers || paidUsers.length === 0) {
            return NextResponse.json({ message: 'No emails to send' })
        }

        console.log(`Sending Mail 3 to ${paidUsers.length} paid users...`)

        for (const user of paidUsers) {
            try {
                await resend.emails.send({
                    from: 'Elazya <no-reply@elazya.com>',
                    to: user.email,
                    subject: `Dans 7 jours, tu reçois Elazya. Voici comment te préparer.`,
                    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fbff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
Bonjour,<br><br>
Ta place est confirmée. Tu es la n°<strong>${user.position}</strong> sur 47.<br>
Dans 7 jours, le 5 avril, tu reçois l'app.
</p>

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
Pour être prêt dès le premier matin :<br>
→ Crée un compte Google AI Studio (gratuit) pour ta clé API Gemini. Lien direct : <a href="https://aistudio.google.com" style="color:#0f172a;font-weight:bold;">aistudio.google.com</a><br>
→ Installe Telegram sur ton téléphone si ce n'est pas déjà fait.<br>
→ Prépare un dossier "Factures" sur ton Mac.
</p>

<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin:bottom:24px;">
<p style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 12px;">Ce que tu recevras le 5 avril à 9h00 :</p>
<ul style="margin:0;padding-left:20px;color:#334155;font-size:16px;line-height:1.6;margin-bottom:24px;">
  <li>Les instructions pour installer OpenClaw (mon moteur IA)</li>
  <li>Le lien direct pour télécharger l'app macOS</li>
  <li>Ton lien de paiement du solde (Tarif Fondateur)</li>
  <li>Ta clé de licence (générée automatiquement)</li>
  <li>Un guide de démarrage rapide (5 minutes pour tout configurer)</li>
</ul>
</div>

<p style="font-size:16px;color:#334155;line-height:1.6;margin:32px 0 16px;">
À dans 7 jours. 🚀
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
                    .update({ mail3_sent: true })
                    .eq('id', user.id)

            } catch (err) {
                console.error(`Failed to send Mail 3 to ${user.email}:`, err)
            }
        }

        return NextResponse.json({ success: true, processed: paidUsers.length })
    } catch (err) {
        console.error('Cron Mail 3 error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
