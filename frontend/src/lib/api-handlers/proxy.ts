import { NextResponse } from "next/server"

/**
 * Proxies a request to the Render backend, forwarding cookies and query params.
 * Used by Next.js API routes that previously imported @backend/* directly.
 *
 * @param request - The incoming Next.js Request
 * @param backendPath - The backend API path (e.g. "/api/dashboard")
 * @param method - HTTP method override (defaults to request.method)
 * @param body - Optional body for POST/PUT requests
 */
export async function proxyToBackend(
    request: Request,
    backendPath: string,
    method?: string,
    body?: unknown,
): Promise<NextResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

    // Forward query string
    const url = new URL(request.url)
    const queryString = url.search || ""

    // Forward cookies (for JWT auth)
    const cookieHeader = request.headers.get("cookie") || ""

    const fetchMethod = method || request.method

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }
    if (cookieHeader) {
        headers["cookie"] = cookieHeader
    }

    const fetchOptions: RequestInit = {
        method: fetchMethod,
        headers,
        credentials: "include",
    }

    if (body !== undefined && (fetchMethod === "POST" || fetchMethod === "PUT" || fetchMethod === "PATCH")) {
        fetchOptions.body = JSON.stringify(body)
    }

    try {
        const response = await fetch(`${apiUrl}${backendPath}${queryString}`, fetchOptions)

        const data = await response.json().catch(() => ({}))

        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error(`Proxy error for ${backendPath}:`, error)
        return NextResponse.json(
            {
                error: "Failed to reach backend",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 502 },
        )
    }
}
