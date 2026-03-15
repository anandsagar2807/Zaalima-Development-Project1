'use client'

import { useEffect, useState } from 'react'
import { documentsAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Search, FilterX, Download, Trash2, Eye, File, Upload, Clock } from 'lucide-react'

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([])
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const { data } = await documentsAPI.getAll()
                setDocuments(data || [])
                setFilteredDocuments(data || [])
            } catch (error) {
                console.warn('Documents fallback →', error)
                setDocuments([])
            } finally {
                setLoading(false)
            }
        }
        fetchDocuments()
    }, [])

    // Filter and search documents
    useEffect(() => {
        let filtered = documents

        if (typeFilter !== 'all') {
            filtered = filtered.filter(doc => doc.type === typeFilter)
        }

        if (searchTerm) {
            filtered = filtered.filter(doc =>
                doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Sort
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
                case 'oldest':
                    return new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime()
                case 'name':
                    return (a.fileName || '').localeCompare(b.fileName || '')
                case 'size_large':
                    return (b.fileSize || 0) - (a.fileSize || 0)
                default:
                    return 0
            }
        })

        setFilteredDocuments(filtered)
    }, [documents, searchTerm, typeFilter, sortBy])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setIsUploading(true)
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const progress = Math.round(((i + 1) / files.length) * 100)
                setUploadProgress(progress)

                // Simulate upload (replace with actual API call)
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            // Refresh documents list
            const { data } = await documentsAPI.getAll()
            setDocuments(data || [])
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
            e.target.value = ''
        }
    }

    const documentTypes = Array.from(new Set(documents.map(d => d.type))).filter(Boolean)

    const getDocumentIcon = (type: string) => {
        const icons: Record<string, string> = {
            pdf: '📄',
            image: '🖼️',
            spreadsheet: '📊',
            document: '📝',
            other: '📁'
        }
        return icons[type] || '📁'
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Documents</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage application documents ({filteredDocuments.length})</p>
                </div>
                <label>
                    <Button
                        icon={<Upload className="w-4 h-4" />}
                        disabled={isUploading}
                        onClick={(e) => {
                            const input = document.querySelector('input[type="file"]') as HTMLInputElement
                            input?.click()
                        }}
                    >
                        {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Documents'}
                    </Button>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                </label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <Card className="border-indigo-200/60 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Uploading documents</p>
                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{uploadProgress}%</p>
                        </div>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card className="border-slate-200/60 dark:border-slate-700/50">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by file name or description..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <option value="all">All Types</option>
                                {documentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">By Name</option>
                                <option value="size_large">Largest First</option>
                            </Select>
                        </div>
                        <div className="md:col-span-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm('')
                                    setTypeFilter('all')
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

            {/* Documents List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12">
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading documents...
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredDocuments.length === 0 ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12 text-center text-slate-500">
                            No documents found
                        </CardContent>
                    </Card>
                ) : (
                    filteredDocuments.map((doc) => (
                        <Card
                            key={doc.id}
                            className="border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 group"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Left Section */}
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="text-3xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                                            {getDocumentIcon(doc.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {doc.fileName}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400">
                                                <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                                                    {doc.type}
                                                </Badge>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span>{formatFileSize(doc.fileSize || 0)}</span>
                                            </div>
                                            {doc.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 line-clamp-2">
                                                    {doc.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button variant="ghost" size="icon-sm" title="View document">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" title="Download">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            title="Delete"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
