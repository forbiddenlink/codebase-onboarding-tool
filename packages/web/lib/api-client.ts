/**
 * API Client with network error handling and retry logic
 */

export interface ApiError {
  message: string;
  status?: number;
  retry?: () => Promise<any>;
}

export interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Enhanced fetch with automatic retry and error handling
 */
export async function apiFetch<T = any>(
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

    } catch (error: any) {
      lastError = error;

      // Don't retry on 4xx errors (client errors)
      if (error.status && error.status >= 400 && error.status < 500) {
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
export function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError ||
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.message?.includes('Failed to fetch')
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (error?.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error?.status === 401 || error?.status === 403) {
    return 'You do not have permission to access this resource.';
  }

  if (error?.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  return error?.message || 'An unexpected error occurred. Please try again.';
}
