import type { Request, Response } from "express"
import crypto from "node:crypto"
import { fetchPullRequestDiff, postPullRequestReviewComment } from "../services/github.service"
import { analyseDiffWithLLM } from "../services/llm.service"
import { logger } from "../utils/logger"
import { AnalysisTimer } from "../utils/performance"
import { classifyError } from "../utils/errors"
import { env } from "../config/env"
import type { GitHubPullRequestWebhookPayload, PullRequestContext } from "../types/github-webhook"
import { saveReviewAnalysis } from "../services/database.service"

function parsePullRequestContext(payload: GitHubPullRequestWebhookPayload): PullRequestContext | null {
    const owner = payload.repository?.owner?.login || ""
    const repo = payload.repository?.name || ""
    const pullNumber = payload.pull_request?.number

    if (!owner || !repo || typeof pullNumber !== "number") {
        return null
    }

    return {
        owner,
        repo,
        pullNumber,
        diffUrl: payload.pull_request?.diff_url,
        htmlUrl: payload.pull_request?.html_url,
    }
}

function verifyWebhookSignature(rawBody: string | undefined, signatureHeader: string | undefined): boolean {
    if (!env.githubWebhookSecret) {
        return true
    }

    if (!rawBody || !signatureHeader?.startsWith("sha256=")) {
        return false
    }

    const expectedSignature = crypto
        .createHmac("sha256", env.githubWebhookSecret)
        .update(rawBody)
        .digest("hex")

    const receivedSignature = signatureHeader.slice("sha256=".length)

    if (expectedSignature.length !== receivedSignature.length) {
        return false
    }

    return crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(receivedSignature, "hex"))
}

export async function githubWebhookController(req: Request, res: Response) {
    const timer = new AnalysisTimer()
    const payload = req.body as GitHubPullRequestWebhookPayload
    const rawBody = (req as Request & { rawBody?: string }).rawBody
    const signature = req.header("x-hub-signature-256") || undefined

    if (!verifyWebhookSignature(rawBody, signature)) {
        return res.status(401).json({ error: "Invalid webhook signature" })
    }

    if (payload.action !== "opened") {
        return res.status(202).json({ received: true, skipped: true, reason: "action_not_opened" })
    }

    const context = parsePullRequestContext(payload)
    if (!context) {
        return res.status(400).json({ error: "Invalid webhook payload" })
    }

    logger.info("GitHub pull request webhook received", {
        owner: context.owner,
        repo: context.repo,
        pullNumber: context.pullNumber,
        htmlUrl: context.htmlUrl,
    })

    try {
        // Step 1: Fetch the PR diff
        timer.startDiffFetch()
        const diff = await fetchPullRequestDiff(context)
        timer.endDiffFetch()

        logger.info("PR received and diff fetched", {
            owner: context.owner,
            repo: context.repo,
            pullNumber: context.pullNumber,
            diffLength: diff.length,
        })

        // Step 2: Send diff to LLM for analysis
        timer.startLLMCall()
        const analysisResult = await analyseDiffWithLLM(diff, {
            repo: `${context.owner}/${context.repo}`,
            pullNumber: context.pullNumber,
        })
        timer.endLLMCall()

        const reviewResponse = await postPullRequestReviewComment(context, analysisResult)

        await saveReviewAnalysis(context, analysisResult, reviewResponse)

        logger.info("GitHub PR review comment posted", {
            owner: context.owner,
            repo: context.repo,
            pullNumber: context.pullNumber,
            issuesCount: analysisResult.issues.length,
            githubReviewId: reviewResponse.id ?? null,
            githubCommentUrl: reviewResponse.html_url ?? null,
        })

        // Step 3: Log performance and return results
        timer.logSummary()

        const performance = timer.getMetrics()

        return res.status(200).json({
            received: true,
            repo: `${context.owner}/${context.repo}`,
            pullNumber: context.pullNumber,
            diffLength: diff.length,
            analysis: analysisResult,
            performance: {
                webhookReceivedAt: new Date(performance.webhookReceivedAt).toISOString(),
                diffFetchDurationMs: performance.diffFetchDurationMs,
                llmResponseDurationMs: performance.llmResponseDurationMs,
                totalDurationMs: performance.totalDurationMs,
                prOpenToLLMResponseMs: performance.diffFetchDurationMs + performance.llmResponseDurationMs,
            },
        })
    } catch (error) {
        const classified = classifyError(error)

        logger.error("Analysis pipeline failed", {
            owner: context.owner,
            repo: context.repo,
            pullNumber: context.pullNumber,
            errorCode: classified.code,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            statusCode: classified.statusCode,
        })

        return res.status(classified.statusCode).json({
            error: classified.message,
            code: classified.code,
            repo: `${context.owner}/${context.repo}`,
            pullNumber: context.pullNumber,
        })
    }
}