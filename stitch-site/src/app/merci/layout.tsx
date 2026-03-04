import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Merci — Elazya",
    robots: { index: false, follow: false },
}

export default function MerciLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
