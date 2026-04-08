"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

interface GoogleAuthButtonProps {
    className?: string
    variant?: "default" | "outline" | "gradient" | "ghost"
    size?: "default" | "sm" | "lg" | "xl"
    label?: string
}

export function GoogleAuthButton({
    className,
    variant = "gradient",
    size = "sm",
    label = "Continue with Google",
}: GoogleAuthButtonProps) {
    const { isLoaded, signIn } = useSignIn()
    const [isLoading, setIsLoading] = useState(false)

    const onClick = async () => {
        if (!isLoaded || !signIn || isLoading) return

        try {
            setIsLoading(true)
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            type="button"
            onClick={onClick}
            variant={variant}
            size={size}
            disabled={!isLoaded || isLoading}
            className={className}
        >
            {isLoading ? "Redirecting..." : label}
        </Button>
    )
}
