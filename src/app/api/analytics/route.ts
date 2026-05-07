import { NextResponse } from "next/server"
import {
    getAnalytics,
    getPRsPerDayData,
    getIssuesBySeverity,
    getSecurityVsBugData,
} from "@backend/services/dashboard.service"

export async function GET() {
    try {
        const [analytics, prsPerDay, severity, securityVsBug] = await Promise.all([
            getAnalytics(),
            getPRsPerDayData(),
            getIssuesBySeverity(),
            getSecurityVsBugData(),
        ])

        // Return null for any piece that the database couldn't provide;
        // the frontend will fall back to mock data for those.
        return NextResponse.json({
            analytics,
            prsPerDayData: prsPerDay,
            issuesBySeverity: severity,
            securityVsBugData: securityVsBug,
        })
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load analytics",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
