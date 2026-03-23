"use client"

import { HeroSection } from "@/components/sections/HeroSection"
import { UGCSection } from "@/components/sections/UGCSection"
import { ProblemsSection } from "@/components/sections/ProblemsSection"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { PricingSection } from "@/components/sections/PricingSection"
import { TestimonialsSection } from "@/components/sections/TestimonialsSection"
import { BookingSection } from "@/components/sections/BookingSection"
import { FAQSection } from "@/components/sections/FAQSection"
import { FinalCTASection } from "@/components/sections/FinalCTASection"

export default function LandingPage() {
  return (
    <main className="min-h-screen text-[#373a46] font-geist selection:bg-gray-200 selection:text-black overflow-hidden relative">
      <div className="relative z-10 w-full">
        {/* Étape 2 — Hero: Attention */}
        <HeroSection />

        {/* Étape 3 — UGC Testimonials: Intérêt immédiat */}
        <UGCSection />

        {/* Étape 4 — Problèmes: Intérêt */}
        <ProblemsSection />

        {/* Étape 5 — Bénéfices: Désir */}
        <BenefitsSection />

        {/* Étape 6 — Processus: Désir */}
        <HowItWorksSection />

        {/* Étape 7 — Pricing: Désir → Action */}
        <PricingSection />

        {/* Étape 8 — Avis textuels: Preuve finale */}
        <TestimonialsSection />

        {/* Étape 9 — Calendrier / Prise de RDV: Action */}
        <BookingSection />

        {/* Étape 10 — FAQ: Lever les objections */}
        <FAQSection />

        {/* Étape 11 — CTA Final: FOMO */}
        <FinalCTASection />
      </div>
    </main>
  )
}
