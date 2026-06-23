"use client"

import { Component, ReactNode } from "react"

interface ClerkGuardProps {
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Error boundary that catches errors from Clerk hooks/components when
 * ClerkProvider is not available (e.g., missing publishable key).
 * Renders the fallback (or nothing) instead of crashing the entire page.
 */
export class ClerkGuard extends Component<ClerkGuardProps, { hasError: boolean }> {
    constructor(props: ClerkGuardProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? null
        }
        return this.props.children
    }
}
