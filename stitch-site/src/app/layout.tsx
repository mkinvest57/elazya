import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geist = localFont({ src: "../fonts/GeistVF.woff2", variable: "--font-geist" });
const instrument = Instrument_Serif({ weight: "400", style: "italic", subsets: ["latin"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "Elazya - Intelligence Artificielle Personnelle",
  description: "Assistant IA local, privé et autonome. Gère votre vie numérique sans cloud.",
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
      <body className={`${geist.variable} ${instrument.variable} bg-white antialiased min-h-screen flex flex-col font-geist`}>
        <Header />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

