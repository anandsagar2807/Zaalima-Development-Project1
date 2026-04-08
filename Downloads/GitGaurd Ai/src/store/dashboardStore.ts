// Zustand Store for GitGuard AI Dashboard
import { create } from "zustand"
import {
    type Repository,
    type PullRequest,
    type AIReview,
    type SecurityIssue,
    type PerformanceIssue,
    type WebhookLog,
    type RuleSetting,
    type AppSettings,
    type Analytics,
} from "@/services/mockData"
import * as api from "@/services/api"

interface DashboardState {
    // Data states
    repositories: Repository[]
    pullRequests: PullRequest[]
    aiReviews: AIReview[]
    securityIssues: SecurityIssue[]
    performanceIssues: PerformanceIssue[]
    webhookLogs: WebhookLog[]
    ruleSettings: RuleSetting[]
    settings: AppSettings
    analytics: Analytics | null
    prsPerDayData: { day: string; prs: number; issues: number }[]
    issuesBySeverity: { name: string; value: number; color: string }[]
    securityVsBugData: { name: string; value: number }[]

    // Loading states
    isLoadingRepositories: boolean
    isLoadingPRs: boolean
    isLoadingReviews: boolean
    isLoadingSecurity: boolean
    isLoadingPerformance: boolean
    isLoadingWebhooks: boolean
    isLoadingRules: boolean
    isLoadingSettings: boolean
    isLoadingAnalytics: boolean

    // Error states
    error: string | null

    // Filters and search
    repoSearchQuery: string
    prSearchQuery: string
    prFilters: string[]
    securityFilters: { severity?: string; repo?: string }
    webhookStatusFilter: string

    // Actions - Analytics
    fetchAnalytics: () => Promise<void>

    // Actions - Repositories
    fetchRepositories: () => Promise<void>
    toggleRepositoryStatus: (id: string) => Promise<void>
    toggleStrictMode: (id: string) => Promise<void>
    toggleSecurityScan: (id: string) => Promise<void>
    toggleAutoFix: (id: string) => Promise<void>
    enableAllBots: () => Promise<void>
    setRepoSearchQuery: (query: string) => void

    // Actions - Pull Requests
    fetchPullRequests: (filters?: { severity?: string; type?: string; autofix?: boolean }) => Promise<void>
    setPRSearchQuery: (query: string) => void
    togglePRFilter: (filter: string) => void
    sortPRs: (sortBy: "latest" | "issues" | "severity") => Promise<void>

    // Actions - AI Reviews
    fetchAIReviews: (prId?: string) => Promise<void>
    applyFix: (id: string) => Promise<void>
    markResolved: (id: string) => Promise<void>
    ignoreRule: (id: string) => Promise<void>

    // Actions - Security
    fetchSecurityIssues: (filters?: { severity?: string; repo?: string }) => Promise<void>
    fixSecurityIssue: (id: string) => Promise<void>
    ignoreSecurityIssue: (id: string) => Promise<void>
    setSecurityFilters: (filters: { severity?: string; repo?: string }) => void

    // Actions - Performance
    fetchPerformanceIssues: () => Promise<void>

    // Actions - Rules
    fetchRules: () => Promise<void>
    toggleRule: (id: string) => Promise<void>
    applyAllRules: (enabled: boolean) => Promise<void>

    // Actions - Webhooks
    fetchWebhookLogs: (status?: string) => Promise<void>
    refreshWebhooks: () => Promise<void>
    setWebhookStatusFilter: (status: string) => void

    // Actions - Settings
    fetchSettings: () => Promise<void>
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>
    resetAllSettings: () => Promise<void>

    // Utility
    clearError: () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    // Initial data states
    repositories: [],
    pullRequests: [],
    aiReviews: [],
    securityIssues: [],
    performanceIssues: [],
    webhookLogs: [],
    ruleSettings: [],
    settings: {
        severityThreshold: "medium",
        autoComments: true,
        autoFixes: true,
        llmTemperature: 0.7,
        maxDiffSize: 5000,
        reviewDelay: 0,
    },
    analytics: null,
    prsPerDayData: [],
    issuesBySeverity: [],
    securityVsBugData: [],

    // Initial loading states
    isLoadingRepositories: false,
    isLoadingPRs: false,
    isLoadingReviews: false,
    isLoadingSecurity: false,
    isLoadingPerformance: false,
    isLoadingWebhooks: false,
    isLoadingRules: false,
    isLoadingSettings: false,
    isLoadingAnalytics: false,

    // Initial error state
    error: null,

    // Initial filter states
    repoSearchQuery: "",
    prSearchQuery: "",
    prFilters: [],
    securityFilters: {},
    webhookStatusFilter: "",

    // Analytics actions
    fetchAnalytics: async () => {
        set({ isLoadingAnalytics: true, error: null })
        try {
            const [analytics, prsData, severityData, securityData] = await Promise.all([
                api.getAnalytics(),
                api.getPRsPerDayData(),
                api.getIssuesBySeverity(),
                api.getSecurityVsBugData(),
            ])
            set({
                analytics,
                prsPerDayData: prsData,
                issuesBySeverity: severityData,
                securityVsBugData: securityData,
                isLoadingAnalytics: false,
            })
        } catch (error) {
            set({ error: "Failed to fetch analytics", isLoadingAnalytics: false })
        }
    },

