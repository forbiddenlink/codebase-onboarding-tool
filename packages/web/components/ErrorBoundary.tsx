'use client'

import { Component, ReactNode, useState } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo)

    // Update state with error details
    this.setState({
      error,
      errorInfo
    })

    // In a real app, you would send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
    if (typeof window !== 'undefined') {
      // Log to a hypothetical error tracking service
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h2 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                  Error Details
                </h2>
                <p className="text-sm text-red-800 dark:text-red-400 font-mono">
                  {this.state.error.message}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs text-red-700 dark:text-red-500 cursor-pointer hover:underline">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 dark:text-red-500 overflow-x-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                aria-label="Go to homepage"
              >
                Go to Homepage
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If this problem persists, please contact support or{' '}
                <a
                  href="https://github.com/yourusername/codecompass/issues"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  report an issue on GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Helper component to test error boundary
export function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('Test error from ErrorTrigger component')
  }

  return (
    <button
      onClick={() => setShouldError(true)}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Trigger Error (for testing)
    </button>
  )
}
