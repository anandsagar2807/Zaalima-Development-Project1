// API Service for GitGuard AI Dashboard
// Tries real backend endpoints first, falls back to mock data when unavailable.

import {
    mockRepositories,
    mockPullRequests,
    mockAIReviews,
    mockSecurityIssues,
    mockPerformanceIssues,
    mockWebhookLogs,
    mockRuleSettings,
    mockAnalytics,
    prsPerDayData,
    issuesBySeverity,
    securityVsBugData,
    defaultSettings,
    type Repository,
    type PullRequest,
    type AIReview,
    type SecurityIssue,
    type PerformanceIssue,
    type WebhookLog,
    type RuleSetting,
    type AppSettings,
    type Analytics,
} from "./mockData"

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
        const response = await fetch(url, {
            cache: "no-store",
            ...init,
        })

        if (!response.ok) return null

        return (await response.json()) as T
    } catch {
        return null
    }
}

// In-memory state for optimistic updates (used as fallback when backend is unavailable)
let repositories = [...mockRepositories]
let pullRequests = [...mockPullRequests]
let aiReviews = [...mockAIReviews]
let securityIssues = [...mockSecurityIssues]
let performanceIssues = [...mockPerformanceIssues]
let webhookLogs = [...mockWebhookLogs]
let ruleSettings = [...mockRuleSettings]
let appSettings = { ...defaultSettings }

