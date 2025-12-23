'use client'

import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  )
}
