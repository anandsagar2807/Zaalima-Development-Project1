'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, Zap, CheckCircle2, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Prevent double submission
    if (loading || success) return

    setError('')
    setSuccess('')

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await authAPI.register({ 
        name: fullName, 
        email, 
        password,
        role: 'CREDIT_OFFICER' // Default role for new users
      })
      setSuccess('✓ Account created! Redirecting you to CreditSense...')

      // Faster redirect with prefetch
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
      submitTimeoutRef.current = setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Unable to create account. Please try again.'
      setError(message)
      setLoading(false)
    }
  }, [fullName, email, password, confirmPassword, agreeTerms, loading, success, router])

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
          <CardTitle className="text-3xl font-bold text-slate-900">Join CreditSense</CardTitle>
          <CardDescription className="text-base text-slate-600 mt-2">
            Create your account to start making smarter credit decisions
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-semibold text-slate-900">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-slate-900">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all h-11"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-slate-900">Password</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-slate-900">Confirm</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                required
              />
            </div>
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

          <div className="flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
              I agree to the{' '}
              <Link href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
            disabled={loading || !agreeTerms}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create CreditSense Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="rounded-lg border-2 border-slate-100 bg-slate-50 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-sm text-slate-700">
              <p className="font-semibold">Instant access to:</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li>• AI-powered credit scoring</li>
                <li>• Real-time risk analytics</li>
                <li>• Automated document processing</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 pt-2">
          Already have an account?{' '}
          <Link href="/login" prefetch={true} className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign in here
          </Link>
        </p>
      </CardContent>
    </>
  )
}
