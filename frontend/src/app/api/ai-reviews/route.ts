import { NextResponse } from "next/server"
import { listReviewHistory } from "@backend/services/database.service"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const prId = searchParams.get("prId")

        const reviews = await listReviewHistory()

        if (prId && reviews) {
            const filtered = reviews.filter((r) => String(r.prId) === prId)
            return NextResponse.json({ reviews: filtered })
        }

        return NextResponse.json({ reviews })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load AI reviews",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const { id, status } = (await request.json()) as { id: string; status: string }

        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
        }

        // Map frontend status to review status
        const statusMap: Record<string, string> = {
            applied: "applied",
            dismissed: "dismissed",
            pending: "pending",
        }
        const reviewStatus = statusMap[status]
        if (!reviewStatus) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        // Use the database pool directly to update the review status
        const { Pool } = await import("pg")
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ review: null })
        }

        const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
        try {
            await pool.query(
                `UPDATE reviews SET status = $1, updated_at = NOW() WHERE id = $2`,
                [reviewStatus, Number(id)]
            )
        } finally {
            await pool.end()
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to update review",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
