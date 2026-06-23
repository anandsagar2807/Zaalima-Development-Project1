import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

/**
 * Comprehensive sign-out handler for the Next.js API route.
 * Clears Clerk session, all auth cookies, and adds cache-control headers
 * to prevent back-navigation to protected pages after logout.
 */
export async function handleSignOut(request: Request) {
    try {
        // Attempt to invalidate Clerk session server-side
        const { sessionId } = await auth()

        // Build redirect URL to home page
        const signOutUrl = new URL("/", request.url)
        const response = NextResponse.redirect(signOutUrl)

        // 1. Clear Clerk session cookie explicitly
        response.cookies.set("__session", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        })

        // 2. Clear Clerk client UAT cookie
        response.cookies.set("__client_uat", "", {
            maxAge: 0,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        })

        // 3. Clear all custom GitGuard cookies
        response.cookies.delete("gitguard_github_connected")
        response.cookies.delete("gitguard_github_login")
        response.cookies.delete("gitguard_github_oauth_state")

        // 4. Clear Express backend JWT token cookie
        // This cookie may be set on a different domain (localhost:4000),
        // but we clear it here too in case it's accessible
        response.cookies.set("token", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        })

        // 5. Clear GitHub OAuth state cookie
        response.cookies.set("github_oauth_state", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        })

        // 6. Add cache-control headers to prevent browser from caching
        // protected pages, which would allow back-navigation after logout
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")

        return response
    } catch (error) {
        console.error("Sign-out error:", error)

        // Even on error, attempt to clear cookies and redirect
        const signOutUrl = new URL("/", request.url)
        const response = NextResponse.redirect(signOutUrl)

        // Clear all auth cookies even on error
        response.cookies.set("__session", "", { maxAge: 0, httpOnly: true, path: "/" })
        response.cookies.set("__client_uat", "", { maxAge: 0, path: "/" })
        response.cookies.set("token", "", { maxAge: 0, httpOnly: true, path: "/" })
        response.cookies.delete("gitguard_github_connected")
        response.cookies.delete("gitguard_github_login")
        response.cookies.delete("gitguard_github_oauth_state")
        response.cookies.set("github_oauth_state", "", { maxAge: 0, httpOnly: true, path: "/" })

        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")

        return response
    }
}
