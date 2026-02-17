import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CodeCompass - AI-Powered Codebase Onboarding',
    template: '%s | CodeCompass',
  },
  description: 'Make joining new codebases 10x faster with AI-powered analysis, interactive diagrams, and personalized learning paths.',
  manifest: '/manifest.json',
  keywords: ['codebase onboarding', 'AI code analysis', 'developer tools', 'code documentation', 'learning paths', 'code navigation'],
  authors: [{ name: 'CodeCompass Team' }],
  creator: 'CodeCompass',
  publisher: 'CodeCompass',
  metadataBase: new URL('https://codebase-onboarding-tool.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://codebase-onboarding-tool.vercel.app',
    title: 'CodeCompass - AI-Powered Codebase Onboarding',
    description: 'Make joining new codebases 10x faster with AI-powered analysis, interactive diagrams, and personalized learning paths.',
    siteName: 'CodeCompass',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeCompass - AI-Powered Codebase Onboarding',
    description: 'Make joining new codebases 10x faster with AI-powered analysis, interactive diagrams, and personalized learning paths.',
    creator: '@codecompass',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#f56565', // Coral primary color
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CodeCompass" />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
