"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    Search,
    Bell,
    Settings,
    GitPullRequest,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock,
    TrendingUp,
    Users,
    FileCode
} from "lucide-react";

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DashboardPreview() {
    return (
        <section id="dashboard" className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                        <span className="gradient-text">Powerful Dashboard</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Monitor all your repositories, track review metrics, and manage team settings from one unified dashboard.
                    </p>
                    <div className="mt-6">
                        <Link href="/dashboard">
                            <Button variant="gradient" size="lg" className="gap-2">
                                Open Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Dashboard Mock */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative"
                >
                    <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                                        <FileCode className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="font-semibold">GitGuard AI</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Search repositories...</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                <Settings className="h-5 w-5 text-muted-foreground" />
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500" />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid lg:grid-cols-4 gap-4 p-6">
                            {/* Stats Cards */}
                            <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { icon: GitPullRequest, label: "Open PRs", value: "24", trend: "+3", color: "text-blue-500" },
                                    { icon: CheckCircle2, label: "Approved", value: "156", trend: "+12", color: "text-green-500" },
                                    { icon: AlertTriangle, label: "Pending Review", value: "8", trend: "-2", color: "text-yellow-500" },
                                    { icon: XCircle, label: "Issues Found", value: "42", trend: "-8", color: "text-red-500" },
                                ].map((stat) => (
                                    <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                                <span className="text-xs text-green-500 font-medium">{stat.trend}</span>
                                            </div>
                                            <div className="mt-2">
                                                <div className="text-2xl font-bold">{stat.value}</div>
                                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-lg">Recent Pull Requests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            {
                                                title: "feat: Add user authentication flow",
                                                repo: "frontend/app",
                                                author: "sarah.dev",
                                                time: "2 min ago",
                                                status: "reviewing",
                                                issues: 3
                                            },
                                            {
                                                title: "fix: Memory leak in data processing",
                                                repo: "backend/services",
                                                author: "mike.code",
                                                time: "15 min ago",
                                                status: "approved",
                                                issues: 0
                                            },
                                            {
                                                title: "refactor: Optimize database queries",
                                                repo: "backend/db",
                                                author: "alex.dev",
                                                time: "1 hour ago",
                                                status: "changes_requested",
                                                issues: 7
                                            },
                                            {
                                                title: "docs: Update API documentation",
                                                repo: "docs/api",
                                                author: "emma.write",
                                                time: "3 hours ago",
                                                status: "approved",
                                                issues: 1
                                            },
                                        ].map((pr, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className={`w-2 h-2 rounded-full ${pr.status === "approved" ? "bg-green-500" :
                                                    pr.status === "reviewing" ? "bg-yellow-500" :
                                                        "bg-red-500"
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{pr.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {pr.repo} • by {pr.author}
                                                    </p>
                                                </div>
                                                {pr.issues > 0 && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                                                        {pr.issues} issues
                                                    </span>
                                                )}
                                                {pr.issues === 0 && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                                        Passed
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground hidden sm:block">{pr.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Chart Placeholder */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="text-lg">Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">This Week</span>
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                        </div>
                                        {/* Mini Chart Bars */}
                                        <div className="flex items-end gap-1 h-24">
                                            {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-t"
                                                    style={{ height: `${height}%` }}
                                                />
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Reviews</span>
                                                <span className="font-medium">+23%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}