/**
 * API Client with network error handling and retry logic
 */

export interface ApiError {
  message: string;
  status?: number;
  retry?: <T = unknown>() => Promise<T>;
}

export interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Enhanced fetch with automatic retry and error handling
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText
        }));

        throw {
          message: errorData.message || `HTTP Error: ${response.status}`,
          status: response.status,
          retry: attempt < retries ? () => apiFetch(url, options) : undefined
        } as ApiError;
      }

      // Parse JSON response
      const data = await response.json();
      return data as T;

    } catch (error: unknown) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      const apiError = error as ApiError;
      if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === retries) {
        // Enhance error with retry function
        if (error instanceof Error) {
          throw {
            message: error.message || 'Network request failed',
            retry: () => apiFetch(url, options)
          } as ApiError;
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Request failed after retries');
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const err = error as Error & { message?: string };
  return (
    error instanceof TypeError ||
    err.message?.includes('fetch') ||
    err.message?.includes('network') ||
    err.message?.includes('Failed to fetch')
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const err = error as ApiError & { message?: string; status?: number };
  if (isNetworkError(err)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (err?.status === 404) {
    return 'The requested resource was not found.';
  }

  if (err?.status === 401 || err?.status === 403) {
    return 'You do not have permission to access this resource.';
  }

  if (err?.status && err.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  return err?.message || 'An unexpected error occurred. Please try again.';
}
