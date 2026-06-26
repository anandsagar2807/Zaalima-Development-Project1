import { proxyToBackend } from "@/lib/api-handlers/proxy"

/**
 * POST /api/github/sync
 * Proxies to the backend /api/github/sync which refreshes the user's GitHub
 * profile data from the GitHub API and updates the stored profile.
 */
export async function POST(request: Request) {
    return proxyToBackend(request, "/api/github/sync", "POST")
}
