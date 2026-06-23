import { NextResponse } from "next/server"
import { getWebhookLogs } from "@backend/services/dashboard.service"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filters: { status?: string } = {}

        const status = searchParams.get("status")
        if (status) filters.status = status

        const logs = await getWebhookLogs(filters)

        if (logs === null) {
            return NextResponse.json({ logs: null })
        }

        return NextResponse.json({ logs })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load webhook logs",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
