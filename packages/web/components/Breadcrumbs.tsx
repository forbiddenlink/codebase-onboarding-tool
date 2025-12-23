'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Breadcrumbs() {
  const pathname = usePathname()

  if (!pathname || pathname === '/') {
    return null
  }

  // Split path into segments and build breadcrumb trail
  const segments = pathname.split('/').filter(Boolean)

  // Map segments to readable names
  const segmentNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'chat': 'AI Chat',
    'diagrams': 'Architecture Diagrams',
    'learning-path': 'Learning Path',
    'settings': 'Settings',
    'viewer': 'Code Viewer',
    'setup': 'Repository Setup',
    'notifications': 'Notifications',
    'whats-new': "What's New",
  }

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const name = segmentNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    return { name, path }
  })

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link
        href="/dashboard"
        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Home
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-gray-600">/</span>
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {crumb.name}
            </span>
          ) : (
            <Link
              href={crumb.path}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
