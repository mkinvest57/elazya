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

        // 1. Store email in Supabase
        const { error } = await supabase
            .from('waitlist')
            .insert({ email: cleanEmail, plan: selectedPlan })

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

        // 3. Get total waitlist count for position
        const { count } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true })

        const position = count || 1

        // 4. Build reservation link
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elazya.com'
        const reservationLink = `${siteUrl}/reservation?plan=${selectedPlan}&email=${encodeURIComponent(cleanEmail)}`

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
                subject: `🚀 Ta place #${position} est réservée — Confirme en 1 clic`,
                html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fbff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">

<div style="text-align:center;margin-bottom:32px;">
<h1 style="font-size:24px;font-weight:700;color:#0f172a;margin:0 0 8px;">Tu es n°${position} sur la liste.</h1>
<p style="font-size:15px;color:#64748b;margin:0;">Plus que ${placesLeft} places disponibles sur 47.</p>
</div>

<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin-bottom:24px;">
<p style="font-size:15px;color:#334155;line-height:1.6;margin:0 0 16px;">
Salut,<br><br>
Ta place Accès Anticipé Elazya est réservée.<br>
Voici ce qu'il te reste à faire :
</p>

<p style="font-size:15px;color:#334155;line-height:1.6;margin:0 0 16px;">
<strong>1.</strong> Clique sur le bouton ci-dessous pour sécuriser ta place.<br>
<strong>2.</strong> Dépose 9€ — déduits de ton prix final le 5 avril.<br>
<strong>3.</strong> Le 5 avril, tu reçois ton accès à -50%.
</p>

<p style="font-size:14px;color:#64748b;margin:0 0 24px;">
Ton plan présélectionné : <strong>${planNames[selectedPlan] || selectedPlan}</strong>
</p>

<div style="text-align:center;">
<a href="${reservationLink}" style="display:inline-block;background:#0f172a;color:#fff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">Sécuriser ma place — 9€</a>
</div>
</div>

<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;">
<p style="font-size:13px;color:#92400e;margin:0;line-height:1.5;">
⚠️ <strong>Attention :</strong> Il reste ${placesLeft} places sur 47.<br>
Après le 5 avril minuit, le prix remonte définitivement.<br>
Si tu ne réserves pas, ta place sera attribuée à quelqu'un d'autre.
</p>
</div>

<div style="text-align:center;padding:16px 0;border-top:1px solid #e2e8f0;">
<p style="font-size:12px;color:#94a3b8;margin:0;">
Paiement sécurisé via Stripe · 9€ déduits du prix final · Remboursé si l'app ne sort pas
</p>
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
