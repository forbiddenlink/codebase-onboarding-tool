'use client'

import { useEffect, useState } from 'react'

interface Repository {
  id: string
  name: string
  path: string
  fileCount?: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [repositories] = useState<Repository[]>([])

  useEffect(() => {
    // In a real implementation, fetch repositories from API
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Explore your analyzed repositories
          </p>
        </div>

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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading repositories...</p>
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">No repositories analyzed yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by analyzing a repository
            </p>
            <a
              href="/setup"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              Analyze Repository
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
    </div>
  )
}
