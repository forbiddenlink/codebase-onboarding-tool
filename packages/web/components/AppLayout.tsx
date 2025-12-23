'use client'

import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'

interface AppLayoutProps {
  children: React.ReactNode
}

// Animation variants for smooth page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1], // Smooth easing curve
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <Breadcrumbs />
          {children}
        </motion.div>
      </main>
    </div>
  )
}
