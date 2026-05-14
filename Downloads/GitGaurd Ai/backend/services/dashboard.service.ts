// Dashboard data service – returns mock data since MongoDB migration is in progress.
// TODO: Implement MongoDB queries for dashboard analytics

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
    // TODO: Implement MongoDB queries
    return null;
}

// ── Chart data ───────────────────────────────────────────────────────────────

export async function getPRsPerDayData(): Promise<PRsPerDayEntry[] | null> {
    // TODO: Implement MongoDB queries
    return null;
}

export async function getIssuesBySeverity(): Promise<SeverityEntry[] | null> {
    // TODO: Implement MongoDB queries
    return null;
}

export async function getSecurityVsBugData(): Promise<CategoryEntry[] | null> {
    // TODO: Implement MongoDB queries
    return null;
}

// ── Pull Requests ────────────────────────────────────────────────────────────

export async function getPullRequests(filters?: {
    severity?: string
    type?: string
    autofix?: boolean
}): Promise<DashboardPullRequest[] | null> {
    // TODO: Implement MongoDB queries
    return null;
}

// ── Security Issues ──────────────────────────────────────────────────────────

export async function getSecurityIssues(filters?: {
    severity?: string
    repo?: string
}): Promise<DashboardSecurityIssue[] | null> {
    // TODO: Implement MongoDB queries
    return null;
}

export async function updateSecurityIssueStatus(
    id: string,
    status: "fixed" | "ignored"
): Promise<boolean> {
    // TODO: Implement MongoDB queries
    return false;
}

// ── Performance Issues ───────────────────────────────────────────────────────

export async function getPerformanceIssues(): Promise<DashboardPerformanceIssue[] | null> {
    // TODO: Implement MongoDB queries
    return null;
}

// ── Webhook Logs ─────────────────────────────────────────────────────────────

export async function getWebhookLogs(filters?: {
    status?: string
}): Promise<DashboardWebhookLog[] | null> {
    // TODO: Implement MongoDB queries
    return null;
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
    // TODO: Implement MongoDB queries
    return DEFAULT_RULES;
}

export async function updateRules(rules: DashboardRule[]): Promise<boolean> {
    // TODO: Implement MongoDB queries
    return false;
}

// ── Repository toggles ──────────────────────────────────────────────────────

export async function toggleRepositoryField(
    repoId: string,
    field: "status" | "strict_mode" | "security_scan" | "ignore_styling" | "auto_fix"
): Promise<boolean> {
    // TODO: Implement MongoDB queries
    return false;
}

export async function enableAllRepositories(): Promise<boolean> {
    // TODO: Implement MongoDB queries
    return false;
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

export async function getDashboardSummary(userId: string | number): Promise<DashboardSummary> {
    // Return mock data since MongoDB migration is in progress
    return getMockDashboardSummary();
}
