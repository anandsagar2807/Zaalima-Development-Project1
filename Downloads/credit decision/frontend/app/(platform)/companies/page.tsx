'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, MapPin, Briefcase, ChevronRight, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const keyStats = [
  { label: 'Companies Onboarded', value: '312', detail: 'with live applications', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Cities Covered', value: '42', detail: 'PAN India', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Industry Clusters', value: '18', detail: 'tailored heuristics', icon: Briefcase, color: 'text-rose-600', bg: 'bg-rose-50' }
]

const recentCompanies = [
  { name: 'Acme Textiles Ltd', industry: 'Textiles', loca: 'Surat, GJ', status: 'Active', employees: '50-200' },
  { name: 'Global Logistics', industry: 'Logistics', loca: 'Mumbai, MH', status: 'Pending', employees: '500+' },
  { name: 'Solar Tech Solutions', industry: 'Renewables', loca: 'Bangalore, KA', status: 'Active', employees: '10-50' },
  { name: 'Zenith Pharma', industry: 'Pharmaceuticals', loca: 'Hyderabad, TS', status: 'Review', employees: '200-500' },
]

export default function CompaniesPage() {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Company Graph</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Portfolio & Entities</h1>
          <p className="text-sm text-slate-500">Search companies, inspect linked applications, and review research snapshots.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-indigo-200/50" asChild>
          <a href="/applications">
            <Plus className="mr-2 h-4 w-4" /> Add New Entity
          </a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {keyStats.map((stat) => {
           const Icon = stat.icon
           return (
            <Card key={stat.label} className="floating-card border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start">
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge variant="outline" className="bg-slate-50 font-medium text-slate-600">
                        {stat.detail}
                    </Badge>
                 </div>
                 <div className="mt-4">
                    <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                 </div>
              </CardContent>
            </Card>
           )
        })}
      </div>

      <div className="grid gap-6">
        <Card className="glass-panel border-0 shadow-xl shadow-slate-200/40">
           <CardHeader className="flex flex-row items-center justify-between">
             <div>
                <CardTitle>Company Directory</CardTitle>
                <CardDescription>Recently active entities in the system.</CardDescription>
             </div>
             <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                View All <ChevronRight className="ml-1 h-4 w-4" />
             </Button>
           </CardHeader>
           <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {recentCompanies.map((company) => (
                    <Card key={company.name} className="group overflow-hidden border border-slate-100 bg-white/50 transition-all hover:bg-white hover:shadow-lg cursor-pointer">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <Avatar className="h-10 w-10 border border-slate-100">
                                   <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${company.name}`} />
                                   <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                                </Avatar>
                                <Badge variant="secondary" className={company.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}>
                                    {company.status}
                                </Badge>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-slate-900 line-clamp-1">{company.name}</h4>
                                <p className="text-xs text-slate-500">{company.industry}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-50">
                                <MapPin className="h-3 w-3" />
                                <span>{company.loca}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
