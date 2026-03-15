'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, Sparkles, Zap, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await authAPI.login(email, password)
      const tokens = response.data?.data || {}
      if (tokens.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken)
      }
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken)
      }
      setSuccess('✓ Logged in! Redirecting to CreditSense...')
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Unable to log in. Please verify your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CardHeader className="space-y-4 border-b border-slate-200/50 px-8 py-8 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/images/creditsense_logo_icon.png" 
            alt="CreditSense Logo" 
            className="h-12 w-12"
          />
          <h2 className="text-xl font-bold text-slate-900">CreditSense</h2>
        </div>
        <div>
          <CardTitle className="text-3xl font-bold text-slate-900">Welcome back</CardTitle>
          <CardDescription className="text-base text-slate-600 mt-2">
            Sign in to access your credit decision platform
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-slate-900">Work Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="demo@creditsense.com" 
              value={email} 
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all h-11"
              required 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-semibold text-slate-900">Password</Label>
              <Link href="/register" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                New here?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all h-11"
              required 
            />
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3">
              <div className="text-red-600 mt-0.5">!</div>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-emerald-700">{success}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full rounded-lg h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In to CreditSense'
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-600">or</span>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-100 bg-slate-50 p-4 space-y-3">
          <p className="flex items-center gap-2 text-sm text-slate-700">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="font-medium">Demo credentials available</span>
          </p>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Email:</strong> demo@creditsense.com</p>
            <p><strong>Password:</strong> Demo123!</p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 pt-2">
          No account yet?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Create one in 2 minutes
          </Link>
        </p>
      </CardContent>
    </>
  )
}
