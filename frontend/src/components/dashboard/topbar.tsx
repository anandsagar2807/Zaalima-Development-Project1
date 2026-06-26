"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Search, Menu, LogOut, User } from "lucide-react"
import { ArrowUpRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/store/authStore"
import { useState, useRef, useEffect } from "react"

interface TopBarProps {
    onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close the dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    const displayName = user?.name || user?.githubUsername || user?.email || "User"
    const avatarUrl = user?.githubAvatar || user?.avatar

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
                        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:h-3.5" />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
                <ThemeToggle />
                {/* User menu — uses backend JWT session (authStore), not Clerk */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-primary/40 transition-all"
                        aria-label="User menu"
                    >
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        )}
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-border">
                                <p className="text-sm font-medium truncate">{displayName}</p>
                                {user?.email && (
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-accent transition-colors text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
