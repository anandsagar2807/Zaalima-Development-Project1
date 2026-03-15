'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, FileStack, Building2, FileCheck2, Gauge, Users, Shield, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/applications', icon: FileStack },
  { label: 'Companies', href: '/companies', icon: Building2 },
  { label: 'Documents', href: '/documents', icon: FileCheck2 },
  { label: 'Scores', href: '/scores', icon: Gauge },
  { label: 'Team', href: '/users', icon: Users },
  { label: 'Risk', href: '/risk', icon: Shield }
]

export function PlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[280px,1fr] bg-slate-50/50 dark:bg-slate-950">

      {/* Sidebar */}
      <aside className="hidden min-h-screen flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 px-6 pt-8 lg:flex">

        {/* Logo Area */}
        <Link href="/dashboard" className="group flex items-center gap-3 px-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg transition-all group-hover:scale-105">
            <Image
              src="/images/creditsense-logo.png"
              alt="CreditSense Logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Credit<span className="text-indigo-500">Sense</span></span>
        </Link>

        <div className="mt-8 mb-2 px-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Status Card */}
        <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">System Online</p>
          </div>
          <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80">
            v2.4.0-stable
            <br />
            Connected to <strong>us-east-1</strong>
          </p>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-col relative">

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200/60 bg-white/80 px-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-1 items-center justify-between">

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <details className="relative z-50">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Menu className="h-5 w-5" />
                </summary>
                <div className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:w-64">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </details>
            </div>

            <div className="hidden lg:block">
              {/* Breadcrumbs or Page Title could go here */}
            </div>

            {/* Profile & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-full dark:bg-slate-800/50 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Production
              </div>

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">CreditSense</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Credit Decision Platform</p>
                </div>
                <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white shadow-sm dark:ring-slate-800 bg-slate-200">
                  <Image 
                    src="/images/creditsense_logo_icon.png" 
                    alt="CreditSense" 
                    width={36} 
                    height={36}
                    className="h-full w-full object-contain"
                  />
                </div>
                <ThemeSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
