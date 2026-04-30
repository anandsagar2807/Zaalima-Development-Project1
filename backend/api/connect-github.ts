import { NextResponse } from "next/server"

export async function handleConnectGithub(request: Request) {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const url = new URL(request.url)

    // Fallback keeps the flow usable even before OAuth env vars are configured.
    if (!clientId) {
        return NextResponse.redirect("https://github.com/apps")
    }

    const state = crypto.randomUUID()
    const callbackUri = process.env.GITHUB_OAUTH_REDIRECT_URI || `${url.origin}/api/connect-github/callback`

    const authorizeUrl = new URL("https://github.com/login/oauth/authorize")
    authorizeUrl.searchParams.set("client_id", clientId)
    authorizeUrl.searchParams.set("scope", "read:user user:email repo")
    authorizeUrl.searchParams.set("state", state)
    authorizeUrl.searchParams.set("redirect_uri", callbackUri)

    const response = NextResponse.redirect(authorizeUrl)
    response.cookies.set("gitguard_github_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
    })

    return response
}
