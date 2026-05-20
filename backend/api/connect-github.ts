import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function handleConnectGithub(request: Request) {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

    if (!clientId) {
        const errorUrl = new URL("/connect-github", request.url)
        errorUrl.searchParams.set("error", "missing_oauth_config")
        return NextResponse.redirect(errorUrl)
    }

    // Generate CSRF state token directly in the Next.js domain so the
    // state cookie is readable by the callback handler (same origin).
    const state = crypto.randomBytes(32).toString("hex")

    // Always compute the callback URL from the request origin — never rely on
    // env vars that may be stale or gitignored. This guarantees redirect_uri
    // matches what GitHub OAuth App expects and avoids cross-origin errors.
    const redirectUri = new URL("/api/connect-github/callback", request.url).toString()

    // GitHub OAuth scopes
    const scope = ["read:user", "user:email", "repo", "read:org"].join(" ")

    // Set state cookie on the Next.js origin (port 3000) — this is the critical fix:
    // the callback runs on the same origin so the cookie is visible.
    cookies().set("gitguard_github_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 60, // 10 minutes
    })

    // Build GitHub authorization URL
    const authUrl = new URL("https://github.com/login/oauth/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", scope)
    authUrl.searchParams.set("state", state)

    return NextResponse.redirect(authUrl.toString())
}
