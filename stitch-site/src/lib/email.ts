import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

export const sendWelcomeEmail = async (email: string, firstName: string, licenseKey: string) => {
    try {
        await resend.emails.send({
            from: "Elazya <onboarding@elazya.com>",
            to: email,
            subject: "Bienvenue sur Elazya ! Votre Clé de Licence",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Bienvenue ${firstName} !</h1>
                    <p>Merci pour votre achat. Voici votre clé de licence unique pour activer Elazya :</p>
                    <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <code style="font-size: 24px; font-weight: bold; color: #6366f1;">${licenseKey}</code>
                    </div>
                    <p>Pour activer votre licence :</p>
                    <ol>
                        <li>Ouvrez l'application Elazya</li>
                        <li>Allez dans Paramètres > Licence</li>
                        <li>Entrez votre clé ci-dessus</li>
                    </ol>
                    <p>Si vous avez des questions, n'hésitez pas à répondre à cet email.</p>
                </div>
            `,
        })
        return { success: true }
    } catch (error) {
        console.error("Failed to send email:", error)
        return { success: false, error }
    }
}
