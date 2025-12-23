'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('auto')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')

  // Load theme from settings on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.theme) {
            setThemeState(data.theme)
          }
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
      }
    }
    loadTheme()
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    let newEffectiveTheme: 'light' | 'dark' = 'light'

    if (theme === 'auto') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      newEffectiveTheme = systemPrefersDark ? 'dark' : 'light'
    } else {
      newEffectiveTheme = theme
    }

    // Apply the theme class
    root.classList.add(newEffectiveTheme)
    setEffectiveTheme(newEffectiveTheme)

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        root.classList.remove('light', 'dark')
        root.classList.add(newTheme)
        setEffectiveTheme(newTheme)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    // Return undefined for non-auto theme mode (cleanup not needed)
    return undefined
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    // Also update in settings
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme })
    }).catch(error => console.error('Failed to save theme:', error))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
