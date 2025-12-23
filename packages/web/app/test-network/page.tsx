'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { apiFetch, getErrorMessage, ApiError } from '@/lib/api-client';

export default function TestNetworkPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState(false);

  const testNetworkError = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Try to fetch from a non-existent endpoint
      await apiFetch('/api/nonexistent-endpoint');
      setSuccess(true);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const testServerError = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate server error by calling an endpoint that will fail
      await apiFetch('/api/test-error');
      setSuccess(true);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (error?.retry) {
      setLoading(true);
      setError(null);
      error.retry()
        .then(() => setSuccess(true))
        .catch((err: any) => setError(err))
        .finally(() => setLoading(false));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Network Error Handling Test
        </h1>
        <p className="text-muted-foreground mb-8">
          Test the application's graceful network error handling with automatic retries
        </p>

        <div className="space-y-6">
          {/* Test Buttons */}
          <div className="flex gap-4">
            <button
              onClick={testNetworkError}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Testing...' : 'Test 404 Error'}
            </button>

            <button
              onClick={testServerError}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Testing...' : 'Test Server Error'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-6 border-2 border-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                    Network Error Occurred
                  </h2>
                  <p className="text-red-600 dark:text-red-300 mb-4">
                    {getErrorMessage(error)}
                  </p>
                  {error.status && (
                    <p className="text-sm text-red-500 dark:text-red-400 mb-2">
                      Status Code: {error.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Retry Button */}
              {error.retry && (
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Retrying...' : '🔄 Retry Request'}
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-6 border-2 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                    Request Successful!
                  </h2>
                  <p className="text-green-600 dark:text-green-300">
                    The network request completed successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Description */}
          <div className="p-6 border border-border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h3 className="text-lg font-semibold mb-3">Network Error Handling Features:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>Automatic Retries:</strong> Failed requests are automatically retried up to 3 times with exponential backoff</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>User-Friendly Messages:</strong> Technical errors are translated to clear, actionable messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>Manual Retry:</strong> Users can manually retry failed requests with a single click</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>Error Classification:</strong> Different error types (4xx, 5xx, network) are handled appropriately</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span><strong>Loading States:</strong> Clear visual feedback during network operations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
