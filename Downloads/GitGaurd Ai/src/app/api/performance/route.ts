import { NextResponse } from "next/server"
import { getPerformanceIssues } from "@backend/services/dashboard.service"

export async function GET() {
    try {
        const issues = await getPerformanceIssues()

        if (issues === null) {
            return NextResponse.json({ issues: null })
        }

        return NextResponse.json({ issues })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load performance issues",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