    // Repository actions
    fetchRepositories: async () => {
        set({ isLoadingRepositories: true, error: null })
        try {
            const repos = await api.getRepositories()
            set({ repositories: repos, isLoadingRepositories: false })
        } catch (error) {
            set({ error: "Failed to fetch repositories", isLoadingRepositories: false })
        }
    },

    toggleRepositoryStatus: async (id: string) => {
        const repo = get().repositories.find((r) => r.id === id)
        if (repo) {
            // Optimistic update
            set((state) => ({
                repositories: state.repositories.map((r) =>
                    r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r
                ),
            }))
            try {
                await api.toggleRepository(id)
            } catch (error) {
                // Revert on error
                set((state) => ({
                    repositories: state.repositories.map((r) =>
                        r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r
                    ),
                })),
                set({ error: "Failed to toggle repository status" })
            }
        }
    },

    toggleStrictMode: async (id: string) => {
        const repo = get().repositories.find((r) => r.id === id)
        if (repo) {
            set((state) => ({
                repositories: state.repositories.map((r) =>
                    r.id === id ? { ...r, strictMode: !r.strictMode } : r
                ),
            }))
            try {
                await api.toggleStrictMode(id)
            } catch (error) {
                set((state) => ({
                    repositories: state.repositories.map((r) =>
                        r.id === id ? { ...r, strictMode: !r.strictMode } : r
                    ),
                })),
                set({ error: "Failed to toggle strict mode" })
            }
        }
    },

    toggleSecurityScan: async (id: string) => {
        const repo = get().repositories.find((r) => r.id === id)
        if (repo) {
            set((state) => ({
                repositories: state.repositories.map((r) =>
                    r.id === id ? { ...r, securityScan: !r.securityScan } : r
                ),
            }))
            try {
                await api.toggleSecurityScan(id)
            } catch (error) {
                set((state) => ({
                    repositories: state.repositories.map((r) =>
                        r.id === id ? { ...r, securityScan: !r.securityScan } : r
                    ),
                })),
                set({ error: "Failed to toggle security scan" })
            }
        }
    },

    toggleAutoFix: async (id: string) => {
        const repo = get().repositories.find((r) => r.id === id)
        if (repo) {
            set((state) => ({
                repositories: state.repositories.map((r) =>
                    r.id === id ? { ...r, autoFix: !r.autoFix } : r
                ),
            }))
            try {
                await api.toggleAutoFix(id)
            } catch (error) {
                set((state) => ({
                    repositories: state.repositories.map((r) =>
                        r.id === id ? { ...r, autoFix: !r.autoFix } : r
                    ),
                })),
                set({ error: "Failed to toggle auto fix" })
            }
        }
    },

    enableAllBots: async () => {
        set((state) => ({
            repositories: state.repositories.map((r) => ({ ...r, status: "active" as const })),
        }))
        try {
            await api.bulkEnableBots()
        } catch (error) {
            set({ error: "Failed to enable all bots" })
        }
    },

    setRepoSearchQuery: (query: string) => set({ repoSearchQuery: query }),

    // Pull Request actions
    fetchPullRequests: async (filters) => {
        set({ isLoadingPRs: true, error: null })
        try {
            const prs = await api.getPullRequests(filters)
            set({ pullRequests: prs, isLoadingPRs: false })
        } catch (error) {
            set({ error: "Failed to fetch pull requests", isLoadingPRs: false })
        }
    },

    setPRSearchQuery: (query: string) => set({ prSearchQuery: query }),

    togglePRFilter: (filter: string) => {
        set((state) => ({
            prFilters: state.prFilters.includes(filter)
                ? state.prFilters.filter((f) => f !== filter)
                : [...state.prFilters, filter],
        }))
    },

    sortPRs: async (sortBy) => {
        set({ isLoadingPRs: true })
        try {
            const sorted = await api.sortPullRequests(sortBy)
            set({ pullRequests: sorted, isLoadingPRs: false })
        } catch (error) {
            set({ error: "Failed to sort pull requests", isLoadingPRs: false })
        }
    },

    // AI Review actions
    fetchAIReviews: async (prId) => {
        set({ isLoadingReviews: true, error: null })
        try {
            const reviews = await api.getAIReviews(prId)
            set({ aiReviews: reviews, isLoadingReviews: false })
        } catch (error) {
            set({ error: "Failed to fetch AI reviews", isLoadingReviews: false })
        }
    },

    applyFix: async (id) => {
        set((state) => ({
            aiReviews: state.aiReviews.map((r) =>
                r.id === id ? { ...r, status: "applied" as const } : r
            ),
        }))
        try {
            await api.applyFix(id)
        } catch (error) {
            set((state) => ({
                aiReviews: state.aiReviews.map((r) =>
                    r.id === id ? { ...r, status: "pending" as const } : r
                ),
            })),
            set({ error: "Failed to apply fix" })
        }
    },

