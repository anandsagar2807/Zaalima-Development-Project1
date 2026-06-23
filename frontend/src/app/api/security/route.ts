import { NextResponse } from "next/server"
import { getSecurityIssues, updateSecurityIssueStatus } from "@backend/services/dashboard.service"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filters: { severity?: string; repo?: string } = {}

        const severity = searchParams.get("severity")
        if (severity) filters.severity = severity

        const repo = searchParams.get("repo")
        if (repo) filters.repo = repo

        const issues = await getSecurityIssues(filters)

        if (issues === null) {
            return NextResponse.json({ issues: null })
        }

        return NextResponse.json({ issues })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load security issues",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const { id, status } = (await request.json()) as { id: string; status: "fixed" | "ignored" }

        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
        }

        const ok = await updateSecurityIssueStatus(id, status)

        if (!ok) {
            return NextResponse.json({ issue: null })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to update security issue",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
