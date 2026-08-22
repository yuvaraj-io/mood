import React, { useState, useMemo } from 'react'
import { useTheme } from '../lib/ThemeContext'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calendar({
  viewDate,
  onChangeViewDate,
  onSelectDate,
  selectedDate,
  moodboards = {},
  onEditDate,
  onViewDayDetail,
}) {
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
  const [selectedEmojiFilter, setSelectedEmojiFilter] = useState(null)

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

  const monthEmojis = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
    const emojis = new Set()
    Object.entries(moodboards).forEach(([k, v]) => {
      if (k.startsWith(monthPrefix) && v) {
        const emo = getDisplayEmoji(v)
        if (emo) emojis.add(emo)
      }
    })
    return Array.from(emojis)
  }, [moodboards, year, month])

  return (
    <div
      className="rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden transition-all duration-300"
      style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
    >
      {/* Month/Year Navigation Header */}
      <div
        className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-4"
        style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.border}` }}
      >
        <button
          onClick={() => onChangeViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
          style={{ color: theme.text, border: `1px solid ${theme.border}`, background: theme.surface }}
          title="Previous Month"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Clickable Month + Year with Dropdowns */}
        <div className="flex items-center gap-1 sm:gap-2 relative">
          {/* Month selector */}
          <div className="relative">
            <button
              onClick={() => { setShowMonthPicker(v => !v); setShowYearPicker(false) }}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-sm xs:text-base sm:text-xl font-bold transition-all duration-150 hover:opacity-80 flex items-center gap-1"
              style={{ color: theme.text, background: theme.hover }}
            >
              {MONTH_NAMES[month]}
              <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showMonthPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMonthPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                <div
                  className="absolute left-0 top-full mt-2 z-50 w-44 sm:w-52 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up p-1.5 sm:p-2"
                  style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
                >
                  <div className="grid grid-cols-3 gap-1">
                    {MONTH_NAMES.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => selectMonth(i)}
                        className="px-1.5 py-2 sm:px-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-100"
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
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-sm xs:text-base sm:text-xl font-bold transition-all duration-150 hover:opacity-80 flex items-center gap-1"
              style={{ color: theme.textSecondary, background: theme.hover }}
            >
              {year}
              <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showYearPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showYearPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
                <div
                  className="absolute right-0 top-full mt-2 z-50 w-40 sm:w-48 max-h-60 overflow-y-auto rounded-xl sm:rounded-2xl shadow-2xl animate-slide-up p-1.5 sm:p-2"
                  style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
                >
                  <div className="grid grid-cols-3 gap-1">
                    {yearRange.map(y => (
                      <button
                        key={y}
                        onClick={() => selectYear(y)}
                        className="px-1.5 py-2 sm:px-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-100"
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
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
          style={{ color: theme.text, border: `1px solid ${theme.border}`, background: theme.surface }}
          title="Next Month"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Emoji Filter Bar */}
      {monthEmojis.length > 0 && (
        <div
          className="px-3 sm:px-5 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-[10px] sm:text-xs border-b scrollbar-none"
          style={{ borderColor: theme.border, background: theme.surface }}
        >
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: theme.textSecondary }}>
            Filter:
          </span>
          <button
            onClick={() => setSelectedEmojiFilter(null)}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex-shrink-0 ${
              selectedEmojiFilter === null ? 'shadow-sm' : 'opacity-60'
            }`}
            style={{
              background: selectedEmojiFilter === null ? theme.primary : theme.hover,
              color: selectedEmojiFilter === null ? '#FFFFFF' : theme.text,
            }}
          >
            All
          </button>
          {monthEmojis.map(emo => (
            <button
              key={emo}
              onClick={() => setSelectedEmojiFilter(prev => prev === emo ? null : emo)}
              className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md sm:rounded-lg text-xs sm:text-sm transition-all flex items-center gap-1 flex-shrink-0 ${
                selectedEmojiFilter === emo ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: selectedEmojiFilter === emo ? theme.hover : 'transparent',
                borderColor: theme.border,
              }}
            >
              <span>{emo}</span>
            </button>
          ))}
        </div>
      )}

      {/* Day of week headers */}
      <div className="grid grid-cols-7 px-2 sm:px-4 pt-2 sm:pt-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div
            key={i}
            className="text-center text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider py-0.5 sm:py-1"
            style={{ color: theme.textSecondary }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid — Responsive for 320px to 475px+ */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 p-2 sm:p-4">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            if (!d) {
              return <div key={`empty-${wi}-${di}`} className="min-h-[54px] xs:min-h-[64px] sm:min-h-[80px] md:min-h-[96px] rounded-xl sm:rounded-2xl opacity-10" />
            }

            const key = getDateStr(d)
            const data = moodboards?.[key]
            const disabled = isFuture(d)
            const isSelected = key === selectedDate
            const isToday = key === todayStr
            const displayEmoji = getDisplayEmoji(data)
            const hasNotes = Boolean(data?.notes && data.notes.trim())

            const matchesFilter = selectedEmojiFilter === null || displayEmoji === selectedEmojiFilter
            const isDimmed = selectedEmojiFilter !== null && !matchesFilter

            return (
              <div
                key={key}
                className={`relative min-h-[54px] xs:min-h-[64px] sm:min-h-[80px] md:min-h-[96px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-between p-1 sm:p-2 transition-all duration-200 group
                  ${disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'}
                  ${isDimmed ? 'opacity-20 grayscale' : ''}`}
                onClick={() => {
                  if (disabled) return
                  onSelectDate(key)
                  if (data && (data.emoji || data.mood || data.notes || data.color)) {
                    onViewDayDetail(key, data)
                  } else {
                    onEditDate(key)
                  }
                }}
                style={{
                  background: data?.color
                    ? `${data.color}25`
                    : isSelected
                      ? theme.hover
                      : theme.calendarCellBg,
                  border: isToday
                    ? `2px sm:2.5px solid ${theme.primary}`
                    : isSelected
                      ? `2px solid ${theme.accent}`
                      : `1px sm:1.5px solid ${theme.calendarCellBorder}`,
                  boxShadow: isSelected ? `0 0 0 2px sm:3px ${theme.primary}25` : 'none',
                }}
              >
                {/* Top row: Day Number + Note Badge */}
                <div className="w-full flex items-center justify-between pointer-events-none px-0.5">
                  <span
                    className={`text-[9px] xs:text-[11px] sm:text-xs md:text-sm font-semibold ${isToday ? 'font-bold' : ''}`}
                    style={{ color: isToday ? theme.primary : theme.text }}
                  >
                    {d.getDate()}
                  </span>

                  {/* Note Indicator Badge */}
                  {hasNotes && (
                    <span
                      className="text-[8px] sm:text-[10px] opacity-80"
                      title="Has written note"
                    >
                      📝
                    </span>
                  )}
                </div>

                {/* Center: Emoji or Color Dot */}
                <div className="flex-1 flex items-center justify-center my-0.5 pointer-events-none">
                  {displayEmoji ? (
                    <span className="text-base xs:text-xl sm:text-2xl md:text-3xl leading-none transition-transform group-hover:scale-110">
                      {displayEmoji}
                    </span>
                  ) : data?.color ? (
                    <span
                      className="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full border border-black/15 shadow-sm"
                      style={{ background: data.color }}
                    />
                  ) : null}
                </div>

                {/* Bottom row: Color Accent Indicator */}
                <div className="w-full flex items-center justify-center h-0.5 sm:h-1 pointer-events-none">
                  {data?.color && displayEmoji && (
                    <span
                      className="w-2.5 sm:w-4 h-0.5 sm:h-1 rounded-full opacity-80"
                      style={{ background: data.color }}
                    />
                  )}
                </div>

                {/* Edit Button — compact size on 320px-475px mobile screens */}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditDate(key)
                    }}
                    className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md sm:rounded-lg shadow-sm
                      opacity-90 sm:opacity-100 md:opacity-0 md:group-hover:opacity-100
                      transition-all duration-150 hover:scale-110"
                    style={{
                      background: theme.primary,
                      color: '#FFFFFF',
                    }}
                    title="Edit mood & note"
                  >
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer: Jump to Today */}
      <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
        <button
          onClick={() => {
            onChangeViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
            onSelectDate(todayStr)
          }}
          className="w-full py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
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
