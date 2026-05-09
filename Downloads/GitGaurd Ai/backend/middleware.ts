import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])

export const middleware = clerkMiddleware(async (auth, req) => {
    // Protect dashboard routes — require authentication
    if (isProtectedRoute(req)) {
        await auth().protect()
    }

    // Add cache-control headers to all responses for protected routes
    // This prevents the browser from caching protected pages, which would
    // allow back-navigation to see them after sign-out
    const response = NextResponse.next()

    if (isProtectedRoute(req)) {
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")
        response.headers.set("X-Content-Type-Options", "nosniff")
    }

    return response
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|map|webp|woff2?|ttf|eot|otf)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
}
