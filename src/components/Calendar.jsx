import React, { useState } from 'react'
import { useTheme } from '../lib/ThemeContext'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calendar({ viewDate, onChangeViewDate, onSelectDate, selectedDate, moodboards, onEditDate }) {
  const { theme } = useTheme()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)

  // Generate year range (current year ± 10)
  const currentYear = today.getFullYear()
  const yearRange = []
  for (let y = currentYear - 10; y <= currentYear + 5; y++) yearRange.push(y)

  const weeks = []
  let cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  while (cells.length) weeks.push(cells.splice(0, 7))

  function isFuture(date) {
    if (!date) return false
    const comp = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const td = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return comp > td
  }

  function getDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function getDisplayEmoji(data) {
    if (!data) return ''
    if (data.emoji) return data.emoji
    const moodToEmoji = {
      happy: '😀', neutral: '😐', sad: '😢', angry: '😡',
      tired: '😴', motivated: '💪', loved: '😍', focused: '🎯',
    }
    return moodToEmoji[data.mood] || data.mood || ''
  }

  function selectMonth(m) {
    onChangeViewDate(new Date(year, m, 1))
    setShowMonthPicker(false)
  }

  function selectYear(y) {
    onChangeViewDate(new Date(y, month, 1))
    setShowYearPicker(false)
  }

  return (
    <div
      className="rounded-2xl shadow-lg overflow-hidden"
      style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
    >
      {/* Month/Year Navigation Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.border}` }}
      >
        <button
          onClick={() => onChangeViewDate(new Date(year, month - 1, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110"
          style={{ color: theme.text }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Clickable Month + Year */}
        <div className="flex items-center gap-1 relative">
          {/* Month selector */}
          <div className="relative">
            <button
              onClick={() => { setShowMonthPicker(v => !v); setShowYearPicker(false) }}
              className="px-2 py-1 rounded-lg text-lg font-semibold transition-all duration-150 hover:opacity-80"
              style={{ color: theme.text }}
            >
              {MONTH_NAMES[month]}
              <svg className={`w-3 h-3 inline-block ml-1 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMonthPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                <div
                  className="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl shadow-xl overflow-hidden animate-slide-up"
                  style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
                >
                  <div className="grid grid-cols-3 gap-0.5 p-2">
                    {MONTH_NAMES.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => selectMonth(i)}
                        className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-100"
                        style={{
                          background: month === i ? theme.primary : 'transparent',
                          color: month === i ? '#FFFFFF' : theme.text,
                        }}
                        onMouseEnter={e => { if (month !== i) e.currentTarget.style.background = theme.hover }}
                        onMouseLeave={e => { if (month !== i) e.currentTarget.style.background = 'transparent' }}
                      >
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Year selector */}
          <div className="relative">
            <button
              onClick={() => { setShowYearPicker(v => !v); setShowMonthPicker(false) }}
              className="px-2 py-1 rounded-lg text-lg font-semibold transition-all duration-150 hover:opacity-80"
              style={{ color: theme.textSecondary }}
            >
              {year}
              <svg className={`w-3 h-3 inline-block ml-1 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showYearPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-50 w-44 max-h-60 overflow-y-auto rounded-xl shadow-xl animate-slide-up"
                  style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
                >
                  <div className="grid grid-cols-3 gap-0.5 p-2">
                    {yearRange.map(y => (
                      <button
                        key={y}
                        onClick={() => selectYear(y)}
                        className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-100"
                        style={{
                          background: year === y ? theme.primary : 'transparent',
                          color: year === y ? '#FFFFFF' : theme.text,
                        }}
                        onMouseEnter={e => { if (year !== y) e.currentTarget.style.background = theme.hover }}
                        onMouseLeave={e => { if (year !== y) e.currentTarget.style.background = 'transparent' }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => onChangeViewDate(new Date(year, month + 1, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110"
          style={{ color: theme.text }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium py-2"
            style={{ color: theme.textSecondary }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 p-3">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            if (!d) {
              return <div key={`empty-${wi}-${di}`} className="aspect-square" />
            }

            const key = getDateStr(d)
            const data = moodboards?.[key]
            const disabled = isFuture(d)
            const isSelected = key === selectedDate
            const isToday = key === todayStr
            const displayEmoji = getDisplayEmoji(data)

            return (
              <button
                key={key}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 group
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                onClick={() => {
                  if (!disabled) onSelectDate(key)
                }}
                disabled={disabled}
                style={{
                  background: data?.color
                    ? `${data.color}20`
                    : isSelected
                      ? theme.hover
                      : theme.calendarCellBg,
                  border: isToday
                    ? `2px solid ${theme.primary}`
                    : isSelected
                      ? `2px solid ${theme.accent}`
                      : `1px solid ${theme.calendarCellBorder}`,
                  boxShadow: isSelected ? `0 0 0 2px ${theme.primary}30` : 'none',
                }}
              >
                {/* Day number */}
                <span
                  className={`text-xs font-medium ${isToday ? 'font-bold' : ''}`}
                  style={{ color: isToday ? theme.primary : theme.text }}
                >
                  {d.getDate()}
                </span>

                {/* Emoji */}
                {displayEmoji && (
                  <span className="text-lg leading-none">{displayEmoji}</span>
                )}

                {/* Color dot */}
                {data?.color && !displayEmoji && (
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: data.color, border: '1px solid rgba(0,0,0,0.1)' }}
                  />
                )}

                {/* Edit button — always visible on mobile (touch), hover on desktop */}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditDate(key)
                    }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full
                      opacity-100 md:opacity-0 md:group-hover:opacity-100
                      transition-opacity duration-150"
                    style={{
                      background: theme.primary,
                      color: '#FFFFFF',
                    }}
                    title="Edit mood"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Today button */}
      <div className="px-3 pb-3">
        <button
          onClick={() => {
            onChangeViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
            onSelectDate(todayStr)
          }}
          className="w-full py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            color: theme.primary,
            background: theme.hover,
            border: `1px solid ${theme.border}`,
          }}
        >
          Today — {today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </button>
      </div>
    </div>
  )
}
