import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const { email, plan } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const cleanEmail = email.toLowerCase().trim()
        const selectedPlan = ['solo', 'pro', 'studio'].includes(plan) ? plan : 'solo'

        // 1. Get total waitlist count to determine exact position upfront
        const { count } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true })

        const position = (count || 0) + 1

        // 2. Store email & position in Supabase
        const { error } = await supabase
            .from('waitlist')
            .insert({ email: cleanEmail, plan: selectedPlan, position })

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Cet email est déjà inscrit.' }, { status: 409 })
            }
            console.error('Supabase insert error:', error)
            return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
        }

        // 2. Get current places count for position info
        const { data: configData } = await supabase
            .from('config')
            .select('value')
            .eq('key', 'places_restantes')
            .single()

        const placesLeft = parseInt(configData?.value || '47')

        // 3. Get total waitlist count (removed duplicate call, using pos from above)

        // 4. Build QCM (onboarding) link instead of direct reservation
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elazya.com'
        const qcmLink = `${siteUrl}/qcm?plan=${selectedPlan}&email=${encodeURIComponent(cleanEmail)}`

        // Plan display names
        const planNames: Record<string, string> = {
            solo: 'Solo — 88€ le 5 avril (au lieu de 197€)',
            pro: 'Pro — 238€ le 5 avril (au lieu de 497€)',
            studio: 'Studio — 488€ le 5 avril (au lieu de 997€)',
        }

        // 5. Send email via Resend
        try {
            await resend.emails.send({
                from: 'Elazya <no-reply@elazya.com>',
                to: cleanEmail,
                subject: `Tu es n°${position} sur 47. Ta place n'est pas encore sécurisée.`,
                html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fbff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 16px;">
Bonjour,<br><br>
Tu es la personne n°<strong>${position}</strong> à rejoindre la liste Accès Anticipé Elazya.<br>
Il reste ${placesLeft} places disponibles.
</p>

<p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 24px;">
Avant de t'envoyer ton lien de réservation,<br>
réponds à 4 questions rapides (30 secondes).<br>
Ça m'aide à te préparer le meilleur onboarding possible.
</p>

<div style="margin-bottom:32px;">
<a href="${qcmLink}" style="display:inline-block;background:#0f172a;color:#fff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">Répondre aux 4 questions →</a>
</div>

<div style="text-align:left;padding:16px 0;border-top:1px solid #e2e8f0;">
<p style="font-size:12px;color:#94a3b8;margin:8px 0 0;">
Elazya · L'app Mac qui tourne ta structure pendant que tu dors.
</p>
</div>

</div>
</body>
</html>`,
            })
            console.log(`[Waitlist] Email sent to ${cleanEmail} — position #${position}`)
        } catch (emailError) {
            // Don't fail the whole request if email fails — the signup is already saved
            console.error('[Waitlist] Email send error:', emailError)
        }

        return NextResponse.json({ success: true, position })
    } catch (err) {
        console.error('Waitlist API error:', err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('config')
            .select('value')
            .eq('key', 'places_restantes')
            .single()

        if (error) {
            return NextResponse.json({ places: 47 })
        }

        return NextResponse.json({ places: parseInt(data.value) || 47 })
    } catch {
        return NextResponse.json({ places: 47 })
    }
}
