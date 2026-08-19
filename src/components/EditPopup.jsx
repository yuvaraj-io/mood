import React, { useState, useEffect, useRef } from 'react'
import ColorPicker from './ColorPicker'
import { isValidEmoji, extractFirstEmoji } from '../lib/emojiUtils'
import { useTheme } from '../lib/ThemeContext'

const BASIC_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚',
  '😐', '😑', '😶', '🤔', '😏', '😒', '🙄', '😬',
  '😢', '😭', '😤', '😡', '🤬', '😰', '😥', '😓',
  '😴', '🥱', '😪', '💤', '😌', '🤗', '🤭', '😷',
  '💪', '🙏', '❤️', '🔥', '⭐', '🌈', '🎯', '🥳',
  '✨', '💯', '🎉', '👍', '👏', '🤝', '💜', '💚',
]

export default function EditPopup({ dateStr, existingData, onSubmit, onClose }) {
  const { theme } = useTheme()
  const [emoji, setEmoji] = useState('')
  const [color, setColor] = useState('#FFD54F')
  const [notes, setNotes] = useState('')
  const [pasteInput, setPasteInput] = useState('')
  const [pasteError, setPasteError] = useState('')
  const modalRef = useRef(null)

  useEffect(() => {
    if (existingData) {
      setEmoji(existingData.emoji || existingData.mood || '')
      setColor(existingData.color || '#FFD54F')
      setNotes(existingData.notes || '')
    }
  }, [existingData])

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handlePasteEmoji() {
    const trimmed = pasteInput.trim()
    if (!trimmed) {
      setPasteError('Please paste an emoji')
      return
    }
    const extracted = extractFirstEmoji(trimmed)
    if (extracted && isValidEmoji(extracted)) {
      setEmoji(extracted)
      setPasteInput('')
      setPasteError('')
    } else {
      setPasteError('Invalid emoji. Please paste a valid emoji character.')
    }
  }

  function handlePasteInputChange(e) {
    const val = e.target.value
    setPasteInput(val)
    setPasteError('')

    // Auto-detect if they pasted an emoji
    if (val.trim()) {
      const extracted = extractFirstEmoji(val.trim())
      if (extracted && isValidEmoji(extracted)) {
        setEmoji(extracted)
        setPasteInput('')
        setPasteError('')
      }
    }
  }

  function handleSubmit() {
    onSubmit(dateStr, {
      emoji: emoji,
      mood: emoji, // backward compatible
      color: color,
      notes: notes,
    })
    onClose()
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className="modal-content w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: theme.text }}>
              Edit Mood
            </h2>
            <p className="text-xs" style={{ color: theme.textSecondary }}>{dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150"
            style={{ color: theme.textSecondary }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Selected emoji preview */}
          {emoji && (
            <div className="flex items-center justify-center">
              <div
                className="w-20 h-20 flex items-center justify-center rounded-2xl text-5xl"
                style={{ background: theme.hover, border: `2px solid ${theme.border}` }}
              >
                {emoji}
              </div>
            </div>
          )}

          {/* Emoji Grid */}
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              Choose an Emoji
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {BASIC_EMOJIS.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setEmoji(e)}
                  className="w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all duration-100 hover:scale-125 active:scale-95"
                  style={{
                    background: emoji === e ? theme.hover : 'transparent',
                    border: emoji === e ? `2px solid ${theme.primary}` : '2px solid transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Paste Emoji */}
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              Or Paste an Emoji
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={pasteInput}
                onChange={handlePasteInputChange}
                placeholder="Paste emoji here..."
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: theme.bg,
                  color: theme.text,
                  border: `1.5px solid ${pasteError ? '#EF4444' : theme.border}`,
                }}
                onFocus={e => { e.target.style.borderColor = pasteError ? '#EF4444' : theme.primary }}
                onBlur={e => { e.target.style.borderColor = pasteError ? '#EF4444' : theme.border }}
              />
              <button
                onClick={handlePasteEmoji}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: theme.hover,
                  color: theme.primary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                Add
              </button>
            </div>
            {pasteError && (
              <p className="text-xs mt-1 text-red-500">{pasteError}</p>
            )}
          </div>

          {/* Color Picker */}
          <ColorPicker value={color} onChange={setColor} disabled={false} />

          {/* Notes / Description */}
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              Description (optional)
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="How are you feeling today? Write a note..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all resize-none"
              style={{
                background: theme.bg,
                color: theme.text,
                border: `1.5px solid ${theme.border}`,
              }}
              onFocus={e => { e.target.style.borderColor = theme.primary }}
              onBlur={e => { e.target.style.borderColor = theme.border }}
            />
            <div className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {notes.length}/500
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-4"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150 hover:shadow-md active:scale-[0.98]"
            style={{ background: theme.primary }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
