'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { logout, getUser } from '@/lib/auth'
import { 
  DashboardIcon, 
  SearchIcon, 
  ChatIcon, 
  DiagramIcon, 
  LearningPathIcon, 
  WhatsNewIcon, 
  SettingsIcon,
  LogoutIcon,
  AISparkleIcon
} from '@/components/icons/CustomIcons'
import CommandPalette from './CommandPalette'

interface SidebarLink {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string; size?: number }>
}

const links: SidebarLink[] = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Search', href: '/search', icon: SearchIcon },
  { name: 'Chat', href: '/chat', icon: ChatIcon },
  { name: 'Diagrams', href: '/diagrams', icon: DiagramIcon },
  { name: 'Learning Path', href: '/learning-path', icon: LearningPathIcon },
  { name: "What's New", href: '/whats-new', icon: WhatsNewIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)

  // Get user on client side only (after mount)
  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
  }, [])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className={`block h-0.5 bg-gray-700 dark:bg-gray-300 transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block h-0.5 bg-gray-700 dark:bg-gray-300 transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block h-0.5 bg-gray-700 dark:bg-gray-300 transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </div>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen fixed left-0 top-0 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded inline-block mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-sunset">
                <AISparkleIcon className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold gradient-sunset bg-clip-text text-transparent">
                CodeCompass
              </h1>
            </div>
          </Link>
          
          {/* Command Palette Button */}
          <div className="mt-4">
            <CommandPalette />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary dark:text-primary font-semibold shadow-sm border border-primary/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-muted hover:translate-x-1'
                }`}
              >
                <Icon className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} size={20} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {/* User Info & Logout */}
          {user && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium truncate">{user.name}</p>
                <p className="truncate text-gray-500 dark:text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                  router.push('/login')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:translate-x-1"
                aria-label="Log out"
              >
                <LogoutIcon size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* App Version */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>CodeCompass v0.1.0</p>
            <p className="mt-1">AI-Powered Onboarding</p>
          </div>
        </div>
      </aside>
    </>
  )
}
