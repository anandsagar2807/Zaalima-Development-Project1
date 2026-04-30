import crypto from "node:crypto"
import { Pool, type PoolClient } from "pg"
import { env } from "../config/env"
import type { PullRequestContext } from "../types/github-webhook"
import type { LLMAnalysisResult, LLMIssue } from "../types/llm-analysis"

const SYSTEM_USER_KEY = "gitguard-system"
const SYSTEM_LOGIN = "GitGuard AI"

const pool = env.databaseUrl
    ? new Pool({ connectionString: env.databaseUrl })
    : null

export type StoredReviewHistoryItem = {
    id: string
    title: string
    fileName: string
    issueType: LLMIssue["type"]
    severity: LLMIssue["severity"]
    description: string
    suggestedFix: string
    lineNumber: number
    codeSnippet: string
    status: string
    prId: string
    repository: string
    reviewedAt: string
}

export type StoredSettings = {
    severityThreshold: string
    autoComments: boolean
    autoFixes: boolean
    llmTemperature: number
    maxDiffSize: number
    reviewDelay: number
    strictMode: boolean
    ignoreStyling: boolean
    securityScan: boolean
}

const DEFAULT_SETTINGS: StoredSettings = {
    severityThreshold: "medium",
    autoComments: true,
    autoFixes: true,
    llmTemperature: 0.7,
    maxDiffSize: 5000,
    reviewDelay: 0,
    strictMode: true,
    ignoreStyling: false,
    securityScan: true,
}

function getPool(): Pool {
    if (!pool) {
        throw new Error("Missing DATABASE_URL")
    }

    return pool
}

function hashRepositoryId(owner: string, repo: string): number {
    const hash = crypto.createHash("sha256").update(`${owner}/${repo}`).digest("hex")
    return Math.max(1, parseInt(hash.slice(0, 8), 16))
}

function issueTitle(issue: LLMIssue, index: number): string {
    return `${issue.type.replace(/_/g, " ")} issue ${index + 1}`
}

function reviewFileName(context: PullRequestContext): string {
    return `${context.owner}/${context.repo} • PR #${context.pullNumber}`
}

async function ensureSystemUser(client: PoolClient): Promise<number> {
    const response = await client.query<{ id: string }>(
        `
        INSERT INTO users (clerk_user_id, github_login)
        VALUES ($1, $2)
        ON CONFLICT (clerk_user_id)
        DO UPDATE SET
            github_login = EXCLUDED.github_login,
            updated_at = NOW()
        RETURNING id
        `,
        [SYSTEM_USER_KEY, SYSTEM_LOGIN]
    )

    return Number(response.rows[0].id)
}

async function ensureRepository(
    client: PoolClient,
    userId: number,
    owner: string,
    repo: string
): Promise<number> {
    const githubRepoId = hashRepositoryId(owner, repo)
    const response = await client.query<{ id: string }>(
        `
        INSERT INTO repositories (
            user_id,
            github_repo_id,
            owner,
            name,
            full_name,
            private,
            status,
            strict_mode,
            ignore_styling,
            security_scan,
            last_analyzed_at,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, FALSE, 'active', TRUE, FALSE, TRUE, NOW(), NOW(), NOW())
        ON CONFLICT (user_id, github_repo_id)
        DO UPDATE SET
            owner = EXCLUDED.owner,
            name = EXCLUDED.name,
            full_name = EXCLUDED.full_name,
            last_analyzed_at = NOW(),
            updated_at = NOW()
        RETURNING id
        `,
        [userId, githubRepoId, owner, repo, `${owner}/${repo}`]
    )

    return Number(response.rows[0].id)
}

