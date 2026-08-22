import React, { useState } from 'react'
import { useTheme, THEMES } from '../lib/ThemeContext'

export default function ThemeSelector() {
  const { themeName, setThemeName, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const lightThemes = Object.entries(THEMES).filter(([, t]) => t.group === 'light')
  const darkThemes = Object.entries(THEMES).filter(([, t]) => t.group === 'dark')

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-200"
        style={{
          background: theme.surface,
          color: theme.text,
          border: `1px solid ${theme.border}`,
        }}
        title="Change theme"
      >
        <span className="text-xs sm:text-base">{THEMES[themeName]?.emoji || '🎨'}</span>
        <span className="hidden md:inline">{THEMES[themeName]?.name || 'Theme'}</span>
        <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div
            className="absolute right-0 top-full mt-2 z-50 w-56 sm:w-64 max-h-[70vh] overflow-y-auto rounded-xl sm:rounded-2xl shadow-xl animate-slide-up"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
          >
            <div className="p-1.5 sm:p-2">
              {/* Light Themes */}
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 mb-0.5" style={{ color: theme.textSecondary }}>
                ☀️ Light
              </div>
              {lightThemes.map(([key, t]) => (
                <ThemeOption
                  key={key}
                  themeKey={key}
                  themeData={t}
                  isActive={themeName === key}
                  currentTheme={theme}
                  onSelect={() => { setThemeName(key); setIsOpen(false) }}
                />
              ))}

              {/* Divider */}
              <div className="my-1.5 mx-2 h-px" style={{ background: theme.border }} />

              {/* Dark Themes */}
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 mb-0.5" style={{ color: theme.textSecondary }}>
                🌙 Dark
              </div>
              {darkThemes.map(([key, t]) => (
                <ThemeOption
                  key={key}
                  themeKey={key}
                  themeData={t}
                  isActive={themeName === key}
                  currentTheme={theme}
                  onSelect={() => { setThemeName(key); setIsOpen(false) }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ThemeOption({ themeData, isActive, currentTheme, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150"
      style={{
        background: isActive ? currentTheme.hover : 'transparent',
        color: currentTheme.text,
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = currentTheme.hover
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span className="text-base sm:text-lg">{themeData.emoji}</span>
      <span className="flex-1 text-left text-xs sm:text-sm">{themeData.name}</span>
      <div className="flex gap-1">
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/10" style={{ background: themeData.primary }} />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/10" style={{ background: themeData.bg }} />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/10" style={{ background: themeData.accent }} />
      </div>
      {isActive && (
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: currentTheme.primary }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}
