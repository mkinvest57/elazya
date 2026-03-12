"use client"

import { HeroSection } from "@/components/sections/HeroSection"
import { ProblemsSection } from "@/components/sections/ProblemsSection"
import { SolutionSection } from "@/components/sections/SolutionSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { IntegrationsSection } from "@/components/sections/IntegrationsSection"
import { BentoGridSection } from "@/components/sections/BentoGridSection"
import { TestimonialsSection } from "@/components/sections/TestimonialsSection"
import { ValueStackingSection } from "@/components/sections/ValueStackingSection"
import { PricingSection } from "@/components/sections/PricingSection"
import { FAQSection } from "@/components/sections/FAQSection"

export default function LandingPage() {
  return (
    <main className="min-h-screen text-[#373a46] font-geist selection:bg-gray-200 selection:text-black overflow-hidden relative">
      <div className="relative z-10 w-full mb-24">
        <HeroSection />
        <ProblemsSection />
        <SolutionSection />
        <HowItWorksSection />
        <IntegrationsSection />
        <BentoGridSection />
        <TestimonialsSection />
        <ValueStackingSection />
        <PricingSection />
        <FAQSection />
      </div>
    </main>
  )
}
