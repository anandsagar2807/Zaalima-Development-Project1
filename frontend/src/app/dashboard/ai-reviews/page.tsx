"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Code, AlertTriangle, CheckCircle, X, Copy, Wand2, FileCode, RefreshCw } from "lucide-react"
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

const severityColors = {
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20",
}

const typeIcons = {
    bug: AlertTriangle,
    security: Code,
    performance: Code,
    style: FileCode,
    "best-practice": CheckCircle,
}

export default function AIReviewsPage() {
    const {
        aiReviews,
        isLoadingReviews,
        error,
        fetchAIReviews,
        applyFix,
        markResolved,
        ignoreRule,
        clearError,
    } = useDashboardStore()

    const [expandedReview, setExpandedReview] = useState<string | null>(null)
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

    const handleApplyFix = async (id: string) => {
        await applyFix(id)
        toast.success("Fix applied successfully")
    }

    const handleResolve = async (id: string) => {
        await markResolved(id)
        toast.success("Issue marked as resolved")
    }

    const handleIgnore = async (id: string) => {
        await ignoreRule(id)
        toast.success("Rule ignored")
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success("Code copied to clipboard")
    }

    const filteredReviews = aiReviews.filter((review) => {
        if (filter === "all") return true
        return review.status === filter
    })

    if (isLoadingReviews && aiReviews.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const stats = {
        total: aiReviews.length,
        pending: aiReviews.filter((r) => r.status === "pending").length,
        applied: aiReviews.filter((r) => r.status === "applied").length,
        dismissed: aiReviews.filter((r) => r.status === "dismissed").length,
        critical: aiReviews.filter((r) => r.severity === "critical").length,
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
                    <h1 className="text-3xl font-bold">AI Reviews</h1>
                    <p className="text-muted-foreground mt-1">
                        Review AI suggestions and apply fixes
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchAIReviews()
                        toast.success("Reviews refreshed")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    disabled={isLoadingReviews}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingReviews ? "animate-spin" : ""}`} />
                    <span className="text-sm font-medium">Refresh</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <motion.div variants={itemVariants}>
                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Critical</p>
                            <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filter */}
            <motion.div variants={itemVariants} className="flex gap-2">
                {(["all", "pending", "applied", "dismissed"] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === status
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </motion.div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No reviews found</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    filteredReviews.map((review) => {
                        const TypeIcon = typeIcons[review.issueType]
                        const isExpanded = expandedReview === review.id
                        return (
                            <motion.div key={review.id} variants={itemVariants}>
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div
                                            className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-lg ${severityColors[review.severity]}`}>
                                                        <TypeIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold">{review.title}</h3>
                                                            <span className={`px-2 py-0.5 rounded text-xs border ${severityColors[review.severity]}`}>
                                                                {review.severity}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${
                                                                review.status === "applied"
                                                                    ? "bg-green-500/10 text-green-500"
                                                                    : review.status === "dismissed"
                                                                    ? "bg-gray-500/10 text-gray-500"
                                                                    : "bg-yellow-500/10 text-yellow-500"
                                                            }`}>
                                                                {review.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {review.fileName} • Line {review.lineNumber}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            {review.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                {review.status === "pending" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleApplyFix(review.id)
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-sm"
                                                        >
                                                            <Wand2 className="h-4 w-4" />
                                                            Apply
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleIgnore(review.id)
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 text-sm"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Ignore
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && review.suggestedFix && (
                                            <div className="border-t p-4 bg-muted/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Suggested Fix</span>
                                                    <button
                                                        onClick={() => copyToClipboard(review.suggestedFix)}
                                                        className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                        Copy
                                                    </button>
                                                </div>
                                                <pre className="p-4 rounded-lg bg-background border overflow-x-auto text-sm">
                                                    <code>{review.suggestedFix}</code>
                                                </pre>
                                            </div>
                                        )}
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