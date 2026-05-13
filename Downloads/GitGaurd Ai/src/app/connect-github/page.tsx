"use client"

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Activity, CheckCircle2, FileText, Mail, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthorizeGithubButton from "@/components/AuthorizeGithubButton"

function ConnectGithubContent() {
    const searchParams = useSearchParams()
    const { user } = useUser()
    const username = user?.username || user?.firstName || user?.primaryEmailAddress?.emailAddress || "your account"
    const oauthError = searchParams ? searchParams.get("error") : null

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-4 py-24 sm:px-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(30,78,157,0.26),transparent_42%),radial-gradient(circle_at_bottom,rgba(196,145,58,0.18),transparent_45%)]" />

            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-card/85 shadow-2xl backdrop-blur-sm">
                <div className="border-b border-border/70 p-8">
                    <div className="mb-6 flex items-center justify-center gap-5">
                        <div className="rounded-full bg-[#08245A] p-4 shadow-xl">
                            <Image src="/owl-logo.png" alt="GitGuard" width={52} height={52} className="rounded-full object-cover" />
                        </div>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-primary/50 to-transparent" />
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div className="h-0.5 w-16 bg-gradient-to-l from-primary/50 to-transparent" />
                        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-900">
                            <svg viewBox="0 0 16 16" className="h-[52px] w-[52px] fill-slate-900 dark:fill-white" aria-hidden="true">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-center text-3xl font-semibold tracking-tight">
                        GitGuard AI would like permission to connect to GitHub
                    </h1>
                </div>

                <div className="p-8">
                    {oauthError && (
                        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                            GitHub authorization failed: {oauthError}. Please try again.
                        </div>
                    )}
                    <div className="rounded-xl border border-border/70 bg-background/80 p-6">
                        <ul className="space-y-5">
                            <li className="flex items-start gap-3">
                                <UserCircle className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Verify your GitHub identity</p>
                                    <p className="text-sm text-muted-foreground">Signed in as {username}</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Know which repositories can be accessed</p>
                                    <p className="text-sm text-muted-foreground">You can review and limit access during authorization.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Activity className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Act on your behalf</p>
                                    <p className="text-sm text-muted-foreground">GitGuard posts AI review comments to pull requests.</p>
                                </div>
                            </li>
                        </ul>

                        <div className="my-6 border-t border-border/70" />

                        <h2 className="text-base font-semibold">Resources on your account</h2>
                        <div className="mt-4 flex items-start gap-3 rounded-lg border border-border/70 p-4">
                            <Mail className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium">Email addresses (read)</p>
                                <p className="text-sm text-muted-foreground">Used to match identities and send secure notifications.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Link href="/dashboard">
                            <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                        </Link>
                        <AuthorizeGithubButton size="lg" className="w-full sm:w-auto" />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default function ConnectGithubPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <ConnectGithubContent />
        </Suspense>
    )
}
