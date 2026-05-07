import { NextResponse } from "next/server"
import { getDashboardSummary } from "@backend/services/dashboard.service"

export async function GET(request: Request) {
    try {
        // Mock user ID for now (in production, get from auth session)
        const userId = 1

        const summary = await getDashboardSummary(userId)

        return NextResponse.json({ summary })
    } catch (error) {
        console.error('Dashboard API error:', error)
        return NextResponse.json(
            {
                error: "Failed to fetch dashboard summary",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
