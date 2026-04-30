/**
 * Performance timing utility for the analysis pipeline.
 *
 * Tracks:
 * - Webhook received timestamp
 * - Diff fetch duration
 * - LLM response duration
 * - Total end-to-end duration
 */

import type { AnalysisPerformanceMetrics } from "../types/llm-analysis"
import { logger } from "./logger"

/**
 * A stopwatch-like helper that accumulates elapsed time for named phases.
 */
export class AnalysisTimer {
    private webhookReceivedAt: number
    private diffFetchStart: number = 0
    private diffFetchDurationMs: number = 0
    private llmCallStart: number = 0
    private llmResponseDurationMs: number = 0

    constructor() {
        this.webhookReceivedAt = Date.now()
    }

    /**
     * Call when the webhook is first received (called automatically in constructor).
     * Can be called again to reset the timer.
     */
    markWebhookReceived(): void {
        this.webhookReceivedAt = Date.now()
    }

    /**
     * Call just before fetching the PR diff.
     */
    startDiffFetch(): void {
        this.diffFetchStart = Date.now()
    }

    /**
     * Call immediately after the diff is fetched.
     */
    endDiffFetch(): void {
        if (this.diffFetchStart === 0) {
            logger.warn("endDiffFetch called without a matching startDiffFetch")
            return
        }
        this.diffFetchDurationMs = Date.now() - this.diffFetchStart
        logger.info("Diff fetch completed", {
            diffFetchDurationMs: this.diffFetchDurationMs,
        })
    }

    /**
     * Call just before sending the request to the LLM API.
     */
    startLLMCall(): void {
        this.llmCallStart = Date.now()
    }

    /**
     * Call immediately after receiving the LLM response.
     */
    endLLMCall(): void {
        if (this.llmCallStart === 0) {
            logger.warn("endLLMCall called without a matching startLLMCall")
            return
        }
        this.llmResponseDurationMs = Date.now() - this.llmCallStart
        logger.info("LLM call completed", {
            llmResponseDurationMs: this.llmResponseDurationMs,
        })
    }

    /**
     * Computes and returns the final performance metrics.
     */
    getMetrics(): AnalysisPerformanceMetrics {
        const totalDurationMs = Date.now() - this.webhookReceivedAt

        return {
            webhookReceivedAt: this.webhookReceivedAt,
            diffFetchDurationMs: this.diffFetchDurationMs,
            llmResponseDurationMs: this.llmResponseDurationMs,
            totalDurationMs,
        }
    }

    /**
     * Logs a summary of all performance metrics.
     */
    logSummary(): void {
        const metrics = this.getMetrics()
        logger.info("Analysis pipeline performance summary", {
            webhookReceivedAt: new Date(metrics.webhookReceivedAt).toISOString(),
            diffFetchDurationMs: `${metrics.diffFetchDurationMs}ms`,
            llmResponseDurationMs: `${metrics.llmResponseDurationMs}ms`,
            totalDurationMs: `${metrics.totalDurationMs}ms`,
            prOpenToLLMResponseMs: `${metrics.diffFetchDurationMs + metrics.llmResponseDurationMs}ms`,
        })
    }
}