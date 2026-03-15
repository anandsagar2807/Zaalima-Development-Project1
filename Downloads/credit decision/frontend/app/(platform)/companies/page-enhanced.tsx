'use client'

import { useEffect, useState } from 'react'
import { companiesAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Search, FilterX, Building2, Users, TrendingUp, Globe, Edit3, Trash2 } from 'lucide-react'

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([])
    const [filteredCompanies, setFilteredCompanies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [industryFilter, setIndustryFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid')

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const { data } = await companiesAPI.getAll()
                setCompanies(data || [])
                setFilteredCompanies(data || [])
            } catch (error) {
                console.warn('Companies fallback →', error)
                setCompanies([])
            } finally {
                setLoading(false)
            }
        }
        fetchCompanies()
    }, [])

    // Filter and search companies
    useEffect(() => {
        let filtered = companies

        if (industryFilter !== 'all') {
            filtered = filtered.filter(company => company.industry === industryFilter)
        }

        if (searchTerm) {
            filtered = filtered.filter(company =>
                company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Sort
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                case 'oldest':
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                case 'name_asc':
                    return (a.companyName || '').localeCompare(b.companyName || '')
                case 'name_desc':
                    return (b.companyName || '').localeCompare(a.companyName || '')
                default:
                    return 0
            }
        })

        setFilteredCompanies(filtered)
    }, [companies, searchTerm, industryFilter, sortBy])

    const industries = Array.from(new Set(companies.map(c => c.industry))).filter(Boolean)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Companies</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage company database ({filteredCompanies.length})</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>
                    Add Company
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Total Companies</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{companies.length}</p>
                            </div>
                            <Building2 className="w-8 h-8 text-indigo-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Industries</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{industries.length}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-emerald-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {companies.filter(c => c.status === 'active').length}
                                </p>
                            </div>
                            <Globe className="w-8 h-8 text-blue-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Rating</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {(companies.reduce((sum, c) => sum + (c.rating || 0), 0) / (companies.length || 1)).toFixed(1)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-orange-500 opacity-20" />
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
                                    placeholder="Search by name or registration number..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <Select value={industryFilter} onValueChange={setIndustryFilter}>
                                <option value="all">All Industries</option>
                                {industries.map(industry => (
                                    <option key={industry} value={industry}>{industry}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="md:col-span-3">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                            </Select>
                        </div>
                        <div className="md:col-span-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm('')
                                    setIndustryFilter('all')
                                    setSortBy('newest')
                                }}
                                title="Clear all filters"
                            >
                                <FilterX className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Companies Grid */}
            {loading ? (
                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="py-12">
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading companies...
                        </div>
                    </CardContent>
                </Card>
            ) : filteredCompanies.length === 0 ? (
                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="py-12 text-center text-slate-500">
                        No companies found
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCompanies.map((company) => (
                        <Card key={company.id} className="border-slate-200/60 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 group">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {company.companyName}
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            {company.registrationNumber}
                                        </CardDescription>
                                    </div>
                                    <Building2 className="w-5 h-5 text-indigo-500/30 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Industry Badge */}
                                <div>
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {company.industry || 'N/A'}
                                    </Badge>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Rating</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {(company.rating || 0).toFixed(1)}/5
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Credit Score</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {company.creditScore || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${company.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                        {company.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                                    <Button variant="ghost" size="sm" icon={<Edit3 className="w-3 h-3" />} className="flex-1">
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-600 hover:text-red-700">
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
