'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { dashboardAPI } from '@/lib/api'
import type { DashboardOverview } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap, Target, TrendingUp, ArrowUpRight, Clock, Users, FileText, ChevronRight, Plus } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, LineChart, Line } from 'recharts'

const fallbackOverview: DashboardOverview = {
    summary: {
        totalApplications: 154,
        pendingApplications: 23,
        approvedApplications: 96,
        rejectedApplications: 12,
        totalExposure: 1250000000,
        averageScore: 72,
        approvalRate: '78.5%'
    },
    recentApplications: [],
    trends: [
        { month: 'Aug', applications: 45, approved: 32, exposure: 45_000_000 },
        { month: 'Sep', applications: 52, approved: 38, exposure: 62_000_000 },
        { month: 'Oct', applications: 48, approved: 35, exposure: 58_000_000 },
        { month: 'Nov', applications: 61, approved: 45, exposure: 78_000_000 },
        { month: 'Dec', applications: 54, approved: 42, exposure: 72_000_000 },
        { month: 'Jan', applications: 67, approved: 52, exposure: 95_000_000 }
    ]
}

export default function DashboardPage() {
    const [overview, setOverview] = useState<DashboardOverview>(fallbackOverview)
    const [loading, setLoading] = useState(true)
    const [selectedMetric, setSelectedMetric] = useState<'applications' | 'exposure' | 'approval'>('applications')

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const { data } = await dashboardAPI.getOverview()
                setOverview(data)
            } catch (error) {
                console.warn('Dashboard overview fallback →', error)
            } finally {
                setLoading(false)
            }
        }
        fetchOverview()
    }, [])

    const MetricCard = ({
        icon: Icon,
        title,
        value,
        change,
        positive = true,
        gradient = 'from-blue-500 to-blue-600'
    }: {
        icon: any
        title: string
        value: string | number
        change: string
        positive?: boolean
        gradient?: string
    }) => (
        <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-slate-200/60 dark:border-slate-700/50">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -mr-8 -mt-8`} />
            <CardContent className="pt-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">{title}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                        <p className={`text-xs mt-2 font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {positive ? '↑' : '↓'} {change}
                        </p>
                    </div>
                    <div className={`bg-gradient-to-br ${gradient} p-3 rounded-lg text-white opacity-80 group-hover:opacity-100 transition-opacity`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time credit decisioning analytics</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={<Clock className="w-4 h-4" />}>
                        Last 30 Days
                    </Button>
                    <Button icon={<Plus className="w-4 h-4" />}>
                        New Application
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={FileText}
                    title="Total Applications"
                    value={overview.summary.totalApplications}
                    change="12% increase this month"
                    positive={true}
                    gradient="from-blue-500 to-blue-600"
                />
                <MetricCard
                    icon={Clock}
                    title="Pending Review"
                    value={overview.summary.pendingApplications}
                    change="5 awaiting approval"
                    positive={true}
                    gradient="from-orange-500 to-orange-600"
                />
                <MetricCard
                    icon={TrendingUp}
                    title="Approval Rate"
                    value={overview.summary.approvalRate}
                    change="2.3% from last month"
                    positive={true}
                    gradient="from-emerald-500 to-emerald-600"
                />
                <MetricCard
                    icon={Target}
                    title="Avg Credit Score"
                    value={overview.summary.averageScore}
                    change="+3 points"
                    positive={true}
                    gradient="from-indigo-500 to-indigo-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="lg:col-span-2 border-slate-200/60 dark:border-slate-700/50">
                    <CardHeader className="border-b border-slate-200/60 dark:border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Applications Trend</CardTitle>
                                <CardDescription>6-month application and approval trends</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {(['applications', 'exposure', 'approval'] as const).map((metric) => (
                                    <button
                                        key={metric}
                                        onClick={() => setSelectedMetric(metric)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${selectedMetric === metric
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={overview.trends}>
                                <defs>
                                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '8px',
                                        color: '#f1f5f9'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorApplications)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardHeader className="border-b border-slate-200/60 dark:border-slate-700/50">
                        <CardTitle>Portfolio Risk</CardTitle>
                        <CardDescription>Risk level breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[
                                { label: 'Low Risk', value: '45%', color: 'from-emerald-500 to-emerald-600', percentage: 45 },
                                { label: 'Medium Risk', value: '35%', color: 'from-yellow-500 to-yellow-600', percentage: 35 },
                                { label: 'High Risk', value: '15%', color: 'from-orange-500 to-orange-600', percentage: 15 },
                                { label: 'Critical', value: '5%', color: 'from-red-500 to-red-600', percentage: 5 },
                            ].map((risk) => (
                                <div key={risk.label} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{risk.label}</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{risk.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`bg-gradient-to-r ${risk.color} h-full transition-all duration-500 ease-out`}
                                            style={{ width: `${risk.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-200/60 dark:border-slate-700/50">
                <CardHeader className="border-b border-slate-200/60 dark:border-slate-700/50">
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and workflows</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'New Application', icon: Plus, href: '/applications', color: 'from-blue-500 to-blue-600' },
                            { label: 'Review Documents', icon: FileText, href: '/documents', color: 'from-indigo-500 to-indigo-600' },
                            { label: 'Run Scoring', icon: Target, href: '/scores', color: 'from-emerald-500 to-emerald-600' },
                            { label: 'Risk Analysis', icon: Activity, href: '/risk', color: 'from-orange-500 to-orange-600' },
                        ].map((action) => (
                            <Link key={action.label} href={action.href}>
                                <button className="w-full group relative overflow-hidden rounded-lg p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                    <div className="relative flex flex-col items-center gap-2">
                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} text-white opacity-60 group-hover:opacity-100 transition-opacity`}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{action.label}</span>
                                    </div>
                                </button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
