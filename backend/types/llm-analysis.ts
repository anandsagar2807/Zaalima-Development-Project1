/**
 * The category of issue detected by the LLM.
 */
export type IssueType = "bug" | "security" | "performance" | "bad_practice"

/**
 * Severity level of a detected issue.
 */
export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info"

/**
 * A single issue detected in a PR diff by the LLM.
 */
export type LLMIssue = {
    /** Category of the issue */
    type: IssueType
    /** How severe the issue is */
    severity: IssueSeverity
    /** Human-readable description of the issue */
    description: string
    /** Suggested fix or remediation */
    fix: string
}

/**
 * The structured response returned by the LLM analysis.
 */
export type LLMAnalysisResult = {
    issues: LLMIssue[]
}

/**
 * Performance timing metrics for the analysis pipeline.
 */
export type AnalysisPerformanceMetrics = {
    /** Timestamp when the PR opened webhook was received (ms since epoch) */
    webhookReceivedAt: number
    /** Time taken to fetch the PR diff (ms) */
    diffFetchDurationMs: number
    /** Time taken for the LLM to respond (ms) */
    llmResponseDurationMs: number
    /** Total end-to-end time from webhook receipt to analysis completion (ms) */
    totalDurationMs: number
}

/**
 * The complete result of analyzing a pull request.
 */
export type PullRequestAnalysis = {
    repo: string
    pullNumber: number
    analysis: LLMAnalysisResult
    performance: AnalysisPerformanceMetrics
}

/**
 * Valid issue types for validation.
 */
export const VALID_ISSUE_TYPES: readonly IssueType[] = [
    "bug",
    "security",
    "performance",
    "bad_practice",
] as const

/**
 * Valid severity levels for validation.
 */
export const VALID_SEVERITIES: readonly IssueSeverity[] = [
    "critical",
    "high",
    "medium",
    "low",
    "info",
] as const