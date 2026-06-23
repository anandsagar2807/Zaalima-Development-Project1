import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { getInsforgeServerClient, tryInsertWithPayloadVariants } from "@/lib/insforge-server"

type GithubRepo = {
    id: number
    name: string
    owner: { login: string }
    private: boolean
    default_branch: string
    pushed_at: string
    updated_at: string
    open_issues_count: number
}

type RepositoryScan = {
    score: number
    findings: number
    secretsRisk: boolean
    summary: string
    languages: string[]
    hasWorkflows: boolean
    hasTests: boolean
}

type ScannedRepository = {
    id: string
    name: string
    owner: string
    status: "active"
    strictMode: boolean
    securityScan: boolean
    autoFix: boolean
    ignoreLint: boolean
    lastAnalyzed: string
    totalPRs: number
    openPRs: number
    scanScore: number
    scanFindings: number
    secretsRisk: boolean
    scanSummary: string
    languages: string[]
    hasWorkflows: boolean
    hasTests: boolean
}

function getAccessTokenFromMetadata(user: any): string | null {
    const token = user?.privateMetadata?.gitguardGithub?.accessToken
    return typeof token === "string" && token.length > 0 ? token : null
}

async function githubRequest<T>(token: string, path: string): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
    })

    if (!response.ok) {
        throw new Error(`GitHub request failed for ${path}: ${response.status}`)
    }

    return (await response.json()) as T
}

function toRelativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime()
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)))
    if (mins < 60) return `${mins} minutes ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
}

function countMatches(content: string, patterns: RegExp[]): number {
    return patterns.reduce((sum, pattern) => sum + (pattern.test(content) ? 1 : 0), 0)
}

async function scanRepository(token: string, owner: string, repo: string, branch: string): Promise<RepositoryScan> {
    const [languages, root] = await Promise.all([
        githubRequest<Record<string, number>>(token, `/repos/${owner}/${repo}/languages`),
        githubRequest<Array<{ name: string; path: string; type: string }>>(
            token,
            `/repos/${owner}/${repo}/contents?ref=${encodeURIComponent(branch)}`
        ),
    ])

    const languageNames = Object.keys(languages).slice(0, 4)
    const hasWorkflows = root.some((entry) => entry.type === "dir" && entry.name === ".github")

    let treePaths: string[] = []
    try {
        const tree = await githubRequest<{ tree: Array<{ path: string; type: string }> }>(
            token,
            `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`
        )
        treePaths = tree.tree.filter((item) => item.type === "blob").map((item) => item.path)
    } catch {
        treePaths = root.map((entry) => entry.path)
    }

    const hasTests = treePaths.some((path) =>
        /(^|\/)(__tests__|test|tests)(\/|$)|\.(test|spec)\.(ts|tsx|js|jsx|py|go|java|rb)$/.test(path)
    )

    const secretsRisk = treePaths.some((path) =>
        /(\.env$|id_rsa|\.pem$|credentials|secret|token)/i.test(path) && !/\.example$/i.test(path)
    )

    const codeFiles = treePaths
        .filter((path) => /\.(ts|tsx|js|jsx|py|java|go|rb|php)$/i.test(path))
        .slice(0, 3)

    let patternFindings = 0
    for (const filePath of codeFiles) {
        try {
            const file = await githubRequest<{ content?: string; encoding?: string }>(
                token,
                `/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`
            )
            if (file.encoding === "base64" && file.content) {
                const text = Buffer.from(file.content, "base64").toString("utf8")
                patternFindings += countMatches(text, [
                    /\beval\(/,
                    /dangerouslySetInnerHTML/,
                    /(api[_-]?key|secret|token)\s*=\s*["'][^"']+["']/i,
                ])
            }
        } catch {
            continue
        }
    }

    const findings = patternFindings + (secretsRisk ? 2 : 0) + (hasTests ? 0 : 1) + (hasWorkflows ? 0 : 1)
    const score = Math.max(35, 100 - findings * 12)

    const summary =
        findings <= 1
            ? "Healthy baseline; only low-risk items detected."
            : findings <= 3
                ? "Moderate issues detected; recommended cleanup and hardening."
                : "High-risk patterns detected; prioritize security and quality fixes."

    return {
        score,
        findings,
        secretsRisk,
        summary,
        languages: languageNames,
        hasWorkflows,
        hasTests,
    }
}

async function persistRepositoriesAndScans(userId: string, repositories: ScannedRepository[]) {
    const insforgeClient = getInsforgeServerClient()
    if (!insforgeClient) {
        throw new Error("Missing InsForge configuration")
    }

    const deleteExisting = await insforgeClient.database
        .from("github_repositories")
        .delete()
        .eq("clerk_user_id", userId)
    if (deleteExisting.error) {
        throw deleteExisting.error
    }

    for (const repository of repositories) {
        const repoIdNumber = Number(repository.id)
        const nowIso = new Date().toISOString()

        // Try multiple payload shapes to tolerate minor schema naming differences.
        await tryInsertWithPayloadVariants("github_repositories", [
            {
                clerk_user_id: userId,
                github_repo_id: repoIdNumber,
                owner: repository.owner,
                name: repository.name,
                scan_score: repository.scanScore,
                scan_findings: repository.scanFindings,
                secrets_risk: repository.secretsRisk,
                scan_summary: repository.scanSummary,
                languages: repository.languages,
                has_workflows: repository.hasWorkflows,
                has_tests: repository.hasTests,
                last_scanned_at: nowIso,
                updated_at: nowIso,
            },
            {
                clerk_user_id: userId,
                github_repo_id: repoIdNumber,
                owner_login: repository.owner,
                repository_name: repository.name,
                score: repository.scanScore,
                findings: repository.scanFindings,
                summary: repository.scanSummary,
                secrets_risk: repository.secretsRisk,
                languages: repository.languages,
                has_workflows: repository.hasWorkflows,
                has_tests: repository.hasTests,
                updated_at: nowIso,
            },
            {
                clerk_user_id: userId,
                github_repo_id: repoIdNumber,
                repository_name: repository.name,
                last_scan_score: repository.scanScore,
                last_scan_findings: repository.scanFindings,
                last_scanned_at: nowIso,
            },
        ])

        await tryInsertWithPayloadVariants("scan_runs", [
            {
                clerk_user_id: userId,
                github_repo_id: repoIdNumber,
                repository_name: repository.name,
                scan_score: repository.scanScore,
                scan_findings: repository.scanFindings,
                secrets_risk: repository.secretsRisk,
                scan_summary: repository.scanSummary,
                languages: repository.languages,
                has_workflows: repository.hasWorkflows,
                has_tests: repository.hasTests,
                created_at: nowIso,
            },
            {
                clerk_user_id: userId,
                github_repo_id: repoIdNumber,
                repo_name: repository.name,
                score: repository.scanScore,
                findings: repository.scanFindings,
                summary: repository.scanSummary,
                created_at: nowIso,
            },
        ])
    }
}

export async function handleGithubRepositories() {
    const { userId } = auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await clerkClient.users.getUser(userId)
    const token = getAccessTokenFromMetadata(user)

    if (!token) {
        return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
    }

    const repos = await githubRequest<GithubRepo[]>(
        token,
        "/user/repos?sort=updated&per_page=100&visibility=all"
    )

    const scanned = await Promise.all(
        repos.map(async (repo) => {
            let scan: RepositoryScan | null = null
            try {
                scan = await scanRepository(token, repo.owner.login, repo.name, repo.default_branch)
            } catch {
                scan = null
            }

            return {
                id: String(repo.id),
                name: repo.name,
                owner: repo.owner.login,
                status: "active" as const,
                strictMode: true,
                securityScan: true,
                autoFix: true,
                ignoreLint: false,
                lastAnalyzed: toRelativeTime(repo.pushed_at || repo.updated_at),
                totalPRs: 0,
                openPRs: Math.max(0, repo.open_issues_count),
                scanScore: scan?.score ?? 70,
                scanFindings: scan?.findings ?? 0,
                secretsRisk: scan?.secretsRisk ?? false,
                scanSummary: scan?.summary ?? "Scan partial; retry to complete deep analysis.",
                languages: scan?.languages ?? [],
                hasWorkflows: scan?.hasWorkflows ?? false,
                hasTests: scan?.hasTests ?? false,
            }
        })
    )

    try {
        await persistRepositoriesAndScans(userId, scanned)
    } catch {
        return NextResponse.json({ error: "Failed to persist repository scans" }, { status: 500 })
    }

    return NextResponse.json({ repositories: scanned })
}
