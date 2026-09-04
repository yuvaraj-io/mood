import React, { useState, useMemo, useEffect } from 'react'
import { useTheme } from '../lib/ThemeContext'

export default function AnalyticsModal({ moodboards = {}, viewDate, onClose }) {
  const { theme } = useTheme()
  const [filterScope, setFilterScope] = useState('month')

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth() + 1
  const monthPrefix = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const yearPrefix = `${viewYear}-`

  const filteredEntries = useMemo(() => {
    return Object.entries(moodboards).filter(([dateKey, data]) => {
      if (!data) return false
      const hasTodos = Array.isArray(data.todos) && data.todos.length > 0
      if (!data.emoji && !data.mood && !data.color && !data.notes && !hasTodos) return false

      if (filterScope === 'month') {
        return dateKey.startsWith(monthPrefix)
      } else if (filterScope === 'year') {
        return dateKey.startsWith(yearPrefix)
      }
      return true
    })
  }, [moodboards, filterScope, monthPrefix, yearPrefix])

  const todoStats = useMemo(() => {
    let total = 0
    let completed = 0
    let daysWithTodos = 0

    filteredEntries.forEach(([, data]) => {
      if (Array.isArray(data.todos) && data.todos.length > 0) {
        daysWithTodos++
        data.todos.forEach(t => {
          total++
          if (t.completed) completed++
        })
      }
    })

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return {
      total,
      completed,
      pending: total - completed,
      daysWithTodos,
      percent,
    }
  }, [filteredEntries])

  const emojiStats = useMemo(() => {
    const counts = {}
    let totalWithEmoji = 0

    const moodToEmoji = {
      happy: '😀', neutral: '😐', sad: '😢', angry: '😡',
      tired: '😴', motivated: '💪', loved: '😍', focused: '🎯',
    }

    filteredEntries.forEach(([, data]) => {
      const emo = data.emoji || moodToEmoji[data.mood] || data.mood
      if (emo) {
        counts[emo] = (counts[emo] || 0) + 1
        totalWithEmoji++
      }
    })

    const sorted = Object.entries(counts)
      .map(([emoji, count]) => ({
        emoji,
        count,
        percent: totalWithEmoji > 0 ? Math.round((count / totalWithEmoji) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return {
      list: sorted,
      total: totalWithEmoji,
      topMood: sorted[0] || null,
    }
  }, [filteredEntries])

  const colorStats = useMemo(() => {
    const counts = {}
    let totalWithColor = 0

    filteredEntries.forEach(([, data]) => {
      if (data.color) {
        counts[data.color] = (counts[data.color] || 0) + 1
        totalWithColor++
      }
    })

    const sorted = Object.entries(counts)
      .map(([color, count]) => ({
        color,
        count,
        percent: totalWithColor > 0 ? Math.round((count / totalWithColor) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return {
      list: sorted,
      total: totalWithColor,
    }
  }, [filteredEntries])

  const streak = useMemo(() => {
    const today = new Date()
    let currentStreak = 0
    let checkDate = new Date(today)

    while (true) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
      const entry = moodboards[dateStr]
      if (entry && (entry.emoji || entry.mood || entry.color || entry.notes)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        if (currentStreak === 0 && dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`) {
          checkDate.setDate(checkDate.getDate() - 1)
          const yDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
          if (moodboards[yDateStr]) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
            continue
          }
        }
        break
      }
    }
    return currentStreak
  }, [moodboards])

  function handleExport() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(moodboards, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `mood-calendar-export-${new Date().toISOString().slice(0,10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  const monthLabel = viewDate.toLocaleString(undefined, { month: 'short', year: 'numeric' })

  return (
    <div className="modal-overlay p-2 sm:p-4" onClick={handleOverlayClick}>
      <div
        className="modal-content w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4"
          style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">📊</span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold truncate" style={{ color: theme.text }}>
                Mood Insights & Stats
              </h2>
              <p className="text-[10px] sm:text-xs truncate" style={{ color: theme.textSecondary }}>
                Patterns & mood distribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors duration-150"
            style={{ color: theme.textSecondary }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Scope Tabs */}
        <div className="px-3.5 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between border-b pb-2.5 sm:pb-3 gap-2" style={{ borderColor: theme.border }}>
          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 sm:p-1 rounded-lg sm:rounded-xl gap-0.5 sm:gap-1 overflow-x-auto">
            <button
              onClick={() => setFilterScope('month')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                filterScope === 'month' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: filterScope === 'month' ? theme.surface : 'transparent',
                color: filterScope === 'month' ? theme.primary : theme.text,
              }}
            >
              {monthLabel}
            </button>
            <button
              onClick={() => setFilterScope('year')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                filterScope === 'year' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: filterScope === 'year' ? theme.surface : 'transparent',
                color: filterScope === 'year' ? theme.primary : theme.text,
              }}
            >
              {viewYear}
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                filterScope === 'all' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: filterScope === 'all' ? theme.surface : 'transparent',
                color: filterScope === 'all' ? theme.primary : theme.text,
              }}
            >
              All Time
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex-shrink-0"
            style={{
              background: theme.hover,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
            title="Download JSON export"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden xs:inline">Export</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            <div
              className="p-2 sm:p-3.5 rounded-xl text-center"
              style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
            >
              <div className="text-base sm:text-2xl font-bold" style={{ color: theme.primary }}>
                {filteredEntries.length}
              </div>
              <div className="text-[9px] sm:text-xs mt-0.5 truncate" style={{ color: theme.textSecondary }}>
                Days Tracked
              </div>
            </div>

            <div
              className="p-2 sm:p-3.5 rounded-xl text-center"
              style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
            >
              <div className="text-base sm:text-2xl font-bold flex items-center justify-center gap-0.5" style={{ color: theme.text }}>
                <span>🔥</span> {streak}
              </div>
              <div className="text-[9px] sm:text-xs mt-0.5 truncate" style={{ color: theme.textSecondary }}>
                Day Streak
              </div>
            </div>

            <div
              className="p-2 sm:p-3.5 rounded-xl text-center"
              style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
            >
              <div className="text-base sm:text-2xl leading-tight">
                {emojiStats.topMood ? emojiStats.topMood.emoji : '—'}
              </div>
              <div className="text-[9px] sm:text-xs mt-0.5 truncate" style={{ color: theme.textSecondary }}>
                {emojiStats.topMood ? `Top (${emojiStats.topMood.percent}%)` : 'Top Mood'}
              </div>
            </div>
          </div>

          {/* Daily Plans & Task Execution Tracker */}
          <div
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl"
            style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg">🎯</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold" style={{ color: theme.text }}>
                    Task Execution & Planning
                  </h3>
                  <p className="text-[10px] sm:text-[11px]" style={{ color: theme.textSecondary }}>
                    {todoStats.daysWithTodos} active planning days
                  </p>
                </div>
              </div>
              <span
                className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: todoStats.percent === 100 && todoStats.total > 0 ? '#10B98125' : theme.hover,
                  color: todoStats.percent === 100 && todoStats.total > 0 ? '#10B981' : theme.primary,
                }}
              >
                {todoStats.percent}% rate
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${todoStats.percent}%`,
                  background: todoStats.percent === 100 && todoStats.total > 0 ? '#10B981' : theme.primary,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t" style={{ borderColor: theme.border }}>
              <div>
                <div className="text-xs sm:text-sm font-bold" style={{ color: theme.text }}>
                  {todoStats.total}
                </div>
                <div className="text-[9px] sm:text-[10px]" style={{ color: theme.textSecondary }}>
                  Tasks Planned
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {todoStats.completed}
                </div>
                <div className="text-[9px] sm:text-[10px]" style={{ color: theme.textSecondary }}>
                  Completed
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                  {todoStats.pending}
                </div>
                <div className="text-[9px] sm:text-[10px]" style={{ color: theme.textSecondary }}>
                  Pending
                </div>
              </div>
            </div>
          </div>

          {/* Emoji Frequency Breakdown */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center justify-between" style={{ color: theme.text }}>
              <span>Emoji & Mood Distribution</span>
              <span className="text-[10px] sm:text-xs font-normal" style={{ color: theme.textSecondary }}>
                {emojiStats.total} logged
              </span>
            </h3>

            {emojiStats.list.length === 0 ? (
              <div
                className="p-4 sm:p-8 text-center rounded-xl text-xs sm:text-sm"
                style={{ background: theme.bg, color: theme.textSecondary }}
              >
                No moods logged for this period yet. Tap any date to log!
              </div>
            ) : (
              <div className="space-y-2">
                {emojiStats.list.map(item => (
                  <div key={item.emoji} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-2xl w-6 sm:w-8 text-center flex-shrink-0">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs mb-0.5">
                        <span className="font-medium" style={{ color: theme.text }}>
                          {item.count} {item.count === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-semibold" style={{ color: theme.textSecondary }}>
                          {item.percent}%
                        </span>
                      </div>
                      <div className="h-2 sm:h-2.5 rounded-full overflow-hidden w-full bg-black/10 dark:bg-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percent}%`,
                            background: theme.primary,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color Breakdown */}
          {colorStats.list.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: theme.text }}>
                Highlight Color Palette
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {colorStats.list.map(item => (
                  <div
                    key={item.color}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs"
                    style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
                  >
                    <span
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border flex-shrink-0"
                      style={{ background: item.color, borderColor: 'rgba(0,0,0,0.15)' }}
                    />
                    <span className="font-medium" style={{ color: theme.text }}>
                      {item.count}d ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 text-center border-t text-[10px] sm:text-xs"
          style={{ borderColor: theme.border, background: theme.headerBg, color: theme.textSecondary }}
        >
          Keep tracking every day to discover your happiness trends! ✨
        </div>
      </div>
    </div>
  )
}
