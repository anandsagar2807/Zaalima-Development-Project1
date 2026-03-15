'use client'

import { useEffect, useState } from 'react'
import { scoresAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Search, FilterX, TrendingUp, PieChart, Download, Eye } from 'lucide-react'

export default function ScoresPage() {
    const [scores, setScores] = useState<any[]>([])
    const [filteredScores, setFilteredScores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [ratingFilter, setRatingFilter] = useState('all')
    const [sortBy, setSortBy] = useState('highest')

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const { data } = await scoresAPI.getAll()
                setScores(data || [])
                setFilteredScores(data || [])
            } catch (error) {
                console.warn('Scores fallback →', error)
                setScores([])
            } finally {
                setLoading(false)
            }
        }
        fetchScores()
    }, [])

    // Filter and search scores
    useEffect(() => {
        let filtered = scores

        if (ratingFilter !== 'all') {
            filtered = filtered.filter(score => score.rating === ratingFilter)
        }

        if (searchTerm) {
            filtered = filtered.filter(score =>
                score.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                score.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Sort
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'highest':
                    return (b.overallScore || 0) - (a.overallScore || 0)
                case 'lowest':
                    return (a.overallScore || 0) - (b.overallScore || 0)
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                default:
                    return 0
            }
        })

        setFilteredScores(filtered)
    }, [scores, searchTerm, ratingFilter, sortBy])

    const getRatingColor = (rating?: string) => {
        const colors: Record<string, string> = {
            'AAA': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            'AA': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            'A': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'BBB': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'BB': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'B': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'CCC': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        }
        return colors[rating || ''] || 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    }

    const getScoreHealth = (score: number) => {
        if (score >= 750) return { label: 'Excellent', color: 'text-emerald-600' }
        if (score >= 700) return { label: 'Very Good', color: 'text-blue-600' }
        if (score >= 650) return { label: 'Good', color: 'text-yellow-600' }
        if (score >= 600) return { label: 'Fair', color: 'text-orange-600' }
        return { label: 'Poor', color: 'text-red-600' }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Credit Scores</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Analyze credit scoring results ({filteredScores.length})</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>
                    New Assessment
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-slate-200/60 dark:border-slate-700/50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name or company..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                <option value="all">All Ratings</option>
                                <option value="AAA">AAA</option>
                                <option value="AA">AA</option>
                                <option value="A">A</option>
                                <option value="BBB">BBB</option>
                                <option value="BB">BB</option>
                                <option value="B">B</option>
                                <option value="CCC">CCC</option>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <option value="highest">Highest Score</option>
                                <option value="lowest">Lowest Score</option>
                                <option value="newest">Newest First</option>
                            </Select>
                        </div>
                        <div className="md:col-span-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm('')
                                    setRatingFilter('all')
                                    setSortBy('highest')
                                }}
                                title="Clear all filters"
                            >
                                <FilterX className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Scores Cards */}
            <div className="space-y-4">
                {loading ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12">
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading scores...
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredScores.length === 0 ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12 text-center text-slate-500">
                            No credit scores found
                        </CardContent>
                    </Card>
                ) : (
                    filteredScores.map((score) => {
                        const health = getScoreHealth(score.overallScore || 0)
                        return (
                            <Card
                                key={score.id}
                                className="border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 group overflow-hidden"
                            >
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left: Main Info */}
                                        <div className="lg:col-span-2">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {score.applicantName}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                        {score.companyName}
                                                    </p>
                                                </div>
                                                <Badge className={getRatingColor(score.rating)}>
                                                    {score.rating || 'N/A'}
                                                </Badge>
                                            </div>

                                            {/* Five C's Breakdown */}
                                            <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Five C's Analysis</p>
                                                <div className="space-y-2">
                                                    {['Character', 'Capacity', 'Capital', 'Conditions', 'Collateral'].map((factor, idx) => (
                                                        <div key={factor} className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">{factor}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                                                        style={{ width: `${(score[`${factor.toLowerCase()}Score`] || 0) * 10}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-semibold text-slate-900 dark:text-white w-8 text-right">
                                                                    {score[`${factor.toLowerCase()}Score`] || 0}/10
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Score Display */}
                                        <div className="flex flex-col items-center justify-between p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/20 rounded-lg">
                                            {/* Score Circle */}
                                            <div className="relative w-40 h-40 flex items-center justify-center">
                                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 140">
                                                    <circle
                                                        cx="70" cy="70" r="65"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        opacity="0.1"
                                                    />
                                                    <circle
                                                        cx="70" cy="70" r="65"
                                                        fill="none"
                                                        stroke="url(#scoreGradient)"
                                                        strokeWidth="8"
                                                        strokeDasharray={`${(score.overallScore || 0) * 4.08} 408`}
                                                        strokeLinecap="round"
                                                        transform="rotate(-90 70 70)"
                                                        className="transition-all duration-500"
                                                    />
                                                    <defs>
                                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#4F46E5" />
                                                            <stop offset="100%" stopColor="#7C3AED" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="text-center">
                                                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                                                        {Math.round(score.overallScore || 0)}
                                                    </p>
                                                    <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${health.color}`}>
                                                        {health.label}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="w-full text-center space-y-2 mt-4">
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    {score.createdAt ? new Date(score.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" icon={<Eye className="w-3 h-3" />} className="flex-1">
                                                        View
                                                    </Button>
                                                    <Button size="sm" icon={<Download className="w-3 h-3" />}>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
