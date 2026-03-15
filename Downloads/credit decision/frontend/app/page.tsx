import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowUpRight,
    FileText,
    Users,
    FolderDown,
    GaugeCircle,
    BrainCircuit,
    Sparkles,
    ShieldCheck,
    Building2,
    Wand2,
    Globe,
    Layers,
    Zap,
    CheckCircle2,
    TrendingUp,
    BarChart3,
    Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/theme-switcher'

const heroMetrics = [
    { label: 'Applications inspected', value: '12,480+', accent: 'from-sky-400 to-indigo-500' },
    { label: 'Avg decision time', value: '3.9 days', accent: 'from-emerald-400 to-lime-400' },
    { label: 'Docs parsed this week', value: '1,812', accent: 'from-amber-400 to-pink-400' }
]

const productStacks = [
    {
        icon: Users,
        title: 'Crew & Roles',
        copy: 'Spin up credit officers, risk nerds, and approval bosses with safety rails.',
        link: '/users',
        color: 'from-rose-100 via-white to-white'
    },
    {
        icon: FileText,
        title: 'Applications HQ',
        copy: 'Every stage, each approval, all auditable and searchable.',
        link: '/applications',
        color: 'from-sky-100 via-white to-white'
    },
    {
        icon: FolderDown,
        title: 'Document Dock',
        copy: 'Upload GST, bank statements, ITRs, and auto-orchestrate OCR.',
        link: '/documents',
        color: 'from-lime-100 via-white to-white'
    },
    {
        icon: GaugeCircle,
        title: 'Score Studio',
        copy: 'Five-C scoring with IIT-style explainability and nudges.',
        link: '/scores',
        color: 'from-amber-100 via-white to-white'
    }
]

const workflowSteps = [
    {
        title: 'Capture & triage',
        description: 'Applications stream in via APIs or UI with instant risk hygiene checks.',
        stat: '0 missed docs',
        icon: Wand2
    },
    {
        title: 'Score & narrate',
        description: 'Five-Cs plus sensitivity analysis stitched straight into CAM templates.',
        stat: '5C + NLP',
        icon: BrainCircuit
    },
    {
        title: 'Decide & govern',
        description: 'Dual approval lanes, audit trails, and risk guardrails for committees.',
        stat: '1-click PDF',
        icon: ShieldCheck
    }
]

const docSpotlight = [
    {
        title: 'GST + Bank bundles',
        copy: 'Drag-drop zips, auto tag document type, trigger OCR + NLP jobs simultaneously.',
        accent: 'from-sky-400/20 to-indigo-500/10'
    },
    {
        title: 'Entity knowledge graph',
        copy: 'Mongo memory of suppliers, litigations, sentiment and MCA filings stitched per company.',
        accent: 'from-emerald-400/20 to-lime-400/10'
    },
    {
        title: 'Score studio explainers',
        copy: 'Break down every score into drivers, mitigants, and adjustments for committees.',
        accent: 'from-amber-400/20 to-orange-400/10'
    }
]