async function ensurePullRequest(
    client: PoolClient,
    repositoryId: number,
    context: PullRequestContext,
    title: string,
    branch?: string | null
): Promise<number> {
    const response = await client.query<{ id: string }>(
        `
        INSERT INTO pull_requests (
            repository_id,
            github_pull_number,
            title,
            branch,
            state,
            diff_url,
            html_url,
            opened_at,
            reviewed_at,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, 'open', $5, $6, NOW(), NOW(), NOW(), NOW())
        ON CONFLICT (repository_id, github_pull_number)
        DO UPDATE SET
            title = EXCLUDED.title,
            branch = COALESCE(EXCLUDED.branch, pull_requests.branch),
            diff_url = COALESCE(EXCLUDED.diff_url, pull_requests.diff_url),
            html_url = COALESCE(EXCLUDED.html_url, pull_requests.html_url),
            reviewed_at = NOW(),
            updated_at = NOW()
        RETURNING id
        `,
        [repositoryId, context.pullNumber, title, branch ?? null, context.diffUrl ?? null, context.htmlUrl ?? null]
    )

    return Number(response.rows[0].id)
}

async function ensureSettingsRow(client: PoolClient, userId: number): Promise<StoredSettings> {
    const response = await client.query<StoredSettings & { id: string }>(
        `
        INSERT INTO settings (
            user_id,
            strict_mode,
            ignore_styling,
            security_scan,
            auto_comments,
            auto_fixes,
            severity_threshold,
            llm_temperature,
            max_diff_size,
            review_delay,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET updated_at = NOW()
        RETURNING
            id,
            severity_threshold AS "severityThreshold",
            auto_comments AS "autoComments",
            auto_fixes AS "autoFixes",
            llm_temperature AS "llmTemperature",
            max_diff_size AS "maxDiffSize",
            review_delay AS "reviewDelay",
            strict_mode AS "strictMode",
            ignore_styling AS "ignoreStyling",
            security_scan AS "securityScan"
        `,
        [
            userId,
            DEFAULT_SETTINGS.strictMode,
            DEFAULT_SETTINGS.ignoreStyling,
            DEFAULT_SETTINGS.securityScan,
            DEFAULT_SETTINGS.autoComments,
            DEFAULT_SETTINGS.autoFixes,
            DEFAULT_SETTINGS.severityThreshold,
            DEFAULT_SETTINGS.llmTemperature,
            DEFAULT_SETTINGS.maxDiffSize,
            DEFAULT_SETTINGS.reviewDelay,
        ]
    )

    const row = response.rows[0]

    return {
        severityThreshold: row.severityThreshold,
        autoComments: row.autoComments,
        autoFixes: row.autoFixes,
        llmTemperature: Number(row.llmTemperature),
        maxDiffSize: Number(row.maxDiffSize),
        reviewDelay: Number(row.reviewDelay),
        strictMode: row.strictMode,
        ignoreStyling: row.ignoreStyling,
        securityScan: row.securityScan,
    }
}

function normalizeStoredSettings(row: Record<string, unknown> | null): StoredSettings {
    if (!row) {
        return { ...DEFAULT_SETTINGS }
    }

    return {
        severityThreshold: String(row.severityThreshold ?? DEFAULT_SETTINGS.severityThreshold),
        autoComments: Boolean(row.autoComments ?? DEFAULT_SETTINGS.autoComments),
        autoFixes: Boolean(row.autoFixes ?? DEFAULT_SETTINGS.autoFixes),
        llmTemperature: Number(row.llmTemperature ?? DEFAULT_SETTINGS.llmTemperature),
        maxDiffSize: Number(row.maxDiffSize ?? DEFAULT_SETTINGS.maxDiffSize),
        reviewDelay: Number(row.reviewDelay ?? DEFAULT_SETTINGS.reviewDelay),
        strictMode: Boolean(row.strictMode ?? DEFAULT_SETTINGS.strictMode),
        ignoreStyling: Boolean(row.ignoreStyling ?? DEFAULT_SETTINGS.ignoreStyling),
        securityScan: Boolean(row.securityScan ?? DEFAULT_SETTINGS.securityScan),
    }
}

