import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geist = localFont({ src: "../fonts/GeistVF.woff2", variable: "--font-geist" });
const instrument = Instrument_Serif({ weight: "400", style: "italic", subsets: ["latin"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "Elazya — L'IA qui exécute à votre place, directement sur votre Mac",
  description: "Agent IA autonome qui gère vos emails, crée vos devis et pilote votre CRM — 100% local, 100% privé. +60 entreprises accompagnées.",
  keywords: ["IA autonome", "agent IA Mac", "automatisation business", "CRM IA", "Elazya", "intelligence artificielle locale"],
  openGraph: {
    title: "Elazya — L'IA qui exécute à votre place",
    description: "Agent IA autonome qui gère vos emails, crée vos devis et pilote votre CRM — 100% local sur Mac.",
    type: "website",
    url: "https://elazya.com",
    siteName: "Elazya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elazya — L'IA qui exécute à votre place",
    description: "Agent IA autonome, 100% local sur Mac. +60 entreprises accompagnées.",
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Elazya",
              applicationCategory: "BusinessApplication",
              operatingSystem: "macOS",
              offers: {
                "@type": "Offer",
                price: "197",
                priceCurrency: "EUR",
              },
              description: "Agent IA autonome qui gère vos emails, crée vos devis et pilote votre CRM — 100% local sur Mac.",
            })
          }}
        />
      </head>
      <body className={`${geist.variable} ${instrument.variable} bg-white antialiased min-h-screen flex flex-col font-geist`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
