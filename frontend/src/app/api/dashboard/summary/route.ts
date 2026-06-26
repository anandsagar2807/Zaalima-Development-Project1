import { proxyToBackend } from "@/lib/api-handlers/proxy"

/**
 * GET /api/dashboard/summary
 * Proxies to the backend /api/dashboard/summary which returns the full
 * dashboard data (analytics, pull requests, security issues, etc.) as
 * { summary: {...} }. Used by dashboardStore.fetchDashboardSummary().
 */
export async function GET(request: Request) {
    return proxyToBackend(request, "/api/dashboard/summary")
}