    markResolved: async (id) => {
        set((state) => ({
            aiReviews: state.aiReviews.map((r) =>
                r.id === id ? { ...r, status: "applied" as const } : r
            ),
        }))
        try {
            await api.markResolved(id)
        } catch (error) {
            set({ error: "Failed to mark as resolved" })
        }
    },

    ignoreRule: async (id) => {
        set((state) => ({
            aiReviews: state.aiReviews.map((r) =>
                r.id === id ? { ...r, status: "dismissed" as const } : r
            ),
        }))
        try {
            await api.ignoreRule(id)
        } catch (error) {
            set((state) => ({
                aiReviews: state.aiReviews.map((r) =>
                    r.id === id ? { ...r, status: "pending" as const } : r
                ),
            })),
            set({ error: "Failed to ignore rule" })
        }
    },

    // Security actions
    fetchSecurityIssues: async (filters) => {
        set({ isLoadingSecurity: true, error: null })
        try {
            const issues = await api.getSecurityIssues(filters)
            set({ securityIssues: issues, isLoadingSecurity: false })
        } catch (error) {
            set({ error: "Failed to fetch security issues", isLoadingSecurity: false })
        }
    },

    fixSecurityIssue: async (id) => {
        set((state) => ({
            securityIssues: state.securityIssues.map((i) =>
                i.id === id ? { ...i, status: "fixed" as const } : i
            ),
        }))
        try {
            await api.fixSecurityIssue(id)
        } catch (error) {
            set({ error: "Failed to fix security issue" })
        }
    },

    ignoreSecurityIssue: async (id) => {
        set((state) => ({
            securityIssues: state.securityIssues.map((i) =>
                i.id === id ? { ...i, status: "ignored" as const } : i
            ),
        }))
        try {
            await api.ignoreSecurityIssue(id)
        } catch (error) {
            set({ error: "Failed to ignore security issue" })
        }
    },

    setSecurityFilters: (filters) => set({ securityFilters: filters }),

    // Performance actions
    fetchPerformanceIssues: async () => {
        set({ isLoadingPerformance: true, error: null })
        try {
            const issues = await api.getPerformanceIssues()
            set({ performanceIssues: issues, isLoadingPerformance: false })
        } catch (error) {
            set({ error: "Failed to fetch performance issues", isLoadingPerformance: false })
        }
    },

    // Rules actions
    fetchRules: async () => {
        set({ isLoadingRules: true, error: null })
        try {
            const rules = await api.getRules()
            set({ ruleSettings: rules, isLoadingRules: false })
        } catch (error) {
            set({ error: "Failed to fetch rules", isLoadingRules: false })
        }
    },

    toggleRule: async (id) => {
        set((state) => ({
            ruleSettings: state.ruleSettings.map((r) =>
                r.id === id ? { ...r, enabled: !r.enabled } : r
            ),
        }))
        try {
            await api.toggleRule(id)
        } catch (error) {
            set((state) => ({
                ruleSettings: state.ruleSettings.map((r) =>
                    r.id === id ? { ...r, enabled: !r.enabled } : r
                ),
            })),
            set({ error: "Failed to toggle rule" })
        }
    },

    applyAllRules: async (enabled) => {
        set((state) => ({
            ruleSettings: state.ruleSettings.map((r) => ({ ...r, enabled })),
        }))
        try {
            await api.applyRulesGlobally(enabled)
        } catch (error) {
            set({ error: "Failed to apply rules globally" })
        }
    },

    // Webhook actions
    fetchWebhookLogs: async (status) => {
        set({ isLoadingWebhooks: true, error: null })
        try {
            const logs = await api.getWebhookLogs(status ? { status } : undefined)
            set({ webhookLogs: logs, isLoadingWebhooks: false })
        } catch (error) {
            set({ error: "Failed to fetch webhook logs", isLoadingWebhooks: false })
        }
    },

    refreshWebhooks: async () => {
        try {
            const logs = await api.refreshWebhookLogs()
            set({ webhookLogs: logs })
        } catch (error) {
            set({ error: "Failed to refresh webhooks" })
        }
    },

    setWebhookStatusFilter: (status) => set({ webhookStatusFilter: status }),

    // Settings actions
    fetchSettings: async () => {
        set({ isLoadingSettings: true, error: null })
        try {
            const settings = await api.getSettings()
            set({ settings, isLoadingSettings: false })
        } catch (error) {
            set({ error: "Failed to fetch settings", isLoadingSettings: false })
        }
    },

    updateSettings: async (newSettings) => {
        set((state) => ({
            settings: { ...state.settings, ...newSettings },
        }))
        try {
            await api.updateSettings(newSettings)
        } catch (error) {
            set({ error: "Failed to update settings" })
        }
    },

    resetAllSettings: async () => {
        try {
            const settings = await api.resetSettings()
            set({ settings })
        } catch (error) {
            set({ error: "Failed to reset settings" })
        }
    },

    // Utility
    clearError: () => set({ error: null }),
}))