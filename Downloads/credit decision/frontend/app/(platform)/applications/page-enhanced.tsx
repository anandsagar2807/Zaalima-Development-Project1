'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { applicationsAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Search, FilterX, ChevronRight, Eye, Edit3, Trash2 } from 'lucide-react'

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [filteredApplications, setFilteredApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const { data } = await applicationsAPI.getAll()
                setApplications(data || [])
                setFilteredApplications(data || [])
            } catch (error) {
                console.warn('Applications fallback →', error)
                setApplications([])
            } finally {
                setLoading(false)
            }
        }
        fetchApplications()
    }, [])

    // Filter and search applications
    useEffect(() => {
        let filtered = applications

        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter)
        }

        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.id?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Sort
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                case 'oldest':
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                case 'highest_amount':
                    return (b.loanAmount || 0) - (a.loanAmount || 0)
                case 'lowest_amount':
                    return (a.loanAmount || 0) - (b.loanAmount || 0)
                default:
                    return 0
            }
        })

        setFilteredApplications(filtered)
    }, [applications, searchTerm, statusFilter, sortBy])

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            underway: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            funded: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
        }
        return colors[status] || 'bg-slate-100 text-slate-800'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applications</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage loan applications ({filteredApplications.length})</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>
                    New Application
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-slate-200/60 dark:border-slate-700/50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name or ID..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <option value="all">All Status</option>
                                <option value="intake">Intake</option>
                                <option value="underway">Underway</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="funded">Funded</option>
                            </Select>
                        </div>
                        <div className="md:col-span-3">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest_amount">Highest Amount</option>
                                <option value="lowest_amount">Lowest Amount</option>
                            </Select>
                        </div>
                        <div className="md:col-span-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm('')
                                    setStatusFilter('all')
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

            {/* Applications Table */}
            <Card className="border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Applicant</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Loan Amount</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Score</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Applied</th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Loading applications...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No applications found
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((app) => (
                                    <tr
                                        key={app.id}
                                        className="border-b border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{app.applicantName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{app.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                Rs {(app.loanAmount / 100000).toFixed(1)}L
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${app.creditScore || 0}%` }}
                                                    />
                                                </div>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white text-sm">{app.creditScore || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={getStatusColor(app.status)}>
                                                {app.status || 'pending'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon-sm" title="View details">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" title="Edit">
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" title="Delete" className="text-red-600 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
