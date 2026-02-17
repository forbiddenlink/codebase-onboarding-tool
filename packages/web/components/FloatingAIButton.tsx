'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AISparkleIcon } from './icons/CustomIcons'

export default function FloatingAIButton() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    router.push('/chat')
  }

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-background/95 backdrop-blur-xl border-2 border-border rounded-xl shadow-2xl whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <AISparkleIcon className="text-primary" size={16} />
              <span className="text-sm font-medium">Ask AI anything</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Quick chat about your code
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-background/95 border-r-2 border-b-2 border-border transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => {
          setIsHovered(true)
          setShowTooltip(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowTooltip(false)
        }}
        className="relative w-16 h-16 rounded-full gradient-sunset shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/30 overflow-hidden group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Chat"
      >
        {/* Pulsing background animation */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Sparkle icon */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <motion.div
            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <AISparkleIcon className="text-white" size={32} />
          </motion.div>
        </div>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%', y: '-100%' }}
          whileHover={{ x: '100%', y: '100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>

      {/* Decorative rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30 pointer-events-none"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-secondary/30 pointer-events-none"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      />
    </div>
  )
}

