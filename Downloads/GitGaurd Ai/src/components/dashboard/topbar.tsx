"use client"

import Link from "next/link"
import { Bell, Search, Menu } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { ArrowUpRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface TopBarProps {
    onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
    return (
        <header className="h-14 sm:h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 lg:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search repositories, PRs..."
                        className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-40 sm:w-64 lg:w-80 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs sm:text-sm"
                    />
                </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
                <Link href="/">
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-xs sm:text-sm h-8 sm:h-9">
                        <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Home</span>
                        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
                <ThemeToggle />
                <UserButton afterSignOutUrl="/" />
            </div>
        </header>
    )
}