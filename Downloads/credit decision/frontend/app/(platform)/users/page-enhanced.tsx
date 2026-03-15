'use client'

import { useEffect, useState } from 'react'
import { usersAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { Plus, Search, FilterX, User, Mail, Phone, Edit3, Trash2, ShieldCheck, Activity } from 'lucide-react'

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [filteredUsers, setFilteredUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('name')

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await usersAPI.getAll()
                setUsers(data || [])
                setFilteredUsers(data || [])
            } catch (error) {
                console.warn('Users fallback →', error)
                setUsers([])
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    // Filter and search users
    useEffect(() => {
        let filtered = users

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter)
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter)
        }

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Sort
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '')
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                case 'oldest':
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                default:
                    return 0
            }
        })

        setFilteredUsers(filtered)
    }, [users, searchTerm, roleFilter, statusFilter, sortBy])

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            analyst: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            viewer: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
        }
        return colors[role] || 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }
        return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    }

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        roles: Array.from(new Set(users.map(u => u.role))).length
    }

    const roles = Array.from(new Set(users.map(u => u.role))).filter(Boolean)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Members</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage user accounts and permissions ({filteredUsers.length})</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>
                    Add User
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                            </div>
                            <User className="w-8 h-8 text-indigo-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">Active</p>
                                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{stats.active}</p>
                            </div>
                            <Activity className="w-8 h-8 text-emerald-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Roles</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.roles}</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-blue-500 opacity-20" />
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
                                    placeholder="Search by name or email..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <option value="all">All Roles</option>
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <option value="name">By Name</option>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </Select>
                        </div>
                        <div className="md:col-span-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm('')
                                    setRoleFilter('all')
                                    setStatusFilter('all')
                                    setSortBy('name')
                                }}
                                title="Clear all filters"
                            >
                                <FilterX className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Grid */}
            <div className="space-y-4">
                {loading ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12">
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading users...
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredUsers.length === 0 ? (
                    <Card className="border-slate-200/60 dark:border-slate-700/50">
                        <CardContent className="py-12 text-center text-slate-500">
                            No users found
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map((user) => (
                            <Card
                                key={user.id}
                                className="border-slate-200/60 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 group"
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                    {user.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {user.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : user.status === 'pending' ? 'bg-yellow-500' : 'bg-slate-400'}`} />
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-2">
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                    <Phone className="w-3 h-3" />
                                                    {user.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                <Mail className="w-3 h-3" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className={getRoleColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                            <Badge className={getStatusColor(user.status)}>
                                                {user.status}
                                            </Badge>
                                        </div>

                                        {/* Metadata */}
                                        <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                                            {user.createdAt && (
                                                <p>Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" icon={<Edit3 className="w-3 h-3" />} className="flex-1">
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-red-600 hover:text-red-700"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
