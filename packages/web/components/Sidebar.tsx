'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface SidebarLink {
  name: string
  href: string
  icon: string
}

const links: SidebarLink[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Chat', href: '/chat', icon: '💬' },
  { name: 'Diagrams', href: '/diagrams', icon: '📈' },
  { name: 'Learning Path', href: '/learning-path', icon: '🎯' },
  { name: "What's New", href: '/whats-new', icon: '🎉' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CodeCompass
          </h1>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>CodeCompass v0.1.0</p>
          <p className="mt-1">AI-Powered Onboarding</p>
        </div>
      </div>
    </aside>
  )
}
