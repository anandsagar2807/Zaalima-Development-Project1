import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Aurora - Create Account',
  description: 'Join Aurora and start making smarter credit decisions',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.3),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'160\\' height=\\'160\\' viewBox=\\'0 0 160 160\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-opacity=\\'0.15\\'%3E%3Cpath d=\\'M0 0h160v160H0z\\'/%3E%3Cpath d=\\'M80 0h1v160h-1zM0 80h160v1H0z\\' fill=\\'%23ffffff\\'/%3E%3C/g%3E%3C/svg%3E')" }} />
      <div className="relative z-10 flex min-h-screen flex-col px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row">
          <div className="flex flex-1 flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-8 text-slate-100 shadow-2xl">
            <div>
              <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-white">
                <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400" />
                Aurora Credit OS
              </Link>
              <p className="mt-6 max-w-md text-sm text-slate-300">
                A playful IIT-grade credit decision universe. Jump in, manage applications, parse documents, orchestrate scores, and keep regulators smiling.
              </p>
              <div className="mt-10 space-y-4">
                {["Single cockpit for applications + docs", "Scores, risk, CAM with AI explainers", "Secure by default with sandbox + prod modes"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-white">•</span>
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">© {new Date().getFullYear()} Aurora Credit OS</p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white text-slate-900 shadow-2xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
