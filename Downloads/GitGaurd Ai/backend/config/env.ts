import dotenv from "dotenv"
import path from "path"

// Load backend/.env relative to CWD (project root when running via npm scripts)
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") })

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

    // GitHub OAuth (used by connect-github & connect-github-callback)
    githubClientId: process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    githubOAuthRedirectUri: process.env.GITHUB_OAUTH_REDIRECT_URI || "",
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || "http://localhost:4000/auth/github/callback",

    // JWT & Encryption
    jwtSecret: process.env.JWT_SECRET || "default-jwt-secret-change-in-production",
    encryptionKey: process.env.ENCRYPTION_KEY || "default-encryption-key-change-in-production",

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

    // LLM configuration
    llmApiKey: process.env.LLM_API_KEY || "",
    llmBaseUrl: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
    llmModel: process.env.LLM_MODEL || "gpt-4o-mini",
    llmMaxTokens: toPositiveInteger(process.env.LLM_MAX_TOKENS, 4096),
    llmTimeoutMs: toPositiveInteger(process.env.LLM_TIMEOUT_MS, 60000),
    llmMaxDiffSize: toPositiveInteger(process.env.LLM_MAX_DIFF_SIZE, 50000),

    // Insforge Integration (DISABLED)
    enableInsforge: process.env.ENABLE_INSFORGE === "true",
    insforgeApiBaseUrl: process.env.INSFORGE_API_BASE_URL || "",
    insforgeApiKey: process.env.INSFORGE_API_KEY || "",
}

export function assertEnv() {
    if (!env.githubToken) {
        throw new Error("Missing required environment variable: GITHUB_TOKEN")
    }
    if (!env.llmApiKey) {
        throw new Error("Missing required environment variable: LLM_API_KEY")
    }
}
