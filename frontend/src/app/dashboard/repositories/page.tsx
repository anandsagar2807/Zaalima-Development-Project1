"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GitBranch, Play, Pause, Shield, Wand2, Search, Power, RefreshCw, FlaskConical, AlertTriangle, FileCode } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStore } from "@/store/dashboardStore"
import { toast } from "sonner"
import type { Repository } from "@/services/mockData"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

export default function RepositoriesPage() {
    const {
        repositories,
        isLoadingRepositories,
        error,
        repoSearchQuery,
        fetchRepositories,
        toggleRepositoryStatus,
        toggleStrictMode,
        toggleSecurityScan,
        toggleIgnoreStyling,
        toggleAutoFix,
        enableAllBots,
        setRepoSearchQuery,
        clearError,
    } = useDashboardStore()

    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused">("all")

    useEffect(() => {
        fetchRepositories()
    }, [fetchRepositories])

    useEffect(() => {
        if (error) {
            toast.error(error)
            clearError()
        }
    }, [error, clearError])

    const filteredRepositories = repositories.filter((repo) => {
        const matchesSearch =
            repo.name.toLowerCase().includes(repoSearchQuery.toLowerCase()) ||
            repo.owner.toLowerCase().includes(repoSearchQuery.toLowerCase())
        const matchesStatus = filterStatus === "all" || repo.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const handleToggleBot = async (id: string) => {
        const repo = repositories.find((r) => r.id === id)
        if (repo) {
            await toggleRepositoryStatus(id)
            toast.success(`Bot ${repo.status === "active" ? "paused" : "activated"} for ${repo.name}`)
        }
    }

    const handleToggleStrict = async (id: string) => {
        const repo = repositories.find((r) => r.id === id)
        if (repo) {
            await toggleStrictMode(id)
            toast.success(`Strict mode ${!repo.strictMode ? "enabled" : "disabled"} for ${repo.name}`)
        }
    }

    const handleToggleSecurity = async (id: string) => {
        const repo = repositories.find((r) => r.id === id)
        if (repo) {
            await toggleSecurityScan(id)
            toast.success(`Security scan ${!repo.securityScan ? "enabled" : "disabled"} for ${repo.name}`)
        }
    }

    const handleToggleIgnoreStyling = async (id: string) => {
        const repo = repositories.find((r) => r.id === id)
        if (repo) {
            await toggleIgnoreStyling(id)
            toast.success(`Ignore styling ${!repo.ignoreLint ? "enabled" : "disabled"} for ${repo.name}`)
        }
    }

    const handleToggleAutoFix = async (id: string) => {
        const repo = repositories.find((r) => r.id === id)
        if (repo) {
            await toggleAutoFix(id)
            toast.success(`Auto fix ${!repo.autoFix ? "enabled" : "disabled"} for ${repo.name}`)
        }
    }

    const handleEnableAll = async () => {
        await enableAllBots()
        toast.success("All bots enabled successfully")
    }

    if (isLoadingRepositories && repositories.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const stats = {
        total: repositories.length,
        active: repositories.filter((r) => r.status === "active").length,
        paused: repositories.filter((r) => r.status === "paused").length,
        withSecurity: repositories.filter((r) => r.securityScan).length,
        withIgnoreStyling: repositories.filter((r) => r.ignoreLint).length,
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
                    <h1 className="text-3xl font-bold">Repositories</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage connected repositories and bot settings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            fetchRepositories()
                            toast.success("Repositories refreshed")
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        disabled={isLoadingRepositories}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoadingRepositories ? "animate-spin" : ""}`} />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                    <button
                        onClick={handleEnableAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Power className="h-4 w-4" />
                        <span className="text-sm font-medium">Enable All</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <GitBranch className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                                </div>
                                <Play className="h-6 w-6 text-green-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-yellow-500/5 border-yellow-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Paused</p>
                                    <p className="text-2xl font-bold text-yellow-500">{stats.paused}</p>
                                </div>
                                <Pause className="h-6 w-6 text-yellow-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Security Enabled</p>
                                    <p className="text-2xl font-bold text-blue-500">{stats.withSecurity}</p>
                                </div>
                                <Shield className="h-6 w-6 text-blue-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-sky-500/5 border-sky-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ignore Styling</p>
                                    <p className="text-2xl font-bold text-sky-500">{stats.withIgnoreStyling}</p>
                                </div>
                                <AlertTriangle className="h-6 w-6 text-sky-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Search and Filter */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search repositories..."
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "active", "paused"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Repository List */}
            <div className="space-y-4">
                {filteredRepositories.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No repositories found</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    filteredRepositories.map((repo) => (
                        <motion.div key={repo.id} variants={itemVariants}>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`p-3 rounded-lg ${repo.status === "active"
                                                    ? "bg-green-500/10"
                                                    : "bg-yellow-500/10"
                                                    }`}
                                            >
                                                <GitBranch
                                                    className={`h-6 w-6 ${repo.status === "active"
                                                        ? "text-green-500"
                                                        : "text-yellow-500"
                                                        }`}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{repo.owner}/{repo.name}</h3>
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs ${repo.status === "active"
                                                            ? "bg-green-500/10 text-green-500"
                                                            : "bg-yellow-500/10 text-yellow-500"
                                                            }`}
                                                    >
                                                        {repo.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Last analyzed: {repo.lastAnalyzed}
                                                </p>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                        Scan score: {repo.scanScore ?? 0}
                                                    </span>
                                                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                        Findings: {repo.scanFindings ?? 0}
                                                    </span>
                                                    {repo.secretsRisk && (
                                                        <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                                                            Secret risk
                                                        </span>
                                                    )}
                                                    {repo.languages && repo.languages.length > 0 && (
                                                        <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500">
                                                            {repo.languages.join(" / ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{repo.totalPRs} total PRs</span>
                                                <span>•</span>
                                                <span>{repo.openPRs} open</span>
                                            </div>

                                            <button
                                                onClick={() => handleToggleBot(repo.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${repo.status === "active"
                                                    ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                                                    : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                    }`}
                                            >
                                                {repo.status === "active" ? "Pause" : "Activate"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Settings Row */}
                                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                                        <button
                                            onClick={() => handleToggleStrict(repo.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${repo.strictMode
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            <span>Strict Mode</span>
                                            <div
                                                className={`w-4 h-4 rounded-full ${repo.strictMode ? "bg-primary" : "bg-muted-foreground/50"
                                                    }`}
                                            />
                                        </button>

                                        <button
                                            onClick={() => handleToggleSecurity(repo.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${repo.securityScan
                                                ? "bg-blue-500/10 text-blue-500"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            <Shield className="h-4 w-4" />
                                            <span>Security</span>
                                        </button>

                                        <button
                                            onClick={() => handleToggleIgnoreStyling(repo.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${repo.ignoreLint
                                                ? "bg-sky-500/10 text-sky-500"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            <FileCode className="h-4 w-4" />
                                            <span>Ignore Styling</span>
                                        </button>

                                        <button
                                            onClick={() => handleToggleAutoFix(repo.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${repo.autoFix
                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            <Wand2 className="h-4 w-4" />
                                            <span>Auto Fix</span>
                                        </button>

                                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                                            <FlaskConical className="h-4 w-4" />
                                            <span>{repo.hasTests ? "Tests detected" : "Tests missing"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{repo.hasWorkflows ? "CI workflow detected" : "No CI workflow"}</span>
                                        </div>
                                    </div>

                                    {repo.scanSummary && (
                                        <div className="mt-4 rounded-lg border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                                            {repo.scanSummary}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    )
}