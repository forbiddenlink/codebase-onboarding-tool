'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

interface Change {
  id: string
  date: Date
  type: 'feature' | 'bugfix' | 'refactor' | 'breaking'
  title: string
  description: string
  files: string[]
  author: string
  impact: 'high' | 'medium' | 'low'
}

export default function WhatsNewPage() {
  const [joinDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 30 days ago
  const [changes] = useState<Change[]>([
    {
      id: '1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'feature',
      title: 'Notification System Added',
      description: 'A comprehensive notification system has been implemented to alert users when modules they\'ve learned change significantly. Includes webhook integration and real-time change detection.',
      files: [
        'packages/web/app/api/notifications/route.ts',
        'packages/web/app/notifications/page.tsx',
        'packages/web/prisma/schema.prisma'
      ],
      author: 'Development Team',
      impact: 'high'
    },
    {
      id: '2',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: 'feature',
      title: 'User Authentication System',
      description: 'Complete authentication flow with login and registration. Includes password hashing with bcrypt, email validation, and secure session management.',
      files: [
        'packages/web/app/api/auth/login/route.ts',
        'packages/web/app/api/auth/register/route.ts',
        'packages/web/app/login/page.tsx',
        'packages/web/app/register/page.tsx'
      ],
      author: 'Security Team',
      impact: 'high'
    },
    {
      id: '3',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      type: 'refactor',
      title: 'Settings Sync Across Interfaces',
      description: 'Settings now sync automatically across web dashboard, CLI, and VS Code extension using a shared settings file (~/.codecompass/settings.json).',
      files: [
        'packages/web/app/api/settings/route.ts',
        'packages/cli/src/index.ts',
        'packages/vscode-extension/src/extension.ts'
      ],
      author: 'Platform Team',
      impact: 'medium'
    },
    {
      id: '4',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      type: 'feature',
      title: 'VS Code Extension Enhancements',
      description: 'Added inline annotations, hover tooltips, and sidebar overview. Performance optimized with caching and debouncing.',
      files: [
        'packages/vscode-extension/src/extension.ts',
        'packages/vscode-extension/package.json'
      ],
      author: 'Editor Team',
      impact: 'high'
    },
    {
      id: '5',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      type: 'bugfix',
      title: 'Fixed Syntax Highlighting Tokenization',
      description: 'Resolved issue where numbers in CSS class names were being wrapped in syntax highlighting spans, causing broken HTML.',
      files: [
        'packages/web/app/viewer/page.tsx'
      ],
      author: 'UI Team',
      impact: 'low'
    },
    {
      id: '6',
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      type: 'feature',
      title: 'CLI Interactive Mode',
      description: 'Added interactive mode with arrow key navigation, input validation, and multiple operation support.',
      files: [
        'packages/cli/src/index.ts'
      ],
      author: 'CLI Team',
      impact: 'medium'
    },
    {
      id: '7',
      date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      type: 'feature',
      title: 'Repository Analysis Engine',
      description: 'Built comprehensive file scanning with language detection, LOC counting, complexity calculation, and knowledge graph creation.',
      files: [
        'packages/web/app/api/repository/analyze/route.ts',
        'packages/analyzer/src/analyzer.ts'
      ],
      author: 'Analysis Team',
      impact: 'high'
    }
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '✨'
      case 'bugfix': return '🐛'
      case 'refactor': return '♻️'
      case 'breaking': return '⚠️'
      default: return '📝'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'bugfix': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'refactor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'breaking': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-orange-600 dark:text-orange-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const changesSinceJoin = changes.filter(c => c.date >= joinDate)

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          What's New
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stay up to date with changes to the codebase since you joined
        </p>
      </div>

      {/* Summary card */}
      <div className="mb-8 p-6 border border-border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎉</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-muted-foreground mb-3">
              You joined {Math.floor((Date.now() - joinDate.getTime()) / (24 * 60 * 60 * 1000))} days ago.
              Since then, there have been {changesSinceJoin.length} significant changes to the codebase.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {changesSinceJoin.filter(c => c.type === 'feature').length}
                </div>
                <div className="text-xs text-muted-foreground">New Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {changesSinceJoin.filter(c => c.type === 'bugfix').length}
                </div>
                <div className="text-xs text-muted-foreground">Bug Fixes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {changesSinceJoin.filter(c => c.type === 'refactor').length}
                </div>
                <div className="text-xs text-muted-foreground">Refactors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {changesSinceJoin.filter(c => c.impact === 'high').length}
                </div>
                <div className="text-xs text-muted-foreground">High Impact</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline of changes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Recent Changes</h2>
        {changesSinceJoin.map((change, index) => {
          const daysAgo = Math.floor((Date.now() - change.date.getTime()) / (24 * 60 * 60 * 1000))

          return (
            <div
              key={change.id}
              className="border border-border rounded-lg p-6 bg-white dark:bg-gray-900 hover:border-primary transition"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getTypeIcon(change.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{change.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(change.type)}`}>
                          {change.type}
                        </span>
                        <span className={`text-xs font-semibold ${getImpactColor(change.impact)}`}>
                          {change.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`} · by {change.author}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{change.description}</p>
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-muted-foreground mb-2">
                      Files changed ({change.files.length}):
                    </div>
                    <div className="space-y-1">
                      {change.files.map((file, i) => (
                        <div key={i} className="text-xs font-mono text-muted-foreground bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded">
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90 transition">
                      View Diff
                    </button>
                    <button className="px-3 py-1.5 border border-border rounded text-xs hover:bg-accent transition">
                      View Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {changesSinceJoin.length === 0 && (
        <div className="text-center py-16 border border-border rounded-lg">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">
            No changes since you joined. Check back later for updates.
          </p>
        </div>
      )}
    </AppLayout>
  )
}
