import React, { useEffect, useState } from 'react'
import TodoList from './TodoList'
import { isDateInFuture } from '../lib/todoUtils'
import { useTheme } from '../lib/ThemeContext'

export default function DayDetailModal({
  dateStr,
  data = {},
  onEdit,
  onClose,
  onUpdateTodos,
}) {
  const { theme } = useTheme()
  const isFuture = isDateInFuture(dateStr)
  const [todos, setTodos] = useState(Array.isArray(data.todos) ? data.todos : [])

  useEffect(() => {
    setTodos(Array.isArray(data.todos) ? data.todos : [])
  }, [data.todos])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const moodToEmoji = {
    happy: '😀', neutral: '😐', sad: '😢', angry: '😡',
    tired: '😴', motivated: '💪', loved: '😍', focused: '🎯',
  }

  const displayEmoji = data.emoji || moodToEmoji[data.mood] || data.mood || null
  const dateObj = new Date(dateStr + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleTodosChange(updatedTodos) {
    setTodos(updatedTodos)
    if (onUpdateTodos) {
      onUpdateTodos(dateStr, updatedTodos)
    }
  }

  return (
    <div className="modal-overlay p-2 sm:p-4" onClick={handleOverlayClick}>
      <div
        className="modal-content w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
      >
        {/* Top decorative header */}
        <div
          className="p-4 sm:p-5 text-center relative"
          style={{
            background: data.color ? `${data.color}25` : theme.headerBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-150"
            style={{ color: theme.textSecondary }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Emoji / Planning Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center text-4xl sm:text-5xl drop-shadow-sm mb-1">
            {displayEmoji || (isFuture ? '🎯' : '📝')}
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            {isFuture && (
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Future Plan
              </span>
            )}
            <h3 className="text-sm sm:text-base font-bold" style={{ color: theme.text }}>
              {formattedDate}
            </h3>
          </div>

          {data.color && (
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: data.color }} />
              <span className="text-[11px] sm:text-xs" style={{ color: theme.textSecondary }}>Color Highlight</span>
            </div>
          )}
        </div>

        {/* Content Body: Todos Tracker + Notes */}
        <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Interactive Todo List Section */}
          <div
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl"
            style={{ background: `${theme.hover}40`, border: `1px solid ${theme.border}` }}
          >
            <TodoList
              todos={todos}
              onChange={handleTodosChange}
              isFuture={isFuture}
              title={isFuture ? 'Plans & Execution Tasks' : 'Daily Tasks Tracker'}
            />
          </div>

          {/* Description / Notes */}
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.textSecondary }}>
              {isFuture ? 'Planning Notes / Goals' : 'Journal / Description'}
            </div>
            {data.notes ? (
              <p
                className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed p-2.5 sm:p-3 rounded-xl"
                style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
              >
                {data.notes}
              </p>
            ) : (
              <p className="text-xs italic py-1 text-center" style={{ color: theme.textSecondary }}>
                {isFuture ? 'No planning notes written yet.' : 'No description added for this day.'}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between"
          style={{ borderTop: `1px solid ${theme.border}`, background: theme.headerBg }}
        >
          <span className="text-[10px] sm:text-xs" style={{ color: theme.textSecondary }}>
            {todos.length > 0 ? `${todos.filter(t => t.completed).length}/${todos.length} done` : 'Plan & track your day'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all"
              style={{ color: theme.textSecondary, border: `1px solid ${theme.border}`, background: theme.surface }}
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose()
                onEdit(dateStr)
              }}
              className="flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: theme.primary }}
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {isFuture ? 'Configure Plans' : 'Edit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
