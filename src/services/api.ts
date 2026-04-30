// Mock API Service for GitGuard AI Dashboard
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

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
        const response = await fetch(url, {
            cache: "no-store",
            ...init,
        })

        if (!response.ok) {
            return null
        }

        return (await response.json()) as T
    } catch {
        return null
    }
}

// In-memory state for optimistic updates
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
    await delay(500)
    return { ...mockAnalytics }
}

export async function getPRsPerDayData(): Promise<typeof prsPerDayData> {
    await delay(300)
    return [...prsPerDayData]
}

export async function getIssuesBySeverity(): Promise<typeof issuesBySeverity> {
    await delay(300)
    return [...issuesBySeverity]
}

export async function getSecurityVsBugData(): Promise<typeof securityVsBugData> {
    await delay(300)
    return [...securityVsBugData]
}

// ============ Repositories API ============
export async function getRepositories(): Promise<Repository[]> {
    await delay(250)

    try {
        const response = await fetch("/api/github/repositories", { cache: "no-store" })
        if (response.ok) {
            const data = (await response.json()) as { repositories: Repository[] }
            repositories = data.repositories
            return [...repositories]
        }
    } catch {
        // Fallback to local mock repositories when GitHub is not connected.
    }

    return [...repositories]
}

export async function toggleRepository(id: string): Promise<Repository> {
    await delay(300)
    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.status = repo.status === "active" ? "paused" : "active"
    return { ...repo }
}

export async function toggleStrictMode(id: string): Promise<Repository> {
    await delay(200)
    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.strictMode = !repo.strictMode
    return { ...repo }
}

export async function toggleSecurityScan(id: string): Promise<Repository> {
    await delay(200)
    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.securityScan = !repo.securityScan
    return { ...repo }
}

export async function toggleIgnoreStyling(id: string): Promise<Repository> {
    await delay(200)
    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.ignoreLint = !repo.ignoreLint
    return { ...repo }
}

export async function toggleAutoFix(id: string): Promise<Repository> {
    await delay(200)
    const repo = repositories.find((r) => r.id === id)
    if (!repo) throw new Error("Repository not found")
    repo.autoFix = !repo.autoFix
    return { ...repo }
}

export async function bulkEnableBots(): Promise<Repository[]> {
    await delay(500)
    repositories = repositories.map((r) => ({ ...r, status: "active" as const }))
    return [...repositories]
}

// ============ Pull Requests API ============
export async function getPullRequests(filters?: {
    severity?: string
    type?: string
    autofix?: boolean
}): Promise<PullRequest[]> {
    await delay(500)
    let filtered = [...pullRequests]

    if (filters?.severity) {
        filtered = filtered.filter((pr) => pr.severity === filters.severity)
    }
    if (filters?.type) {
        filtered = filtered.filter((pr) => pr.type === filters.type)
    }
    if (filters?.autofix !== undefined) {
        filtered = filtered.filter((pr) => pr.hasAutoFix === filters.autofix)
    }

    return filtered
}

export async function getPullRequest(id: string): Promise<PullRequest> {
    await delay(300)
    const pr = pullRequests.find((p) => p.id === id)
    if (!pr) throw new Error("Pull request not found")
    return { ...pr }
}

