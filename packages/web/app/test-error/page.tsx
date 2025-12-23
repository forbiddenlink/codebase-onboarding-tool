'use client'

import { ErrorTrigger } from '@/components/ErrorBoundary'
import AppLayout from '@/components/AppLayout'

export default function TestErrorPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Error Boundary Test
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Click the button below to trigger an error and test the error boundary.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Test Error Boundary
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This button will throw an error that should be caught by the error boundary.
            The error boundary should display a fallback UI instead of crashing the app.
          </p>
          <ErrorTrigger />
        </div>

        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Expected Behavior
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>Click the "Trigger Error" button</li>
            <li>Error boundary should catch the error</li>
            <li>Fallback UI should be displayed</li>
            <li>Error details should be logged to console</li>
            <li>App should not crash completely</li>
            <li>User should see "Try Again" and "Go to Homepage" buttons</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}
