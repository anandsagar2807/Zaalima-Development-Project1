/**
 * Response parser for LLM output.
 *
 * Handles:
 * - Extracting JSON from markdown code fences
 * - Validating the structure against the expected schema
 * - Normalising invalid enum values to closest match
 * - Returning a safe, typed LLMAnalysisResult
 */

import {
    VALID_ISSUE_TYPES,
    VALID_SEVERITIES,
} from "../types/llm-analysis"
import type {
    LLMIssue,
    LLMAnalysisResult,
    IssueType,
    IssueSeverity,
} from "../types/llm-analysis"
import { logger } from "../utils/logger"

/**
 * Custom error class for parsing failures.
 */
export class LLMResponseParseError extends Error {
    constructor(
        message: string,
        public readonly rawResponse?: string,
        public readonly cause?: unknown
    ) {
        super(message)
        this.name = "LLMResponseParseError"
    }
}

/**
 * Strips markdown code fences from the LLM response.
 * Some models wrap their JSON output in fences despite instructions not to.
 */
function stripCodeFences(text: string): string {
    const fencePattern = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/g
    let lastMatch: RegExpExecArray | null = null
    let match: RegExpExecArray | null

    while ((match = fencePattern.exec(text)) !== null) {
        lastMatch = match
    }

    if (lastMatch) {
        return lastMatch[1].trim()
    }

    return text.trim()
}

/**
 * Attempts to find a JSON object in the raw text by scanning for
 * the outermost `{ ... }` pair.
 */
function extractJsonObject(text: string): string {
    const firstBrace = text.indexOf("{")
    const lastBrace = text.lastIndexOf("}")

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new LLMResponseParseError(
            "No JSON object found in LLM response",
            text
        )
    }

    return text.slice(firstBrace, lastBrace + 1)
}

/**
 * Normalises an issue type string to a valid IssueType.
 * Falls back to "bad_practice" if no match is found.
 */
function normaliseType(raw: unknown): IssueType {
    if (typeof raw !== "string") return "bad_practice"

    const lowered = raw.toLowerCase().trim().replace(/\s+/g, "_")

    if (VALID_ISSUE_TYPES.includes(lowered as IssueType)) {
        return lowered as IssueType
    }

    const aliases: Record<string, IssueType> = {
        vulnerability: "security",
        sec: "security",
        perf: "performance",
        optimization: "performance",
        code_smell: "bad_practice",
        smell: "bad_practice",
        antipattern: "bad_practice",
        anti_pattern: "bad_practice",
        defect: "bug",
        error: "bug",
    }

    return aliases[lowered] ?? "bad_practice"
}

/**
 * Normalises a severity string to a valid IssueSeverity.
 * Falls back to "medium" if no match is found.
 */
function normaliseSeverity(raw: unknown): IssueSeverity {
    if (typeof raw !== "string") return "medium"

    const lowered = raw.toLowerCase().trim()

    if (VALID_SEVERITIES.includes(lowered as IssueSeverity)) {
        return lowered as IssueSeverity
    }

    const aliases: Record<string, IssueSeverity> = {
        blocker: "critical",
        fatal: "critical",
        major: "high",
        important: "high",
        minor: "low",
        trivial: "low",
        warning: "medium",
        note: "info",
        informational: "info",
        suggestion: "info",
    }

    return aliases[lowered] ?? "medium"
}

/**
 * Validates and normalises a single raw issue object.
 */
function validateIssue(raw: unknown, index: number): LLMIssue | null {
    if (typeof raw !== "object" || raw === null) {
        logger.warn(`Skipping invalid issue at index ${index}: not an object`)
        return null
    }

    const obj = raw as Record<string, unknown>

    const type = normaliseType(obj.type)
    const severity = normaliseSeverity(obj.severity)
    const description =
        typeof obj.description === "string" && obj.description.trim()
            ? obj.description.trim()
            : "(No description provided)"
    const fix =
        typeof obj.fix === "string" && obj.fix.trim()
            ? obj.fix.trim()
            : "(No fix suggestion provided)"

    return { type, severity, description, fix }
}

/**
 * Parses the raw LLM response string into a validated LLMAnalysisResult.
 *
 * @param rawResponse - The raw text returned by the LLM
 * @returns A validated and normalised analysis result
 * @throws LLMResponseParseError if the response cannot be parsed
 */
export function parseLLMResponse(rawResponse: string): LLMAnalysisResult {
    if (!rawResponse || typeof rawResponse !== "string") {
        throw new LLMResponseParseError(
            "LLM response is empty or not a string",
            rawResponse
        )
    }

    let jsonStr: string

    try {
        const cleaned = stripCodeFences(rawResponse)
        jsonStr = extractJsonObject(cleaned)
    } catch (err) {
        if (err instanceof LLMResponseParseError) throw err
        throw new LLMResponseParseError(
            "Failed to extract JSON from LLM response",
            rawResponse,
            err
        )
    }

    let parsed: unknown

    try {
        parsed = JSON.parse(jsonStr)
    } catch (err) {
        throw new LLMResponseParseError(
            `JSON parse error: ${err instanceof Error ? err.message : "unknown"}`,
            rawResponse,
            err
        )
    }

    if (typeof parsed !== "object" || parsed === null) {
        throw new LLMResponseParseError(
            "Parsed JSON is not an object",
            rawResponse
        )
    }

    const root = parsed as Record<string, unknown>

    if (!Array.isArray(root.issues)) {
        const arrayKey = Object.keys(root).find((k) => Array.isArray(root[k]))
        if (arrayKey) {
            root.issues = root[arrayKey]
        } else {
            root.issues = [root]
        }
    }

    const validatedIssues: LLMIssue[] = []
    const rawIssues = root.issues as unknown[]

    for (let i = 0; i < rawIssues.length; i++) {
        const issue = validateIssue(rawIssues[i], i)
        if (issue) {
            validatedIssues.push(issue)
        }
    }

    logger.info("LLM response parsed successfully", {
        totalRawIssues: rawIssues.length,
        validIssues: validatedIssues.length,
    })

    return { issues: validatedIssues }
}