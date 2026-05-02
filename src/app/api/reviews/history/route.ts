import { NextResponse } from "next/server"
import { listReviewHistory } from "@backend/services/database.service"

export async function GET() {
    try {
        const reviews = await listReviewHistory()
        return NextResponse.json({ reviews })
    } catch (error) {
        // Graceful fallback: return null reviews when database is not configured
        // so the frontend can fall back to mock data instead of showing an error
        const message = error instanceof Error ? error.message : "Unknown error"
        const isDbError =
            message.includes("DATABASE_URL") ||
            message.includes("ECONNREFUSED") ||
            message.includes("relation") ||
            message.includes("database")

        if (isDbError) {
            return NextResponse.json({ reviews: null })
        }

        return NextResponse.json(
            {
                error: "Failed to load review history",
                details: message,
            },
            { status: 500 }
        )
    }
}