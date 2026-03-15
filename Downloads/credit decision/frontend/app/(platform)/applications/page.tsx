'use client'

import { useEffect, useState } from 'react'
import { applicationsAPI } from '@/lib/api'
import type { ApplicationSummary } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Filter, Upload, Search, RefreshCcw, ArrowRight, Building2, Wallet } from 'lucide-react'

const stageFilters = ['all', 'primary-input', 'research', 'scoring', 'approval', 'funded'] as const
const initialPagination = { page: 1, limit: 10 }

const stageConfig = {
  'primary-input': { label: 'Primary Input', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  'research': { label: 'Research', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  'scoring': { label: 'Scoring', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  'approval': { label: 'Approval', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  'funded': { label: 'Funded', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
} as const

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationSummary[]>([])
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<(typeof stageFilters)[number]>('all')
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const params = { ...pagination, stage: stage === 'all' ? undefined : stage, search: search || undefined }
        const { data } = await applicationsAPI.list(params)
        setApplications(data.items)
      } catch (error) {
        console.warn('Applications fallback list →', error)
        setApplications([
          {
            id: 'fallback-app-1',
            applicationNumber: 'APP-009812',
            company: { name: 'Fallback Textiles Pvt Ltd' },
            loanAmount: 25000000,
            stage: 'scoring',
            assignedTo: 'team-alpha',
            updatedAt: new Date().toISOString()
          },
          {
            id: 'fallback-app-2',
            applicationNumber: 'APP-009813',
            company: { name: 'Alpha Logistics' },
            loanAmount: 1500000,
            stage: 'primary-input',
            assignedTo: 'unassigned',
             updatedAt: new Date().toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [pagination, stage, search])

  return (
    <div className="space-y-8">
       <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Applications layer</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Commercial credit intake</h1>
          <p className="text-sm text-slate-500">Track primary input + research + scoring flows in one pane.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full shadow-lg shadow-indigo-200/50">
            <a href="/documents">
              <Upload className="mr-2 h-4 w-4" /> Upload doc bundle
            </a>
          </Button>
          <Button variant="outline" className="rounded-full bg-white/50 backdrop-blur-sm">
            <Filter className="mr-2 h-4 w-4" /> Smart filters
          </Button>
        </div>
      </div>

      <div className="glass-panel p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by company, application number, analyst..."
                className="pl-10 bg-white/50 border-slate-200 focus:bg-white transition-all"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex gap-3">
                 <Select value={stage} onValueChange={(value) => setStage(value as (typeof stageFilters)[number])}>
                  <SelectTrigger className="w-[180px] bg-white/50 border-slate-200">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageFilters.map((option) => (
                      <SelectItem key={option} value={option} className="capitalize">
                        {option.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={() => setPagination(initialPagination)}>
                  <RefreshCcw className="h-4 w-4 text-slate-500" />
                </Button>
            </div>
          </div>

          <Tabs defaultValue="board" className="space-y-6">
            <TabsList className="bg-slate-100/50 p-1">
              <TabsTrigger value="board" className="rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Kanban Board</TabsTrigger>
              <TabsTrigger value="table" className="rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="mt-0">
              <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-5 min-w-[1000px] md:min-w-0">
                {Object.entries(stageConfig).map(([key, config]) => {
                    const stageApps = applications.filter((app) => app.stage === key)
                    
                    return (
                        <div key={key} className="flex flex-col gap-3 rounded-xl bg-slate-50/50 p-3 ring-1 ring-slate-100">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{config.label}</span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-100">
                                    {stageApps.length}
                                </span>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                {stageApps.map((app) => (
                                    <div key={app.id} className="group relative flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 cursor-pointer">
                                        <div className="flex items-start justify-between">
                                            <div className="rounded-md bg-indigo-50 p-1.5 text-indigo-600">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400">{app.applicationNumber}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 line-clamp-1">{app.company?.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {app.loanAmount ? `₹${(app.loanAmount / 100000).toFixed(1)}L` : '—'}
                                            </p>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between border-t border-slate-50 pt-2">
                                            <span className="text-[10px] uppercase text-slate-400 font-medium">
                                                {app.assignedTo || 'Unassigned'}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                                {stageApps.length === 0 && (
                                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400">Empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
              </div>
            </TabsContent>

            <TabsContent value="table">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Application</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Loan Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Stage</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assignee</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                           <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-indigo-500/50" />
                              <p>Syncing applications...</p>
                           </div>
                        </td>
                      </tr>
                    )}
                    {!loading && applications.map((app) => {
                         const stageInfo = stageConfig[app.stage as keyof typeof stageConfig] || stageConfig['primary-input'];
                         return (
                            <tr key={app.id} className="group hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500">{app.applicationNumber}</td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="rounded-full bg-slate-100 p-2 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                          <Building2 className="h-4 w-4" />
                                      </div>
                                      <span className="font-semibold text-slate-900">{app.company?.name ?? '—'}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-700">
                                  {app.loanAmount ? `₹${(app.loanAmount / 100000).toLocaleString()} L` : '—'}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className={`${stageInfo.color} font-medium`}>
                                    {stageInfo.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{app.assignedTo ?? <span className="text-slate-400 italic">Unassigned</span>}</td>
                              <td className="px-6 py-4 text-slate-500 text-xs">
                                  {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                         )
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  )
}
