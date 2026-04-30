import { NextResponse } from "next/server"
import { listReviewHistory } from "@backend/services/database.service"

export async function GET() {
    try {
        const reviews = await listReviewHistory()
        return NextResponse.json({ reviews })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load review history",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}