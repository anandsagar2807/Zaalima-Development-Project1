/**
 * Prompt template for LLM-based PR diff analysis.
 *
 * Constructs a system + user message pair that instructs the LLM to
 * review a pull-request diff and return structured JSON with detected
 * bugs, security vulnerabilities, performance issues, and bad practices.
 */

import type { IssueType, IssueSeverity } from "../types/llm-analysis"

/** Human-readable labels for each issue type (used in the prompt). */
const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
    bug: "Bug — logic errors, off-by-one, null dereferences, race conditions, etc.",
    security: "Security — injection, XSS, CSRF, auth bypass, secrets in code, etc.",
    performance: "Performance — N+1 queries, memory leaks, unnecessary re-renders, blocking I/O, etc.",
    bad_practice: "Bad Practice — code smells, missing error handling, hard-coded values, poor naming, etc.",
}

const SEVERITY_LEVELS = "critical, high, medium, low, info"

/**
 * Builds the system prompt that sets the LLM's role and output constraints.
 */
export function buildSystemPrompt(): string {
    return `You are GitGuard AI, an expert code reviewer. Your job is to analyse pull-request diffs and surface actionable issues.

You MUST classify every issue you find into exactly one of these categories:
${Object.entries(ISSUE_TYPE_LABELS)
    .map(([key, label]) => `  - "${key}": ${label}`)
    .join("\n")}

For each issue you MUST assign a severity from: ${SEVERITY_LEVELS}.

RULES:
1. Only report REAL issues — do not hallucinate or speculate.
2. Every issue must include a concrete, copy-paste-ready fix suggestion.
3. If the diff is clean and has no issues, return an empty issues array.
4. Respond ONLY with valid JSON — no markdown fences, no commentary before or after.
5. The JSON must conform exactly to this schema:
{
  "issues": [
    {
      "type": "<one of: bug | security | performance | bad_practice>",
      "severity": "<one of: critical | high | medium | low | info>",
      "description": "<clear, concise description of the issue>",
      "fix": "<concrete suggestion to fix the issue>"
    }
  ]
}`
}

/**
 * Builds the user prompt that contains the actual PR diff.
 *
 * @param diff - The raw unified diff of the pull request
 * @param metadata - Optional metadata about the PR for context
 */
export function buildUserPrompt(
    diff: string,
    metadata?: { repo?: string; pullNumber?: number; author?: string }
): string {
    const header = metadata
        ? `Review the following pull-request diff from ${metadata.repo ?? "a repository"}#${metadata.pullNumber ?? "?"}${metadata.author ? ` by @${metadata.author}` : ""}.`
        : "Review the following pull-request diff."

    return `${header}

--- DIFF START ---
${diff}
--- DIFF END ---

Return your analysis as JSON conforming to the schema described in the system prompt. If no issues are found, return {"issues":[]}.`
}