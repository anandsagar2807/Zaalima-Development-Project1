'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileStack, Cloud, Search, Filter, FileCheck, Loader2, FileWarning } from 'lucide-react'

interface DocumentRecord {
  id: string
  type: string
  name: string
  stage: string
  status: 'verified' | 'pending' | 'rejected'
  uploadedBy: string
  uploadedAt: string
}

const fallbackDocs: DocumentRecord[] = [
  {
    id: 'doc-001',
    type: 'BANK_STATEMENT',
    name: 'Bank Statement Jan-Mar 2024',
    stage: 'intake',
    status: 'verified',
    uploadedBy: 'Loan Officer',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'doc-002',
    type: 'GST_RETURN',
    name: 'GSTR-3B FY24 Q2',
    stage: 'research',
    status: 'pending',
    uploadedBy: 'Research Bot',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'doc-003',
    type: 'KYC_AADHAAR',
    name: 'Promoter Aadhaar Back',
    stage: 'primary-input',
    status: 'rejected',
    uploadedBy: 'System',
    uploadedAt: new Date().toISOString()
  }
]

const statusMeta = {
  verified: { label: 'Verified', color: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: FileCheck },
  pending: { label: 'Pending', color: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', icon: Loader2 },
  rejected: { label: 'Rejected', color: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400', icon: FileWarning }
}

type StatusKey = 'verified' | 'pending' | 'rejected'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 800))
        setDocuments(fallbackDocs)
      } catch (error) {
        console.warn('Document list fallback →', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  const currentDocs = documents.length ? documents : fallbackDocs

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in zoom-in duration-500 space-y-8 p-6 lg:p-8">

      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <FileStack className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Documents Vault
            </h1>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
            Central repository for all borrower documents. Upload, verify, and audit trails in one glass dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-panel hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
            <Cloud className="mr-2 h-4 w-4" /> Pull from App
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all">
            <Upload className="mr-2 h-4 w-4" /> Upload New
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {(['verified', 'pending', 'rejected'] as StatusKey[]).map((status) => {
          const meta = statusMeta[status]
          const total = currentDocs.filter((doc) => doc.status === status).length

          return (
            <Card key={status} className="glass-panel border-0 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-0 left-0 h-1 w-full ${meta.color}`} />
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${meta.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{meta.label}</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{total}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${meta.bg}`}>
                    <meta.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-12">

        {/* Document List */}
        <div className="md:col-span-8 space-y-6">
          <Card className="glass-panel border-0 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Detailed File Log
                </CardTitle>
                <CardDescription>Recent uploads and their verification status</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="h-9 w-[150px] lg:w-[200px] rounded-full border border-slate-200 bg-white/50 pl-9 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50"
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Filter className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Document Name</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Stage</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {currentDocs.map((doc) => {
                        const meta = statusMeta[doc.status]
                        return (
                          <tr key={doc.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                              <div className="flex items-center gap-2">
                                <FileStack className="h-4 w-4 text-slate-400" />
                                {doc.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{doc.type}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="font-normal text-slate-600 dark:text-slate-400">
                                {doc.stage}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${meta.bg} border-0 shadow-none hover:bg-opacity-80`}>
                                {meta.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-slate-400">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upload Zone */}
        <div className="md:col-span-4 space-y-6">
          <Card className="glass-panel border-0 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-3xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-indigo-500" />
                Quick Upload
              </CardTitle>
              <CardDescription>Drag & drop files here to process immediately</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">Click or drag file to this area to upload</h3>
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                  Support for PDF, XLSX, ZIP. Max size 25MB.
                </p>
                <Button size="sm" variant="secondary" className="w-full">Select Files</Button>
              </div>

              <div className="mt-8">
                <h4 className="mb-3 text-sm font-medium text-slate-900 dark:text-white">Recent Activity</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="flex-1 text-slate-600 dark:text-slate-400">Parsed <span className="font-medium text-slate-900 dark:text-slate-200">Financials_FY23.pdf</span></span>
                      <span className="text-xs text-slate-400">2m ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
