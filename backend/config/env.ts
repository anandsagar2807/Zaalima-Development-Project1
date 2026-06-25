import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Resolve .env.backend relative to this file (backend/config/../.env.backend)
// This works regardless of CWD — whether started from project root or backend/ dir
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, "../.env.backend")

const dotenvResult = dotenv.config({ path: envPath })
if (dotenvResult.error) {
    console.warn(`Warning: Could not load .env.backend from ${envPath}:`, dotenvResult.error.message)
} else {
    console.log(`Loaded ${Object.keys(dotenvResult.parsed || {}).length} env vars from ${envPath}`)
}

const toPositiveInteger = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    // Render sets PORT automatically; fall back to 4000 for local dev
    port: toPositiveInteger(process.env.PORT, 4000),
    githubToken: process.env.GITHUB_TOKEN || "",
    githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || "",
    mongoUri: process.env.MONGO_URI || "",

    // GitHub OAuth (used by connect-github & connect-github-callback)
    githubClientId: process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    githubOAuthRedirectUri: process.env.GITHUB_OAUTH_REDIRECT_URI || "",
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || "http://localhost:4000/api/auth/github/callback",

    // JWT & Encryption
    jwtSecret: process.env.JWT_SECRET || "default-jwt-secret-change-in-production",
    encryptionKey: process.env.ENCRYPTION_KEY || "default-encryption-key-change-in-production",

    // Frontend — in production default to the known Vercel deployment so
    // post-OAuth redirects work even if FRONTEND_URL isn't explicitly set.
    frontendUrl:
        process.env.FRONTEND_URL ||
        (process.env.NODE_ENV === "production"
            ? "https://frontend-amber-six-35.vercel.app"
            : "http://localhost:3000"),

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
    // GitHub OAuth credentials are required
    if (!env.githubClientId) {
        console.warn("Warning: GITHUB_CLIENT_ID not set. GitHub OAuth will not work.")
    }
    if (!env.githubClientSecret) {
        console.warn("Warning: GITHUB_CLIENT_SECRET not set. GitHub OAuth will not work.")
    }

    // Optional: GitHub token for advanced features
    if (!env.githubToken) {
        console.warn("Warning: GITHUB_TOKEN not set. Some features may be limited.")
    }

    // Optional: LLM for AI features
    if (!env.llmApiKey) {
        console.warn("Warning: LLM_API_KEY not set. AI features will use mock data.")
    }
}
