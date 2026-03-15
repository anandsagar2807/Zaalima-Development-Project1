'use client'

import { useEffect, useState } from 'react'
import { riskAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Search, FilterX, AlertTriangle, TrendingDown, Shield, Activity, Zap } from 'lucide-react'

export default function RiskPage() {
    const [risks, setRisks] = useState<any[]>([])
    const [filteredRisks, setFilteredRisks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [levelFilter, setLevelFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('severity')

    useEffect(() => {
        const fetchRisks = async () => {
            try {
                const { data } = await riskAPI.getAll()
                setRisks(data || [])
                setFilteredRisks(data || [])
            } catch (error) {
                console.warn('Risks fallback →', error)
                setRisks([])
            } finally {
                setLoading(false)
            }
        }
        fetchRisks()
    }, [])

    // Filter and search risks
    useEffect(() => {
        let filtered = risks

        if (levelFilter !== 'all') {
            filtered = filtered.filter(risk => risk.level === levelFilter)
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(risk => risk.status === statusFilter)
        }

        if (searchTerm) {
            filtered = filtered.filter(risk =>
                risk.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                risk.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Sort
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'severity':
                    const severityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
                    return (severityMap[b.level] || 0) - (severityMap[a.level] || 0)
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                case 'oldest':
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                default:
                    return 0
            }
        })

        setFilteredRisks(filtered)
    }, [risks, searchTerm, levelFilter, statusFilter, sortBy])

    const getRiskLevelColor = (level: string) => {
        const colors: Record<string, string> = {
            critical: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
            high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
            medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
            low: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
        }
        return colors[level] || 'text-slate-600 bg-slate-100 dark:bg-slate-900/20 dark:text-slate-400'
    }

    const getRiskLevelIcon = (level: string) => {
        const icons: Record<string, typeof AlertTriangle> = {
            critical: AlertTriangle,
            high: AlertTriangle,
            medium: Activity,
            low: TrendingDown
        }
        const Icon = icons[level] || AlertTriangle
        return <Icon className="w-4 h-4" />
    }

    const stats = {
        total: risks.length,
        critical: risks.filter(r => r.level === 'critical').length,
        high: risks.filter(r => r.level === 'high').length,
        mitigated: risks.filter(r => r.status === 'mitigated').length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Risk Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Identify and mitigate credit risks ({filteredRisks.length})</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>
                    New Risk Assessment
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Total Risks</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-slate-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200/60 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 dark:text-red-300">Critical</p>
                                <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">{stats.critical}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500 opacity-30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-orange-200/60 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 dark:text-orange-300">High</p>
                                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200 mt-1">{stats.high}</p>
                            </div>
                            <Activity className="w-8 h-8 text-orange-500 opacity-30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">Mitigated</p>
                                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{stats.mitigated}</p>
                            </div>
                            <Shield className="w-8 h-8 text-emerald-500 opacity-30" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-slate-200/60 dark:border-slate-700/50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by title or description..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                <option value="all">All Levels</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="mitigated">Mitigated</option>
                                <option value="closed">Closed</option>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <option value="severity">By Severity</option>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </Select>
                        </div>
                        <div className="md:col-span-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm('')
                                    setLevelFilter('all')
                                    setStatusFilter('all')
                                    setSortBy('severity')
                                }}
                                title="Clear all filters"
                            >
                                <FilterX className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Risks List */}
            <div className="space-y-4">
                {loading ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12">
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading risks...
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredRisks.length === 0 ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12 text-center text-slate-500">
                            No risks found
                        </CardContent>
                    </Card>
                ) : (
                    filteredRisks.map((risk) => (
                        <Card
                            key={risk.id}
                            className="border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 group"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left Section */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${getRiskLevelColor(risk.level)}`}>
                                                {getRiskLevelIcon(risk.level)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {risk.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    {risk.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                                            <Badge className={`${getRiskLevelColor(risk.level).replace('text-', 'bg-').replace('bg-', 'text-')}`}>
                                                {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                                            </Badge>
                                            <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                                                {risk.status}
                                            </Badge>
                                            <span className="text-slate-600 dark:text-slate-400">
                                                Impact: {risk.impact || '—'}
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-400">
                                                Probability: {risk.probability || '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        {/* Risk Score */}
                                        <div className="text-right">
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Risk Score</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {risk.score || '—'}
                                            </p>
                                        </div>

                                        {/* Mitigation */}
                                        <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${risk.mitigationProgress || 0}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            {risk.mitigationProgress || 0}% Mitigated
                                        </p>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm">
                                                Review
                                            </Button>
                                            <Button size="sm">
                                                Mitigate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
