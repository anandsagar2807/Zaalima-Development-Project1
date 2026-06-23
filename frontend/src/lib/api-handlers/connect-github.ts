import { NextResponse } from "next/server"

export async function handleConnectGithub(request: Request) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    // Delegate to the Express backend which handles the full OAuth flow:
    //  1. Sets state cookie on port 4000
    //  2. Redirects to GitHub with redirect_uri=...4000/api/auth/github/callback
    //  3. GitHub calls back to Express on port 4000 (same origin → cookie readable)
    //  4. Express exchanges token, stores user, redirects to frontend
    return NextResponse.redirect(`${apiUrl}/api/auth/github`)
}
