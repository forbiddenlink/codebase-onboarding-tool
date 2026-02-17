'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AISparkleIcon,
  SearchIcon,
  DashboardIcon,
  ChatIcon,
  DiagramIcon,
  LearningPathIcon,
  SettingsIcon,
  CodeIcon,
  WhatsNewIcon,
  FileIcon,
  RocketIcon,
} from './icons/CustomIcons'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  action: () => void
  category: 'navigation' | 'ai' | 'action' | 'file'
  keywords?: string[]
}

interface CommandPaletteProps {
  onClose?: () => void
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Define all available commands
  const allCommands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View your repositories and stats',
      icon: DashboardIcon,
      category: 'navigation',
      action: () => router.push('/dashboard'),
      keywords: ['dashboard', 'home', 'main'],
    },
    {
      id: 'nav-search',
      label: 'Search Files',
      description: 'Search across your codebase',
      icon: SearchIcon,
      category: 'navigation',
      action: () => router.push('/search'),
      keywords: ['search', 'find', 'files'],
    },
    {
      id: 'nav-chat',
      label: 'AI Chat',
      description: 'Ask questions about your code',
      icon: ChatIcon,
      category: 'navigation',
      action: () => router.push('/chat'),
      keywords: ['chat', 'ai', 'ask', 'question'],
    },
    {
      id: 'nav-diagrams',
      label: 'View Diagrams',
      description: 'Explore architecture visualizations',
      icon: DiagramIcon,
      category: 'navigation',
      action: () => router.push('/diagrams'),
      keywords: ['diagrams', 'architecture', 'visualization', 'graph'],
    },
    {
      id: 'nav-learning',
      label: 'Learning Path',
      description: 'Follow your onboarding journey',
      icon: LearningPathIcon,
      category: 'navigation',
      action: () => router.push('/learning-path'),
      keywords: ['learning', 'path', 'onboarding', 'tutorial'],
    },
    {
      id: 'nav-viewer',
      label: 'Code Viewer',
      description: 'Browse and explore code',
      icon: CodeIcon,
      category: 'navigation',
      action: () => router.push('/viewer'),
      keywords: ['code', 'viewer', 'browse', 'files'],
    },
    {
      id: 'nav-whats-new',
      label: "What's New",
      description: 'See recent updates and features',
      icon: WhatsNewIcon,
      category: 'navigation',
      action: () => router.push('/whats-new'),
      keywords: ['new', 'updates', 'changelog', 'features'],
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Configure your preferences',
      icon: SettingsIcon,
      category: 'navigation',
      action: () => router.push('/settings'),
      keywords: ['settings', 'preferences', 'config'],
    },
    // AI Actions
    {
      id: 'ai-quick-question',
      label: 'Ask AI a Question',
      description: 'Quick AI chat about your code',
      icon: AISparkleIcon,
      category: 'ai',
      action: () => router.push('/chat'),
      keywords: ['ai', 'ask', 'question', 'help'],
    },
    {
      id: 'ai-explain-code',
      label: 'Explain Current Code',
      description: 'Get AI explanation of what you\'re viewing',
      icon: AISparkleIcon,
      category: 'ai',
      action: () => {
        // This would integrate with current file context
        router.push('/chat?action=explain')
      },
      keywords: ['explain', 'understand', 'what', 'does'],
    },
    // Actions
    {
      id: 'action-setup',
      label: 'Analyze New Repository',
      description: 'Add and analyze a new codebase',
      icon: RocketIcon,
      category: 'action',
      action: () => router.push('/setup'),
      keywords: ['setup', 'analyze', 'new', 'repository', 'add'],
    },
    {
      id: 'action-recent',
      label: 'View Recent Files',
      description: 'See your recently viewed files',
      icon: FileIcon,
      category: 'action',
      action: () => {
        // This would show recent files
        router.push('/viewer')
      },
      keywords: ['recent', 'files', 'history'],
    },
  ], [router])

  // Fuzzy search implementation
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands

    const searchLower = search.toLowerCase()
    
    return allCommands.filter(cmd => {
      const labelMatch = cmd.label.toLowerCase().includes(searchLower)
      const descMatch = cmd.description?.toLowerCase().includes(searchLower)
      const keywordMatch = cmd.keywords?.some(k => k.includes(searchLower))
      
      return labelMatch || descMatch || keywordMatch
    })
  }, [search, allCommands])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {
      navigation: [],
      ai: [],
      action: [],
      file: [],
    }

    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd)
    })

    return groups
  }, [filteredCommands])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }

      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearch('')
        setSelectedIndex(0)
      }

      // Arrow navigation
      if (isOpen && filteredCommands.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            setIsOpen(false)
            setSearch('')
            setSelectedIndex(0)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Close handler
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setSearch('')
    setSelectedIndex(0)
    onClose?.()
  }, [onClose])

  const handleCommandClick = useCallback((command: Command) => {
    command.action()
    handleClose()
  }, [handleClose])

  const categoryLabels = {
    navigation: 'Navigation',
    ai: 'AI Actions',
    action: 'Actions',
    file: 'Files',
  }

  const categoryColors = {
    navigation: 'text-primary',
    ai: 'text-secondary',
    action: 'text-accent',
    file: 'text-muted-foreground',
  }

  return (
    <>
      {/* Keyboard hint */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border hover:border-primary/50 bg-muted/50"
      >
        <SearchIcon size={16} />
        <span>Search...</span>
        <kbd className="px-2 py-0.5 text-xs bg-background border border-border rounded">⌘K</kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
              onClick={handleClose}
            />

            {/* Palette */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl mx-4 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glass card with enhanced glassmorphism */}
                <div className="bg-background/98 backdrop-blur-2xl border-2 border-white/10 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                  {/* Search input */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <SearchIcon className="text-primary" size={20} />
                    <input
                      type="text"
                      placeholder="Search commands, pages, or ask AI..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                      autoFocus
                    />
                    <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">ESC</kbd>
                  </div>

                  {/* Commands list */}
                  <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <SearchIcon className="mx-auto mb-3 opacity-50" size={40} />
                        <p>No commands found</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                      </div>
                    ) : (
                      Object.entries(groupedCommands).map(([category, commands]) => {
                        if (commands.length === 0) return null
                        
                        return (
                          <div key={category} className="mb-4 last:mb-0">
                            <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${categoryColors[category as keyof typeof categoryColors]}`}>
                              {categoryLabels[category as keyof typeof categoryLabels]}
                            </div>
                            <div className="space-y-1 mt-1">
                              {commands.map((command) => {
                                const globalIndex = filteredCommands.indexOf(command)
                                const isSelected = globalIndex === selectedIndex
                                const Icon = command.icon

                                return (
                                  <motion.button
                                    key={command.id}
                                    onClick={() => handleCommandClick(command)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 shadow-sm'
                                        : 'hover:bg-muted border border-transparent'
                                    }`}
                                    whileHover={{ x: 4 }}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  >
                                    <div className={`p-2 rounded-lg ${
                                      isSelected 
                                        ? 'bg-gradient-coral-amber text-white' 
                                        : 'bg-muted text-muted-foreground'
                                    }`}>
                                      <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-foreground">{command.label}</div>
                                      {command.description && (
                                        <div className="text-sm text-muted-foreground truncate">
                                          {command.description}
                                        </div>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <kbd className="px-2 py-1 text-xs bg-background border border-border rounded">
                                        ↵
                                      </kbd>
                                    )}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Footer hint with glass effect */}
                  <div className="px-4 py-3 border-t border-white/10 dark:border-white/5 bg-white/5 backdrop-blur-sm flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↓</kbd>
                        <span>Navigate</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">↵</kbd>
                        <span>Select</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">ESC</kbd>
                        <span>Close</span>
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

