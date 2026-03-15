'use client'

import { useEffect, useState } from 'react'
import { usersAPI } from '@/lib/api'
import type { UserRecord } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Loader2, Shield, UserPlus, Lock, Mail, Phone, MoreHorizontal, Users, Filter, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// ... existing code ...
const fallbackUsers: UserRecord[] = [
  {
    id: 'user-1',
    name: 'Anika Sharma',
    email: 'anika@lending.co',
    role: 'credit-analyst',
    status: 'active',
    phone: '+91 98XXXXXX12'
  },
  {
    id: 'user-2',
    name: 'Rahul Iyer',
    email: 'rahul@lending.co',
    role: 'risk-lead',
    status: 'suspended',
    phone: '+91 97XXXXXX02'
  },
   {
    id: 'user-3',
    name: 'Arjun Verma',
    email: 'arjun@lending.co',
    role: 'admin',
    status: 'active',
    phone: '+91 99XXXXXX33'
  }
]

const roleConfig: Record<string, { label: string, color: string }> = {
  'credit-analyst': { label: 'Credit Analyst', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'risk-lead': { label: 'Risk Lead', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  'ops-lead': { label: 'Ops Lead', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'admin': { label: 'Admin', color: 'bg-slate-800 text-white dark:bg-slate-700' }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600))
        setUsers(fallbackUsers)
      } catch (error) {
        console.warn('Users list fallback →', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const currentUsers = users.length ? users : fallbackUsers

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in zoom-in duration-500 space-y-8 p-6 lg:p-8">
       
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Team Roster
            </h1>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
            Manage access controls, roles, and permissions for credit analysts, risk leads, and admins.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search team..." 
                className="h-10 w-[200px] rounded-full border border-slate-200 bg-white/50 pl-9 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50"
              />
          </div>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all">
            <UserPlus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-6">
        <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100/50 p-1 backdrop-blur-sm border border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700">
               <TabsTrigger value="grid" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Grid View</TabsTrigger>
               <TabsTrigger value="table" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">List View</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden md:flex text-slate-500">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>
        </div>

        <TabsContent value="grid" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {currentUsers.map((user) => {
               const roleInfo = roleConfig[user.role] || { label: user.role, color: 'bg-slate-100 text-slate-600' }
               
               return (
                <Card key={user.id} className="group glass-panel border-0 shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                   <div className={`absolute top-0 left-0 w-1 h-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                   
                   {/* Background decoration */}
                   <div className="absolute top-0 right-0 p-20 bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/10 rounded-bl-[100px] -z-10 opacity-50 transition-opacity group-hover:opacity-100" />

                  <CardHeader className="flex flex-col gap-4 pb-4">
                    <div className="flex justify-between items-start">
                         <Avatar className="h-14 w-14 border-2 border-white shadow-md dark:border-slate-700">
                            {/* In a real app, use user.avatarUrl */}
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                <DropdownMenuItem>Change Role</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-rose-600">Deactivate User</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">{user.name}</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                            {/* Status Dot */}
                            <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {user.email}
                        </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex flex-wrap gap-2">
                        <Badge className={`${roleInfo.color} border-0 px-2 py-0.5 font-medium`}>
                           {roleInfo.label}
                        </Badge>
                     </div>
                     
                     <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                           <Phone className="mr-2 h-3.5 w-3.5 opacity-70" />
                           {user.phone}
                        </div>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                           <Shield className="mr-2 h-3.5 w-3.5 opacity-70" />
                           Last active: <span className="text-slate-700 dark:text-slate-300 ml-1">2 hours ago</span>
                        </div>
                     </div>
                  </CardContent>
                </Card>
               )
            })}
             
             {/* Add New Card */}
             <button className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm group-hover:scale-110 transition-transform dark:bg-slate-800">
                   <UserPlus className="h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add Team Member</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Invite by email</p>
             </button>

          </div>
        </TabsContent>
        
        <TabsContent value="table">
            <Card className="glass-panel border-0 shadow-lg">
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {currentUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                 <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="font-normal capitalize text-slate-600 dark:text-slate-400">
                                                {user.role.replace('-', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{user.phone}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
