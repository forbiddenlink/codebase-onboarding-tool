'use client'

import { useEffect } from 'react'
import { ToastProvider } from '@/components/ToastContainer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { QueryProvider } from '@/components/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import OfflineIndicator, { ServiceWorkerUpdateBanner } from '@/components/OfflineIndicator'
import { initializeServiceWorker } from '@/lib/service-worker'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize service worker for offline functionality
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      initializeServiceWorker({
        autoUpdate: false, // Let user decide when to update
        preloadPages: true, // Preload critical pages for offline use
        onOnline: () => {
          console.log('✓ Back online');
        },
        onOffline: () => {
          console.log('⚠ Offline mode activated');
        },
      }).then((registration) => {
        if (registration) {
          console.log('Service worker registered for offline support');
        }
      }).catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <OfflineIndicator />
            <ServiceWorkerUpdateBanner />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
