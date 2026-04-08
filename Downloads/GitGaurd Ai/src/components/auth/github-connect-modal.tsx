"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useAuth, useUser } from "@clerk/nextjs"
import { Github, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const DISMISS_KEY_PREFIX = "gitguard:github-connect-dismissed:"
const CONNECTED_KEY_PREFIX = "gitguard:github-connected:"

export function GitHubConnectModal() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const prompt = searchParams.get("prompt")
    const { isSignedIn } = useAuth()
    const { user, isLoaded } = useUser()
    const [open, setOpen] = useState(false)

    const externalAccounts = user?.externalAccounts ?? []

    const hasGoogleAccount = useMemo(() => {
        return externalAccounts.some((account) =>
            String(account.provider || "").toLowerCase().includes("google")
        )
    }, [externalAccounts])

    const hasGithubAccount = useMemo(() => {
        return externalAccounts.some((account) =>
            String(account.provider || "").toLowerCase().includes("github")
        )
    }, [externalAccounts])

    useEffect(() => {
        if (prompt === "connect-github") {
            setOpen(true)
            window.sessionStorage.removeItem(`${DISMISS_KEY_PREFIX}${user?.id ?? "guest"}`)

            const url = new URL(window.location.href)
            url.searchParams.delete("prompt")
            window.history.replaceState({}, "", url.toString())
        }

        if (!user?.id) return
        if (searchParams.get("github_connected") === "1") {
            window.localStorage.setItem(`${CONNECTED_KEY_PREFIX}${user.id}`, "1")
            window.sessionStorage.removeItem(`${DISMISS_KEY_PREFIX}${user.id}`)
            setOpen(false)
        }
    }, [prompt, searchParams, user?.id])

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user) return
        if (!hasGoogleAccount && prompt !== "connect-github") return
        if (pathname?.startsWith("/connect-github")) return
        if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) return

        const connectedFlag = window.localStorage.getItem(`${CONNECTED_KEY_PREFIX}${user.id}`)
        if (connectedFlag === "1" || document.cookie.includes("gitguard_github_connected=1") || hasGithubAccount) {
            setOpen(false)
            return
        }

        const dismissKey = `${DISMISS_KEY_PREFIX}${user.id}`
        const dismissed = window.sessionStorage.getItem(dismissKey)
        if (!dismissed) {
            setOpen(true)
        }
    }, [hasGithubAccount, hasGoogleAccount, isLoaded, isSignedIn, pathname, prompt, user])

    const dismiss = () => {
        if (user?.id) {
            window.sessionStorage.setItem(`${DISMISS_KEY_PREFIX}${user.id}`, "1")
        }
        setOpen(false)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
            <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-blue-100/20 bg-card shadow-2xl">
                <button
                    aria-label="Close"
                    onClick={dismiss}
                    className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-muted"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="border-b bg-gradient-to-r from-primary/20 via-blue-600/10 to-amber-500/10 p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Secure Setup
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight">Connect GitHub</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your Google sign-in is ready. Connect GitHub now to sync repositories and run AI reviews.
                    </p>
                </div>

                <div className="space-y-4 p-6">
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                        You will be asked to authorize GitHub access, similar to the standard GitHub consent screen.
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={dismiss}>Maybe later</Button>
                        <a href="/connect-github" onClick={dismiss}>
                            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-700 hover:to-green-600">
                                <Github className="h-4 w-4" />
                                Connect to GitHub
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
