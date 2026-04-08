"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Gauge, Clock, Database, Zap, TrendingUp, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStore } from "@/store/dashboardStore"
import { toast } from "sonner"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

const impactColors = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20",
}

const typeIcons = {
    "slow-loop": Clock,
    memory: Database,
    "api-call": Zap,
    query: TrendingUp,
}

export default function PerformancePage() {
    const {
        performanceIssues,
        isLoadingPerformance,
        error,
        fetchPerformanceIssues,
        clearError,
    } = useDashboardStore()

    useEffect(() => {
        fetchPerformanceIssues()
    }, [fetchPerformanceIssues])

    useEffect(() => {
        if (error) {
            toast.error(error)
            clearError()
        }
    }, [error, clearError])

    if (isLoadingPerformance && performanceIssues.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const avgScore = performanceIssues.length > 0
        ? Math.round(100 - performanceIssues.length * 5)
        : 100

    const stats = {
        total: performanceIssues.length,
        high: performanceIssues.filter((p) => p.impact === "high").length,
        medium: performanceIssues.filter((p) => p.impact === "medium").length,
        low: performanceIssues.filter((p) => p.impact === "low").length,
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500"
        if (score >= 60) return "text-yellow-500"
        return "text-red-500"
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Performance Insights</h1>
                    <p className="text-muted-foreground mt-1">
                        Analyze and optimize code performance
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchPerformanceIssues()
                        toast.success("Performance data refreshed")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    disabled={isLoadingPerformance}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingPerformance ? "animate-spin" : ""}`} />
                    <span className="text-sm font-medium">Refresh</span>
                </button>
            </div>

            {/* Performance Score */}
            <motion.div variants={itemVariants}>
                <Card className="overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-xl font-semibold mb-2">Overall Performance Score</h2>
                                <p className="text-muted-foreground">
                                    Calculated based on detected issues: score = 100 - issues * 5
                                </p>
                            </div>
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
                                    <div className="text-center">
                                        <span className={`text-4xl font-bold ${getScoreColor(avgScore)}`}>
                                            {avgScore}
                                        </span>
                                        <span className="text-muted-foreground">/100</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Issues</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Gauge className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">High Impact</p>
                                    <p className="text-2xl font-bold text-red-500">{stats.high}</p>
                                </div>
                                <Clock className="h-6 w-6 text-red-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-yellow-500/5 border-yellow-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Medium Impact</p>
                                    <p className="text-2xl font-bold text-yellow-500">{stats.medium}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Low Impact</p>
                                    <p className="text-2xl font-bold text-green-500">{stats.low}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Performance Issues</h2>
                {performanceIssues.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No performance issues found</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    performanceIssues.map((issue) => {
                        const TypeIcon = typeIcons[issue.type]
                        return (
                            <motion.div key={issue.id} variants={itemVariants}>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${impactColors[issue.impact]}`}>
                                                    <TypeIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{issue.title}</h3>
                                                        <span className={`px-2 py-0.5 rounded text-xs border ${impactColors[issue.impact]}`}>
                                                            {issue.impact} impact
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {issue.repository} • PR {issue.prNumber}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        {issue.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Performance Score</p>
                                                    <p className={`text-2xl font-bold ${getScoreColor(issue.performanceScore)}`}>
                                                        {issue.performanceScore}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Detected {issue.detectedAt}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </motion.div>
    )
}