"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Shield, Key, Database, Code, AlertTriangle, RefreshCw, Filter, Search } from "lucide-react"
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

const severityHeatmapColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    secret: Key,
    token: Key,
    vulnerability: AlertTriangle,
    "sql-injection": Database,
    xss: Code,
    dependency: Shield,
}

export default function SecurityPage() {
    const {
        securityIssues,
        isLoadingSecurity,
        error,
        fetchSecurityIssues,
        fixSecurityIssue,
        ignoreSecurityIssue,
        clearError,
    } = useDashboardStore()

    const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
    const [selectedRepo, setSelectedRepo] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchSecurityIssues()
    }, [fetchSecurityIssues])

    useEffect(() => {
        if (error) {
            toast.error(error)
            clearError()
        }
    }, [error, clearError])

    const handleFix = async (id: string) => {
        await fixSecurityIssue(id)
        toast.success("Security issue resolved")
    }

    const handleIgnore = async (id: string) => {
        await ignoreSecurityIssue(id)
        toast.success("Security issue ignored")
    }

    // Get unique repos for filter
    const repos = [...new Set(securityIssues.map((issue) => issue.repository))]

    const filteredIssues = securityIssues.filter((issue) => {
        const matchesSeverity = selectedSeverity === "all" || issue.severity === selectedSeverity
        const matchesRepo = selectedRepo === "all" || issue.repository === selectedRepo
        const matchesStatus = issue.status !== "ignored"
        const matchesSearch = searchQuery === "" ||
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSeverity && matchesRepo && matchesStatus && matchesSearch
    })

    if (isLoadingSecurity && securityIssues.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const stats = {
        total: securityIssues.length,
        critical: securityIssues.filter((s) => s.severity === "critical").length,
        secrets: securityIssues.filter((s) => s.type === "secret" || s.type === "token").length,
        vulnerabilities: securityIssues.filter((s) => s.type === "sql-injection" || s.type === "xss" || s.type === "vulnerability").length,
        dependencies: securityIssues.filter((s) => s.type === "dependency").length,
    }

    // Heatmap data by type and severity
    const heatmapData = [
        { type: "Secrets", count: stats.secrets, severity: stats.secrets > 5 ? "critical" : stats.secrets > 2 ? "high" : "low" },
        { type: "Tokens", count: securityIssues.filter((s) => s.type === "token").length, severity: "medium" },
        { type: "SQL Injection", count: securityIssues.filter((s) => s.type === "sql-injection").length, severity: "critical" },
        { type: "XSS", count: securityIssues.filter((s) => s.type === "xss").length, severity: "high" },
        { type: "Dependencies", count: stats.dependencies, severity: "medium" },
    ]

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Security Center</h1>
                    <p className="text-muted-foreground mt-1">
                        Detect and resolve security vulnerabilities
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchSecurityIssues()
                        toast.success("Security data refreshed")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    disabled={isLoadingSecurity}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingSecurity ? "animate-spin" : ""}`} />
                    <span className="text-sm font-medium">Refresh</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Issues</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Shield className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Critical</p>
                                    <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
                                </div>
                                <AlertTriangle className="h-6 w-6 text-red-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Secrets</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.secrets}</p>
                                </div>
                                <Key className="h-6 w-6 text-amber-600/50 dark:text-amber-400/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-orange-500/5 border-orange-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Vulnerabilities</p>
                                    <p className="text-2xl font-bold text-orange-500">{stats.vulnerabilities}</p>
                                </div>
                                <Database className="h-6 w-6 text-orange-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Dependencies</p>
                                    <p className="text-2xl font-bold text-blue-500">{stats.dependencies}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Severity Heatmap */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Severity Heatmap</CardTitle>
                        <p className="text-sm text-muted-foreground">Issue distribution by type</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-2">
                            {heatmapData.map((item) => (
                                <div
                                    key={item.type}
                                    className={`p-4 rounded-lg ${severityHeatmapColors[item.severity as keyof typeof severityHeatmapColors]} bg-opacity-20 border border-opacity-30`}
                                >
                                    <p className="text-sm font-medium">{item.type}</p>
                                    <p className="text-2xl font-bold">{item.count}</p>
                                    <p className="text-xs capitalize opacity-70">{item.severity}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="all">All Repositories</option>
                    {repos.map((repo) => (
                        <option key={repo} value={repo}>{repo}</option>
                    ))}
                </select>
            </motion.div>

            {/* Issues List */}
            <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No security issues found</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    filteredIssues.map((issue) => {
                        const TypeIcon = typeIcons[issue.type] || Shield
                        return (
                            <motion.div key={issue.id} variants={itemVariants}>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${severityColors[issue.severity]}`}>
                                                    <TypeIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{issue.title}</h3>
                                                        <span className={`px-2 py-0.5 rounded text-xs border ${severityColors[issue.severity]}`}>
                                                            {issue.severity}
                                                        </span>
                                                        {issue.status === "fixed" && (
                                                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-500">
                                                                Fixed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {issue.repository} • PR {issue.prNumber} • {issue.detectedAt}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        {issue.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {issue.status !== "fixed" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleFix(issue.id)}
                                                        className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-sm font-medium"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleIgnore(issue.id)}
                                                        className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 text-sm"
                                                    >
                                                        Ignore
                                                    </button>
                                                </div>
                                            )}
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