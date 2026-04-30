import "dotenv/config"

const toPositiveInteger = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: toPositiveInteger(process.env.PORT, 4000),
    githubToken: process.env.GITHUB_TOKEN || "",
    githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || "",
    databaseUrl: process.env.DATABASE_URL || "",

    // LLM configuration
    llmApiKey: process.env.LLM_API_KEY || "",
    llmBaseUrl: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
    llmModel: process.env.LLM_MODEL || "gpt-4o-mini",
    llmMaxTokens: toPositiveInteger(process.env.LLM_MAX_TOKENS, 4096),
    llmTimeoutMs: toPositiveInteger(process.env.LLM_TIMEOUT_MS, 60000),
    llmMaxDiffSize: toPositiveInteger(process.env.LLM_MAX_DIFF_SIZE, 50000),
}

export function assertEnv() {
    if (!env.githubToken) {
        throw new Error("Missing required environment variable: GITHUB_TOKEN")
    }
    if (!env.llmApiKey) {
        throw new Error("Missing required environment variable: LLM_API_KEY")
    }
}
