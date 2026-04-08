import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { DashboardPreview } from "@/components/sections/dashboard-preview"
import { Pricing } from "@/components/sections/pricing"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Pricing />
    </main>
  )
}