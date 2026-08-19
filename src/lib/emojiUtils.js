/**
 * Emoji validation utilities
 * Uses Unicode property escapes to detect and validate emoji characters.
 */

// Regex to match a single emoji (including sequences like ZWJ, skin tones, flags)
const EMOJI_REGEX = /\p{Extended_Pictographic}(\u{FE0F}|\u{200D}\p{Extended_Pictographic})*/gu

/**
 * Check if a string is a valid single emoji (or emoji sequence like 👨‍👩‍👧)
 */
export function isValidEmoji(str) {
  if (!str || typeof str !== 'string') return false
  const trimmed = str.trim()
  if (trimmed.length === 0) return false

  // Remove variation selectors and zero-width joiners for length check
  const matches = trimmed.match(EMOJI_REGEX)
  if (!matches) return false

  // Reconstruct what the regex matched and compare to full string
  const reconstructed = matches.join('')
  // Check that the entire string is made of emoji characters
  // Allow some combining marks (skin tones, etc.)
  const nonEmojiChars = trimmed
    .replace(EMOJI_REGEX, '')
    .replace(/[\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu, '') // variation selectors, ZWJ, skin tones
    .replace(/[\u{E0061}-\u{E007A}\u{E007F}\u{1F1E0}-\u{1F1FF}]/gu, '') // flag sequences
    .trim()

  return nonEmojiChars.length === 0
}

/**
 * Extract the first emoji from a string
 */
export function extractFirstEmoji(str) {
  if (!str || typeof str !== 'string') return null
  const matches = str.match(EMOJI_REGEX)
  return matches ? matches[0] : null
}

/**
 * Extract all emojis from a string
 */
export function extractAllEmojis(str) {
  if (!str || typeof str !== 'string') return []
  return str.match(EMOJI_REGEX) || []
}

/**
 * Check if a string contains at least one emoji
 */
export function containsEmoji(str) {
  if (!str || typeof str !== 'string') return false
  return EMOJI_REGEX.test(str)
}