export async function getSystemSettings(): Promise<StoredSettings> {
    const client = getPool().connect()
    const connection = await client

    try {
        const userId = await ensureSystemUser(connection)
        const existing = await connection.query<Record<string, unknown>>(
            `
            SELECT
                severity_threshold AS "severityThreshold",
                auto_comments AS "autoComments",
                auto_fixes AS "autoFixes",
                llm_temperature AS "llmTemperature",
                max_diff_size AS "maxDiffSize",
                review_delay AS "reviewDelay",
                strict_mode AS "strictMode",
                ignore_styling AS "ignoreStyling",
                security_scan AS "securityScan"
            FROM settings
            WHERE user_id = $1
            LIMIT 1
            `,
            [userId]
        )

        if (existing.rowCount === 0) {
            return await ensureSettingsRow(connection, userId)
        }

        return normalizeStoredSettings(existing.rows[0])
    } finally {
        connection.release()
    }
}

export async function updateSystemSettings(partial: Partial<StoredSettings>): Promise<StoredSettings> {
    const connection = await getPool().connect()

    try {
        const userId = await ensureSystemUser(connection)
        const existing = await connection.query<Record<string, unknown>>(
            `
            SELECT
                severity_threshold AS "severityThreshold",
                auto_comments AS "autoComments",
                auto_fixes AS "autoFixes",
                llm_temperature AS "llmTemperature",
                max_diff_size AS "maxDiffSize",
                review_delay AS "reviewDelay",
                strict_mode AS "strictMode",
                ignore_styling AS "ignoreStyling",
                security_scan AS "securityScan"
            FROM settings
            WHERE user_id = $1
            LIMIT 1
            `,
            [userId]
        )

        const current = existing.rowCount === 0 ? DEFAULT_SETTINGS : normalizeStoredSettings(existing.rows[0])
        const merged = {
            ...current,
            ...Object.fromEntries(Object.entries(partial).filter(([, value]) => value !== undefined)),
        }

        const response = await connection.query<Record<string, unknown>>(
            `
            INSERT INTO settings (
                user_id,
                strict_mode,
                ignore_styling,
                security_scan,
                auto_comments,
                auto_fixes,
                severity_threshold,
                llm_temperature,
                max_diff_size,
                review_delay,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
                strict_mode = EXCLUDED.strict_mode,
                ignore_styling = EXCLUDED.ignore_styling,
                security_scan = EXCLUDED.security_scan,
                auto_comments = EXCLUDED.auto_comments,
                auto_fixes = EXCLUDED.auto_fixes,
                severity_threshold = EXCLUDED.severity_threshold,
                llm_temperature = EXCLUDED.llm_temperature,
                max_diff_size = EXCLUDED.max_diff_size,
                review_delay = EXCLUDED.review_delay,
                updated_at = NOW()
            RETURNING
                severity_threshold AS "severityThreshold",
                auto_comments AS "autoComments",
                auto_fixes AS "autoFixes",
                llm_temperature AS "llmTemperature",
                max_diff_size AS "maxDiffSize",
                review_delay AS "reviewDelay",
                strict_mode AS "strictMode",
                ignore_styling AS "ignoreStyling",
                security_scan AS "securityScan"
            `,
            [
                userId,
                merged.strictMode,
                merged.ignoreStyling,
                merged.securityScan,
                merged.autoComments,
                merged.autoFixes,
                merged.severityThreshold,
                merged.llmTemperature,
                merged.maxDiffSize,
                merged.reviewDelay,
            ]
        )

        return normalizeStoredSettings(response.rows[0])
    } finally {
        connection.release()
    }
}

