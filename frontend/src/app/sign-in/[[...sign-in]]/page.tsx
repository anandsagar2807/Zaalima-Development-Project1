import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Sign In</h1>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                    Social-only auth mode is enabled. Continue with Google or Professional GitHub.
                </p>
                <div className="mt-5">
                    <SocialAuthButtons fullWidth />
                </div>
            </div>
        </div>
    )
}