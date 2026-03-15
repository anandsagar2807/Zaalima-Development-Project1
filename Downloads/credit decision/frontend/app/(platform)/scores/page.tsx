'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Gauge,
  Activity,
  Sparkles,
  TrendingUp,
  Download,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  BarChart4,
  CheckCircle2,
  XCircle
} from 'lucide-react'

// Mock Data for "Recent Scoring Runs"
const recentScores = [
  { id: 'APP-2024-001', company: 'TechFlow Solutions', score: 780, grade: 'A', status: 'Approved', risk: 'Low', date: '2 mins ago' },
  { id: 'APP-2024-005', company: 'Urban Retail Ltd', score: 620, grade: 'B-', status: 'Review', risk: 'Medium', date: '15 mins ago' },
  { id: 'APP-2024-012', company: 'Green Energy Corp', score: 850, grade: 'A+', status: 'Auto-Approved', risk: 'Minimal', date: '1 hour ago' },
  { id: 'APP-2024-018', company: 'Rapid Logistics', score: 450, grade: 'D', status: 'Rejected', risk: 'High', date: '3 hours ago' },
  { id: 'APP-2024-022', company: 'Creative Studios', score: 710, grade: 'B+', status: 'Approved', risk: 'Low', date: '5 hours ago' },
]

// Mock Data for "5 Cs Breakdown" used in a hypothetical analysis view
const fiveCsBreakdown = [
  {
    title: 'Character',
    score: 85,
    color: 'bg-indigo-500',
    icon: ShieldCheck,
    details: 'Strong governance, no bureau defaults, positive market repute.'
  },
  {
    title: 'Capacity',
    score: 62,
    color: 'bg-blue-500',
    icon: Activity,
    details: 'Moderate DSCR (1.2x), stable cash flows but thin margins.'
  },
  {
    title: 'Capital',
    score: 75,
    color: 'bg-emerald-500',
    icon: BarChart4,
    details: 'Good leverage ratio, adequate promoter infusion evident.'
  },
  {
    title: 'Collateral',
    score: 90,
    color: 'bg-rose-500',
    icon: FileText,
    details: 'Prime commercial property, updated 2024 valuation report.'
  },
  {
    title: 'Conditions',
    score: 55,
    color: 'bg-amber-500',
    icon: TrendingUp,
    details: 'Sector headwinds in retail, regulatory environment stable.'
  }
]

export default function ScoresPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in zoom-in duration-500 space-y-8 p-6 lg:p-8">

      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Gauge className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Score Studio
            </h1>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
            Real-time credit scoring engine. Analyze 5 Cs, generated CAMs, and risk models powered by ML algorithms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-panel hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all">
            <Sparkles className="mr-2 h-4 w-4" /> New Analysis
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">

        {/* Left Column: Recent Runs (Table/List) */}
        <div className="md:col-span-8 space-y-6">
          <Card className="glass-panel border-0 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Recent Scoring Runs
                </CardTitle>
                <CardDescription>Latest applications processed by the engine</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search runs..."
                    className="h-9 w-[150px] lg:w-[200px] rounded-full border border-slate-200 bg-white/50 pl-9 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50"
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Filter className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Application ID</th>
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                      <th className="px-4 py-3 font-medium">Grade</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Risk</th>
                      <th className="px-4 py-3 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {recentScores.map((run) => (
                      <tr key={run.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                          {run.id}
                        </td>
                        <td className="px-4 py-3">{run.company}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                          {run.score}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`
                            ${run.grade.startsWith('A') ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                            ${run.grade.startsWith('B') ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                            ${run.grade.startsWith('D') ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : ''}
                          `}>
                            {run.grade}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {run.status === 'Approved' || run.status === 'Auto-Approved' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : run.status === 'Rejected' ? (
                              <XCircle className="h-4 w-4 text-rose-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="text-slate-600 dark:text-slate-400">{run.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{run.risk}</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">{run.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel border-0 shadow-lg p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Portfolio Exposure</p>
                  <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">$12.4M</h3>
                  <p className="mt-1 text-xs text-slate-500">+8.5% from last month</p>
                </div>
                <div className="rounded-full bg-white p-3 shadow-sm dark:bg-slate-800">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </Card>
            <Card className="glass-panel border-0 shadow-lg p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Avg. Credit Score</p>
                  <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">742</h3>
                  <p className="mt-1 text-xs text-slate-500">Strong portfolio health</p>
                </div>
                <div className="rounded-full bg-white p-3 shadow-sm dark:bg-slate-800">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Deep Dive (5 Cs) */}
        <div className="md:col-span-4 space-y-6">
          <Card className="glass-panel h-full border-0 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart4 className="h-5 w-5 text-indigo-500" />
                5 Cs Analysis
              </CardTitle>
              <CardDescription>
                Breakdown for selected application <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1 py-0.5 rounded ml-1">APP-2024-001</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {fiveCsBreakdown.map((c, i) => (
                <div key={c.title} className="group flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${c.color} bg-opacity-10 dark:bg-opacity-20`}>
                        <c.icon className={`h-4 w-4 ${c.color.replace('bg-', 'text-')}`} />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{c.title}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{c.score}/100</span>
                  </div>
                  <Progress value={c.score} className="h-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                    {c.details}
                  </p>
                </div>
              ))}

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Final Weighted Score</span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">780</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Based on ML proprietary model v2.1. Recommended action:
                    <span className="font-semibold text-emerald-600 ml-1">APPROVE</span>
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
