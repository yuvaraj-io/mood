import React from 'react'
import { useTheme } from '../lib/ThemeContext'

const PRESET_COLORS = [
  '#FFD54F', // Yellow
  '#FF8A80', // Red / Pink
  '#80D8FF', // Light Blue
  '#A7FFEB', // Teal
  '#B39DDB', // Purple
  '#FFAB91', // Orange
  '#C5E1A5', // Light Green
  '#F48FB1', // Pink
  '#90CAF9', // Blue
  '#CFD8DC', // Grey
]

export default function ColorPicker({ value, onChange, disabled }) {
  const { theme } = useTheme()

  return (
    <div>
      <div className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
        Highlight Color
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => !disabled && onChange(c)}
            className="w-8 h-8 rounded-full transition-all duration-150 hover:scale-110 active:scale-95"
            style={{
              background: c,
              border: value === c ? `3px solid ${theme.primary}` : '2px solid rgba(0,0,0,0.1)',
              boxShadow: value === c ? `0 0 0 2px ${theme.surface}, 0 0 0 4px ${theme.primary}` : 'none',
            }}
            aria-label={`Color ${c}`}
            disabled={disabled}
          />
        ))}
        <div className="relative ml-1">
          <input
            type="color"
            value={value}
            onChange={e => !disabled && onChange(e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
            disabled={disabled}
            title="Custom color"
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center text-xs"
            style={{ border: `2px solid ${theme.border}` }}
          >
          </div>
        </div>
      </div>
    </div>
  )
}
