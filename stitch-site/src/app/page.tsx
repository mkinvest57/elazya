"use client"

import { GlassBackground } from "@/components/ui/GlassBackground"
import { HeroSection } from "@/components/sections/HeroSection"
import { LogosSection } from "@/components/sections/LogosSection"
import { ProblemsSection } from "@/components/sections/ProblemsSection"
import { SolutionSection } from "@/components/sections/SolutionSection"
import { PillarsSection } from "@/components/sections/PillarsSection"
import { ValueStackingSection } from "@/components/sections/ValueStackingSection"
import { PricingSection } from "@/components/sections/PricingSection"
import { FAQSection } from "@/components/sections/FAQSection"

export default function LandingPage() {
  return (
    <main className="min-h-screen text-slate-800 font-sans selection:bg-primary/20 selection:text-slate-900 overflow-hidden relative">
      <GlassBackground />
      
      <div className="relative z-10 w-full">
        {/* 2. HERO SECTION */}
        <HeroSection />

        {/* 3. LOGO CLOUD */}
        <LogosSection />

        {/* 4. SECTION PROBLÈME */}
        <ProblemsSection />

        {/* 5. SECTION SOLUTION */}
        <SolutionSection />

        {/* 6. SECTION PILIERS */}
        <PillarsSection />

        {/* 7. VALUE STACKING */}
        <ValueStackingSection />

        {/* 8. PRICING */}
        <PricingSection />

        {/* 9. FAQ & GARANTIE */}
        <FAQSection />
      </div>
    </main>
  )
}
