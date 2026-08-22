import React, { useState, useEffect, useMemo } from 'react'
import Calendar from './components/Calendar'
import EditPopup from './components/EditPopup'
import SignInPage from './components/SignInPage'
import ThemeSelector from './components/ThemeSelector'
import AnalyticsModal from './components/AnalyticsModal'
import DayDetailModal from './components/DayDetailModal'
import { ThemeProvider, useTheme } from './lib/ThemeContext'
import { auth, provider, db } from './lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getMoodboard as getLocal, saveMoodboard as saveLocal } from './lib/localStorage'

function AppInner() {
  const { theme } = useTheme()
  const today = new Date()
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [guestMode, setGuestMode] = useState(false)
  const [moods, setMoods] = useState({})
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(formatDate(today))
  const [editingDate, setEditingDate] = useState(null)
  const [detailDate, setDetailDate] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        setGuestMode(false)
        const ref = doc(db, 'users', u.uid)
        try {
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const data = snap.data()
            setMoods(data.moods || {})
          } else {
            await setDoc(ref, { moods: {} })
            setMoods({})
          }
        } catch (err) {
          console.error('Error loading user data:', err)
          setMoods(getLocal())
        }
      } else {
        setUser(null)
        if (guestMode) {
          setMoods(getLocal())
        }
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (guestMode && !user) {
      setMoods(getLocal())
    }
  }, [guestMode])

  const currentStreak = useMemo(() => {
    let streakCount = 0
    let checkDate = new Date(today)

    while (true) {
      const dateStr = formatDate(checkDate)
      const entry = moods[dateStr]
      if (entry && (entry.emoji || entry.mood || entry.color || entry.notes)) {
        streakCount++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        if (streakCount === 0 && dateStr === formatDate(today)) {
          checkDate.setDate(checkDate.getDate() - 1)
          const yDateStr = formatDate(checkDate)
          if (moods[yDateStr]) {
            streakCount++
            checkDate.setDate(checkDate.getDate() - 1)
            continue
          }
        }
        break
      }
    }
    return streakCount
  }, [moods])

  async function handleLogin() {
    try {
      const res = await signInWithPopup(auth, provider)
      console.log('Logged in:', res.user.email)
    } catch (e) {
      console.error('Login failed', e)
      alert('Login failed: ' + e.message)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    setUser(null)
    setGuestMode(false)
    setMoods({})
  }

  function handleContinueGuest() {
    setGuestMode(true)
    setMoods(getLocal())
  }

  async function onSave(dateStr, data) {
    const updated = { ...moods, [dateStr]: data }
    setMoods(updated)
    saveLocal(dateStr, data)

    if (user) {
      const ref = doc(db, 'users', user.uid)
      try {
        await updateDoc(ref, { moods: updated })
      } catch (err) {
        await setDoc(ref, { moods: updated }, { merge: true })
      }
    }
  }

  function onSelectDate(d) {
    setSelectedDate(d)
  }

  function onEditDate(dateStr) {
    setEditingDate(dateStr)
  }

  function onViewDayDetail(dateStr) {
    setDetailDate(dateStr)
  }

  if (authLoading || (!user && !guestMode)) {
    return (
      <SignInPage
        onGoogleSignIn={handleLogin}
        onContinueGuest={handleContinueGuest}
        isLoading={authLoading}
      />
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-300 pb-8 sm:pb-12" style={{ background: theme.bg }}>
      {/* Header — Fully optimized for 320px to 475px mobile screens */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: `${theme.headerBg}ee`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div
              className="w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-lg sm:rounded-xl shadow-sm"
              style={{ background: theme.primary }}
            >
              <span className="text-white text-xs sm:text-base">😊</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xs xs:text-sm sm:text-base md:text-lg font-bold leading-tight truncate" style={{ color: theme.text }}>
                Mood Calendar
              </h1>
              {currentStreak > 0 && (
                <div className="flex items-center gap-0.5 text-[9px] sm:text-[11px] font-semibold truncate" style={{ color: theme.primary }}>
                  <span>🔥</span> {currentStreak}d streak
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Insights / Charts Button */}
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-150 shadow-sm hover:scale-105 active:scale-95"
              style={{
                background: theme.surface,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
              title="View Mood Analytics & Charts"
            >
              <span className="text-xs sm:text-sm">📊</span>
              <span className="hidden xs:inline">Stats</span>
            </button>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs"
                  style={{ background: theme.hover, color: theme.textSecondary }}
                >
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="w-4 h-4 rounded-full" />
                  )}
                  <span className="max-w-[100px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 hover:opacity-80"
                  style={{
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface,
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={handleLogin}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 shadow-sm"
                  style={{
                    background: theme.primary,
                    color: '#FFFFFF',
                  }}
                >
                  Sign in
                </button>
                <button
                  onClick={handleLogout}
                  className="px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 hover:opacity-80"
                  style={{
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface,
                  }}
                  title="Logout"
                >
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main — Responsive Calendar Container */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <Calendar
          viewDate={viewDate}
          onChangeViewDate={setViewDate}
          onSelectDate={onSelectDate}
          selectedDate={selectedDate}
          moodboards={moods}
          onEditDate={onEditDate}
          onViewDayDetail={onViewDayDetail}
        />

        {/* Sync status footer */}
        <div className="mt-4 text-center px-2">
          <p className="text-[10px] sm:text-xs" style={{ color: theme.textSecondary }}>
            {user
              ? '✓ Synced to your Google account cloud storage'
              : '💾 Guest mode: entries are saved locally on this device'}
          </p>
        </div>
      </main>

      {/* Edit Popup Modal */}
      {editingDate && (
        <EditPopup
          dateStr={editingDate}
          existingData={moods?.[editingDate] ?? {}}
          onSubmit={onSave}
          onClose={() => setEditingDate(null)}
        />
      )}

      {/* Day Detail View Modal */}
      {detailDate && (
        <DayDetailModal
          dateStr={detailDate}
          data={moods?.[detailDate] ?? {}}
          onEdit={(d) => {
            setDetailDate(null)
            setEditingDate(d)
          }}
          onClose={() => setDetailDate(null)}
        />
      )}

      {/* Analytics / Charts Modal */}
      {showAnalytics && (
        <AnalyticsModal
          moodboards={moods}
          viewDate={viewDate}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
