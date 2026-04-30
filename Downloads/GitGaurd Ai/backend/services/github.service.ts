import { env } from "../config/env"
import type { PullRequestContext } from "../types/github-webhook"
import type { LLMAnalysisResult } from "../types/llm-analysis"

const GITHUB_API_BASE = "https://api.github.com"

type GitHubRequestOptions = {
    method?: "GET" | "POST"
    body?: unknown
    accept?: string
}

async function githubRequest<T>(
    path: string,
    { method = "GET", body, accept = "application/vnd.github+json" }: GitHubRequestOptions = {}
): Promise<T> {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${env.githubToken}`,
            Accept: accept,
            "X-GitHub-Api-Version": "2022-11-28",
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
            `GitHub API request failed (${response.status} ${response.statusText}) on ${path}: ${errorText}`
        )
    }

    if (response.status === 204) {
        return undefined as T
    }

    const contentType = response.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
        return (await response.json()) as T
    }

    return (await response.text()) as T
}

export async function fetchPullRequestDiff(context: PullRequestContext): Promise<string> {
    return githubRequest<string>(
        `/repos/${context.owner}/${context.repo}/pulls/${context.pullNumber}`,
        { accept: "application/vnd.github.v3.diff" }
    )
}

function formatIssueSection(issue: LLMAnalysisResult["issues"][number], index: number): string {
    return [
        `### Issue ${index + 1}`,
        `Issue: ${issue.type}`,
        `Description: ${issue.description}`,
        "Suggested Fix:",
        "```ts",
        issue.fix,
        "```",
        `Severity: ${issue.severity}`,
    ].join("\n")
}

export function buildReviewCommentBody(analysis: LLMAnalysisResult): string {
    if (analysis.issues.length === 0) {
        return [
            "## GitGuard AI Review",
            "",
            "No issues found.",
            "",
            "Severity: info",
        ].join("\n")
    }

    return [
        "## GitGuard AI Review",
        "",
        ...analysis.issues.flatMap((issue, index) => [formatIssueSection(issue, index), ""]),
    ].join("\n").trim()
}

export async function postPullRequestReviewComment(
    context: PullRequestContext,
    analysis: LLMAnalysisResult
): Promise<{ id?: number; html_url?: string | null }> {
    const body = buildReviewCommentBody(analysis)

    const response = await githubRequest<{ id?: number; html_url?: string | null }>(
        `/repos/${context.owner}/${context.repo}/pulls/${context.pullNumber}/reviews`,
        {
            method: "POST",
            body: {
                event: "COMMENT",
                body,
            },
        }
    )

    return {
        id: response.id,
        html_url: response.html_url,
    }
}
