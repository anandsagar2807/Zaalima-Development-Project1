"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Webhook, CheckCircle, XCircle, Clock, RefreshCw, GitPullRequest } from "lucide-react"
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

const statusColors = {
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusIcons = {
    success: CheckCircle,
    pending: Clock,
    failed: XCircle,
}

export default function WebhooksPage() {
    const {
        webhookLogs,
        isLoadingWebhooks,
        error,
        fetchWebhookLogs,
        clearError,
    } = useDashboardStore()

    const [filter, setFilter] = useState<"all" | "success" | "pending" | "failed">("all")

    useEffect(() => {
        fetchWebhookLogs()
        const interval = setInterval(fetchWebhookLogs, 5000)
        return () => clearInterval(interval)
    }, [fetchWebhookLogs])

    useEffect(() => {
        if (error) {
            toast.error(error)
            clearError()
        }
    }, [error, clearError])

    const filteredLogs = webhookLogs.filter((log) => {
        if (filter === "all") return true
        return log.status === filter
    })

    if (isLoadingWebhooks && webhookLogs.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const stats = {
        total: webhookLogs.length,
        success: webhookLogs.filter((l) => l.status === "success").length,
        pending: webhookLogs.filter((l) => l.status === "pending").length,
        failed: webhookLogs.filter((l) => l.status === "failed").length,
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
                    <h1 className="text-3xl font-bold">Webhook Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor webhook events and their status in real-time
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchWebhookLogs()
                        toast.success("Webhook logs refreshed")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    disabled={isLoadingWebhooks}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingWebhooks ? "animate-spin" : ""}`} />
                    <span className="text-sm font-medium">Refresh</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Events</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Webhook className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Success</p>
                                    <p className="text-2xl font-bold text-green-500">{stats.success}</p>
                                </div>
                                <CheckCircle className="h-6 w-6 text-green-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-yellow-500/5 border-yellow-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                                </div>
                                <Clock className="h-6 w-6 text-yellow-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                    <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                                </div>
                                <XCircle className="h-6 w-6 text-red-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filter */}
            <motion.div variants={itemVariants} className="flex gap-2">
                {(["all", "success", "pending", "failed"] as const).map((status) => (
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

            {/* Logs Timeline */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Event Timeline</h2>
                {filteredLogs.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No webhook logs found</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    filteredLogs.map((log) => {
                        const StatusIcon = statusIcons[log.status]
                        return (
                            <motion.div key={log.id} variants={itemVariants}>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${statusColors[log.status]}`}>
                                                <StatusIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{log.event}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[log.status]}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {log.repository} • PR {log.prNumber}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {log.details}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>{log.timestamp}</span>
                                                    {log.duration !== "-" && <span>Duration: {log.duration}</span>}
                                                </div>
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