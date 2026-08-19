import React, { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  // ===== LIGHT THEMES =====
  sunshine: {
    name: 'Sunshine',
    emoji: '☀️',
    group: 'light',
    primary: '#F59E0B',
    bg: '#FFFBEB',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#D97706',
    border: '#FDE68A',
    hover: '#FEF3C7',
    calendarCellBg: '#FFFFFF',
    calendarCellBorder: '#FDE68A',
    headerBg: '#FFFBEB',
  },
  forest: {
    name: 'Forest',
    emoji: '🌲',
    group: 'light',
    primary: '#10B981',
    bg: '#ECFDF5',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#059669',
    border: '#A7F3D0',
    hover: '#D1FAE5',
    calendarCellBg: '#FFFFFF',
    calendarCellBorder: '#A7F3D0',
    headerBg: '#ECFDF5',
  },
  ocean: {
    name: 'Ocean',
    emoji: '🌊',
    group: 'light',
    primary: '#3B82F6',
    bg: '#EFF6FF',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#2563EB',
    border: '#BFDBFE',
    hover: '#DBEAFE',
    calendarCellBg: '#FFFFFF',
    calendarCellBorder: '#BFDBFE',
    headerBg: '#EFF6FF',
  },
  sunset: {
    name: 'Sunset',
    emoji: '🌅',
    group: 'light',
    primary: '#F97316',
    bg: '#FFF7ED',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#EA580C',
    border: '#FED7AA',
    hover: '#FFEDD5',
    calendarCellBg: '#FFFFFF',
    calendarCellBorder: '#FED7AA',
    headerBg: '#FFF7ED',
  },
  emerald: {
    name: 'Emerald',
    emoji: '💎',
    group: 'light',
    primary: '#34D399',
    bg: '#D1FAE5',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#059669',
    border: '#6EE7B7',
    hover: '#A7F3D0',
    calendarCellBg: '#FFFFFF',
    calendarCellBorder: '#6EE7B7',
    headerBg: '#D1FAE5',
  },
  snow: {
    name: 'Snow',
    emoji: '❄️',
    group: 'light',
    primary: '#6366F1',
    bg: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    accent: '#4F46E5',
    border: '#E5E7EB',
    hover: '#F3F4F6',
    calendarCellBg: '#F9FAFB',
    calendarCellBorder: '#E5E7EB',
    headerBg: '#FFFFFF',
  },

  // ===== DARK THEMES =====
  'sunshine-dark': {
    name: 'Sunshine Dark',
    emoji: '🌤️',
    group: 'dark',
    primary: '#FBBF24',
    bg: '#1C1508',
    surface: '#2A2010',
    text: '#FEF3C7',
    textSecondary: '#D4A94A',
    accent: '#F59E0B',
    border: '#3D3211',
    hover: '#3D3211',
    calendarCellBg: '#2A2010',
    calendarCellBorder: '#3D3211',
    headerBg: '#1C1508',
  },
  'forest-dark': {
    name: 'Forest Dark',
    emoji: '🌿',
    group: 'dark',
    primary: '#34D399',
    bg: '#071A12',
    surface: '#0F2A1D',
    text: '#D1FAE5',
    textSecondary: '#6EE7B7',
    accent: '#10B981',
    border: '#14532D',
    hover: '#14532D',
    calendarCellBg: '#0F2A1D',
    calendarCellBorder: '#14532D',
    headerBg: '#071A12',
  },
  'ocean-dark': {
    name: 'Ocean Dark',
    emoji: '🐳',
    group: 'dark',
    primary: '#60A5FA',
    bg: '#0B1526',
    surface: '#111D35',
    text: '#DBEAFE',
    textSecondary: '#93C5FD',
    accent: '#3B82F6',
    border: '#1E3A5F',
    hover: '#1E3A5F',
    calendarCellBg: '#111D35',
    calendarCellBorder: '#1E3A5F',
    headerBg: '#0B1526',
  },
  'sunset-dark': {
    name: 'Sunset Dark',
    emoji: '🌇',
    group: 'dark',
    primary: '#FB923C',
    bg: '#1A0F05',
    surface: '#2A1A0D',
    text: '#FFEDD5',
    textSecondary: '#FDBA74',
    accent: '#F97316',
    border: '#3D2510',
    hover: '#3D2510',
    calendarCellBg: '#2A1A0D',
    calendarCellBorder: '#3D2510',
    headerBg: '#1A0F05',
  },
  'emerald-dark': {
    name: 'Emerald Dark',
    emoji: '🪲',
    group: 'dark',
    primary: '#6EE7B7',
    bg: '#052E1A',
    surface: '#0A3D24',
    text: '#A7F3D0',
    textSecondary: '#6EE7B7',
    accent: '#34D399',
    border: '#145535',
    hover: '#145535',
    calendarCellBg: '#0A3D24',
    calendarCellBorder: '#145535',
    headerBg: '#052E1A',
  },
  midnight: {
    name: 'Midnight',
    emoji: '🌙',
    group: 'dark',
    primary: '#818CF8',
    bg: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    accent: '#6366F1',
    border: '#374151',
    hover: '#374151',
    calendarCellBg: '#1F2937',
    calendarCellBorder: '#374151',
    headerBg: '#111827',
  },
}

const THEME_STORAGE_KEY = 'mood_calendar_theme'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'ocean'
    } catch {
      return 'ocean'
    }
  })

  const theme = THEMES[themeName] || THEMES.ocean

  useEffect(() => {
    // Apply CSS custom properties to document root
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-bg', theme.bg)
    root.style.setProperty('--color-surface', theme.surface)
    root.style.setProperty('--color-text', theme.text)
    root.style.setProperty('--color-text-secondary', theme.textSecondary)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-border', theme.border)
    root.style.setProperty('--color-hover', theme.hover)
    root.style.setProperty('--color-calendar-cell-bg', theme.calendarCellBg)
    root.style.setProperty('--color-calendar-cell-border', theme.calendarCellBorder)
    root.style.setProperty('--color-header-bg', theme.headerBg)

    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeName)
    } catch {}
  }, [themeName, theme])

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, allThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