export async function sortPullRequests(
    sortBy: "latest" | "issues" | "severity"
): Promise<PullRequest[]> {
    await delay(300)
    let sorted = [...pullRequests]

    switch (sortBy) {
        case "latest":
            // Already sorted by time in mock
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
    await delay(500)

    const backend = await fetchJson<{ reviews: AIReview[] }>("/api/reviews/history")
    if (backend?.reviews) {
        return prId ? backend.reviews.filter((review) => review.prId === prId) : backend.reviews
    }

    if (prId) {
        return aiReviews.filter((r) => r.prId === prId)
    }
    return [...aiReviews]
}

export async function applyFix(id: string): Promise<AIReview> {
    await delay(800)
    const review = aiReviews.find((r) => r.id === id)
    if (!review) throw new Error("Review not found")
    review.status = "applied"
    return { ...review }
}

export async function markResolved(id: string): Promise<AIReview> {
    await delay(300)
    const review = aiReviews.find((r) => r.id === id)
    if (!review) throw new Error("Review not found")
    review.status = "applied"
    return { ...review }
}

export async function ignoreRule(id: string): Promise<AIReview> {
    await delay(200)
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
    await delay(500)
    let filtered = [...securityIssues]

    if (filters?.severity) {
        filtered = filtered.filter((i) => i.severity === filters.severity)
    }
    if (filters?.repo) {
        filtered = filtered.filter((i) => i.repository === filters.repo)
    }

    return filtered
}

export async function fixSecurityIssue(id: string): Promise<SecurityIssue> {
    await delay(500)
    const issue = securityIssues.find((i) => i.id === id)
    if (!issue) throw new Error("Security issue not found")
    issue.status = "fixed"
    return { ...issue }
}

export async function ignoreSecurityIssue(id: string): Promise<SecurityIssue> {
    await delay(300)
    const issue = securityIssues.find((i) => i.id === id)
    if (!issue) throw new Error("Security issue not found")
    issue.status = "ignored"
    return { ...issue }
}

// ============ Performance API ============
export async function getPerformanceIssues(): Promise<PerformanceIssue[]> {
    await delay(500)
    return [...performanceIssues]
}

export function calculatePerformanceScore(issuesCount: number): number {
    return Math.max(0, 100 - issuesCount * 5)
}

// ============ Rules API ============
export async function getRules(): Promise<RuleSetting[]> {
    await delay(400)
    return [...ruleSettings]
}

export async function toggleRule(id: string): Promise<RuleSetting> {
    await delay(200)
    const rule = ruleSettings.find((r) => r.id === id)
    if (!rule) throw new Error("Rule not found")
    rule.enabled = !rule.enabled
    return { ...rule }
}

export async function applyRulesGlobally(enabled: boolean): Promise<RuleSetting[]> {
    await delay(500)
    ruleSettings = ruleSettings.map((r) => ({ ...r, enabled }))
    return [...ruleSettings]
}

// ============ Webhooks API ============
export async function getWebhookLogs(filters?: {
    status?: string
}): Promise<WebhookLog[]> {
    await delay(400)
    let filtered = [...webhookLogs]

    if (filters?.status) {
        filtered = filtered.filter((l) => l.status === filters.status)
    }

    return filtered
}

export async function refreshWebhookLogs(): Promise<WebhookLog[]> {
    await delay(300)
    // Add a new webhook entry to simulate real-time updates
    const newLog = generateNewWebhook()
    webhookLogs = [newLog, ...webhookLogs.slice(0, 19)]
    return [...webhookLogs]
}

// ============ Settings API ============
export async function getSettings(): Promise<AppSettings> {
    await delay(300)

    const backend = await fetchJson<{ settings: AppSettings }>("/api/settings")
    if (backend?.settings) {
        appSettings = { ...appSettings, ...backend.settings }
        return { ...appSettings }
    }

    return { ...appSettings }
}

export async function updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
    await delay(400)

    const backend = await fetchJson<{ settings: AppSettings }>("/api/settings", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
    })

    if (backend?.settings) {
        appSettings = { ...appSettings, ...backend.settings }
        return { ...appSettings }
    }

    appSettings = { ...appSettings, ...newSettings }
    return { ...appSettings }
}

export async function resetSettings(): Promise<AppSettings> {
    await delay(300)

    const backend = await fetchJson<{ settings: AppSettings }>("/api/settings", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(defaultSettings),
    })

    if (backend?.settings) {
        appSettings = { ...backend.settings }
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
        // Simulate slight variations in analytics
        const updatedAnalytics = {
            ...mockAnalytics,
            totalPRs: mockAnalytics.totalPRs + Math.floor(Math.random() * 3),
            issuesDetected: mockAnalytics.issuesDetected + Math.floor(Math.random() * 2),
        }
        callback(updatedAnalytics)
    }, 30000)

    return () => clearInterval(interval)
}