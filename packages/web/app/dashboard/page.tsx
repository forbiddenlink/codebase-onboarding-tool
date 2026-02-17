'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { requireAuth } from '@/lib/auth'
import { AISparkleIcon, CodeIcon, DashboardIcon, DiagramIcon, RefreshIcon, RepositoryIcon, RocketIcon } from '@/components/icons/CustomIcons'
import { SkeletonDashboard } from '@/components/SkeletonLoader'

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
  const router = useRouter()
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
    // Check authentication - redirect to login if not authenticated
    const user = requireAuth(router)
    if (!user) {
      return // Will redirect to login
    }

    // In a real implementation, fetch repositories from API
    setLoading(false)
  }, [router])

  return (
    <AppLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-sunset shadow-lg">
              <DashboardIcon className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-sunset bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Explore your analyzed repositories and insights
              </p>
            </div>
          </div>
        </div>

        {/* Review Suggestions */}
        {reviewSuggestions.length > 0 && (
          <div className="mb-8 p-6 border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-secondary/20 rounded-xl">
                <RefreshIcon className="text-secondary" size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Time to Re-Review</h2>
                <p className="text-muted-foreground">
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
                    className={`p-5 border-l-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${priorityColors[suggestion.priority]}`}
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
                        className="px-5 py-2.5 gradient-coral-amber text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-bold"
                      >
                        Review Now
                      </a>
                      <button className="px-5 py-2.5 border-2 border-accent text-accent rounded-lg hover:bg-accent hover:text-white transition-all duration-200 text-sm font-semibold">
                        View Changes
                      </button>
                      <button className="px-5 py-2.5 border border-border rounded-lg hover:bg-muted transition-all duration-200 text-sm">
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
            className="group p-8 border-2 border-border rounded-2xl hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer bg-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="inline-block p-3 bg-primary/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <AISparkleIcon className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Chat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ask questions about your codebase
              </p>
            </div>
          </a>
          <a
            href="/viewer"
            className="group p-8 border-2 border-border rounded-2xl hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer bg-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent opacity-5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="inline-block p-3 bg-accent/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <CodeIcon className="text-accent" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Code Viewer</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse and explore your code
              </p>
            </div>
          </a>
          <a
            href="/diagrams"
            className="group p-8 border-2 border-border rounded-2xl hover:border-secondary hover:shadow-xl transition-all duration-300 cursor-pointer bg-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary opacity-5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="inline-block p-3 bg-secondary/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <DiagramIcon className="text-secondary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Diagrams</h3>
              <p className="text-muted-foreground leading-relaxed">
                View architecture visualizations
              </p>
            </div>
          </a>
        </div>

        {loading ? (
          <SkeletonDashboard />
        ) : repositories.length === 0 ? (
          <div className="text-center py-20 border-2 border-border rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent opacity-5 rounded-full translate-y-32 -translate-x-32"></div>
            <div className="relative">
              <div className="inline-block p-6 bg-gradient-sunset rounded-3xl mb-6 shadow-xl">
                <RepositoryIcon className="text-white" size={64} />
              </div>
              <h3 className="text-3xl font-bold mb-4">No repositories analyzed yet</h3>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto text-lg">
                Get started by analyzing a repository to unlock AI-powered insights,
                interactive diagrams, and personalized learning paths.
              </p>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                It only takes a few minutes to analyze a typical codebase!
              </p>
              <a
                href="/setup"
                className="inline-flex items-center gap-3 px-8 py-4 gradient-sunset text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <RocketIcon size={24} />
                Analyze Your First Repository
              </a>
            </div>
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
