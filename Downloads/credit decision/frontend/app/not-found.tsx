import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | CreditSense',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-slate-900 px-6">
      <div className="text-center space-y-8 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 dark:from-white via-indigo-600 to-slate-900 dark:to-indigo-400 bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/"
            className="inline-block px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all shadow-lg"
          >
            Return Home
          </a>
          <div className="text-sm">
            <a href="/dashboard" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
              Go to Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
