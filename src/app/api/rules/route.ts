import { NextResponse } from "next/server"
import { getRules, updateRules } from "@backend/services/dashboard.service"

export async function GET() {
    try {
        const rules = await getRules()

        if (rules === null) {
            return NextResponse.json({ rules: null })
        }

        return NextResponse.json({ rules })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load rules",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const payload = (await request.json()) as Record<string, unknown>

        // Toggle a single rule
        if (typeof payload.ruleId === "string") {
            const rules = await getRules()
            if (!rules) {
                return NextResponse.json({ rules: null })
            }
            const updated = rules.map((r) =>
                r.id === payload.ruleId ? { ...r, enabled: !r.enabled } : r
            )
            await updateRules(updated)
            return NextResponse.json({ rules: updated })
        }

        // Apply all rules globally
        if (typeof payload.enabled === "boolean") {
            const rules = await getRules()
            if (!rules) {
                return NextResponse.json({ rules: null })
            }
            const updated = rules.map((r) => ({ ...r, enabled: payload.enabled as boolean }))
            await updateRules(updated)
            return NextResponse.json({ rules: updated })
        }

        return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to update rules",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
