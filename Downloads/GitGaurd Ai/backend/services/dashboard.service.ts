// Dashboard data service – aggregates data from PostgreSQL for the frontend dashboard.
// Falls back to returning null when the database is not configured.

import { Pool } from "pg"
import { getPool } from "../config/database"

// ── Types ────────────────────────────────────────────────────────────────────

export interface DashboardAnalytics {
    totalPRs: number
    issuesDetected: number
    securityWarnings: number
    performanceWarnings: number
    avgResponseTime: number
    autoFixes: number
}

export interface DashboardPullRequest {
    id: string
    title: string
    repository: string
    status: "open" | "merged" | "closed" | "pending"
    issuesFound: number
    severity: "critical" | "high" | "medium" | "low"
    reviewedAt: string
    author: string
    branch: string
    hasAutoFix: boolean
    type: "security" | "performance" | "bug" | "style"
}

export interface DashboardSecurityIssue {
    id: string
    type: "vulnerability" | "secret" | "dependency" | "token" | "sql-injection" | "xss"
    severity: "critical" | "high" | "medium" | "low"
    title: string
    description: string
    repository: string
    prNumber: string
    detectedAt: string
    status: "open" | "fixed" | "ignored"
}

export interface DashboardPerformanceIssue {
    id: string
    type: "slow-loop" | "memory" | "api-call" | "query"
    title: string
    description: string
    repository: string
    prNumber: string
    impact: "high" | "medium" | "low"
    performanceScore: number
    detectedAt: string
}

export interface DashboardWebhookLog {
    id: string
    event: string
    status: "success" | "pending" | "failed"
    repository: string
    prNumber: string
    timestamp: string
    duration: string
    details: string
}

export interface DashboardRule {
    id: string
    name: string
    description: string
    enabled: boolean
    category: "bug" | "security" | "performance" | "style" | "best-practice"
}

export interface PRsPerDayEntry { day: string; prs: number; issues: number }
export interface SeverityEntry { name: string; value: number; color: string }
export interface CategoryEntry { name: string; value: number }

// ── Pool ─────────────────────────────────────────────────────────────────────

// Re-export getPool from config/database for shared pool usage
// The local getPool() returns Pool | null (null when DATABASE_URL is not configured)

// ── Helpers ──────────────────────────────────────────────────────────────────

function toRelativeTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date
    const diffMs = Date.now() - d.getTime()
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)))
    if (mins < 60) return `${mins} minutes ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} days ago`
    return d.toLocaleDateString()
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

function worstSeverity(severities: string[]): "critical" | "high" | "medium" | "low" {
    let worst: "critical" | "high" | "medium" | "low" = "low"
    let worstRank = 3
    for (const s of severities) {
        const rank = SEVERITY_ORDER[s] ?? 3
        if (rank < worstRank) {
            worstRank = rank
            worst = s as "critical" | "high" | "medium" | "low"
        }
    }
    return worst
}

function issueTypeToCategory(t: string): "security" | "performance" | "bug" | "style" {
    if (t === "security") return "security"
    if (t === "performance") return "performance"
    if (t === "style") return "style"
    return "bug"
}

function securitySubType(t: string): DashboardSecurityIssue["type"] {
    const map: Record<string, DashboardSecurityIssue["type"]> = {
        "sql-injection": "sql-injection",
        sql_injection: "sql-injection",
        xss: "xss",
        secret: "secret",
        token: "token",
        dependency: "dependency",
        vulnerability: "vulnerability",
    }
    return map[t] ?? "vulnerability"
}

function perfSubType(t: string): DashboardPerformanceIssue["type"] {
    const map: Record<string, DashboardPerformanceIssue["type"]> = {
        "slow-loop": "slow-loop",
        slow_loop: "slow-loop",
        memory: "memory",
        "api-call": "api-call",
        api_call: "api-call",
        query: "query",
    }
    return map[t] ?? "query"
}

// ── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<DashboardAnalytics | null> {
    const p = getPool()
    if (!p) return null

    try {
        const [prCount, reviewCount, secCount, perfCount, fixCount, avgTime] = await Promise.all([
            p.query("SELECT COUNT(*)::int AS cnt FROM pull_requests"),
            p.query("SELECT COUNT(*)::int AS cnt FROM reviews"),
            p.query("SELECT COUNT(*)::int AS cnt FROM reviews WHERE issue_type = 'security'"),
            p.query("SELECT COUNT(*)::int AS cnt FROM reviews WHERE issue_type = 'performance'"),
            p.query("SELECT COUNT(*)::int AS cnt FROM reviews WHERE status = 'applied'"),
            p.query(`
                SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (reviewed_at - opened_at))), 0)::numeric(10,1) AS avg_sec
                FROM pull_requests
                WHERE reviewed_at IS NOT NULL AND opened_at IS NOT NULL
            `),
        ])

        return {
            totalPRs: prCount.rows[0]?.cnt ?? 0,
            issuesDetected: reviewCount.rows[0]?.cnt ?? 0,
            securityWarnings: secCount.rows[0]?.cnt ?? 0,
            performanceWarnings: perfCount.rows[0]?.cnt ?? 0,
            avgResponseTime: Number(avgTime.rows[0]?.avg_sec ?? 0),
            autoFixes: fixCount.rows[0]?.cnt ?? 0,
        }
    } catch {
        return null
    }
}

// ── Chart data ───────────────────────────────────────────────────────────────

export async function getPRsPerDayData(): Promise<PRsPerDayEntry[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        const result = await p.query(`
            SELECT
                TO_CHAR(DATE(created_at), 'Dy') AS day,
                COUNT(DISTINCT pull_request_id)::int AS prs,
                COUNT(*)::int AS issues
            FROM reviews
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
        `)
        return result.rows.map((r) => ({
            day: r.day,
            prs: r.prs,
            issues: r.issues,
        }))
    } catch {
        return null
    }
}

export async function getIssuesBySeverity(): Promise<SeverityEntry[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        const result = await p.query(`
            SELECT severity, COUNT(*)::int AS value
            FROM reviews
            GROUP BY severity
            ORDER BY ARRAY_POSITION(ARRAY['critical','high','medium','low'], severity)
        `)
        const colorMap: Record<string, string> = {
            critical: "#ef4444",
            high: "#f97316",
            medium: "#eab308",
            low: "#22c55e",
        }
        return result.rows.map((r) => ({
            name: r.severity.charAt(0).toUpperCase() + r.severity.slice(1),
            value: r.value,
            color: colorMap[r.severity] ?? "#6b7280",
        }))
    } catch {
        return null
    }
}

export async function getSecurityVsBugData(): Promise<CategoryEntry[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        const result = await p.query(`
            SELECT issue_type AS name, COUNT(*)::int AS value
            FROM reviews
            GROUP BY issue_type
            ORDER BY value DESC
        `)
        return result.rows.map((r) => ({
            name: r.name.charAt(0).toUpperCase() + r.name.slice(1),
            value: r.value,
        }))
    } catch {
        return null
    }
}

// ── Pull Requests ────────────────────────────────────────────────────────────

export async function getPullRequests(filters?: {
    severity?: string
    type?: string
    autofix?: boolean
}): Promise<DashboardPullRequest[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        let sql = `
            SELECT
                pr.id,
                pr.title,
                pr.state,
                pr.branch,
                pr.author,
                pr.reviewed_at,
                pr.html_url,
                r.name AS repo_name,
                COALESCE(issues.cnt, 0)::int AS issues_found,
                COALESCE(issues.has_fix, FALSE) AS has_auto_fix,
                COALESCE(issues.worst_sev, 'low') AS worst_severity,
                COALESCE(issues.main_type, 'bug') AS main_type
            FROM pull_requests pr
            JOIN repositories r ON r.id = pr.repository_id
            LEFT JOIN LATERAL (
                SELECT
                    COUNT(*)::int AS cnt,
                    BOOL_OR(status = 'applied') AS has_fix,
                    MIN(array_position(ARRAY['critical','high','medium','low'], severity)) AS sev_rank,
                    CASE WHEN MIN(array_position(ARRAY['critical','high','medium','low'], severity)) = 0 THEN 'critical'
                         WHEN MIN(array_position(ARRAY['critical','high','medium','low'], severity)) = 1 THEN 'high'
                         WHEN MIN(array_position(ARRAY['critical','high','medium','low'], severity)) = 2 THEN 'medium'
                         ELSE 'low' END AS worst_sev,
                    MODE() WITHIN GROUP (ORDER BY issue_type) AS main_type
                FROM reviews rv WHERE rv.pull_request_id = pr.id
            ) issues ON TRUE
            WHERE 1=1
        `
        const params: unknown[] = []
        let paramIdx = 1

        if (filters?.severity) {
            sql += ` AND issues.worst_sev = $${paramIdx++}`
            params.push(filters.severity)
        }
        if (filters?.type) {
            sql += ` AND issues.main_type = $${paramIdx++}`
            params.push(filters.type)
        }

        sql += ` ORDER BY pr.reviewed_at DESC NULLS LAST, pr.opened_at DESC LIMIT 100`

        const result = await p.query(sql, params)

        return result.rows.map((row) => ({
            id: String(row.id),
            title: row.title,
            repository: row.repo_name,
            status: row.state === "open" ? "open" : row.state === "closed" ? "closed" : (row.state as "open" | "merged" | "closed" | "pending"),
            issuesFound: row.issues_found,
            severity: row.worst_severity,
            reviewedAt: row.reviewed_at ? toRelativeTime(row.reviewed_at) : "Not reviewed",
            author: row.author ?? "unknown",
            branch: row.branch ?? "",
            hasAutoFix: row.has_auto_fix,
            type: issueTypeToCategory(row.main_type),
        }))
    } catch {
        return null
    }
}

