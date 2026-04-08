import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { sessionId } = await auth()

        if (!sessionId) {
            return NextResponse.json({ error: "No active session" }, { status: 400 })
        }

        const signOutUrl = new URL("/", request.url)
        const response = NextResponse.redirect(signOutUrl)

        // Clear Clerk cookies explicitly
        response.cookies.set("__session", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        })

        // Clear custom GitGuard cookies
        response.cookies.delete("gitguard_github_connected")
        response.cookies.delete("gitguard_github_login")
        response.cookies.delete("gitguard_github_oauth_state")

        return response
    } catch (error) {
        console.error("Sign-out error:", error)
        return NextResponse.json(
            { error: "Failed to sign out", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}
