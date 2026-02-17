'use client'

import { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  opacity?: number
  border?: boolean
  shadow?: boolean
  hover?: boolean
}

export function GlassCard({
  children,
  className = '',
  blur = 'xl',
  opacity = 0.05,
  border = true,
  shadow = true,
  hover = false,
  ...motionProps
}: GlassCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  return (
    <motion.div
      className={`
        ${blurClasses[blur]}
        ${border ? 'border-2 border-white/10 dark:border-white/5' : ''}
        ${shadow ? 'shadow-2xl' : ''}
        ${hover ? 'hover:border-white/20 dark:hover:border-white/10 transition-all duration-300' : ''}
        rounded-2xl
        ${className}
      `}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        ...motionProps.style,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

export function GlassModal({
  children,
  className = '',
  onClose,
}: {
  children: ReactNode
  className?: string
  onClose?: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <GlassCard
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`pointer-events-auto max-w-2xl w-full ${className}`}
          blur="xl"
          opacity={0.95}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {children}
        </GlassCard>
      </div>
    </>
  )
}

export function GlassDropdown({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard
        className={`${className}`}
        blur="xl"
        opacity={0.98}
        shadow={true}
      >
        {children}
      </GlassCard>
    </motion.div>
  )
}

export function GlassTooltip({
  children,
  content,
  position = 'top',
}: {
  children: ReactNode
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}) {
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-2 border-l-2',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-2 border-r-2',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-2 border-b-2',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-2 border-t-2',
  }

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`absolute ${positionClasses[position]} opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50`}
      >
        <GlassCard
          className="px-3 py-2 text-sm whitespace-nowrap"
          blur="xl"
          opacity={0.98}
        >
          {content}
        </GlassCard>
        {/* Arrow */}
        <div
          className={`absolute w-3 h-3 bg-white/95 backdrop-blur-xl border-white/10 ${arrowClasses[position]} rotate-45`}
        />
      </div>
    </div>
  )
}

export function GlassButton({
  children,
  className = '',
  variant = 'default',
  ...props
}: {
  children: ReactNode
  className?: string
  variant?: 'default' | 'primary' | 'secondary'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantClasses = {
    default: 'bg-white/10 hover:bg-white/20 text-foreground',
    primary: 'gradient-coral-amber text-white hover:shadow-xl',
    secondary: 'bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent-foreground',
  }

  return (
    <motion.button
      className={`
        px-6 py-3 rounded-xl font-semibold
        backdrop-blur-xl border-2 border-white/10
        transition-all duration-200
        ${variantClasses[variant]}
        ${className}
      `}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

