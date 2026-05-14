import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const hasValidClerkKey =
    !!clerkPublishableKey &&
    (clerkPublishableKey.startsWith("pk_test_") || clerkPublishableKey.startsWith("pk_live_"))

// Dynamic import so we only load Clerk when a valid key is present
async function getClerkMiddleware() {
    const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server")
    const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])

    return clerkMiddleware(async (auth, req) => {
        if (isProtectedRoute(req)) {
            await auth().protect()
        }

        const response = NextResponse.next()

        if (isProtectedRoute(req)) {
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
            response.headers.set("Pragma", "no-cache")
            response.headers.set("Expires", "0")
            response.headers.set("X-Content-Type-Options", "nosniff")
        }

        return response
    })
}

export async function middleware(req: NextRequest) {
    if (hasValidClerkKey) {
        try {
            const clerkMiddlewareHandler = await getClerkMiddleware()
            // clerkMiddleware returns a handler function that needs to be called
            return await clerkMiddlewareHandler(req, {} as any)
        } catch {
            // Clerk middleware failed — fall through to plain response
        }
    }

    // No valid Clerk key or Clerk failed — just pass through
    const response = NextResponse.next()

    // Still add security headers for dashboard routes
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")
        response.headers.set("X-Content-Type-Options", "nosniff")
    }

    return response
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|map|webp|woff2?|ttf|eot|otf)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
}
