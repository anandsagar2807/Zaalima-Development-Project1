"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { useAuthStore } from "@/store/authStore"
import { cleanupAuthData } from "@/lib/auth-cleanup"

/**
 * ClerkSignOutListener coordinates Clerk's sign-out with the Zustand auth store.
 *
 * When Clerk's <UserButton afterSignOutUrl="/" /> triggers a sign-out, Clerk handles
 * its own session cleanup but does NOT clear the Zustand persisted store or other
 * browser storage. This component detects the transition from signed-in to signed-out
 * and performs comprehensive cleanup.
 *
 * Must be rendered inside <ClerkProvider>.
 */
export function ClerkSignOutListener() {
    const { isSignedIn } = useAuth()
    const wasSignedIn = useRef(isSignedIn)
    const isCleaningUp = useRef(false)

    useEffect(() => {
        // Detect transition: was signed in, now signed out
        if (wasSignedIn.current && !isSignedIn && !isCleaningUp.current) {
            isCleaningUp.current = true

            const performCleanup = async () => {
                try {
                    // 1. Call Express backend to clear JWT token cookie on the backend domain
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
                    await fetch(`${API_URL}/api/auth/logout`, {
                        method: "POST",
                        credentials: "include",
                    }).catch(() => {
                        // Backend may be unreachable; continue with local cleanup
                    })

                    // 2. Reset Zustand store state
                    useAuthStore.setState({
                        user: null,
                        githubProfile: null,
                        authenticated: false,
                        githubConnected: false,
                        loading: false,
                    })

                    // 3. Clear all persisted auth data from browser storage
                    await cleanupAuthData()
                } catch (error) {
                    console.error("ClerkSignOutListener cleanup error:", error)
                    // Still try to clear local data even if something failed
                    cleanupAuthData()
                } finally {
                    isCleaningUp.current = false
                }
            }

            performCleanup()
        }

        // Update the ref for next comparison
        wasSignedIn.current = isSignedIn
    }, [isSignedIn])

    // This component renders nothing — it's a side-effect listener only
    return null
}
