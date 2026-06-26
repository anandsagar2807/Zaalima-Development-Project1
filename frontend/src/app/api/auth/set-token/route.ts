import { NextResponse } from "next/server"

/**
 * Receives a JWT token via URL query parameter (from the backend OAuth callback)
 * and sets it as a same-origin httpOnly cookie on the Vercel domain.
 *
 * This solves the cross-origin cookie problem: the backend on Render cannot set
 * a cookie that the Vercel frontend can read (third-party cookie blocking).
 * Instead, the backend passes the token via URL, and this route sets it as a
 * first-party cookie on the Vercel domain.
 *
 * After setting the cookie, it redirects to /dashboard with the original query
 * params (github_connected, github_login).
 */
export async function GET(request: Request) {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")
    const githubConnected = url.searchParams.get("github_connected")
    const githubLogin = url.searchParams.get("github_login")

    if (!token) {
        // No token — redirect to home
        return NextResponse.redirect(new URL("/", request.url))
    }

    // Build the dashboard redirect URL with original params
    const dashboardUrl = new URL("/dashboard", request.url)
    if (githubConnected) {
        dashboardUrl.searchParams.set("github_connected", githubConnected)
    }
    if (githubLogin) {
        dashboardUrl.searchParams.set("github_login", githubLogin)
    }

    const response = NextResponse.redirect(dashboardUrl)

    // Set the JWT as a same-origin httpOnly cookie on the Vercel domain
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days (in seconds)
    })

    return response
}
