"use client"

import { usePathname } from "next/navigation"
import { Header } from "./Header"
import { Footer } from "./Footer"

const MINIMAL_PATHS = ["/"]

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isMinimal = MINIMAL_PATHS.includes(pathname)

    if (isMinimal) {
        return <>{children}</>
    }

    return (
        <>
            <Header />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
        </>
    )
}
