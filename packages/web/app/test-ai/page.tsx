'use client'

import { useState } from 'react'

export default function TestAIPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const testCodeAnalysis = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
          language: 'javascript',
          type: 'analyze',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(JSON.stringify(data, null, 2))
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Test Claude API Integration
        </h1>

        <div className="space-y-4">
          <button
            onClick={testCodeAnalysis}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Test Code Analysis'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-semibold">Error:</p>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">Result:</p>
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
