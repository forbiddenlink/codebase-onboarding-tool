'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show content immediately if not mounted (SSR) or if animations fail
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeCompass
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              AI-Powered Codebase Onboarding Platform
            </p>
            <p className="text-lg mb-8">
              Make joining new codebases 10x faster
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/setup"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
                aria-label="Get started with repository setup"
              >
                Get Started
              </a>
              <button
                className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition"
                aria-label="Learn more about CodeCompass features"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div
            className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow"
            role="article"
            aria-label="AI Chat feature"
          >
            <h3 className="text-xl font-semibold mb-2">🤖 AI Chat</h3>
            <p className="text-muted-foreground">
              Ask questions about your codebase in natural language
            </p>
          </div>
          <div
            className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow"
            role="article"
            aria-label="Architecture Diagrams feature"
          >
            <h3 className="text-xl font-semibold mb-2">📊 Architecture Diagrams</h3>
            <p className="text-muted-foreground">
              Interactive visualizations of your code structure
            </p>
          </div>
          <div
            className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow"
            role="article"
            aria-label="Learning Paths feature"
          >
            <h3 className="text-xl font-semibold mb-2">🎯 Learning Paths</h3>
            <p className="text-muted-foreground">
              Personalized onboarding based on your role
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Environment setup complete. Start building! 🚀</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <motion.div
        className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="text-center">
          <motion.h1
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            CodeCompass
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground mb-8"
            variants={itemVariants}
          >
            AI-Powered Codebase Onboarding Platform
          </motion.p>
          <motion.p className="text-lg mb-8" variants={itemVariants}>
            Make joining new codebases 10x faster
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center"
            variants={itemVariants}
          >
            <motion.a
              href="/setup"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Get started with repository setup"
            >
              Get Started
            </motion.a>
            <motion.button
              className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Learn more about CodeCompass features"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow"
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          role="article"
          aria-label="AI Chat feature"
        >
          <h3 className="text-xl font-semibold mb-2">🤖 AI Chat</h3>
          <p className="text-muted-foreground">
            Ask questions about your codebase in natural language
          </p>
        </motion.div>
        <motion.div
          className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow"
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          role="article"
          aria-label="Architecture Diagrams feature"
        >
          <h3 className="text-xl font-semibold mb-2">📊 Architecture Diagrams</h3>
          <p className="text-muted-foreground">
            Interactive visualizations of your code structure
          </p>
        </motion.div>
        <motion.div
          className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow"
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          role="article"
          aria-label="Learning Paths feature"
        >
          <h3 className="text-xl font-semibold mb-2">🎯 Learning Paths</h3>
          <p className="text-muted-foreground">
            Personalized onboarding based on your role
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-8 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p>Environment setup complete. Start building! 🚀</p>
      </motion.div>
    </main>
  )
}
