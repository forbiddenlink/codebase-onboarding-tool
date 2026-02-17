'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AISparkleIcon, DiagramIcon, LearningPathIcon } from '@/components/icons/CustomIcons'

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
            <div className="inline-block mb-6 p-4 rounded-2xl bg-gradient-sunset shadow-xl">
              <AISparkleIcon className="text-white" size={48} />
            </div>
            <h1 className="text-6xl font-bold mb-4 gradient-sunset bg-clip-text text-transparent">
              CodeCompass
            </h1>
            <p className="text-xl text-muted-foreground mb-8 font-medium">
              AI-Powered Codebase Onboarding Platform
            </p>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Make joining new codebases <span className="font-bold text-primary">10x faster</span> with intelligent analysis and personalized learning paths
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/setup"
                className="px-8 py-4 gradient-coral-amber text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-200 shadow-lg"
                aria-label="Get started with repository setup"
              >
                Get Started →
              </a>
              <button
                className="px-8 py-4 border-2 border-accent text-accent rounded-xl font-bold hover:bg-accent hover:text-white transition-all duration-200"
                aria-label="Learn more about CodeCompass features"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div
            className="group p-8 border-2 border-border rounded-2xl hover:border-primary hover:shadow-2xl transition-all duration-300 bg-card relative overflow-hidden"
            role="article"
            aria-label="AI Chat feature"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="inline-block p-3 bg-primary/10 rounded-xl mb-4">
                <AISparkleIcon className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Chat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ask questions about your codebase in natural language and get instant, context-aware answers
              </p>
            </div>
          </div>
          <div
            className="group p-8 border-2 border-border rounded-2xl hover:border-accent hover:shadow-2xl transition-all duration-300 bg-card relative overflow-hidden"
            role="article"
            aria-label="Architecture Diagrams feature"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="inline-block p-3 bg-accent/10 rounded-xl mb-4">
                <DiagramIcon className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Architecture Diagrams</h3>
              <p className="text-muted-foreground leading-relaxed">
                Interactive visualizations of your code structure with smart dependency mapping
              </p>
            </div>
          </div>
          <div
            className="group p-8 border-2 border-border rounded-2xl hover:border-secondary hover:shadow-2xl transition-all duration-300 bg-card relative overflow-hidden"
            role="article"
            aria-label="Learning Paths feature"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="inline-block p-3 bg-secondary/10 rounded-xl mb-4">
                <LearningPathIcon className="text-secondary" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Learning Paths</h3>
              <p className="text-muted-foreground leading-relaxed">
                Personalized onboarding journeys tailored to your role and experience level
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-muted rounded-full">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-foreground">Environment setup complete. Ready to explore!</p>
          </div>
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
          <motion.div 
            className="inline-block mb-6 p-4 rounded-2xl bg-gradient-sunset shadow-xl"
            variants={itemVariants}
            whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
          >
            <AISparkleIcon className="text-white" size={48} />
          </motion.div>
          <motion.h1
            className="text-6xl font-bold mb-4 gradient-sunset bg-clip-text text-transparent"
            variants={itemVariants}
          >
            CodeCompass
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground mb-8 font-medium"
            variants={itemVariants}
          >
            AI-Powered Codebase Onboarding Platform
          </motion.p>
          <motion.p className="text-lg mb-8 max-w-2xl mx-auto" variants={itemVariants}>
            Make joining new codebases <span className="font-bold text-primary">10x faster</span> with intelligent analysis and personalized learning paths
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center"
            variants={itemVariants}
          >
            <motion.a
              href="/setup"
              className="px-8 py-4 gradient-coral-amber text-white rounded-xl font-bold shadow-lg"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.95 }}
              aria-label="Get started with repository setup"
            >
              Get Started →
            </motion.a>
            <motion.button
              className="px-8 py-4 border-2 border-accent text-accent rounded-xl font-bold"
              whileHover={{ scale: 1.05, y: -2, backgroundColor: "hsl(180 65% 42%)", color: "#fff" }}
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
          className="group p-8 border-2 border-border rounded-2xl bg-card relative overflow-hidden"
          variants={cardVariants}
          whileHover={{ y: -8, borderColor: "hsl(11 85% 62%)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", transition: { duration: 0.3 } }}
          role="article"
          aria-label="AI Chat feature"
        >
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-full -translate-y-16 translate-x-16"
            whileHover={{ scale: 1.5, transition: { duration: 0.5 } }}
          ></motion.div>
          <div className="relative">
            <motion.div 
              className="inline-block p-3 bg-primary/10 rounded-xl mb-4"
              whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
            >
              <AISparkleIcon className="text-primary" size={32} />
            </motion.div>
            <h3 className="text-xl font-bold mb-3">AI Chat</h3>
            <p className="text-muted-foreground leading-relaxed">
              Ask questions about your codebase in natural language and get instant, context-aware answers
            </p>
          </div>
        </motion.div>
        <motion.div
          className="group p-8 border-2 border-border rounded-2xl bg-card relative overflow-hidden"
          variants={cardVariants}
          whileHover={{ y: -8, borderColor: "hsl(180 65% 42%)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", transition: { duration: 0.3 } }}
          role="article"
          aria-label="Architecture Diagrams feature"
        >
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-5 rounded-full -translate-y-16 translate-x-16"
            whileHover={{ scale: 1.5, transition: { duration: 0.5 } }}
          ></motion.div>
          <div className="relative">
            <motion.div 
              className="inline-block p-3 bg-accent/10 rounded-xl mb-4"
              whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
            >
              <DiagramIcon className="text-accent" size={32} />
            </motion.div>
            <h3 className="text-xl font-bold mb-3">Architecture Diagrams</h3>
            <p className="text-muted-foreground leading-relaxed">
              Interactive visualizations of your code structure with smart dependency mapping
            </p>
          </div>
        </motion.div>
        <motion.div
          className="group p-8 border-2 border-border rounded-2xl bg-card relative overflow-hidden"
          variants={cardVariants}
          whileHover={{ y: -8, borderColor: "hsl(38 92% 50%)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", transition: { duration: 0.3 } }}
          role="article"
          aria-label="Learning Paths feature"
        >
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-5 rounded-full -translate-y-16 translate-x-16"
            whileHover={{ scale: 1.5, transition: { duration: 0.5 } }}
          ></motion.div>
          <div className="relative">
            <motion.div 
              className="inline-block p-3 bg-secondary/10 rounded-xl mb-4"
              whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
            >
              <LearningPathIcon className="text-secondary" size={32} />
            </motion.div>
            <h3 className="text-xl font-bold mb-3">Learning Paths</h3>
            <p className="text-muted-foreground leading-relaxed">
              Personalized onboarding journeys tailored to your role and experience level
            </p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-muted rounded-full">
          <motion.div 
            className="w-2 h-2 bg-accent rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          ></motion.div>
          <p className="text-sm font-medium text-foreground">Environment setup complete. Ready to explore!</p>
        </div>
      </motion.div>
    </main>
  )
}