// ── Security Issues ──────────────────────────────────────────────────────────

export async function getSecurityIssues(filters?: {
    severity?: string
    repo?: string
}): Promise<DashboardSecurityIssue[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        let sql = `
            SELECT
                rv.id,
                rv.issue_type,
                rv.severity,
                rv.title,
                rv.description,
                rv.status,
                rv.created_at,
                r.name AS repo_name,
                pr.github_pull_number
            FROM reviews rv
            JOIN pull_requests pr ON pr.id = rv.pull_request_id
            JOIN repositories r ON r.id = pr.repository_id
            WHERE rv.issue_type = 'security'
        `
        const params: unknown[] = []
        let paramIdx = 1

        if (filters?.severity) {
            sql += ` AND rv.severity = $${paramIdx++}`
            params.push(filters.severity)
        }
        if (filters?.repo) {
            sql += ` AND r.name = $${paramIdx++}`
            params.push(filters.repo)
        }

        sql += ` ORDER BY rv.created_at DESC LIMIT 100`

        const result = await p.query(sql, params)

        return result.rows.map((row) => ({
            id: String(row.id),
            type: securitySubType(row.issue_type),
            severity: row.severity,
            title: row.title ?? `${row.issue_type} issue detected`,
            description: row.description,
            repository: row.repo_name,
            prNumber: `#${row.github_pull_number}`,
            detectedAt: toRelativeTime(row.created_at),
            status: row.status === "applied" ? "fixed" : (row.status as "open" | "fixed" | "ignored"),
        }))
    } catch {
        return null
    }
}

export async function updateSecurityIssueStatus(
    id: string,
    status: "fixed" | "ignored"
): Promise<boolean> {
    const p = getPool()
    if (!p) return false

    try {
        const reviewStatus = status === "fixed" ? "applied" : "dismissed"
        await p.query(`UPDATE reviews SET status = $1, updated_at = NOW() WHERE id = $2`, [
            reviewStatus,
            Number(id),
        ])
        return true
    } catch {
        return false
    }
}

// ── Performance Issues ───────────────────────────────────────────────────────

export async function getPerformanceIssues(): Promise<DashboardPerformanceIssue[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        const result = await p.query(`
            SELECT
                rv.id,
                rv.issue_type,
                rv.severity,
                rv.title,
                rv.description,
                rv.created_at,
                r.name AS repo_name,
                pr.github_pull_number
            FROM reviews rv
            JOIN pull_requests pr ON pr.id = rv.pull_request_id
            JOIN repositories r ON r.id = pr.repository_id
            WHERE rv.issue_type = 'performance'
            ORDER BY rv.created_at DESC
            LIMIT 100
        `)

        return result.rows.map((row) => ({
            id: String(row.id),
            type: perfSubType(row.issue_type),
            title: row.title ?? `${row.issue_type} issue detected`,
            description: row.description,
            repository: row.repo_name,
            prNumber: `#${row.github_pull_number}`,
            impact: (row.severity === "critical" || row.severity === "high"
                ? "high"
                : row.severity === "medium"
                    ? "medium"
                    : "low") as "high" | "medium" | "low",
            performanceScore: Math.max(0, 100 - (SEVERITY_ORDER[row.severity] ?? 2) * 20),
            detectedAt: toRelativeTime(row.created_at),
        }))
    } catch {
        return null
    }
}

// ── Webhook Logs ─────────────────────────────────────────────────────────────

