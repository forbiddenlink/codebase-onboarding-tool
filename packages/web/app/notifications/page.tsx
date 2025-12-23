'use client'

import { useCallback, useEffect, useState } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  metadata?: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterUnread, setFilterUnread] = useState(false)

  // Mock user ID - in production, get from session
  const userId = '5dfa9cdf-db81-45b3-9b08-092b8efa0917'

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/notifications?userId=${userId}${filterUnread ? '&unreadOnly=true' : ''}`
      const response = await fetch(url)
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, filterUnread])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      })
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true, userId }),
      })
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const checkForChanges = async () => {
    setLoading(true)
    try {
      // Simulate checking for changes with a mock repository ID
      const response = await fetch('/api/notifications/check-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          repositoryId: 'demo-repo-id',
        }),
      })
      const data = await response.json()
      alert(`Checked for changes! Created ${data.notificationsCreated} new notifications.`)
      // Refresh notifications list
      await fetchNotifications()
    } catch (error) {
      console.error('Error checking for changes:', error)
      alert('Failed to check for changes')
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'learned_area_changed':
        return '🔄'
      case 'breaking_change':
        return '⚠️'
      case 'module_updated':
        return '✨'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'learned_area_changed':
        return 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20'
      case 'breaking_change':
        return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
      case 'module_updated':
        return 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated on changes to areas you&apos;ve learned
          </p>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`px-4 py-2 rounded-lg transition ${
                filterUnread
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {filterUnread ? `Unread (${unreadCount})` : 'All Notifications'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Mark all as read
              </button>
            )}
          </div>
          <button
            onClick={checkForChanges}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            🔍 Check for Changes
          </button>
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 border border-border rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="text-7xl mb-6">🔔</div>
            <h3 className="text-2xl font-semibold mb-3">No notifications yet</h3>
            <p className="text-muted-foreground mb-2 max-w-md mx-auto">
              You&apos;ll receive notifications when there are significant changes to code areas you&apos;ve learned.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click &quot;Check for Changes&quot; to simulate detecting changes in your learned modules.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-6 border rounded-lg transition ${
                  notification.read ? 'opacity-60' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <h3 className="text-lg font-semibold">{notification.title}</h3>
                      {!notification.read && (
                        <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-4 text-sm text-primary hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
