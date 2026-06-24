import { proxyToBackend } from "@/lib/api-handlers/proxy"

export async function GET(request: Request) {
    return proxyToBackend(request, "/api/reviews/history")
}
