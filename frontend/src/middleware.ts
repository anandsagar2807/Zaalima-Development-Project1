import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
    // Just pass through - we're using JWT auth from backend, not Clerk
    const response = NextResponse.next()

    // Add security headers for dashboard routes
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
