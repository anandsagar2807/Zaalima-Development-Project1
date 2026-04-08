"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    GitBranch,
    GitPullRequest,
    Bot,
    Lock,
    Zap,
    Settings as SettingsIcon,
    Webhook,
    FileCode,
    ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Repositories", href: "/dashboard/repositories", icon: GitBranch },
    { name: "Pull Requests", href: "/dashboard/pull-requests", icon: GitPullRequest },
    { name: "AI Reviews", href: "/dashboard/ai-reviews", icon: Bot },
    { name: "Security Center", href: "/dashboard/security", icon: Lock },
    { name: "Performance Insights", href: "/dashboard/performance", icon: Zap },
    { name: "Rule Engine", href: "/dashboard/rules", icon: FileCode },
    { name: "Webhook Logs", href: "/dashboard/webhooks", icon: Webhook },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
]

interface SidebarProps {
    open: boolean
    onToggle: () => void
}

export function Sidebar({ open, onToggle }: SidebarProps) {
    const pathname = usePathname()

    return (
        <motion.aside
            initial={false}
            animate={{ width: open ? 280 : 80 }}
            className="relative h-screen bg-card border-r flex flex-col"
        >
            <div className="flex items-center justify-between p-4 border-b">
                <AnimatePresence mode="wait">
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-lg ring-1 ring-border/60">
                                <Image
                                    src="/owl-logo.png"
                                    alt="GitGuard owl logo"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 object-cover"
                                />
                            </div>
                            <div>
                                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">GitGuard AI</span>
                                <p className="text-xs text-muted-foreground">AI Dashboard</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                    <motion.div
                        animate={{ rotate: open ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </motion.div>
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <AnimatePresence mode="wait">
                                {open && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t">
                <AnimatePresence mode="wait">
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-gradient-to-br from-primary/10 to-amber-400/10 rounded-lg p-4"
                        >
                            <p className="text-sm font-medium">Pro Plan Active</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Unlimited PR reviews
                            </p>
                            <div className="mt-3 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-primary to-amber-500 rounded-full" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                750 / 1000 PRs this month
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
    )
}