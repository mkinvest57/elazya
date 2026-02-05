import { Button } from "@/components/ui/Button"
import { MessageCircle, Twitter, Globe } from "lucide-react"
import Link from "next/link"

export default function CommunityPage() {
    return (
        <div className="container mx-auto px-4 py-24 md:py-32 text-center max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Rejoignez le <span className="text-primary">mouvement</span>.</h1>
            <p className="text-xl text-foreground/60 mb-12">
                Plus de 4 000 utilisateurs passionnés échangent chaque jour sur le futur de l'IA locale.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="p-8 bg-surface-2 rounded-2xl border border-surface-3 flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                        <MessageCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Discord VIP</h3>
                    <p className="text-foreground/60 text-sm mb-8">
                        Support prioritaire, bêtas exclusives et discussions techniques.
                    </p>
                    <a href="https://discord.gg/elazya" target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full">Rejoindre Discord</Button>
                    </a>
                </div>

                <div className="p-8 bg-surface-2 rounded-2xl border border-surface-3 flex flex-col items-center">
                    <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                        <Twitter className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Twitter / X</h3>
                    <p className="text-foreground/60 text-sm mb-8">
                        Suivez nos annonces en temps réel et les nouveaux skills.
                    </p>
                    <a href="https://twitter.com/ElazyaAI" target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="secondary" className="w-full">Suivre @ElazyaAI</Button>
                    </a>
                </div>
            </div>

            <div className="border-t border-surface-3 pt-12">
                <p className="text-sm text-foreground/40 italic">
                    "Elazya a changé ma façon de travailler. La communauté est incroyable." — Thomas, Developer
                </p>
            </div>
        </div>
    )
}
