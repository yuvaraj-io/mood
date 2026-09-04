export const PRIORITIES = {
  high: {
    key: 'high',
    label: 'High',
    color: '#EF4444',
    bg: '#FEE2E2',
    dot: 'bg-red-500',
    icon: '🔴',
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    color: '#F59E0B',
    bg: '#FEF3C7',
    dot: 'bg-amber-500',
    icon: '🟡',
  },
  low: {
    key: 'low',
    label: 'Low',
    color: '#10B981',
    bg: '#D1FAE5',
    dot: 'bg-emerald-500',
    icon: '🟢',
  },
}

export function createTodo(text, priority = 'medium') {
  return {
    id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim(),
    completed: false,
    priority: PRIORITIES[priority] ? priority : 'medium',
    createdAt: new Date().toISOString(),
  }
}

export function getTodoStats(todos = []) {
  if (!Array.isArray(todos) || todos.length === 0) {
    return { total: 0, completed: 0, pending: 0, percent: 0 }
  }
  const total = todos.length
  const completed = todos.filter(t => Boolean(t.completed)).length
  const pending = total - completed
  const percent = Math.round((completed / total) * 100)
  return { total, completed, pending, percent }
}

export function isDateInFuture(dateStr) {
  if (!dateStr) return false
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return target > now
}
