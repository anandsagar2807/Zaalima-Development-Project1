'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, ScanFace, FileSearch, ShieldCheck, Activity, Users, Lock } from 'lucide-react'

const riskModules = [
  { 
    title: 'Risk Flags', 
    description: 'Real-time severity alerts from credit bureau and fraud checks.', 
    icon: AlertTriangle,
    status: 'Active',
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
  { 
    title: 'Circular Trading', 
    description: 'Graph analysis to detect suspicious supplier-buyer networks.', 
    icon: ScanFace,
    status: 'Beta',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50'
  },
  { 
    title: 'Litigation Radar', 
    description: 'Automated E-Courts and news sentiment analysis.', 
    icon: FileSearch,
    status: 'Coming Soon',
    color: 'text-rose-500',
    bg: 'bg-rose-50'
  },
  { 
    title: 'Scorecard Builder', 
    description: 'Custom implementation of logistic regression models.', 
    icon: Activity,
    status: 'Active',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  },
   { 
    title: 'PEP Screening', 
    description: 'Politically Exposed Persons and sanctions list checks.', 
    icon: Users,
    status: 'Active',
    color: 'text-sky-500',
    bg: 'bg-sky-50'
  },
   { 
    title: 'Collateral Vault', 
    description: 'Valuation tracking and LTV monitoring system.', 
    icon: Lock,
    status: 'Planned',
    color: 'text-slate-500',
    bg: 'bg-slate-50'
  }
]

export default function RiskPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Risk Lab</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Investigations & Mitigants</h1>
          <p className="text-sm text-slate-500">Centralized governance for credit policy and fraud detection.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-indigo-200/50" asChild>
          <a href="/applications">
            <ShieldCheck className="mr-2 h-4 w-4" /> Assign Investigation
          </a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {riskModules.map((module) => {
           const Icon = module.icon
           return (
            <Card key={module.title} className="floating-card border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className={`rounded-xl p-3 ${module.bg}`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <Badge variant="secondary" className="bg-slate-100 font-medium text-slate-600">
                    {module.status}
                </Badge>
              </CardHeader>
              <CardContent>
                 <CardTitle className="text-lg font-bold text-slate-900">{module.title}</CardTitle>
                 <p className="mt-2 text-sm text-slate-500 leading-relaxed">{module.description}</p>
                 <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Version 2.1</span>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        Launch Module
                    </Button>
                 </div>
              </CardContent>
            </Card>
           )
        })}
      </div>
    </div>
  )
}
