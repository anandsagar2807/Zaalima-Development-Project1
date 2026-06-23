/**
 * Custom error classes for the GitGuard AI backend.
 *
 * Provides a hierarchy of typed errors for:
 * - LLM API communication failures
 * - LLM response parsing failures
 * - Rate limiting / timeout scenarios
 * - General analysis pipeline errors
 */

import { LLMResponseParseError } from "../services/response.parser"

/**
 * Base error class for all GitGuard AI errors.
 * Includes a machine-readable `code` for programmatic handling.
 */
export class GitGuardError extends Error {
    constructor(
        message: string,
        public readonly code: string
    ) {
        super(message)
        this.name = "GitGuardError"
    }
}

/**
 * Thrown when the LLM API request fails (network error, HTTP 4xx/5xx, etc.).
 */
export class LLMApiError extends GitGuardError {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly responseBody?: string
    ) {
        super(message, "LLM_API_ERROR")
        this.name = "LLMApiError"
    }
}

/**
 * Thrown when the LLM request times out.
 */
export class LLMTimeoutError extends GitGuardError {
    constructor(
        message: string,
        public readonly timeoutMs: number
    ) {
        super(message, "LLM_TIMEOUT_ERROR")
        this.name = "LLMTimeoutError"
    }
}

/**
 * Thrown when the LLM API returns a rate-limit response (429).
 */
export class LLMRateLimitError extends GitGuardError {
    constructor(
        message: string,
        public readonly retryAfterMs?: number
    ) {
        super(message, "LLM_RATE_LIMIT_ERROR")
        this.name = "LLMRateLimitError"
    }
}

/**
 * Thrown when the diff is too large or empty for analysis.
 */
export class InvalidDiffError extends GitGuardError {
    constructor(message: string) {
        super(message, "INVALID_DIFF_ERROR")
        this.name = "InvalidDiffError"
    }
}

/**
 * Type guard: checks if an error is a GitGuardError (or any subclass).
 */
export function isGitGuardError(err: unknown): err is GitGuardError {
    return err instanceof GitGuardError
}

/**
 * Type guard: checks if an error is an LLMResponseParseError.
 */
export function isParseError(err: unknown): err is LLMResponseParseError {
    return err instanceof LLMResponseParseError
}

/**
 * Returns a user-friendly error message and appropriate HTTP status code
 * based on the error type.
 */
export function classifyError(err: unknown): {
    statusCode: number
    message: string
    code: string
} {
    if (err instanceof LLMRateLimitError) {
        return {
            statusCode: 429,
            message: "LLM rate limit exceeded. Please try again later.",
            code: err.code,
        }
    }

    if (err instanceof LLMTimeoutError) {
        return {
            statusCode: 504,
            message: "LLM analysis timed out.",
            code: err.code,
        }
    }

    if (err instanceof LLMApiError) {
        const status = err.statusCode ?? 502
        return {
            statusCode: status >= 500 ? 502 : status,
            message: "Failed to get analysis from LLM provider.",
            code: err.code,
        }
    }

    if (err instanceof LLMResponseParseError) {
        return {
            statusCode: 502,
            message: "LLM returned an invalid response format.",
            code: "LLM_PARSE_ERROR",
        }
    }

    if (err instanceof InvalidDiffError) {
        return {
            statusCode: 422,
            message: err.message,
            code: err.code,
        }
    }

    if (err instanceof GitGuardError) {
        return {
            statusCode: 500,
            message: err.message,
            code: err.code,
        }
    }

    return {
        statusCode: 500,
        message: "An unexpected error occurred during analysis.",
        code: "INTERNAL_ERROR",
    }
}