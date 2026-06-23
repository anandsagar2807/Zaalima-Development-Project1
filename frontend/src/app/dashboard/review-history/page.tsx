"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { History, RefreshCw, AlertTriangle, CheckCircle, X, Code } from "lucide-react"
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

const statusIcons = {
    pending: AlertTriangle,
    applied: CheckCircle,
    dismissed: X,
}

export default function ReviewHistoryPage() {
    const { aiReviews, isLoadingReviews, error, fetchAIReviews, clearError } = useDashboardStore()
    const [filter, setFilter] = useState<"all" | "pending" | "applied" | "dismissed">("all")

    useEffect(() => {
        fetchAIReviews()
    }, [fetchAIReviews])

    useEffect(() => {
        if (error) {
            toast.error(error)
            clearError()
        }
    }, [error, clearError])

    const filteredReviews = aiReviews.filter((review) => filter === "all" || review.status === filter)

    const stats = {
        total: aiReviews.length,
        pending: aiReviews.filter((review) => review.status === "pending").length,
        applied: aiReviews.filter((review) => review.status === "applied").length,
        dismissed: aiReviews.filter((review) => review.status === "dismissed").length,
    }

    if (isLoadingReviews && aiReviews.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Review History</h1>
                    <p className="text-muted-foreground mt-1">
                        Track AI review outcomes across pull requests
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchAIReviews()
                        toast.success("Review history refreshed")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    disabled={isLoadingReviews}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingReviews ? "animate-spin" : ""}`} />
                    <span className="text-sm font-medium">Refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-yellow-500/5 border-yellow-500/20">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Applied</p>
                            <p className="text-2xl font-bold text-green-500">{stats.applied}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-gray-500/5 border-gray-500/20">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Dismissed</p>
                            <p className="text-2xl font-bold text-gray-500">{stats.dismissed}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
                {(["all", "pending", "applied", "dismissed"] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </motion.div>

            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No review history found</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    filteredReviews.map((review) => {
                        const StatusIcon = statusIcons[review.status]

                        return (
                            <motion.div key={review.id} variants={itemVariants}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <History className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{review.title}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {review.fileName} • Line {review.lineNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                                                    {review.issueType}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                                                    {review.severity}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${review.status === "applied"
                                                        ? "bg-green-500/10 text-green-500"
                                                        : review.status === "dismissed"
                                                            ? "bg-gray-500/10 text-gray-500"
                                                            : "bg-yellow-500/10 text-yellow-500"
                                                    }`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {review.status}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground">{review.description}</p>
                                        <div className="rounded-lg border bg-muted/40 p-4">
                                            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                                                <Code className="h-4 w-4" />
                                                Suggested Fix
                                            </div>
                                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{review.suggestedFix}</pre>
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