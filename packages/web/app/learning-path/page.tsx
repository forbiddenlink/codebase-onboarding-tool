'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const sampleSnippets: CodeSnippet[] = [
  {
    id: '1',
    title: 'Authentication Middleware',
    description: 'Learn how authentication is handled in the application',
    code: `export async function authMiddleware(req: Request) {
  const token = req.headers.get('Authorization')
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const user = await verifyToken(token)
  return { user }
}`,
    language: 'typescript',
    difficulty: 'intermediate'
  },
  {
    id: '2',
    title: 'Database Connection',
    description: 'Understand how the app connects to the database using Prisma',
    code: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUser(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  })
}`,
    language: 'typescript',
    difficulty: 'beginner'
  },
  {
    id: '3',
    title: 'API Error Handling',
    description: 'See how errors are handled consistently across all API routes',
    code: `export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      message: error.message
    }
  }

  console.error('Unexpected error:', error)
  return {
    status: 500,
    message: 'Internal server error'
  }
}`,
    language: 'typescript',
    difficulty: 'intermediate'
  }
]

export default function LearningPathPage() {
  const [completedSnippets, setCompletedSnippets] = useState<Set<string>>(new Set())
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null)

  const toggleSnippet = (id: string) => {
    setExpandedSnippet(expandedSnippet === id ? null : id)
  }

  const markComplete = (id: string) => {
    setCompletedSnippets(prev => new Set([...prev, id]))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const progress = (completedSnippets.size / sampleSnippets.length) * 100

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Learning Path
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Follow this personalized curriculum to understand the codebase
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 p-6 border border-border rounded-lg bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedSnippets.size} of {sampleSnippets.length} modules completed
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {progress === 100 ? '🎉 Congratulations! You\'ve completed the learning path!' : 'Keep going! You\'re making great progress.'}
        </p>
      </div>

      {/* Code snippets in cards */}
      <div className="space-y-4">
        {sampleSnippets.map((snippet, index) => {
          const isCompleted = completedSnippets.has(snippet.id)
          const isExpanded = expandedSnippet === snippet.id

          return (
            <div
              key={snippet.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                isCompleted
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-border bg-white dark:bg-gray-900'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{snippet.title}</h3>
                      <p className="text-sm text-muted-foreground">{snippet.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(snippet.difficulty)}`}>
                    {snippet.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => toggleSnippet(snippet.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
                >
                  {isExpanded ? '▼ Hide Code' : '▶ Show Code'}
                </button>

                {isExpanded && (
                  <div className="mb-4">
                    {/* Code card with syntax highlighting */}
                    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {snippet.language}
                        </span>
                        <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition">
                          Copy
                        </button>
                      </div>
                      <pre className="text-sm font-mono overflow-x-auto">
                        <code className="text-gray-800 dark:text-gray-200">{snippet.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!isCompleted && (
                    <button
                      onClick={() => markComplete(snippet.id)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-semibold"
                    >
                      Mark as Complete
                    </button>
                  )}
                  <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition text-sm">
                    View in Context
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion message */}
      {progress === 100 && (
        <div className="mt-8 p-6 border-2 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold mb-2">Learning Path Complete!</h3>
          <p className="text-muted-foreground mb-4">
            Great job! You&apos;ve reviewed all the key modules in the codebase.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition">
            Explore Advanced Topics →
          </button>
        </div>
      )}
    </AppLayout>
  )
}
