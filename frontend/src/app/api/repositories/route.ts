import { NextResponse } from "next/server"
import { proxyToBackend } from "@/lib/api-handlers/proxy"

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        return proxyToBackend(request, "/api/repositories", "PUT", body)
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
