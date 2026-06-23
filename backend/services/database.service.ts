// Database service – stub implementation for MongoDB migration
// This service is used for storing PR review analysis results
// TODO: Implement MongoDB models and queries for reviews, pull requests, repositories, and settings

import { logger } from '../utils/logger';
import type { PullRequestContext } from '../types/github-webhook';
import type { LLMAnalysisResult } from '../types/llm-analysis';

export type StoredReviewHistoryItem = {
    id: string;
    title: string;
    fileName: string;
    issueType: string;
    severity: string;
    description: string;
    suggestedFix: string;
    lineNumber: number;
    codeSnippet: string;
    status: string;
    prId: string;
    repository: string;
    reviewedAt: string;
};

export type StoredSettings = {
    severityThreshold: string;
    autoComments: boolean;
    autoFixes: boolean;
    llmTemperature: number;
    maxDiffSize: number;
    reviewDelay: number;
    strictMode: boolean;
    ignoreStyling: boolean;
    securityScan: boolean;
};

const DEFAULT_SETTINGS: StoredSettings = {
    severityThreshold: 'medium',
    autoComments: true,
    autoFixes: true,
    llmTemperature: 0.7,
    maxDiffSize: 5000,
    reviewDelay: 0,
    strictMode: true,
    ignoreStyling: false,
    securityScan: true,
};

export async function getSystemSettings(): Promise<StoredSettings> {
    // TODO: Implement MongoDB query
    return DEFAULT_SETTINGS;
}

export async function updateSystemSettings(partial: Partial<StoredSettings>): Promise<StoredSettings> {
    // TODO: Implement MongoDB query
    return { ...DEFAULT_SETTINGS, ...partial };
}

export async function saveReviewAnalysis(
    context: PullRequestContext,
    analysis: LLMAnalysisResult,
    reviewResponse?: { id?: number | string; html_url?: string | null }
): Promise<void> {
    // TODO: Implement MongoDB insert
    logger.info('Review analysis saved (stub)', {
        owner: context.owner,
        repo: context.repo,
        pullNumber: context.pullNumber,
        issuesCount: analysis.issues.length,
    });
}

export async function listReviewHistory(): Promise<StoredReviewHistoryItem[]> {
    // TODO: Implement MongoDB query
    return [];
}
