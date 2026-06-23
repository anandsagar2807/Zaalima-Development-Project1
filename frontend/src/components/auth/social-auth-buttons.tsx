"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface SocialAuthButtonsProps {
    className?: string
    size?: "default" | "sm" | "lg" | "xl"
    fullWidth?: boolean
}

export function SocialAuthButtons({ className = "", size = "default", fullWidth = false }: SocialAuthButtonsProps) {
    const { isLoaded, signIn } = useSignIn()
    const pathname = usePathname()
    const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null)

    const signInWith = async (provider: "google" | "github") => {
        if (loadingProvider) return

        // GitHub CTA intentionally bypasses Clerk OAuth and goes straight to GitHub auth flow.
        if (provider === "github") {
            // From the home page, open in a new tab so the landing page stays open.
            // From any other page (sign-in, connect-github, etc.), stay in the same tab.
            if (pathname === "/") {
                window.open("/api/connect-github", "_blank", "noopener,noreferrer")
            } else {
                window.location.href = "/api/connect-github"
            }
            return
        }

        if (!isLoaded || !signIn) return

        setLoadingProvider(provider)
        try {
            await signIn.authenticateWithRedirect({
                strategy: provider === "google" ? "oauth_google" : "oauth_github",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: provider === "google" ? "/dashboard?prompt=connect-github" : "/dashboard",
            })
        } catch {
            // Google OAuth fallback.
            window.location.assign("/sign-in")
        } finally {
            setLoadingProvider(null)
        }
    }

    const widthClass = fullWidth ? "w-full" : ""

    return (
        <div className={`flex flex-col gap-2 sm:flex-row ${className}`}>
            <Button
                type="button"
                size={size}
                variant="default"
                className={widthClass}
                disabled={!isLoaded || loadingProvider !== null}
                onClick={() => signInWith("google")}
            >
                {loadingProvider === "google" ? "Redirecting..." : "Continue with Google"}
            </Button>
            <Button
                type="button"
                size={size}
                variant="outline"
                className={`${widthClass} border-emerald-600/40 bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 dark:text-emerald-400`}
                disabled={!isLoaded || loadingProvider !== null}
                onClick={() => signInWith("github")}
            >
                {loadingProvider === "github" ? "Redirecting..." : "Continue with GitHub"}
            </Button>
        </div>
    )
}
