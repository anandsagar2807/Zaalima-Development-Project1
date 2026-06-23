import { NextResponse } from "next/server"
import { getSystemSettings, updateSystemSettings, type StoredSettings } from "@backend/services/database.service"

function isDatabaseError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : "Unknown error"
    return (
        message.includes("DATABASE_URL") ||
        message.includes("ECONNREFUSED") ||
        message.includes("relation") ||
        message.includes("database") ||
        message.includes("connect")
    )
}

export async function GET() {
    try {
        const settings = await getSystemSettings()
        return NextResponse.json({ settings })
    } catch (error) {
        // Graceful fallback: return null settings when database is not configured
        if (isDatabaseError(error)) {
            return NextResponse.json({ settings: null })
        }
        return NextResponse.json(
            {
                error: "Failed to load settings",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const payload = (await request.json()) as Record<string, unknown>
        const updates: Partial<StoredSettings> = {}

        if (typeof payload.severityThreshold === "string") updates.severityThreshold = payload.severityThreshold
        if (typeof payload.autoComments === "boolean") updates.autoComments = payload.autoComments
        if (typeof payload.autoFixes === "boolean") updates.autoFixes = payload.autoFixes
        if (typeof payload.llmTemperature === "number") updates.llmTemperature = payload.llmTemperature
        if (typeof payload.maxDiffSize === "number") updates.maxDiffSize = payload.maxDiffSize
        if (typeof payload.reviewDelay === "number") updates.reviewDelay = payload.reviewDelay

        const settings = await updateSystemSettings(updates)

        return NextResponse.json({ settings })
    } catch (error) {
        // Graceful fallback: return null settings when database is not configured
        if (isDatabaseError(error)) {
            return NextResponse.json({ settings: null })
        }
        return NextResponse.json(
            {
                error: "Failed to update settings",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}