export async function getWebhookLogs(filters?: {
    status?: string
}): Promise<DashboardWebhookLog[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        let sql = `
            SELECT
                l.id,
                l.event,
                l.status,
                l.message,
                l.duration_ms,
                l.created_at,
                r.name AS repo_name,
                pr.github_pull_number
            FROM logs l
            LEFT JOIN repositories r ON r.id = l.repository_id
            LEFT JOIN pull_requests pr ON pr.id = l.pull_request_id
            WHERE 1=1
        `
        const params: unknown[] = []
        let paramIdx = 1

        if (filters?.status) {
            sql += ` AND l.status = $${paramIdx++}`
            params.push(filters.status)
        }

        sql += ` ORDER BY l.created_at DESC LIMIT 50`

        const result = await p.query(sql, params)

        return result.rows.map((row) => ({
            id: String(row.id),
            event: row.event ?? "pull_request.opened",
            status: (row.status ?? "success") as "success" | "pending" | "failed",
            repository: row.repo_name ?? "unknown",
            prNumber: row.github_pull_number ? `#${row.github_pull_number}` : "#0",
            timestamp: toRelativeTime(row.created_at),
            duration: row.duration_ms ? `${(row.duration_ms / 1000).toFixed(1)}s` : "-",
            details: row.message ?? "",
        }))
    } catch {
        return null
    }
}

// ── Rules ────────────────────────────────────────────────────────────────────

const DEFAULT_RULES: DashboardRule[] = [
    { id: "1", name: "Bug Detection", description: "Automatically detect potential bugs and logic errors", enabled: true, category: "bug" },
    { id: "2", name: "Security Scanner", description: "Scan for security vulnerabilities and exposed secrets", enabled: true, category: "security" },
    { id: "3", name: "Performance Analysis", description: "Identify performance bottlenecks and optimization opportunities", enabled: true, category: "performance" },
    { id: "4", name: "Best Practices", description: "Enforce coding best practices and design patterns", enabled: true, category: "best-practice" },
    { id: "5", name: "Code Style", description: "Check for consistent code formatting and style", enabled: false, category: "style" },
    { id: "6", name: "Strict Review Mode", description: "Enable more thorough analysis with stricter rules", enabled: true, category: "security" },
    { id: "7", name: "Auto Suggest Fixes", description: "Automatically generate fix suggestions for detected issues", enabled: true, category: "bug" },
]

export async function getRules(): Promise<DashboardRule[] | null> {
    const p = getPool()
    if (!p) return null

    try {
        const result = await p.query(`SELECT rules FROM settings WHERE user_id = 0 LIMIT 1`)
        if (result.rows.length > 0 && Array.isArray(result.rows[0].rules)) {
            return result.rows[0].rules as DashboardRule[]
        }
        return DEFAULT_RULES
    } catch {
        return DEFAULT_RULES
    }
}

export async function updateRules(rules: DashboardRule[]): Promise<boolean> {
    const p = getPool()
    if (!p) return false

    try {
        await p.query(
            `UPDATE settings SET rules = $1::jsonb, updated_at = NOW() WHERE user_id = 0`,
            [JSON.stringify(rules)]
        )
        return true
    } catch {
        return false
    }
}

// ── Repository toggles ──────────────────────────────────────────────────────

export async function toggleRepositoryField(
    repoId: string,
    field: "status" | "strict_mode" | "security_scan" | "ignore_styling" | "auto_fix"
): Promise<boolean> {
    const p = getPool()
    if (!p) return false

    try {
        if (field === "status") {
            await p.query(
                `UPDATE repositories SET status = CASE WHEN status = 'active' THEN 'paused' ELSE 'active' END, updated_at = NOW() WHERE id = $1`,
                [Number(repoId)]
            )
        } else {
            await p.query(
                `UPDATE repositories SET ${field} = NOT ${field}, updated_at = NOW() WHERE id = $1`,
                [Number(repoId)]
            )
        }
        return true
    } catch {
        return false
    }
}

export async function enableAllRepositories(): Promise<boolean> {
    const p = getPool()
    if (!p) return false

    try {
        await p.query(`UPDATE repositories SET status = 'active', updated_at = NOW()`)
        return true
    } catch {
        return false
    }
}

// ── Dashboard Summary ────────────────────────────────────────────────────────

export interface DashboardSummary {
    analytics: DashboardAnalytics
    pullRequests: DashboardPullRequest[]
    securityIssues: DashboardSecurityIssue[]
    performanceIssues: DashboardPerformanceIssue[]
    webhookLogs: DashboardWebhookLog[]
    rules: DashboardRule[]
    chartData: {
        prsPerDay: PRsPerDayEntry[]
        issuesBySeverity: SeverityEntry[]
        securityVsBug: CategoryEntry[]
    }
}

