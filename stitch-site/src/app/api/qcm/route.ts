import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, role, hours, interest, plan } = body

        if (!email) {
            return NextResponse.json({ error: 'Email manquant' }, { status: 400 })
        }

        const { error } = await supabase
            .from('waitlist')
            .update({
                qcm_role: role,
                qcm_hours: hours,
                qcm_interest: interest,
                qcm_plan: plan
            })
            .eq('email', email.toLowerCase().trim())

        if (error) {
            console.error('Erreur sauvegarde QCM:', error)
            return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (err) {
        console.error('API QCM error:', err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
