'use client';

import { useEffect, useState } from 'react';
import { getNetworkStatus } from '@/lib/service-worker';

/**
 * Offline Indicator Component
 *
 * Shows a banner when the user goes offline
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Initial status
    setIsOnline(navigator.onLine);

    // Setup listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);

      // Hide "back online" banner after 3 seconds
      setTimeout(() => {
        setShowBanner(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`py-3 px-4 text-center text-sm font-medium ${
          isOnline
            ? 'bg-green-600 text-white'
            : 'bg-yellow-500 text-gray-900'
        }`}
      >
        {isOnline ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">✓</span>
            <span>Back online - All features available</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">📡</span>
            <span>You&apos;re offline - Cached data still available</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Network Status Badge
 *
 * Shows current network status and speed
 */
export function NetworkStatusBadge() {
  const [status, setStatus] = useState(getNetworkStatus());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getNetworkStatus());
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  if (!status.online) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm"
        title="You are currently offline"
      >
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
        <span>Offline</span>
      </div>
    );
  }

  const connectionSpeed = status.effectiveType;
  const speedColor =
    connectionSpeed === '4g' ? 'green' :
    connectionSpeed === '3g' ? 'yellow' :
    'red';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 bg-${speedColor}-100 dark:bg-${speedColor}-900/20 text-${speedColor}-800 dark:text-${speedColor}-300 rounded-full text-sm`}
      title={`Network: ${connectionSpeed || 'unknown'}`}
    >
      <span className={`w-2 h-2 bg-${speedColor}-500 rounded-full`}></span>
      <span>Online{connectionSpeed ? ` (${connectionSpeed})` : ''}</span>
    </div>
  );
}

/**
 * Service Worker Update Banner
 *
 * Shows a banner when a service worker update is available
 */
export function ServiceWorkerUpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShowUpdate(true);
    };

    window.addEventListener('sw-update-available', handleUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  if (!showUpdate) {
    return null;
  }

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-md bg-blue-600 text-white rounded-lg shadow-lg p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">🔄</div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Update Available</h3>
          <p className="text-sm text-blue-100 mb-3">
            A new version of CodeCompass is available.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-white text-blue-600 rounded font-medium text-sm hover:bg-blue-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-blue-700 text-white rounded font-medium text-sm hover:bg-blue-800 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
