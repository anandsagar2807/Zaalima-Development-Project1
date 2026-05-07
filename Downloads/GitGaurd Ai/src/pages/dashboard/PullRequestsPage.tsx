import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GitPullRequest, AlertTriangle, Search, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardStore } from '@/store/dashboardStore'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const severityColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
}

const statusColors = {
  open: 'bg-green-500/10 text-green-500',
  merged: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  closed: 'bg-gray-500/10 text-gray-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
}

export default function PullRequestsPage() {
  const {
    pullRequests,
    isLoadingPRs,
    error,
    prSearchQuery,
    fetchPullRequests,
    sortPRs,
    setPRSearchQuery,
    clearError,
  } = useDashboardStore()

  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'issues' | 'severity'>('latest')

  useEffect(() => {
    fetchPullRequests()
  }, [fetchPullRequests])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSort = async (value: 'latest' | 'issues' | 'severity') => {
    setSortBy(value)
    await sortPRs(value)
  }

  const filteredPRs = pullRequests.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(prSearchQuery.toLowerCase()) ||
      pr.repository.toLowerCase().includes(prSearchQuery.toLowerCase()) ||
      pr.author.toLowerCase().includes(prSearchQuery.toLowerCase())

    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'autofix') return matchesSearch && pr.hasAutoFix
    if (selectedFilter === 'security') return matchesSearch && pr.type === 'security'
    if (selectedFilter === 'performance') return matchesSearch && pr.type === 'performance'
    if (selectedFilter === 'critical') return matchesSearch && pr.severity === 'critical'
    if (selectedFilter === 'high') return matchesSearch && pr.severity === 'high'

    return matchesSearch
  })

  if (isLoadingPRs && pullRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = {
    total: pullRequests.length,
    open: pullRequests.filter((p) => p.status === 'open').length,
    critical: pullRequests.filter((p) => p.severity === 'critical').length,
    withAutofix: pullRequests.filter((p) => p.hasAutoFix).length,
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
          <h1 className="text-3xl font-bold">Pull Requests</h1>
          <p className="text-muted-foreground mt-1">View and manage reviewed pull requests</p>
        </div>
        <button
          onClick={() => {
            fetchPullRequests()
            toast.success('Pull requests refreshed')
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          disabled={isLoadingPRs}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingPRs ? 'animate-spin' : ''}`} />
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
                  <p className="text-sm text-muted-foreground">Total PRs</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <GitPullRequest className="h-6 w-6 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold text-green-500">{stats.open}</p>
                </div>
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
                  <p className="text-sm text-muted-foreground">Auto Fixes</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.withAutofix}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pull requests..."
              value={prSearchQuery}
              onChange={(e) => setPRSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All PRs</option>
              <option value="autofix">Has Auto Fix</option>
              <option value="security">Security Issues</option>
              <option value="performance">Performance</option>
              <option value="critical">Critical Severity</option>
              <option value="high">High Severity</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as 'latest' | 'issues' | 'severity')}
              className="px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="latest">Latest</option>
              <option value="issues">Most Issues</option>
              <option value="severity">Highest Severity</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* PR List */}
      <div className="space-y-4">
        {filteredPRs.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pull requests found</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          filteredPRs.map((pr) => (
            <motion.div key={pr.id} variants={itemVariants}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <GitPullRequest className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pr.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pr.repository} • {pr.branch}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[pr.status]}`}>
                            {pr.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs border ${severityColors[pr.severity]}`}
                          >
                            {pr.severity}
                          </span>
                          {pr.hasAutoFix && (
                            <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Auto Fix
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-muted-foreground">
                        <p>{pr.issuesFound} issues</p>
                        <p>by {pr.author}</p>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <p>{pr.reviewedAt}</p>
                        <p className="capitalize">{pr.type}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
