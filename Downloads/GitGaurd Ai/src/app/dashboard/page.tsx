"use client"

import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { GitPullRequest, AlertTriangle, Shield, Zap, Clock, Wand2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStore } from "@/store/dashboardStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

import { containerVariants, itemVariants } from "@/lib/animations"
import { GitHubConnectModal } from "@/components/auth/github-connect-modal"

const statIcons = {
    totalPRs: GitPullRequest,
    issuesDetected: AlertTriangle,
    securityWarnings: Shield,
    performanceWarnings: Zap,
    avgResponseTime: Clock,
    autoFixes: Wand2,
}

function DashboardContent() {
    return (
        <>
            <GitHubConnectModal />
            <DashboardContentInner />
        </>
    )
}

function DashboardContentInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isLoaded: clerkLoaded, isSignedIn, user: clerkUser } = useUser()
    const { loading: authLoading, checkSession } = useAuthStore()
    const {
        analytics,
        prsPerDayData,
        issuesBySeverity,
        securityVsBugData,
        isLoadingAnalytics,
        error,
        fetchAnalytics,
        clearError,
    } = useDashboardStore()

    // Redirect to homepage if not authenticated (use Clerk for auth status)
    useEffect(() => {
        if (clerkLoaded && !isSignedIn) {
            router.push("/")
        }
    }, [clerkLoaded, isSignedIn, router])

    // Once Clerk confirms auth, also sync auth store for backward compat
    useEffect(() => {
        if (clerkLoaded && isSignedIn && clerkUser) {
            checkSession()
        }
    }, [clerkLoaded, isSignedIn, clerkUser, checkSession])

    useEffect(() => {
        if (isSignedIn) {
            fetchAnalytics()
        }
    }, [isSignedIn, fetchAnalytics])

    useEffect(() => {
        if (error) {
            toast.error(error)
            clearError()
        }
    }, [error, clearError])

    // Show success message when redirected from GitHub authorization
    useEffect(() => {
        const githubConnected = searchParams?.get("github_connected")
        const githubLogin = searchParams?.get("github_login")

        if (githubConnected === "true" || githubConnected === "1") {
            // Refresh session to get updated GitHub connection status
            checkSession()

            const message = githubLogin
                ? `GitHub account @${githubLogin} connected successfully!`
                : "GitHub account connected successfully!"
            toast.success(message)

            // Clean up URL parameters
            const url = new URL(window.location.href)
            url.searchParams.delete("github_connected")
            url.searchParams.delete("github_login")
            window.history.replaceState({}, "", url.toString())
        }
    }, [searchParams, checkSession])

    // Show loading state while Clerk initializes
    if (!clerkLoaded || (authLoading && !isSignedIn)) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Auto-refresh analytics every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAnalytics()
        }, 30000)
        return () => clearInterval(interval)
    }, [fetchAnalytics])

    if (isLoadingAnalytics && !analytics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const stats = analytics
        ? [
            { key: "totalPRs", label: "Total PRs", value: analytics.totalPRs.toLocaleString() },
            { key: "issuesDetected", label: "Issues Detected", value: analytics.issuesDetected.toLocaleString() },
            { key: "securityWarnings", label: "Security Warnings", value: analytics.securityWarnings },
            { key: "performanceWarnings", label: "Performance Warnings", value: analytics.performanceWarnings },
            { key: "avgResponseTime", label: "Avg Response Time", value: `${analytics.avgResponseTime}s` },
            { key: "autoFixes", label: "Auto Fixes Applied", value: analytics.autoFixes.toLocaleString() },
        ]
        : []

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor your GitGuard AI activity and analytics
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchAnalytics()
                        toast.success("Analytics refreshed")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    disabled={isLoadingAnalytics}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingAnalytics ? "animate-spin" : ""}`} />
                    <span className="text-sm font-medium">Refresh</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat) => {
                    const Icon = statIcons[stat.key as keyof typeof statIcons]
                    return (
                        <motion.div key={stat.key} variants={itemVariants}>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                        </div>
                                        <Icon className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* PRs Per Day - Line Chart */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle>PRs Analyzed Per Day</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={prsPerDayData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="day" className="text-xs" />
                                        <YAxis className="text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="prs"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(var(--primary))" }}
                                            name="PRs"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="issues"
                                            stroke="hsl(var(--destructive))"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(var(--destructive))" }}
                                            name="Issues"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Issues by Severity - Pie Chart */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Issues by Severity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={issuesBySeverity}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                                            }
                                        >
                                            {issuesBySeverity.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-4">
                                {issuesBySeverity.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-muted-foreground">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Security vs Bug - Bar Chart */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle>Issues Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={securityVsBugData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Auto-refresh notice */}
            <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground">
                <p>Data refreshes automatically every 30 seconds</p>
            </motion.div>
        </motion.div>
    )
}

export default function DashboardOverview() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}
