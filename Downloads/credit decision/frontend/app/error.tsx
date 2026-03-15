'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-slate-900 px-6">
      <div className="text-center space-y-8 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="text-6xl font-bold text-red-600 dark:text-red-400">
            ⚠️
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Something Went Wrong
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => reset()}
            className="inline-block px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all shadow-lg"
          >
            Try Again
          </Button>
          <div className="text-sm">
            <a href="/" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
              Return to Home →
            </a>
          </div>
        </div>

        {error.digest && (
          <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono">
            Error ID: {error.digest}
          </div>
        )}
      </div>
    </div>
  )
}
