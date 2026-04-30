import { NextResponse } from "next/server"
import { getSystemSettings, updateSystemSettings, type StoredSettings } from "@backend/services/database.service"

export async function GET() {
    try {
        const settings = await getSystemSettings()
        return NextResponse.json({ settings })
    } catch (error) {
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
        return NextResponse.json(
            {
                error: "Failed to update settings",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}