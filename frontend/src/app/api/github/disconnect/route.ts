import { proxyToBackend } from "@/lib/api-handlers/proxy"

/**
 * POST /api/github/disconnect
 * Proxies to the backend /api/github/disconnect which clears the user's
 * GitHub connection data.
 */
export async function POST(request: Request) {
    return proxyToBackend(request, "/api/github/disconnect", "POST")
}
