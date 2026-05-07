import { NextResponse } from "next/server"
import { toggleRepositoryField, enableAllRepositories } from "@backend/services/dashboard.service"

export async function PUT(request: Request) {
    try {
        const payload = (await request.json()) as Record<string, unknown>

        // Toggle a specific field on a repository
        if (typeof payload.id === "string" && typeof payload.field === "string") {
            const validFields = ["status", "strict_mode", "security_scan", "ignore_styling", "auto_fix"] as const
            const field = payload.field as string

            if (!validFields.includes(field as (typeof validFields)[number])) {
                return NextResponse.json({ error: "Invalid field" }, { status: 400 })
            }

            const ok = await toggleRepositoryField(payload.id, field as (typeof validFields)[number])

            if (!ok) {
                return NextResponse.json({ repository: null })
            }

            return NextResponse.json({ success: true })
        }

        // Enable all repositories
        if (payload.action === "enableAll") {
            const ok = await enableAllRepositories()
            if (!ok) {
                return NextResponse.json({ repositories: null })
            }
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to update repository",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
