"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Activity, CheckCircle2, FileText, Github, Loader2, Mail, RefreshCw, Unlink, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthorizeGithubButton from "@/components/AuthorizeGithubButton"
import { useAuthStore } from "@/store/authStore"

function ConnectGithubContent() {
    const searchParams = useSearchParams()
    const { user } = useUser()
    const { user: authUser, githubProfile, githubConnected, disconnectGithub, connectGithub } = useAuthStore()
    const clerkUsername = user?.username || user?.firstName || user?.primaryEmailAddress?.emailAddress
    const storeUsername = authUser?.name || authUser?.email
    const githubUsername = githubProfile?.login || authUser?.githubUsername || null
    const username = clerkUsername || storeUsername || "your account"
    const oauthError = searchParams ? searchParams.get("error") : null
    const [isDisconnecting, setIsDisconnecting] = useState(false)
    const [isSwitching, setIsSwitching] = useState(false)
    const [editError, setEditError] = useState<string | null>(null)

    const handleDisconnect = async () => {
        setEditError(null)
        setIsDisconnecting(true)
        try {
            await disconnectGithub()
        } catch {
            setEditError("Failed to disconnect GitHub account. Please try again.")
        } finally {
            setIsDisconnecting(false)
        }
    }

    const handleSwitchAccount = async () => {
        setEditError(null)
        setIsSwitching(true)
        try {
            await disconnectGithub()
            connectGithub()
        } catch {
            setEditError("Failed to switch GitHub account. Please try again.")
            setIsSwitching(false)
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-4 py-16 sm:py-20 md:py-24 sm:px-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(30,78,157,0.26),transparent_42%),radial-gradient(circle_at_bottom,rgba(196,145,58,0.18),transparent_45%)]" />

            <div className="mx-auto w-full max-w-3xl rounded-xl sm:rounded-2xl border border-border/70 bg-card/85 shadow-2xl backdrop-blur-sm">
                <div className="border-b border-border/70 p-5 sm:p-8">
                    <div className="mb-4 sm:mb-6 flex items-center justify-center gap-3 sm:gap-5">
                        <div className="rounded-full bg-[#08245A] p-3 sm:p-4 shadow-xl">
                            <Image src="/owl-logo.png" alt="GitGuard" width={42} height={42} className="rounded-full object-cover sm:w-[52px] sm:h-[52px]" />
                        </div>
                        <div className="hidden sm:block h-0.5 w-8 sm:w-16 bg-gradient-to-r from-primary/50 to-transparent" />
                        <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0" />
                        <div className="hidden sm:block h-0.5 w-8 sm:w-16 bg-gradient-to-l from-primary/50 to-transparent" />
                        <div className="rounded-full bg-slate-100 p-3 sm:p-4 dark:bg-slate-900">
                            <svg viewBox="0 0 16 16" className="h-[42px] w-[42px] sm:h-[52px] sm:w-[52px] fill-slate-900 dark:fill-white" aria-hidden="true">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
                        Connect your GitHub account to enable AI-powered pull request reviews
                    </h1>
                    {githubUsername && (
                        <p className="mt-3 text-center text-sm sm:text-base text-muted-foreground">
                            GitGuard AI will connect with the GitHub account{" "}
                            <span className="font-semibold text-foreground">@{githubUsername}</span>
                        </p>
                    )}
                </div>

                <div className="p-5 sm:p-8">
                    {oauthError && (
                        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                            GitHub authorization failed: {oauthError}. Please try again.
                        </div>
                    )}
                    <div className="rounded-lg sm:rounded-xl border border-border/70 bg-background/80 p-4 sm:p-6">
                        <ul className="space-y-5">
                            <li className="flex items-start gap-3">
                                <UserCircle className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Verify your GitHub identity</p>
                                    <p className="text-sm text-muted-foreground">
                                        Signed in as {username}
                                        {githubUsername && ` — GitHub account @${githubUsername}`}
                                    </p>
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

                        <h2 className="text-base font-semibold">
                            Resources on your GitHub account{githubUsername ? ` (@${githubUsername})` : ""}
                        </h2>
                        <div className="mt-4 flex items-start gap-3 rounded-lg border border-border/70 p-4">
                            <Mail className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium">Email addresses (read)</p>
                                <p className="text-sm text-muted-foreground">Used to match identities and send secure notifications.</p>
                            </div>
                        </div>
                    </div>

                    {githubConnected && githubUsername && (
                        <div className="mt-5 rounded-lg sm:rounded-xl border border-border/70 bg-background/80 p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-900">
                                        <Github className="h-5 w-5 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Connected GitHub account</p>
                                        <p className="text-sm text-muted-foreground">@{githubUsername}</p>
                                    </div>
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Connected
                                </span>
                            </div>

                            {editError && (
                                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                                    {editError}
                                </div>
                            )}

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 sm:w-auto"
                                    onClick={handleSwitchAccount}
                                    disabled={isSwitching || isDisconnecting}
                                >
                                    {isSwitching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    Switch account
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 text-destructive-foreground hover:bg-destructive/10 sm:w-auto"
                                    onClick={handleDisconnect}
                                    disabled={isSwitching || isDisconnecting}
                                >
                                    {isDisconnecting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Unlink className="h-4 w-4" />
                                    )}
                                    Disconnect
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-5 sm:mt-6 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:justify-end">
                        <Link href="/dashboard">
                            <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                        </Link>
                        <AuthorizeGithubButton size="lg" forceAuthorize className="w-full sm:w-auto" />
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
