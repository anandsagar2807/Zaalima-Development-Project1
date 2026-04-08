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
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search repositories, PRs..."
                        className="pl-10 pr-4 py-2 w-64 lg:w-80 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/">
                    <Button variant="outline" size="sm" className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
                        <Home className="h-4 w-4" />
                        <span className="hidden md:inline">Home</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
                <ThemeToggle />
                <UserButton afterSignOutUrl="/" />
            </div>
        </header>
    )
}