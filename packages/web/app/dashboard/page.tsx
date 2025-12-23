'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'

interface Repository {
  id: string
  name: string
  path: string
  fileCount?: number
}

interface ReviewSuggestion {
  id: string
  moduleName: string
  filePath: string
  lastReviewed: Date
  changesSince: number
  reason: string
  priority: 'high' | 'medium' | 'low'
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [repositories] = useState<Repository[]>([])
  const [reviewSuggestions] = useState<ReviewSuggestion[]>([
    {
      id: '1',
      moduleName: 'Authentication System',
      filePath: 'packages/web/app/api/auth/login/route.ts',
      lastReviewed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      changesSince: 8,
      reason: 'Significant changes detected: 8 commits affecting authentication logic',
      priority: 'high'
    },
    {
      id: '2',
      moduleName: 'Database Schema',
      filePath: 'packages/web/prisma/schema.prisma',
      lastReviewed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      changesSince: 3,
      reason: 'Schema updated with new Notification model',
      priority: 'medium'
    },
    {
      id: '3',
      moduleName: 'Code Viewer',
      filePath: 'packages/web/app/viewer/page.tsx',
      lastReviewed: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      changesSince: 12,
      reason: 'Major refactoring: annotation system enhanced with versioning',
      priority: 'high'
    }
  ])

  useEffect(() => {
    // In a real implementation, fetch repositories from API
    setLoading(false)
  }, [])

  return (
    <AppLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Explore your analyzed repositories
          </p>
        </div>

        {/* Review Suggestions */}
        {reviewSuggestions.length > 0 && (
          <div className="mb-8 p-6 border-2 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">🔄</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Time to Re-Review</h2>
                <p className="text-sm text-muted-foreground">
                  These modules have changed significantly since you last reviewed them
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {reviewSuggestions.map((suggestion) => {
                const priorityColors = {
                  high: 'border-red-500 bg-red-50 dark:bg-red-950/20',
                  medium: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                  low: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                }
                const priorityBadges = {
                  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                  low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }

                return (
                  <div
                    key={suggestion.id}
                    className={`p-4 border-l-4 rounded ${priorityColors[suggestion.priority]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{suggestion.moduleName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadges[suggestion.priority]}`}>
                            {suggestion.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mb-2">
                          {suggestion.filePath}
                        </p>
                        <p className="text-sm mb-2">{suggestion.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Last reviewed: {Math.floor((Date.now() - suggestion.lastReviewed.getTime()) / (24 * 60 * 60 * 1000))} days ago
                          </span>
                          <span>
                            {suggestion.changesSince} commits since
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`/viewer?file=${encodeURIComponent(suggestion.filePath)}`}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-semibold"
                      >
                        Review Now
                      </a>
                      <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition text-sm">
                        View Changes
                      </button>
                      <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition text-sm">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/chat"
            className="p-6 border border-border rounded-lg hover:border-primary transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">🤖 AI Chat</h3>
            <p className="text-muted-foreground">
              Ask questions about your codebase
            </p>
          </a>
          <a
            href="/viewer"
            className="p-6 border border-border rounded-lg hover:border-primary transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">📁 Code Viewer</h3>
            <p className="text-muted-foreground">
              Browse and explore your code
            </p>
          </a>
          <a
            href="/diagrams"
            className="p-6 border border-border rounded-lg hover:border-primary transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">📊 Diagrams</h3>
            <p className="text-muted-foreground">
              View architecture visualizations
            </p>
          </a>
        </div>

        {loading ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Your Repositories</h2>
            {/* Skeleton loaders */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border border-border rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-semibold mb-3">No repositories analyzed yet</h3>
            <p className="text-muted-foreground mb-2 max-w-md mx-auto">
              Get started by analyzing a repository to unlock AI-powered insights,
              interactive diagrams, and personalized learning paths.
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              It only takes a few minutes to analyze a typical codebase!
            </p>
            <a
              href="/setup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition shadow-lg"
            >
              🚀 Analyze Your First Repository
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Your Repositories</h2>
            {repositories.map((repo) => (
              <div key={repo.id} className="p-6 border border-border rounded-lg">
                <h3 className="text-xl font-semibold mb-1">{repo.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{repo.path}</p>
                {repo.fileCount && (
                  <p className="text-sm text-muted-foreground">
                    {repo.fileCount} files analyzed
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
