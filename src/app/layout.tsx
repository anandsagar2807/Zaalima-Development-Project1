import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { GitHubConnectModal } from "@/components/auth/github-connect-modal"
import { ClerkSignOutListener } from "@/components/auth/ClerkSignOutListener"
import { Navbar } from "@/components/sections/navbar"
import { Footer } from "@/components/sections/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "GitGuard AI - AI-Powered Pull Request Sentinel",
    description: "Intelligent code analysis that listens to GitHub PR events, analyzes diffs in real-time, and posts automated review comments with suggested fixes.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider afterSignOutUrl="/">
            <html lang="en" suppressHydrationWarning>
                <body className={inter.className}>
                    <ClerkSignOutListener />
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <GitHubConnectModal />
                        <Navbar />
                        {children}
                        <Footer />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}