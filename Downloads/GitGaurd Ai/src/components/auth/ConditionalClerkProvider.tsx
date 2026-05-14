"use client"

import { ReactNode, useMemo } from "react"
import { ClerkProvider } from "@clerk/nextjs"

/**
 * Conditionally wraps children with ClerkProvider only when a valid
 * Clerk publishable key is configured. This prevents the app from
 * crashing when Clerk keys are not set up yet.
 *
 * A valid key must start with "pk_test_" or "pk_live_".
 */
export function ConditionalClerkProvider({ children }: { children: ReactNode }) {
    const hasValidClerkKey = useMemo(() => {
        const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        return !!key && (key.startsWith("pk_test_") || key.startsWith("pk_live_"))
    }, [])

    if (!hasValidClerkKey) {
        return <>{children}</>
    }

    return <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>
}
