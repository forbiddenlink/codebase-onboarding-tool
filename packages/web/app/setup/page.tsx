'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [localPath, setLocalPath] = useState('')
  const [gitUrl, setGitUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAnalyzeLocal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!localPath.trim()) {
      setError('Please enter a valid repository path')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/repository/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: localPath, type: 'local' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze repository')
      }

      // Navigate to dashboard after successful analysis
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repository')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCloneAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!gitUrl.trim()) {
      setError('Please enter a valid git URL')
      return
    }

    setIsCloning(true)

    try {
      const response = await fetch('/api/repository/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: gitUrl, type: 'remote' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clone repository')
      }

      // Navigate to dashboard after successful cloning
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone repository')
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Repository Setup
          </h1>
          <p className="text-muted-foreground">
            Provide a local repository path or a git URL to get started
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Local Repository Path Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Local Repository</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Analyze a repository that&apos;s already on your machine
          </p>
          <form onSubmit={handleAnalyzeLocal} className="space-y-4">
            <div>
              <label htmlFor="localPath" className="block text-sm font-medium mb-2">
                Repository Path
              </label>
              <input
                id="localPath"
                type="text"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="/path/to/your/repository"
                className="w-full px-4 py-2 border border-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background"
                disabled={isAnalyzing}
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {isAnalyzing && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isAnalyzing ? 'Analyzing Repository...' : 'Analyze Repository'}
            </button>
          </form>
        </div>

        {/* Git URL Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Clone from Git</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Clone and analyze a repository from a git URL
          </p>
          <form onSubmit={handleCloneAndAnalyze} className="space-y-4">
            <div>
              <label htmlFor="gitUrl" className="block text-sm font-medium mb-2">
                Git URL
              </label>
              <input
                id="gitUrl"
                type="text"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="https://github.com/username/repo.git"
                className="w-full px-4 py-2 border border-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background"
                disabled={isCloning}
              />
            </div>
            <button
              type="submit"
              disabled={isCloning}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {isCloning && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isCloning ? 'Cloning & Analyzing...' : 'Clone & Analyze'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
