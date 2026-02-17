'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animate = true 
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  }

  return (
    <div
      className={`bg-muted relative overflow-hidden ${variantStyles[variant]} ${className}`}
      style={style}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  )
}

// Preset skeleton patterns for common use cases
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 border-2 border-border rounded-2xl ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={24} />
          <Skeleton width="90%" />
          <Skeleton width="70%" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonList({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" />
            <Skeleton width="80%" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} width={100} height={20} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`${rowIndex}-${colIndex}`} width={100} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton variant="rounded" width={64} height={64} />
        <div className="flex-1 space-y-3">
          <Skeleton width="30%" height={32} />
          <Skeleton width="50%" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 border-2 border-border rounded-2xl">
            <Skeleton variant="rounded" width={48} height={48} className="mb-4" />
            <Skeleton width="60%" height={24} className="mb-3" />
            <Skeleton width="100%" />
          </div>
        ))}
      </div>

      {/* Repository Cards */}
      <div className="space-y-4">
        <Skeleton width="20%" height={28} className="mb-4" />
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonSearchResults() {
  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <Skeleton width="30%" height={32} />
        <Skeleton width={120} height={40} variant="rounded" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={80} height={36} variant="rounded" />
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-6 border border-border rounded-xl">
            <div className="flex items-start gap-4">
              <Skeleton variant="rounded" width={40} height={40} />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton width="40%" height={24} />
                  <Skeleton width={60} height={24} variant="rounded" />
                </div>
                <Skeleton width="100%" />
                <Skeleton width="80%" />
                <div className="flex gap-3 mt-4">
                  <Skeleton width={100} height={32} variant="rounded" />
                  <Skeleton width={100} height={32} variant="rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonFileTree() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i % 3) * 16}px` }}>
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton width={`${60 + (i * 5)}%`} height={20} />
        </div>
      ))}
    </div>
  )
}

