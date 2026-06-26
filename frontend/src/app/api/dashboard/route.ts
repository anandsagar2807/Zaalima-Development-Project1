import { proxyToBackend } from "@/lib/api-handlers/proxy"

/**
 * GET /api/dashboard
 * Proxies to the backend root /api/dashboard which returns the current
 * authenticated user as { user: {...} }. Used by authStore.checkSession()
 * to verify the JWT cookie session and load user/GitHub data.
 */
export async function GET(request: Request) {
    return proxyToBackend(request, "/api/dashboard")
}