// Generate new webhook logs periodically
const generateNewWebhook = (): WebhookLog => {
    const events = ["pull_request.opened", "pull_request.synchronize", "pull_request.closed"]
    const statuses: ("success" | "pending" | "failed")[] = ["success", "success", "success", "pending", "failed"]
    const repos = repositories.map((r) => r.name)

    return {
        id: Date.now().toString(),
        event: events[Math.floor(Math.random() * events.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        repository: repos[Math.floor(Math.random() * repos.length)],
        prNumber: `#${Math.floor(Math.random() * 200)}`,
        timestamp: "Just now",
        duration: statuses[0] === "pending" ? "-" : `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
        details:
            statuses[0] === "success"
                ? "Analysis completed successfully"
                : statuses[0] === "pending"
                    ? "Analysis in progress..."
                    : "Error: Analysis failed",
    }
}

// ============ Analytics API ============

export async function getAnalytics(): Promise<Analytics> {
    // Try the real analytics endpoint
    const data = await fetchJson<{ analytics: Analytics | null }>("/api/analytics")
    if (data?.analytics) {
        return data.analytics
    }
    return { ...mockAnalytics }
}

export async function getPRsPerDayData(): Promise<typeof prsPerDayData> {
    const data = await fetchJson<{ prsPerDayData: typeof prsPerDayData | null }>("/api/analytics")
    if (data?.prsPerDayData && data.prsPerDayData.length > 0) {
        return data.prsPerDayData
    }
    return [...prsPerDayData]
}

export async function getIssuesBySeverity(): Promise<typeof issuesBySeverity> {
    const data = await fetchJson<{ issuesBySeverity: typeof issuesBySeverity | null }>("/api/analytics")
    if (data?.issuesBySeverity && data.issuesBySeverity.length > 0) {
        return data.issuesBySeverity
    }
    return [...issuesBySeverity]
}

export async function getSecurityVsBugData(): Promise<typeof securityVsBugData> {
    const data = await fetchJson<{ securityVsBugData: typeof securityVsBugData | null }>("/api/analytics")
    if (data?.securityVsBugData && data.securityVsBugData.length > 0) {
        return data.securityVsBugData
    }
    return [...securityVsBugData]
}

// ============ Repositories API ============

export async function getRepositories(): Promise<Repository[]> {
    // Try the GitHub repositories endpoint (requires GitHub connection)
    try {
        const response = await fetch("/api/github/repositories", { cache: "no-store" })
        if (response.ok) {
            const data = (await response.json()) as { repositories: Repository[] }
            if (data.repositories && data.repositories.length > 0) {
                repositories = data.repositories
                return [...repositories]
            }
        }
    } catch {
        // Fallback to local mock repositories when GitHub is not connected.
    }

    return [...repositories]
}

export async function toggleRepository(id: string): Promise<Repository> {
    // Try the real endpoint
    const data = await fetchJson<{ success: boolean } | null>("/api/repositories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "status" }),
    })

    // Also update local state
    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.status = repo.status === "active" ? "paused" : "active"
    return { ...repo }
}

export async function toggleStrictMode(id: string): Promise<Repository> {
    await fetchJson("/api/repositories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "strict_mode" }),
    })

    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.strictMode = !repo.strictMode
    return { ...repo }
}

export async function toggleSecurityScan(id: string): Promise<Repository> {
    await fetchJson("/api/repositories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "security_scan" }),
    })

    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.securityScan = !repo.securityScan
    return { ...repo }
}

export async function toggleIgnoreStyling(id: string): Promise<Repository> {
    await fetchJson("/api/repositories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "ignore_styling" }),
    })

    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.ignoreLint = !repo.ignoreLint
    return { ...repo }
}

export async function toggleAutoFix(id: string): Promise<Repository> {
    await fetchJson("/api/repositories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field: "auto_fix" }),
    })

    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.autoFix = !repo.autoFix
    return { ...repo }
}

export async function bulkEnableBots(): Promise<Repository[]> {
    await fetchJson("/api/repositories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enableAll" }),
    })

    repositories = repositories.map((r) => ({ ...r, status: "active" as const }))
    return [...repositories]
}

// ============ Pull Requests API ============

export async function getPullRequests(filters?: {
    severity?: string
    type?: string
    autofix?: boolean
}): Promise<PullRequest[]> {
    // Try the real endpoint
    const params = new URLSearchParams()
    if (filters?.severity) params.set("severity", filters.severity)
    if (filters?.type) params.set("type", filters.type)
    if (filters?.autofix !== undefined) params.set("autofix", String(filters.autofix))

    const qs = params.toString()
    const data = await fetchJson<{ pullRequests: PullRequest[] | null }>(`/api/pull-requests${qs ? `?${qs}` : ""}`)
    if (data?.pullRequests) {
        pullRequests = data.pullRequests
        return [...pullRequests]
    }

    // Fallback to mock with local filtering
    let filtered = [...pullRequests]
    if (filters?.severity) filtered = filtered.filter((pr) => pr.severity === filters.severity)
    if (filters?.type) filtered = filtered.filter((pr) => pr.type === filters.type)
    if (filters?.autofix !== undefined) filtered = filtered.filter((pr) => pr.hasAutoFix === filters.autofix)
    return filtered
}

export async function getPullRequest(id: string): Promise<PullRequest> {
    const pr = pullRequests.find((p) => p.id === id)
    if (!pr) throw new Error("Pull request not found")
    return { ...pr }
}

export async function sortPullRequests(
    sortBy: "latest" | "issues" | "severity"
): Promise<PullRequest[]> {
    let sorted = [...pullRequests]

    switch (sortBy) {
        case "latest":
            break
        case "issues":
            sorted = sorted.sort((a, b) => b.issuesFound - a.issuesFound)
            break
        case "severity":
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            sorted = sorted.sort(
                (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
            )
            break
    }

    return sorted
}

// ============ AI Reviews API ============

export async function getAIReviews(prId?: string): Promise<AIReview[]> {
    // Try the real endpoint
    const qs = prId ? `?prId=${prId}` : ""
    const data = await fetchJson<{ reviews: AIReview[] | null }>(`/api/ai-reviews${qs}`)
    if (data?.reviews && data.reviews.length > 0) {
        aiReviews = data.reviews as AIReview[]
        return [...aiReviews]
    }

    // Fallback to the reviews/history endpoint
    const historyData = await fetchJson<{ reviews: AIReview[] | null }>("/api/reviews/history")
    if (historyData?.reviews && historyData.reviews.length > 0) {
        aiReviews = historyData.reviews as AIReview[]
        return prId ? aiReviews.filter((r) => r.prId === prId) : [...aiReviews]
    }

    // Final fallback to mock
    if (prId) return aiReviews.filter((r) => r.prId === prId)
    return [...aiReviews]
}

export async function applyFix(id: string): Promise<AIReview> {
    // Try the real endpoint
    await fetchJson("/api/ai-reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "applied" }),
    })

    const review = aiReviews.find((r) => r.id === id)
    if (!review) throw new Error("Review not found")
    review.status = "applied"
    return { ...review }
}

export async function markResolved(id: string): Promise<AIReview> {
    await fetchJson("/api/ai-reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "applied" }),
    })

    const review = aiReviews.find((r) => r.id === id)
    if (!review) throw new Error("Review not found")
    review.status = "applied"
    return { ...review }
}

export async function ignoreRule(id: string): Promise<AIReview> {
    await fetchJson("/api/ai-reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "dismissed" }),
    })

    const review = aiReviews.find((r) => r.id === id)
    if (!review) throw new Error("Review not found")
    review.status = "dismissed"
    return { ...review }
}

// ============ Security API ============

export async function getSecurityIssues(filters?: {
    severity?: string
    repo?: string
}): Promise<SecurityIssue[]> {
    const params = new URLSearchParams()
    if (filters?.severity) params.set("severity", filters.severity)
    if (filters?.repo) params.set("repo", filters.repo)

    const qs = params.toString()
    const data = await fetchJson<{ issues: SecurityIssue[] | null }>(`/api/security${qs ? `?${qs}` : ""}`)
    if (data?.issues) {
        securityIssues = data.issues
        return [...securityIssues]
    }

    // Fallback to mock with local filtering
    let filtered = [...securityIssues]
    if (filters?.severity) filtered = filtered.filter((i) => i.severity === filters.severity)
    if (filters?.repo) filtered = filtered.filter((i) => i.repository === filters.repo)
    return filtered
}

export async function fixSecurityIssue(id: string): Promise<SecurityIssue> {
    await fetchJson("/api/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "fixed" }),
    })

    const issue = securityIssues.find((i) => i.id === id)
    if (!issue) throw new Error("Security issue not found")
    issue.status = "fixed"
    return { ...issue }
}

export async function ignoreSecurityIssue(id: string): Promise<SecurityIssue> {
    await fetchJson("/api/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "ignored" }),
    })

    const issue = securityIssues.find((i) => i.id === id)
    if (!issue) throw new Error("Security issue not found")
    issue.status = "ignored"
    return { ...issue }
}

// ============ Performance API ============

export async function getPerformanceIssues(): Promise<PerformanceIssue[]> {
    const data = await fetchJson<{ issues: PerformanceIssue[] | null }>("/api/performance")
    if (data?.issues) {
        performanceIssues = data.issues
        return [...performanceIssues]
    }

    return [...performanceIssues]
}

export function calculatePerformanceScore(issuesCount: number): number {
    return Math.max(0, 100 - issuesCount * 5)
}

// ============ Rules API ============

export async function getRules(): Promise<RuleSetting[]> {
    const data = await fetchJson<{ rules: RuleSetting[] | null }>("/api/rules")
    if (data?.rules) {
        ruleSettings = data.rules
        return [...ruleSettings]
    }

    return [...ruleSettings]
}

export async function toggleRule(id: string): Promise<RuleSetting> {
    await fetchJson("/api/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId: id }),
    })

    const rule = ruleSettings.find((r) => r.id === id)
    if (!rule) throw new Error("Rule not found")
    rule.enabled = !rule.enabled
    return { ...rule }
}

export async function applyRulesGlobally(enabled: boolean): Promise<RuleSetting[]> {
    await fetchJson("/api/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
    })

    ruleSettings = ruleSettings.map((r) => ({ ...r, enabled }))
    return [...ruleSettings]
}

// ============ Webhooks API ============

export async function getWebhookLogs(filters?: {
    status?: string
}): Promise<WebhookLog[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.set("status", filters.status)

    const qs = params.toString()
    const data = await fetchJson<{ logs: WebhookLog[] | null }>(`/api/webhooks${qs ? `?${qs}` : ""}`)
    if (data?.logs) {
        webhookLogs = data.logs
        return [...webhookLogs]
    }

    // Fallback to mock with local filtering
    let filtered = [...webhookLogs]
    if (filters?.status) filtered = filtered.filter((l) => l.status === filters.status)
    return filtered
}

export async function refreshWebhookLogs(): Promise<WebhookLog[]> {
    // Re-fetch from backend
    const data = await fetchJson<{ logs: WebhookLog[] | null }>("/api/webhooks")
    if (data?.logs) {
        webhookLogs = data.logs
        return [...webhookLogs]
    }

    // Fallback: add a new mock webhook entry to simulate real-time updates
    const newLog = generateNewWebhook()
    webhookLogs = [newLog, ...webhookLogs.slice(0, 19)]
    return [...webhookLogs]
}

// ============ Settings API ============

export async function getSettings(): Promise<AppSettings> {
    const data = await fetchJson<{ settings: AppSettings | null }>("/api/settings")
    if (data?.settings) {
        appSettings = { ...appSettings, ...data.settings }
        return { ...appSettings }
    }

    return { ...appSettings }
}

export async function updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
    const data = await fetchJson<{ settings: AppSettings | null }>("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
    })

    if (data?.settings) {
        appSettings = { ...appSettings, ...data.settings }
        return { ...appSettings }
    }

    appSettings = { ...appSettings, ...newSettings }
    return { ...appSettings }
}

export async function resetSettings(): Promise<AppSettings> {
    const data = await fetchJson<{ settings: AppSettings | null }>("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultSettings),
    })

    if (data?.settings) {
        appSettings = { ...data.settings }
        return { ...appSettings }
    }

    appSettings = { ...defaultSettings }
    return { ...appSettings }
}

// ============ Real-time simulation ============

export function subscribeToWebhookUpdates(callback: (log: WebhookLog) => void) {
    const interval = setInterval(() => {
        const newLog = generateNewWebhook()
        webhookLogs = [newLog, ...webhookLogs.slice(0, 19)]
        callback(newLog)
    }, 5000)

    return () => clearInterval(interval)
}

export function subscribeToAnalyticsUpdates(callback: (analytics: Analytics) => void) {
    const interval = setInterval(() => {
        const updatedAnalytics = {
            ...mockAnalytics,
            totalPRs: mockAnalytics.totalPRs + Math.floor(Math.random() * 3),
            issuesDetected: mockAnalytics.issuesDetected + Math.floor(Math.random() * 2),
        }
        callback(updatedAnalytics)
    }, 30000)

    return () => clearInterval(interval)
}
