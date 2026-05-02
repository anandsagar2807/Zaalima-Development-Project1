import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { getInsforgeServerClient, upsertByLookup } from "@/lib/insforge-server"

interface GithubTokenResponse {
    access_token?: string
    scope?: string
    error?: string
    error_description?: string
}

interface GithubUserResponse {
    login?: string
}

function redirectToConnect(requestUrl: string, message: string) {
    const redirectUrl = new URL("/connect-github", requestUrl)
    redirectUrl.searchParams.set("error", message)
    return NextResponse.redirect(redirectUrl)
}

export async function handleGithubConnectCallback(request: Request) {
    const url = new URL(request.url)
    const { userId } = auth()
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    const oauthError = url.searchParams.get("error")

    if (oauthError) {
        return redirectToConnect(request.url, oauthError)
    }

    if (!code || !state) {
        return redirectToConnect(request.url, "missing_code_or_state")
    }

    const stateCookie = cookies().get("gitguard_github_oauth_state")?.value

    if (!stateCookie || stateCookie !== state) {
        return redirectToConnect(request.url, "invalid_oauth_state")
    }

    const clientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || `${url.origin}/api/connect-github/callback`

    if (!clientId || !clientSecret) {
        return redirectToConnect(request.url, "missing_oauth_config")
    }

    let tokenData: GithubTokenResponse | null = null
    try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
                state,
            }),
        })

        tokenData = (await tokenResponse.json()) as GithubTokenResponse
    } catch {
        return redirectToConnect(request.url, "token_exchange_failed")
    }

    if (!tokenData?.access_token) {
        return redirectToConnect(request.url, tokenData?.error || "missing_access_token")
    }

    let githubLogin = ""
    try {
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${tokenData.access_token}`,
                "X-GitHub-Api-Version": "2022-11-28",
            },
            cache: "no-store",
        })
        const userData = (await userResponse.json()) as GithubUserResponse
        githubLogin = userData.login || ""
    } catch {
        githubLogin = ""
    }

    if (userId) {
        try {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    gitguardGithubConnected: true,
                    gitguardGithubLogin: githubLogin || null,
                },
                privateMetadata: {
                    gitguardGithub: {
                        connected: true,
                        login: githubLogin || null,
                        connectedAt: new Date().toISOString(),
                        scope: tokenData.scope || null,
                        accessToken: tokenData.access_token,
                    },
                },
            })
        } catch {
            return redirectToConnect(request.url, "metadata_persist_failed")
        }

        const insforgeClient = getInsforgeServerClient()
        if (!insforgeClient) {
            return redirectToConnect(request.url, "missing_insforge_config")
        }

        try {
            const nowIso = new Date().toISOString()
            await upsertByLookup("github_connections", "clerk_user_id", userId, {
                clerk_user_id: userId,
                github_login: githubLogin || null,
                access_token: tokenData.access_token,
                scope: tokenData.scope || null,
                connected_at: nowIso,
                updated_at: nowIso,
            })
        } catch {
            return redirectToConnect(request.url, "insforge_persist_failed")
        }
    }

    const dashboardUrl = new URL("/dashboard", request.url)
    dashboardUrl.searchParams.set("github_connected", "1")
    if (githubLogin) {
        dashboardUrl.searchParams.set("github_login", githubLogin)
    }

    const response = NextResponse.redirect(dashboardUrl)
    response.cookies.set("gitguard_github_connected", "1", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    })
    if (githubLogin) {
        response.cookies.set("gitguard_github_login", githubLogin, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        })
    }
    response.cookies.delete("gitguard_github_oauth_state")

    return response
}
