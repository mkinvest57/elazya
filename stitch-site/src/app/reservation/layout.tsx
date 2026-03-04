import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Réservation — Elazya Accès Anticipé",
    robots: { index: false, follow: false },
}

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
