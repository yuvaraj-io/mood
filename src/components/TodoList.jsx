import React, { useState } from 'react'
import { PRIORITIES, createTodo, getTodoStats } from '../lib/todoUtils'
import { useTheme } from '../lib/ThemeContext'

export default function TodoList({
  todos = [],
  onChange,
  isFuture = false,
  title,
}) {
  const { theme } = useTheme()
  const [newText, setNewText] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const stats = getTodoStats(todos)

  function handleAdd(e) {
    if (e) e.preventDefault()
    const trimmed = newText.trim()
    if (!trimmed) return
    const item = createTodo(trimmed, newPriority)
    onChange([...todos, item])
    setNewText('')
  }

  function handleToggle(id) {
    const updated = todos.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed }
      }
      return t
    })
    onChange(updated)
  }

  function handleDelete(id) {
    const updated = todos.filter(t => t.id !== id)
    onChange(updated)
  }

  function handleStartEdit(todo) {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  function handleSaveEdit(id) {
    if (!editText.trim()) {
      handleDelete(id)
    } else {
      const updated = todos.map(t => {
        if (t.id === id) {
          return { ...t, text: editText.trim() }
        }
        return t
      })
      onChange(updated)
    }
    setEditingId(null)
    setEditText('')
  }

  function handleCyclePriority(id, currentPriority) {
    const order = ['low', 'medium', 'high']
    const nextIdx = (order.indexOf(currentPriority) + 1) % order.length
    const nextPriority = order[nextIdx]
    const updated = todos.map(t => {
      if (t.id === id) {
        return { ...t, priority: nextPriority }
      }
      return t
    })
    onChange(updated)
  }

  function handleClearCompleted() {
    const updated = todos.filter(t => !t.completed)
    onChange(updated)
  }

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return Boolean(t.completed)
    return true
  })

  return (
    <div className="space-y-3">
      {/* Header & Progress */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm sm:text-base">
            {isFuture ? '🎯' : '✅'}
          </span>
          <span className="text-xs sm:text-sm font-semibold" style={{ color: theme.textSecondary }}>
            {title || (isFuture ? 'Day Plans & Objectives' : 'Todo List Tracker')}
          </span>
        </div>

        {stats.total > 0 && (
          <span
            className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: stats.percent === 100 ? '#10B98125' : theme.hover,
              color: stats.percent === 100 ? '#10B981' : theme.primary,
            }}
          >
            {stats.completed}/{stats.total} ({stats.percent}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${stats.percent}%`,
              background: stats.percent === 100 ? '#10B981' : theme.primary,
            }}
          />
        </div>
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="flex items-center gap-1.5 sm:gap-2">
        <input
          type="text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder={isFuture ? "Plan a task, target, or goal..." : "Add a new task..."}
          className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm outline-none transition-all"
          style={{
            background: theme.bg,
            color: theme.text,
            border: `1.5px solid ${theme.border}`,
          }}
          onFocus={e => { e.target.style.borderColor = theme.primary }}
          onBlur={e => { e.target.style.borderColor = theme.border }}
        />

        {/* Priority Selector for new todo */}
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value)}
          className="px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold outline-none cursor-pointer transition-all"
          style={{
            background: theme.bg,
            color: PRIORITIES[newPriority]?.color || theme.text,
            border: `1.5px solid ${theme.border}`,
          }}
          title="Set task priority"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Med</option>
          <option value="high">🔴 High</option>
        </select>

        <button
          type="submit"
          disabled={!newText.trim()}
          className="px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 hover:opacity-90 active:scale-95 flex-shrink-0"
          style={{ background: theme.primary }}
        >
          {isFuture ? '+ Plan' : '+ Add'}
        </button>
      </form>

      {/* Filter Tabs if multiple items */}
      {stats.total > 1 && (
        <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1">
          <div className="flex gap-1">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded-md font-semibold capitalize transition-all ${
                  filter === f ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: filter === f ? theme.hover : 'transparent',
                  color: filter === f ? theme.primary : theme.textSecondary,
                }}
              >
                {f} ({f === 'all' ? stats.total : f === 'active' ? stats.pending : stats.completed})
              </button>
            ))}
          </div>

          {stats.completed > 0 && (
            <button
              type="button"
              onClick={handleClearCompleted}
              className="text-[10px] sm:text-xs opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
              style={{ color: theme.textSecondary }}
            >
              Clear completed
            </button>
          )}
        </div>
      )}

      {/* Todo List Items */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
        {filteredTodos.length === 0 ? (
          <div
            className="text-center py-4 px-2 rounded-xl text-xs"
            style={{ background: theme.bg, color: theme.textSecondary }}
          >
            {todos.length === 0
              ? (isFuture
                  ? "No plans added for this day yet. Add goals or plans above to organize your day! 🎯"
                  : "No tasks tracked for this day yet. Add one above! ✨")
              : "No tasks match the current filter."}
          </div>
        ) : (
          filteredTodos.map(item => {
            const prio = PRIORITIES[item.priority] || PRIORITIES.medium
            const isEditing = editingId === item.id

            return (
              <div
                key={item.id}
                className="group flex items-center gap-2 p-1.5 sm:p-2 rounded-xl transition-all duration-150"
                style={{
                  background: item.completed ? `${theme.hover}60` : theme.bg,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    border: `1.5px solid ${item.completed ? '#10B981' : theme.border}`,
                    background: item.completed ? '#10B981' : 'transparent',
                  }}
                  title={item.completed ? "Mark as pending" : "Mark as completed"}
                >
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Content / Edit Input */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(item.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={() => handleSaveEdit(item.id)}
                      autoFocus
                      className="w-full px-1.5 py-0.5 rounded text-xs sm:text-sm outline-none"
                      style={{
                        background: theme.surface,
                        color: theme.text,
                        border: `1px solid ${theme.primary}`,
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => handleStartEdit(item)}
                      className={`text-xs sm:text-sm cursor-pointer truncate ${
                        item.completed ? 'line-through opacity-50' : ''
                      }`}
                      style={{ color: theme.text }}
                      title="Click to edit task title"
                    >
                      {item.text}
                    </div>
                  )}
                </div>

                {/* Priority Badge (clickable to cycle) */}
                <button
                  type="button"
                  onClick={() => handleCyclePriority(item.id, item.priority)}
                  className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                  style={{
                    background: prio.bg,
                    color: prio.color,
                  }}
                  title={`Priority: ${prio.label}. Click to cycle.`}
                >
                  <span>{prio.icon}</span>
                  <span className="hidden xs:inline">{prio.label}</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="w-5 h-5 flex items-center justify-center rounded text-xs opacity-60 hover:opacity-100 hover:text-red-500 transition-all flex-shrink-0"
                  style={{ color: theme.textSecondary }}
                  title="Delete task"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
