import { NextResponse } from "next/server"
import { getPullRequests } from "@backend/services/dashboard.service"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filters: { severity?: string; type?: string; autofix?: boolean } = {}

        const severity = searchParams.get("severity")
        if (severity) filters.severity = severity

        const type = searchParams.get("type")
        if (type) filters.type = type

        const autofix = searchParams.get("autofix")
        if (autofix !== null) filters.autofix = autofix === "true"

        const pullRequests = await getPullRequests(filters)

        if (pullRequests === null) {
            // Database not configured – return empty so frontend falls back to mock
            return NextResponse.json({ pullRequests: null })
        }

        return NextResponse.json({ pullRequests })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load pull requests",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
