"use client"

import { useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function GithubConnectedContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const githubLogin = searchParams?.get("github_login") ?? null

    useEffect(() => {
        const timer = window.setTimeout(() => {
            router.push("/dashboard/repositories")
        }, 1600)

        return () => window.clearTimeout(timer)
    }, [router])

    return (
        <main className="min-h-screen bg-background px-4 py-24">
            <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-card p-8 shadow-xl">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <h1 className="text-2xl font-bold tracking-tight">Professional GitHub Connected</h1>
                </div>
                <p className="mt-3 text-muted-foreground">
                    Authorization completed successfully{githubLogin ? ` for @${githubLogin}` : ""}. Your professional GitHub account is now connected. Redirecting to your repositories...
                </p>
                <div className="mt-6 flex gap-3">
                    <Link href="/dashboard/repositories">
                        <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-700 hover:to-green-600">
                            Open Repositories
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline">Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default function GithubConnectedPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <GithubConnectedContent />
        </Suspense>
    )
}
