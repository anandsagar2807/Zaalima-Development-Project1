/**
 * LLM Service — sends PR diffs to an LLM API and returns structured analysis.
 *
 * Uses the OpenAI-compatible chat completions API (works with OpenAI,
 * Azure OpenAI, Groq, Together, Ollama, or any compatible endpoint).
 */

import OpenAI from "openai"
import { env } from "../config/env"
import { logger } from "../utils/logger"
import { buildSystemPrompt, buildUserPrompt } from "./prompt.template"
import { parseLLMResponse } from "./response.parser"
import { LLMApiError, LLMTimeoutError, LLMRateLimitError, InvalidDiffError } from "../utils/errors"
import type { LLMAnalysisResult } from "../types/llm-analysis"

/** Lazily-instantiated OpenAI client (shared across calls). */
let client: OpenAI | null = null

function getClient(): OpenAI {
    if (!client) {
        client = new OpenAI({
            apiKey: env.llmApiKey,
            baseURL: env.llmBaseUrl,
            timeout: env.llmTimeoutMs,
        })
        logger.info("OpenAI client initialised", {
            baseURL: env.llmBaseUrl,
            model: env.llmModel,
        })
    }
    return client
}

/**
 * Validates the diff before sending it to the LLM.
 *
 * @throws InvalidDiffError if the diff is empty or exceeds the size limit
 */
function validateDiff(diff: string): void {
    if (!diff || diff.trim().length === 0) {
        throw new InvalidDiffError("The pull request diff is empty — nothing to analyse.")
    }

    if (diff.length > env.llmMaxDiffSize) {
        throw new InvalidDiffError(
            `The diff is too large to analyse (${diff.length} chars). Maximum allowed: ${env.llmMaxDiffSize} chars.`
        )
    }
}

/**
 * Truncates a diff to the maximum allowed size, keeping the most recent changes.
 * Older changes (at the start) are dropped; a notice is prepended.
 */
function truncateDiff(diff: string): string {
    if (diff.length <= env.llmMaxDiffSize) return diff

    const truncated = diff.slice(diff.length - env.llmMaxDiffSize)
    const notice = "\n\n[... TRUNCATED: older changes omitted ...]\n\n"
    return notice + truncated
}

/**
 * Sends a PR diff to the LLM and returns a structured analysis result.
 *
 * @param diff - The raw unified diff of the pull request
 * @param metadata - Optional PR metadata for richer prompts
 * @returns Parsed and validated LLM analysis result
 */
export async function analyseDiffWithLLM(
    diff: string,
    metadata?: { repo?: string; pullNumber?: number; author?: string }
): Promise<LLMAnalysisResult> {
    // 1. Validate input
    validateDiff(diff)

    const safeDiff = truncateDiff(diff)

    // 2. Build prompts
    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildUserPrompt(safeDiff, metadata)

    logger.info("Sending diff to LLM for analysis", {
        model: env.llmModel,
        diffLength: diff.length,
        truncated: diff.length !== safeDiff.length,
    })

    // 3. Call the LLM API
    let rawResponse: string

    try {
        const openai = getClient()
        const completion = await openai.chat.completions.create({
            model: env.llmModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            max_tokens: env.llmMaxTokens,
            temperature: 0.2,
        })

        const content = completion.choices?.[0]?.message?.content

        if (!content) {
            throw new LLMApiError(
                "LLM returned an empty response",
                200,
                JSON.stringify(completion)
            )
        }

        rawResponse = content

        logger.info("LLM response received", {
            model: env.llmModel,
            responseLength: rawResponse.length,
            usage: completion.usage
                ? {
                    promptTokens: completion.usage.prompt_tokens,
                    completionTokens: completion.usage.completion_tokens,
                    totalTokens: completion.usage.total_tokens,
                }
                : undefined,
        })
    } catch (err) {
        // Handle OpenAI API errors
        if (err instanceof OpenAI.APIError) {
            const status = err.status ?? 500

            if (status === 429) {
                const retryAfter = err.headers?.["retry-after"]
                const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : undefined
                throw new LLMRateLimitError(
                    `LLM rate limit exceeded: ${err.message}`,
                    retryAfterMs
                )
            }

            throw new LLMApiError(
                `LLM API error (${status}): ${err.message}`,
                status,
                err.error?.toString()
            )
        }

        // Detect timeout / connection errors
        // OpenAI SDK wraps timeout errors in APIConnectionError
        if (
            err instanceof OpenAI.APIConnectionError ||
            (err instanceof Error && /timeout|timed out|aborted|ECONNRESET/i.test(err.message))
        ) {
            throw new LLMTimeoutError(
                `LLM request timed out after ${env.llmTimeoutMs}ms`,
                env.llmTimeoutMs
            )
        }

        // Re-throw our own errors
        if (
            err instanceof LLMApiError ||
            err instanceof LLMTimeoutError ||
            err instanceof LLMRateLimitError ||
            err instanceof InvalidDiffError
        ) {
            throw err
        }

        // Unknown error
        throw new LLMApiError(
            `Unexpected error calling LLM: ${err instanceof Error ? err.message : "unknown"}`,
            undefined,
            err instanceof Error ? err.stack : undefined
        )
    }

    // 4. Parse and validate the response
    try {
        return parseLLMResponse(rawResponse)
    } catch (parseErr) {
        logger.error("Failed to parse LLM response", {
            rawResponsePreview: rawResponse.slice(0, 500),
            error: parseErr instanceof Error ? parseErr.message : "unknown",
        })
        throw parseErr
    }
}