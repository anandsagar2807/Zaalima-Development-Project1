"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { DashboardPreview } from "@/components/sections/dashboard-preview"
import { Pricing } from "@/components/sections/pricing"

export default function Home() {
  const router = useRouter()
  const [showPopup, setShowPopup] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = () => {
    // Open connect-github in a new tab so the landing page stays open
    setShowPopup(false)
    if (typeof window !== "undefined") {
      window.open("/connect-github", "_blank", "noopener,noreferrer")
    }
  }

  const handleCancel = () => {
    setShowPopup(false)
  }

  return (
    <main className="min-h-screen">
      {mounted && showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-black shadow-xl dark:bg-zinc-900 dark:text-white">
            <h2 className="text-lg font-semibold">Connect Professional GitHub</h2>
            <p className="mt-2 text-sm opacity-90">
              To enable automated PR reviews and insights, connect your professional GitHub account.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleConnect}
                className="flex-1 rounded-md bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-green-700 hover:to-green-800"
              >
                Connect GitHub
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Hero />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Pricing />
    </main>
  )
}
