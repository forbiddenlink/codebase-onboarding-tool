/**
 * Service Worker Registration and Management
 *
 * Handles registration, updates, and communication with the service worker.
 */

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration?: ServiceWorkerRegistration;
}

/**
 * Check if service workers are supported in this browser
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.log('[SW] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW] Update found, installing new version...');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New version available, ready to activate');
            // Notify user about update
            notifyUpdate();
          }
        });
      }
    });

    // Check for updates on page load
    registration.update();

    return registration;
  } catch (error) {
    console.error('[SW] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[SW] Service worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[SW] Service worker unregistration failed:', error);
    return false;
  }
}

/**
 * Get current service worker status
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
  const isSupported = isServiceWorkerSupported();
  const isOnline = navigator.onLine;

  if (!isSupported) {
    return {
      isSupported: false,
      isRegistered: false,
      isOnline,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      isSupported: true,
      isRegistered: !!registration,
      isOnline,
      registration: registration || undefined,
    };
  } catch (error) {
    console.error('[SW] Failed to get service worker status:', error);
    return {
      isSupported: true,
      isRegistered: false,
      isOnline,
    };
  }
}

/**
 * Send message to service worker
 */
export async function sendMessageToServiceWorker(message: unknown): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.active) {
    registration.active.postMessage(message);
  }
}

/**
 * Skip waiting and activate new service worker immediately
 */
export async function skipWaitingAndActivate(): Promise<void> {
  await sendMessageToServiceWorker({ type: 'SKIP_WAITING' });
  window.location.reload();
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  }
}

/**
 * Cache specific URLs for offline use
 */
export async function cacheUrls(urls: string[]): Promise<void> {
  await sendMessageToServiceWorker({
    type: 'CACHE_URLS',
    urls,
  });
}

/**
 * Notify user about service worker update
 */
function notifyUpdate(): void {
  // Check if user wants auto-update
  const autoUpdate = localStorage.getItem('sw-auto-update') === 'true';

  if (autoUpdate) {
    skipWaitingAndActivate();
  } else {
    // Show update notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CodeCompass Update Available', {
        body: 'A new version is available. Refresh to update.',
        icon: '/favicon.ico',
      });
    }

    // Dispatch custom event for UI notification
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }
}

/**
 * Setup online/offline event listeners
 */
export function setupOnlineOfflineListeners(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  const handleOnline = () => {
    console.log('[SW] Back online');
    if (onOnline) onOnline();
  };

  const handleOffline = () => {
    console.log('[SW] Gone offline');
    if (onOffline) onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Get network status
 */
export function getNetworkStatus(): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  // Type for Network Information API (not in standard types)
  interface NavigatorWithConnection extends Navigator {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
    mozConnection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
    webkitConnection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  }

  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

/**
 * Preload critical pages for offline use
 */
export async function preloadCriticalPages(): Promise<void> {
  const criticalPages = [
    '/dashboard',
    '/search',
    '/viewer',
    '/learning-path',
  ];

  await cacheUrls(criticalPages);
  console.log('[SW] Critical pages preloaded for offline use');
}

/**
 * Initialize service worker with default configuration
 */
export async function initializeServiceWorker(options?: {
  autoUpdate?: boolean;
  preloadPages?: boolean;
  onUpdate?: () => void;
  onOnline?: () => void;
  onOffline?: () => void;
}): Promise<ServiceWorkerRegistration | null> {
  const registration = await registerServiceWorker();

  if (registration) {
    // Setup auto-update
    if (options?.autoUpdate) {
      localStorage.setItem('sw-auto-update', 'true');
    }

    // Preload critical pages
    if (options?.preloadPages) {
      await preloadCriticalPages();
    }

    // Setup online/offline listeners
    if (options?.onOnline || options?.onOffline) {
      setupOnlineOfflineListeners(options.onOnline, options.onOffline);
    }

    // Setup update listener
    if (options?.onUpdate) {
      window.addEventListener('sw-update-available', options.onUpdate);
    }
  }

  return registration;
}
