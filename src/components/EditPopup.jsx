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
      mood: emoji,
      color: color,
      notes: notes,
    })
    onClose()
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay p-2 sm:p-4" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className="modal-content w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4"
          style={{ borderBottom: `1px solid ${theme.border}`, background: theme.headerBg }}
        >
          <div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: theme.text }}>
              Edit Mood
            </h2>
            <p className="text-[11px] sm:text-xs" style={{ color: theme.textSecondary }}>{dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors duration-150"
            style={{ color: theme.textSecondary }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Selected emoji preview */}
          {emoji && (
            <div className="flex items-center justify-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl text-4xl sm:text-5xl"
                style={{ background: theme.hover, border: `2px solid ${theme.border}` }}
              >
                {emoji}
              </div>
            </div>
          )}

          {/* Emoji Grid */}
          <div>
            <div className="text-xs sm:text-sm font-semibold mb-1.5" style={{ color: theme.textSecondary }}>
              Choose an Emoji
            </div>
            <div className="grid grid-cols-7 xs:grid-cols-8 gap-1 sm:gap-1.5">
              {BASIC_EMOJIS.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setEmoji(e)}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg sm:text-xl rounded-lg transition-all duration-100 hover:scale-110 active:scale-95"
                  style={{
                    background: emoji === e ? theme.hover : 'transparent',
                    border: emoji === e ? `2px solid ${theme.primary}` : '1.5px solid transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Paste Emoji */}
          <div>
            <div className="text-xs sm:text-sm font-semibold mb-1.5" style={{ color: theme.textSecondary }}>
              Or Paste an Emoji
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <input
                type="text"
                value={pasteInput}
                onChange={handlePasteInputChange}
                placeholder="Paste emoji here..."
                className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm outline-none transition-all"
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
                className="px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150"
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
              <p className="text-[10px] sm:text-xs mt-1 text-red-500">{pasteError}</p>
            )}
          </div>

          {/* Color Picker */}
          <ColorPicker value={color} onChange={setColor} disabled={false} />

          {/* Notes / Description */}
          <div>
            <div className="text-xs sm:text-sm font-semibold mb-1.5" style={{ color: theme.textSecondary }}>
              Description (optional)
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="How are you feeling today? Write a note..."
              className="w-full px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm outline-none transition-all resize-none"
              style={{
                background: theme.bg,
                color: theme.text,
                border: `1.5px solid ${theme.border}`,
              }}
              onFocus={e => { e.target.style.borderColor = theme.primary }}
              onBlur={e => { e.target.style.borderColor = theme.border }}
            />
            <div className="text-[10px] sm:text-xs mt-1 text-right" style={{ color: theme.textSecondary }}>
              {notes.length}/500
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-3 sm:px-5 py-2.5 sm:py-3"
          style={{ borderTop: `1px solid ${theme.border}`, background: theme.headerBg }}
        >
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150"
            style={{
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-150 hover:shadow-md active:scale-[0.98]"
            style={{ background: theme.primary }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
