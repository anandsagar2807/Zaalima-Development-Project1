"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { UserButton, useAuth } from "@clerk/nextjs"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { ClerkGuard } from "@/components/auth/ClerkGuard"

const navItems = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
]

const dashboardNavItems = [
    { name: "Overview", href: "/dashboard" },
    { name: "Repositories", href: "/dashboard/repositories" },
    { name: "GitHub Connect", href: "/connect-github" },
    { name: "Settings", href: "/dashboard/settings" },
]

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const isDashboardRoute = pathname?.startsWith("/dashboard")
    const activeNavItems = isDashboardRoute ? dashboardNavItems : navItems

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-3 h-16 items-center">
                    <Link href="/" className="flex items-center space-x-2 justify-self-start">
                        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-lg ring-1 ring-border/60">
                            <Image
                                src="/owl-logo.png"
                                alt="GitGuard owl logo"
                                width={40}
                                height={40}
                                className="h-10 w-10 object-cover"
                                priority
                            />
                        </div>
                        <span className="hidden sm:block text-xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">GitGuard AI</span>
                    </Link>

                    <div className="hidden md:flex items-center justify-center gap-6">
                        {activeNavItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 justify-self-end">
                        <ThemeToggle />
                        <div className="hidden md:flex items-center gap-3">
                            <ClerkGuard
                                fallback={
                                    <Link href="/sign-in">
                                        <Button variant="default" size="sm">Sign In</Button>
                                    </Link>
                                }
                            >
                                <ClerkAuthSection />
                            </ClerkGuard>
                        </div>
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t bg-background"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {activeNavItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t">
                                <ClerkGuard
                                    fallback={
                                        <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                                            <Button variant="default" className="w-full">Sign In</Button>
                                        </Link>
                                    }
                                >
                                    <ClerkMobileAuthSection onClose={() => setIsOpen(false)} />
                                </ClerkGuard>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

/** Desktop auth section — uses Clerk hooks, must be inside ClerkProvider */
function ClerkAuthSection() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return (
            <>
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
            </>
        )
    }

    return <SocialAuthButtons size="sm" />
}

/** Mobile auth section — uses Clerk hooks, must be inside ClerkProvider */
function ClerkMobileAuthSection({ onClose }: { onClose: () => void }) {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return (
            <>
                <Link href="/dashboard" onClick={onClose}>
                    <Button variant="ghost" className="w-full gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
                <div className="flex items-center justify-center">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </>
        )
    }

    return <SocialAuthButtons fullWidth />
}