export async function saveReviewAnalysis(
    context: PullRequestContext,
    analysis: LLMAnalysisResult,
    reviewResponse?: { id?: number | string; html_url?: string | null }
): Promise<void> {
    const connection = await getPool().connect()

    try {
        await connection.query("BEGIN")

        const userId = await ensureSystemUser(connection)
        const repositoryId = await ensureRepository(connection, userId, context.owner, context.repo)
        const pullRequestId = await ensurePullRequest(
            connection,
            repositoryId,
            context,
            reviewFileName(context),
            null
        )

        const logMetadata = {
            owner: context.owner,
            repo: context.repo,
            pullNumber: context.pullNumber,
            issuesCount: analysis.issues.length,
            githubReviewId: reviewResponse?.id ?? null,
            githubCommentUrl: reviewResponse?.html_url ?? null,
        }

        await connection.query(
            `
            INSERT INTO logs (user_id, repository_id, pull_request_id, level, message, metadata)
            VALUES ($1, $2, $3, 'info', $4, $5::jsonb)
            `,
            [userId, repositoryId, pullRequestId, "PR received and diff fetched", JSON.stringify(logMetadata)]
        )

        for (const [index, issue] of analysis.issues.entries()) {
            const metadata = {
                title: issueTitle(issue, index),
                repository: `${context.owner}/${context.repo}`,
                pullNumber: context.pullNumber,
                githubReviewId: reviewResponse?.id ?? null,
                githubCommentUrl: reviewResponse?.html_url ?? null,
            }

            await connection.query(
                `
                INSERT INTO reviews (
                    pull_request_id,
                    issue_type,
                    severity,
                    description,
                    suggested_fix,
                    file_name,
                    line_number,
                    code_snippet,
                    status,
                    metadata,
                    github_review_id,
                    github_comment_url,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9::jsonb, $10, $11, NOW(), NOW())
                `,
                [
                    pullRequestId,
                    issue.type,
                    issue.severity,
                    issue.description,
                    issue.fix,
                    reviewFileName(context),
                    index + 1,
                    issue.fix,
                    JSON.stringify(metadata),
                    reviewResponse?.id ? String(reviewResponse.id) : null,
                    reviewResponse?.html_url ?? null,
                ]
            )
        }

        await connection.query("COMMIT")
    } catch (error) {
        await connection.query("ROLLBACK")
        throw error
    } finally {
        connection.release()
    }
}

export async function listReviewHistory(): Promise<StoredReviewHistoryItem[]> {
    const connection = await getPool().connect()

    try {
        const result = await connection.query<Record<string, unknown>>(
            `
            SELECT
                reviews.id AS id,
                reviews.issue_type AS "issueType",
                reviews.severity AS severity,
                reviews.description AS description,
                reviews.suggested_fix AS "suggestedFix",
                reviews.file_name AS "fileName",
                COALESCE(reviews.line_number, 0) AS "lineNumber",
                COALESCE(reviews.code_snippet, reviews.suggested_fix) AS "codeSnippet",
                reviews.status AS status,
                reviews.github_review_id AS "githubReviewId",
                reviews.github_comment_url AS "githubCommentUrl",
                reviews.created_at AS "reviewedAt",
                pull_requests.id AS "prId",
                repositories.owner || '/' || repositories.name AS repository,
                pull_requests.github_pull_number AS "pullNumber",
                COALESCE((reviews.metadata ->> 'title'), reviews.issue_type || ' issue') AS title
            FROM reviews
            JOIN pull_requests ON pull_requests.id = reviews.pull_request_id
            JOIN repositories ON repositories.id = pull_requests.repository_id
            ORDER BY reviews.created_at DESC
            LIMIT 200
            `
        )

        return result.rows.map((row) => ({
            id: String(row.id),
            title: String(row.title),
            fileName: String(row.fileName ?? row.repository),
            issueType: row.issueType as LLMIssue["type"],
            severity: row.severity as LLMIssue["severity"],
            description: String(row.description),
            suggestedFix: String(row.suggestedFix),
            lineNumber: Number(row.lineNumber ?? 0),
            codeSnippet: String(row.codeSnippet ?? row.suggestedFix),
            status: String(row.status),
            prId: String(row.prId),
            repository: String(row.repository),
            reviewedAt: new Date(String(row.reviewedAt)).toISOString(),
        }))
    } finally {
        connection.release()
    }
}
