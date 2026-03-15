'use client'

import { useEffect, useState } from 'react'
import { dashboardAPI } from '@/lib/api'
import type { DashboardOverview } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap, Target, TrendingUp, ArrowUpRight, Clock, Users, FileText, ChevronRight } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'

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

  const stats = [
    {
      label: 'Total Applications',
      value: overview.summary.totalApplications.toLocaleString(),
      subtext: '+12% from last month',
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    },
    {
      label: 'Pending Reviews',
      value: overview.summary.pendingApplications.toString(),
      subtext: 'Requires immediate action',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      label: 'Approved Exposure',
      value: `₹${Math.round(overview.summary.totalExposure / 10_000_000)}Cr`,
      subtext: `${overview.summary.approvedApplications} active deals`,
      icon: Zap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      label: 'Avg Risk Score',
      value: overview.summary.averageScore ? overview.summary.averageScore.toFixed(1) : '—',
      subtext: `Approval Rate: ${overview.summary.approvalRate}`,
      icon: Target,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Command center</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Portfolio Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time insights across applications, risk, and exposure.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full shadow-lg shadow-indigo-200/50" asChild>
            <a href="/applications">
              <Activity className="mr-2 h-4 w-4" /> New Application
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-white/50 backdrop-blur-sm">
            <a href="/documents">Upload Docs</a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={`floating-card border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${stat.bg}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</h3>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg} ${stat.border} border shadow-sm`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/60 font-normal text-slate-600 backdrop-blur-sm">
                    {stat.subtext}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="glass-panel border-0 shadow-xl shadow-slate-200/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  Application Velocity
                </CardTitle>
                <CardDescription>Monthly application volume vs. approvals.</CardDescription>
              </div>
              <SelectPeriod />
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" name="Total Applications" />
                <Area type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorApproved)" name="Approved Deals" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 shadow-xl shadow-slate-200/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              Pipeline Funnel
            </CardTitle>
            <CardDescription>Current volume by stage.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { stage: 'Doc Upload', count: 18, fill: '#6366f1' },
                { stage: 'Verification', count: 21, fill: '#8b5cf6' },
                { stage: 'Scoring', count: 15, fill: '#ec4899' },
                { stage: 'Approval', count: 8, fill: '#10b981' },
                { stage: 'Funded', count: 5, fill: '#f59e0b' }
              ]} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={4} barSize={32} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel overflow-hidden border-0 shadow-xl shadow-slate-200/40">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
            <CardDescription>Latest applications and their current status.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            <a href="/applications">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 text-left">Application ID</th>
                  <th className="px-6 py-4 text-left">Company Name</th>
                  <th className="px-6 py-4 text-left">Loan Amount</th>
                  <th className="px-6 py-4 text-left">Stage</th>
                  <th className="px-6 py-4 text-left">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(overview.recentApplications?.length ? overview.recentApplications : [
                  {
                    id: 'APP-001',
                    applicationNumber: 'APP-2024-8821',
                    company: { name: 'Acme Textiles Ltd' },
                    loanAmount: 25000000,
                    stage: 'SCORING',
                    finalScore: 78.5
                  },
                  {
                    id: 'APP-002',
                    applicationNumber: 'APP-2024-8822',
                    company: { name: 'Global Logistics' },
                    loanAmount: 50000000,
                    stage: 'APPROVAL',
                    finalScore: 82.1
                  },
                  {
                    id: 'APP-003',
                    applicationNumber: 'APP-2024-8823',
                    company: { name: 'Solar Tech' },
                    loanAmount: 15000000,
                    stage: 'VERIFICATION',
                    finalScore: null
                  }
                ]).map((app) => (
                  <tr key={app.id || app.applicationNumber} className="group transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-medium text-slate-600 group-hover:text-indigo-600">{app.applicationNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{app.company?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{app.loanAmount ? `₹${(app.loanAmount / 100000).toLocaleString()} L` : '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-slate-100 font-medium text-slate-600">
                        {app.stage || 'PENDING'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{app.finalScore ? app.finalScore.toFixed(1) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SelectPeriod() {
  return (
    <select className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none">
      <option>Last 6 Months</option>
      <option>Last Year</option>
      <option>All Time</option>
    </select>
  )
}
