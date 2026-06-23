import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Github, Sparkles, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const githubRepoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || 'https://github.com'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-amber-400/10 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Code Review</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight max-w-5xl px-2"
          >
            <span className="gradient-text">GitGuard AI</span>
            <br />
            <span className="text-foreground">Your Pull Request Sentinel</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl"
          >
            Intelligent code analysis that listens to GitHub PR events, analyzes diffs
            in real-time, and posts automated review comments with suggested fixes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link to="/dashboard">
              <Button variant="gradient" size="xl" className="group">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Open Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href={githubRepoUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="xl" className="group">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8"
          >
            {[
              { value: '10K+', label: 'PRs Analyzed' },
              { value: '99.9%', label: 'Uptime' },
              { value: '50ms', label: 'Avg Response' },
              { value: '500+', label: 'Teams' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Floating Code Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 sm:mt-16 w-full max-w-4xl"
          >
            <div className="relative rounded-xl border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b bg-muted/50">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-muted-foreground truncate">
                  pull-request-review.ts
                </span>
              </div>
              {/* Code Content */}
              <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                <div className="flex">
                  <span className="text-muted-foreground w-8">1</span>
                  <span className="text-blue-500">const</span>
                  <span className="text-foreground ml-2">analysis =</span>
                  <span className="text-blue-500 ml-2">await</span>
                  <span className="text-primary ml-2">GitGuardAI</span>
                  <span className="text-foreground">.analyze(</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-8">2</span>
                  <span className="text-foreground ml-4">pr.diff,</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-8">3</span>
                  <span className="text-foreground">);</span>
                </div>
                <div className="flex mt-2">
                  <span className="text-muted-foreground w-8">4</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-8">5</span>
                  <span className="text-green-500">
                    // ✓ Security: No vulnerabilities found
                  </span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-8">6</span>
                  <span className="text-green-500">
                    // ✓ Performance: 2 optimizations suggested
                  </span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-8">7</span>
                  <span className="text-yellow-500">// ⚠ Style: 3 formatting issues</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