export default function LandingPage() {
    return (
        <main className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">

            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-sky-200/10 rounded-full blur-3xl -z-10 animate-pulse" />

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-40 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image 
                            src="/images/creditsense_logo_icon.png" 
                            alt="CreditSense Logo" 
                            width={56} 
                            height={56}
                            className="h-14 w-14"
                        />
                        <div>
                            <h2 className="text-xl font-bold text-indigo-600 dark:text-white">
                                CreditSense
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                            <Link href="#overview">Overview</Link>
                        </Button>
                        <Button asChild variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                            <Link href="#about">About</Link>
                        </Button>
                        <ThemeSwitcher />
                        <Button asChild size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center">
                <div className="space-y-8 text-slate-900 dark:text-white lg:w-1/2">
                    <div className="space-y-4">
                        <Badge variant="secondary" className="rounded-full border-2 border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Trusted by 50+ BFSI firms
                        </Badge>
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900 bg-clip-text text-transparent dark:from-white dark:via-indigo-400 dark:to-white">
                                Credit Decisions,
                                <br />
                                <span className="text-indigo-600 dark:text-indigo-400">Beautifully Automated</span>
                            </h1>
                            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                                CreditSense is the only platform where credit officers, risk teams, and ops squads collaborate on applications, documents, scoring, and governance in one expressive cockpit.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                            <Link href="#product" className="flex items-center gap-2">
                                Explore Features
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 dark:text-white">
                            <Link href="/register" className="flex items-center gap-2">
                                Get Started
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3 pt-4">
                        {heroMetrics.map((metric) => (
                            <div key={metric.label} className="group p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 bg-white/60 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 transition-all cursor-pointer">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">{metric.label}</dt>
                                <dd className={`mt-2 text-2xl font-bold bg-gradient-to-r ${metric.accent} bg-clip-text text-transparent`}>{metric.value}</dd>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative w-full lg:w-1/2">
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Main card */}
                        <div className="relative rounded-3xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl" />

                            <div className="relative space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">CreditSense Command Center</p>
                                        <p className="text-xs text-slate-500 mt-1">Real-time Portfolio Analytics</p>
                                    </div>
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                                </div>

                                {/* Stats Grid */}
                                <div className="grid gap-3">
                                    {[
                                        { icon: BarChart3, label: 'Portfolio', value: '$12.4M', accent: 'text-indigo-600' },
                                        { icon: CheckCircle2, label: 'Approved', value: '94%', accent: 'text-emerald-600' },
                                        { icon: TrendingUp, label: 'Monthly Growth', value: '+18%', accent: 'text-sky-600' }
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-transparent border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-${item.accent.split('-')[1]}-100`}>
                                                    <item.icon className={`h-4 w-4 ${item.accent}`} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                            </div>
                                            <span className={`font-bold ${item.accent}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <Button asChild className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                                        <Link href="/register" prefetch={true}>
                                            Start Your Free Trial
                                        </Link>
                                    </Button>
                                    <p className="text-xs text-slate-500 text-center mt-3">No credit card required. 14-day free access.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="product" className="px-6 py-20 bg-white/50 dark:bg-slate-900/50">
                <div className="mx-auto max-w-6xl space-y-12">
                    <div className="text-center space-y-4">
                        <Badge className="rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-0">
                            <Zap className="h-3.5 w-3.5 mr-1" /> Powerful Features
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                            Everything You Need for Credit Excellence
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Integrated modules for applications, documents, scoring, risk, and team collaboration—all powered by our backend API.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {productStacks.map((stack) => (
                            <Card key={stack.title} className={`group relative overflow-hidden bg-gradient-to-br ${stack.color} border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}>
                                {/* Card badge */}
                                <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/80 p-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <stack.icon className="h-6 w-6 text-indigo-600" />
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-2xl font-bold text-slate-900">{stack.title}</CardTitle>
                                    <CardDescription className="text-base text-slate-600 leading-relaxed">{stack.copy}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild className="rounded-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white group/btn">
                                        <Link href={stack.link} className="flex items-center gap-2">
                                            Get Started
                                            <ArrowUpRight className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Intelligence Stack Section */}
            <section id="overview" className="px-6 py-20">
                <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2">
                    <Card className="glass-panel border-2 border-slate-200/50 bg-white/80 hover:border-indigo-200 transition-all">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <BrainCircuit className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">AI-Powered Scoring</CardTitle>
                                    <CardDescription>Enterprise-grade intelligence</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {docSpotlight.map((item) => (
                                <div key={item.title} className={`rounded-2xl border-2 border-transparent hover:border-indigo-200 bg-gradient-to-br ${item.accent} p-5 transition-all`}>
                                    <p className="font-bold text-slate-900">{item.title}</p>
                                    <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-2 border-slate-200/50 bg-white/80 hover:border-emerald-200 transition-all">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-100 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Real-Time Dashboards</CardTitle>
                                    <CardDescription>Complete portfolio visibility</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    { label: 'Portfolio Exposure', value: '₹1,250 Cr', color: 'from-indigo-100 to-indigo-50' },
                                    { label: 'Online Officers', value: '34', color: 'from-emerald-100 to-emerald-50' },
                                    { label: 'Docs Processed', value: '412', color: 'from-sky-100 to-sky-50' },
                                    { label: 'Alerts Resolved', value: '96%', color: 'from-amber-100 to-amber-50' }
                                ].map((tile) => (
                                    <div key={tile.label} className={`rounded-2xl border-2 border-slate-100 hover:border-green-200 bg-gradient-to-br ${tile.color} p-4 transition-all cursor-pointer hover:shadow-lg`}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{tile.label}</p>
                                        <p className="mt-3 text-2xl font-bold text-slate-900">{tile.value}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="px-6 py-20 bg-white/50">
                <div className="mx-auto max-w-6xl space-y-12">
                    <div className="text-center space-y-4">
                        <Badge className="rounded-full bg-indigo-100 text-indigo-700 border-0">
                            <Building2 className="h-3.5 w-3.5 mr-1" /> About CreditSense
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Transforming Credit Decisioning
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            We're on a mission to modernize how financial institutions make credit decisions.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="border-2 border-slate-200/50 bg-white/80 hover:border-indigo-200 transition-all">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Our Mission</CardTitle>
                                <CardDescription>Empowering smarter credit decisions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    CreditSense empowers banks and NBFCs with AI-driven tools to make faster, more accurate credit decisions while maintaining compliance and governance standards.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200/50 bg-white/80 hover:border-indigo-200 transition-all">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Our Technology</CardTitle>
                                <CardDescription>Enterprise-grade infrastructure</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Built on modern cloud architecture with advanced machine learning models, CreditSense processes thousands of applications daily with enterprise security and reliability.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200/50 bg-white/80 hover:border-indigo-200 transition-all">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Our Impact</CardTitle>
                                <CardDescription>Trusted by leading institutions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Over 50+ BFSI firms trust CreditSense to streamline their credit operations, reducing decision times by up to 70% while improving risk assessment accuracy.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4 text-center">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100">
                            <p className="text-4xl font-bold text-indigo-600">50+</p>
                            <p className="text-sm text-slate-600 mt-2">BFSI Clients</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100">
                            <p className="text-4xl font-bold text-emerald-600">12K+</p>
                            <p className="text-sm text-slate-600 mt-2">Applications Daily</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100">
                            <p className="text-4xl font-bold text-sky-600">70%</p>
                            <p className="text-sm text-slate-600 mt-2">Faster Decisions</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100">
                            <p className="text-4xl font-bold text-amber-600">99.9%</p>
                            <p className="text-sm text-slate-600 mt-2">Uptime SLA</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                <div className="mx-auto max-w-4xl text-center text-white space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            Ready to Transform Your Credit Operations?
                        </h2>
                        <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
                            Join leading financial institutions that trust CreditSense to streamline their credit decision process.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center pt-4">
                        <Button asChild size="lg" className="rounded-full bg-white text-indigo-600 hover:bg-slate-100 shadow-lg">
                            <Link href="/register" prefetch={true} className="flex items-center gap-2">
                                Start Free Trial
                                <Zap className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white text-white hover:bg-white/10">
                            <Link href="/docs/API_ENDPOINTS">View Documentation</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 py-12">
                <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Image 
                                src="/images/creditsense_logo_icon.png" 
                                alt="CreditSense Logo" 
                                width={32} 
                                height={32}
                                className="h-8 w-8"
                            />
                            <span className="font-bold text-white">CreditSense</span>
                        </div>
                        <p className="text-sm text-slate-400">Enterprise credit decisioning platform for BFSI.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#product" className="hover:text-indigo-400">Features</Link></li>
                            <li><Link href="/docs/API_ENDPOINTS" className="hover:text-indigo-400">API Docs</Link></li>
                            <li><Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-indigo-400">About</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-indigo-400">Privacy</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Terms</a></li>
                            <li><a href="#" className="hover:text-indigo-400">Security</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mx-auto max-w-6xl px-6 mt-8 pt-8 border-t border-slate-800 text-sm text-slate-400 flex justify-between">
                    <p>&copy; 2026 CreditSense. All rights reserved.</p>
                    <p>Built for excellence in credit decisions.</p>
                </div>
            </footer>
        </main>
    )
}