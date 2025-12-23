import { create } from 'zustand'

// UI State Interface
interface UIState {
  // Sidebar
  isSidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // Theme (managed by ThemeProvider, but we can track it here too)
  theme: 'light' | 'dark' | 'auto'
  setTheme: (theme: 'light' | 'dark' | 'auto') => void

  // Loading states
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void

  // Active repository
  activeRepositoryId: string | null
  setActiveRepositoryId: (id: string | null) => void

  // Code viewer state
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Notifications
  unreadNotificationsCount: number
  setUnreadNotificationsCount: (count: number) => void
  incrementUnreadNotifications: () => void
}

// Create the Zustand store
export const useUIStore = create<UIState>((set) => ({
  // Sidebar state
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  // Theme state
  theme: 'auto',
  setTheme: (theme) => set({ theme }),

  // Loading states
  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  // Active repository
  activeRepositoryId: null,
  setActiveRepositoryId: (id) => set({ activeRepositoryId: id }),

  // Code viewer
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Notifications
  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
  incrementUnreadNotifications: () => set((state) => ({
    unreadNotificationsCount: state.unreadNotificationsCount + 1
  })),
}))