// Mock data for when database is not available
function getMockDashboardSummary(): DashboardSummary {
    return {
        analytics: {
            totalPRs: 24,
            issuesDetected: 156,
            securityWarnings: 12,
            performanceWarnings: 8,
            avgResponseTime: 45,
            autoFixes: 89,
        },
        pullRequests: [
            {
                id: "1",
                title: "Add user authentication system",
                repository: "frontend-app",
                status: "open",
                issuesFound: 3,
                severity: "high",
                reviewedAt: "2 hours ago",
                author: "john-doe",
                branch: "feature/auth",
                hasAutoFix: true,
                type: "security",
            },
            {
                id: "2",
                title: "Optimize database queries",
                repository: "backend-api",
                status: "merged",
                issuesFound: 2,
                severity: "medium",
                reviewedAt: "5 hours ago",
                author: "jane-smith",
                branch: "perf/db-optimization",
                hasAutoFix: false,
                type: "performance",
            },
        ],
        securityIssues: [
            {
                id: "1",
                type: "sql-injection",
                severity: "critical",
                title: "SQL Injection vulnerability in user query",
                description: "User input is directly concatenated into SQL query without sanitization",
                repository: "backend-api",
                prNumber: "#123",
                detectedAt: "1 hour ago",
                status: "open",
            },
        ],
        performanceIssues: [
            {
                id: "1",
                type: "slow-loop",
                title: "Inefficient loop in data processing",
                description: "O(n²) complexity detected in user data processing",
                repository: "backend-api",
                prNumber: "#124",
                impact: "high",
                performanceScore: 65,
                detectedAt: "3 hours ago",
            },
        ],
        webhookLogs: [
            {
                id: "1",
                event: "pull_request.opened",
                status: "success",
                repository: "frontend-app",
                prNumber: "#125",
                timestamp: "10 minutes ago",
                duration: "2.3s",
                details: "Review completed successfully",
            },
        ],
        rules: DEFAULT_RULES,
        chartData: {
            prsPerDay: [
                { day: "Mon", prs: 4, issues: 12 },
                { day: "Tue", prs: 6, issues: 18 },
                { day: "Wed", prs: 3, issues: 9 },
                { day: "Thu", prs: 5, issues: 15 },
                { day: "Fri", prs: 4, issues: 11 },
                { day: "Sat", prs: 1, issues: 3 },
                { day: "Sun", prs: 1, issues: 2 },
            ],
            issuesBySeverity: [
                { name: "Critical", value: 12, color: "#ef4444" },
                { name: "High", value: 34, color: "#f97316" },
                { name: "Medium", value: 67, color: "#eab308" },
                { name: "Low", value: 43, color: "#22c55e" },
            ],
            securityVsBug: [
                { name: "Security", value: 45 },
                { name: "Bug", value: 67 },
                { name: "Performance", value: 32 },
                { name: "Style", value: 12 },
            ],
        },
    }
}

export async function getDashboardSummary(userId: number): Promise<DashboardSummary> {
    const p = getPool()

    // If no database connection, return mock data
    if (!p) {
        return getMockDashboardSummary()
    }

    try {
        // Fetch all data in parallel
        const [analytics, pullRequests, securityIssues, performanceIssues, webhookLogs, rules, prsPerDay, issuesBySeverity, securityVsBug] = await Promise.all([
            getAnalytics(),
            getPullRequests(),
            getSecurityIssues(),
            getPerformanceIssues(),
            getWebhookLogs(),
            getRules(),
            getPRsPerDayData(),
            getIssuesBySeverity(),
            getSecurityVsBugData(),
        ])

        // If any critical data is null, fall back to mock data
        if (!analytics || !pullRequests) {
            return getMockDashboardSummary()
        }

        return {
            analytics,
            pullRequests,
            securityIssues: securityIssues || [],
            performanceIssues: performanceIssues || [],
            webhookLogs: webhookLogs || [],
            rules: rules || DEFAULT_RULES,
            chartData: {
                prsPerDay: prsPerDay || [],
                issuesBySeverity: issuesBySeverity || [],
                securityVsBug: securityVsBug || [],
            },
        }
    } catch (error) {
        // On any error, return mock data
        return getMockDashboardSummary()
    }
}
