import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl border border-border/70 bg-card p-6 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Social-only sign up is enabled. Continue with Google or GitHub.
                </p>
                <div className="mt-5">
                    <SocialAuthButtons fullWidth />
                </div>
            </div>
        </div>
    )
}