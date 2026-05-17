import { NextResponse } from "next/server"

export async function handleConnectGithub(request: Request) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    // Delegate to the Express backend which sets the state cookie on port 4000.
    // This ensures the state cookie domain matches the callback domain,
    // preventing "invalid_state" errors.
    return NextResponse.redirect(`${apiUrl}/api/auth/github`)
}
