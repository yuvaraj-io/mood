import React, { useState, useEffect } from 'react'
import Calendar from './components/Calendar'
import EditPopup from './components/EditPopup'
import SignInPage from './components/SignInPage'
import ThemeSelector from './components/ThemeSelector'
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
  const [editingDate, setEditingDate] = useState(null) // date string for popup

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        setGuestMode(false)
        // Load user doc from Firestore
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
        // Don't auto-set guest mode here; let the sign-in page handle it
        if (guestMode) {
          setMoods(getLocal())
        }
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  // Load local data when entering guest mode
  useEffect(() => {
    if (guestMode && !user) {
      setMoods(getLocal())
    }
  }, [guestMode])

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

  // Show sign-in page if not authenticated and not in guest mode
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
    <div className="min-h-screen transition-colors duration-300" style={{ background: theme.bg }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: `${theme.headerBg}ee`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Small logo */}
            <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: theme.primary }}>
              <span className="text-white text-sm">😊</span>
            </div>
            <h1 className="text-lg font-semibold" style={{ color: theme.text }}>
              Mood Calendar
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSelector />

            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: theme.hover, color: theme.textSecondary }}
                >
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
                  )}
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded-md text-xs font-medium"
                  style={{ background: theme.hover, color: theme.textSecondary }}
                >
                  Guest
                </span>
                <button
                  onClick={handleLogin}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    background: theme.primary,
                    color: '#FFFFFF',
                  }}
                >
                  Sign in
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.hover }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main — Calendar only */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Calendar
          viewDate={viewDate}
          onChangeViewDate={setViewDate}
          onSelectDate={onSelectDate}
          selectedDate={selectedDate}
          moodboards={moods}
          onEditDate={onEditDate}
        />

        {/* Sync status */}
        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            {user
              ? '✓ Synced to your Google account'
              : '💾 Data saved locally on this device'}
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
