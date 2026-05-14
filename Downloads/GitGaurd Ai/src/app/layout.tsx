import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "@/components/ClientLayout"

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
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    )
}
