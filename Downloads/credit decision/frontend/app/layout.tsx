import type { Metadata } from 'next'
import { Space_Grotesk, Syne } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const syne = Syne({ subsets: ['latin'], variable: '--font-heading', weight: ['400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
    title: 'CreditSense - AI-Powered Credit Decisioning Platform',
    description: 'Enterprise credit decisioning platform with AI-powered scoring, real-time risk analytics, and automated document processing for BFSI institutions.',
    keywords: 'credit scoring, risk analysis, lending platform, fintech, BFSI',
    authors: [{ name: 'CreditSense Team' }],
    creator: 'CreditSense',
    publisher: 'CreditSense',
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://creditsense-platform.com',
        title: 'CreditSense',
        description: 'AI-powered credit decisioning for modern banking',
        siteName: 'CreditSense',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CreditSense',
        description: 'AI-powered credit decisioning for modern banking',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${syne.variable}`} suppressHydrationWarning>
            <body className="font-sans text-foreground bg-background">
                <ThemeProvider>
                    <div className="relative min-h-screen bg-canvas text-foreground">
                        <div className="aurora-lens" />
                        <div className="grid-overlay" />
                        <div className="noise-texture" />
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}