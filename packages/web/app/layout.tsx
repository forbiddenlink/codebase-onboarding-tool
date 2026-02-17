import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeCompass - AI-Powered Codebase Onboarding',
  description: 'Make joining new codebases 10x faster with AI-powered analysis, interactive diagrams, and personalized learning paths.',
  manifest: '/manifest.json',
  themeColor: '#f56565', // Coral primary color
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CodeCompass',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
