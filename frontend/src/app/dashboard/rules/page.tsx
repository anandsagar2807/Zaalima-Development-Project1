"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Bug, Zap, Code, CheckCircle, Settings, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react"
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

const categoryIcons = {
    bug: Bug,
    security: Shield,
    performance: Zap,
    style: Code,
    "best-practice": CheckCircle,
}

const categoryColors = {
    bug: "bg-red-500/10 text-red-500 border-red-500/20",
    security: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    performance: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    style: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "best-practice": "bg-green-500/10 text-green-500 border-green-500/20",
}

export default function RulesPage() {
    const {
        ruleSettings,
        isLoadingRules,
        error,
        fetchRules,
        toggleRule,
        applyAllRules,
        clearError,
    } = useDashboardStore()

    useEffect(() => {
        fetchRules()
    }, [fetchRules])

    useEffect(() => {
        if (error) {
            toast.error(error)
            clearError()
        }
    }, [error, clearError])

    const handleToggleRule = async (id: string) => {
        const rule = ruleSettings.find((r) => r.id === id)
        if (rule) {
            await toggleRule(id)
            toast.success(`${rule.name} ${rule.enabled ? "disabled" : "enabled"}`)
        }
    }

    const handleApplyAll = async (enabled: boolean) => {
        await applyAllRules(enabled)
        toast.success(`All rules ${enabled ? "enabled" : "disabled"}`)
    }

    if (isLoadingRules && ruleSettings.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const stats = {
        total: ruleSettings.length,
        enabled: ruleSettings.filter((r) => r.enabled).length,
        disabled: ruleSettings.filter((r) => !r.enabled).length,
        security: ruleSettings.filter((r) => r.category === "security" && r.enabled).length,
    }

    const groupedRules = ruleSettings.reduce((acc, rule) => {
        if (!acc[rule.category]) acc[rule.category] = []
        acc[rule.category].push(rule)
        return acc
    }, {} as Record<string, typeof ruleSettings>)

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Rule Engine</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure which analysis rules are applied to your repositories
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchRules()
                        toast.success("Rules refreshed")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    disabled={isLoadingRules}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingRules ? "animate-spin" : ""}`} />
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
                                    <p className="text-sm text-muted-foreground">Total Rules</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Settings className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Enabled</p>
                                    <p className="text-2xl font-bold text-green-500">{stats.enabled}</p>
                                </div>
                                <ToggleRight className="h-6 w-6 text-green-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-gray-500/5 border-gray-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Disabled</p>
                                    <p className="text-2xl font-bold text-gray-500">{stats.disabled}</p>
                                </div>
                                <ToggleLeft className="h-6 w-6 text-gray-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Security Rules</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.security}</p>
                                </div>
                                <Shield className="h-6 w-6 text-amber-600/50 dark:text-amber-400/50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Bulk Actions */}
            <motion.div variants={itemVariants} className="flex gap-2">
                <button
                    onClick={() => handleApplyAll(true)}
                    className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-sm font-medium"
                >
                    Enable All
                </button>
                <button
                    onClick={() => handleApplyAll(false)}
                    className="px-4 py-2 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 text-sm font-medium"
                >
                    Disable All
                </button>
            </motion.div>

            {/* Rules by Category */}
            {Object.entries(groupedRules).map(([category, rules]) => {
                const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]
                return (
                    <motion.div key={category} variants={itemVariants}>
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${categoryColors[category as keyof typeof categoryColors]}`}>
                                        <CategoryIcon className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-lg capitalize">{category.replace("-", " ")}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {rules.map((rule) => (
                                    <div
                                        key={rule.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">{rule.name}</h4>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs ${rule.enabled
                                                            ? "bg-green-500/10 text-green-500"
                                                            : "bg-gray-500/10 text-gray-500"
                                                        }`}
                                                >
                                                    {rule.enabled ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {rule.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleRule(rule.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.enabled ? "bg-primary" : "bg-muted-foreground/30"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.enabled ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </motion.div>
    )
}