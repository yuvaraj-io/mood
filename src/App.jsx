import React, { useState, useEffect } from 'react'
import Calendar from './components/Calendar'
import DayEditor from './components/DayEditor'
import YearOverview from './components/YearOverview'
import { auth, provider, db } from './lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getMoodboard as getLocal, saveMoodboard as saveLocal } from './lib/localStorage'

export default function App(){
  const today = new Date()
  const [user, setUser] = useState(null)
  const [moods, setMoods] = useState({}) // map date->data
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(formatDate(today))
  const [showYearOverview, setShowYearOverview] = useState(false)

  useEffect(()=>{
    // auth state listener
    const unsub = onAuthStateChanged(auth, async (u)=>{
      if(u){
        setUser(u)
        // load user doc
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if(snap.exists()){
          const data = snap.data()
          setMoods(data.moods || {})
        } else {
          // create empty doc
          await setDoc(ref, { moods: {} })
          setMoods({})
        }
      } else {
        setUser(null)
        // load from localStorage fallback
        setMoods(getLocal())
      }
    })
    return ()=> unsub()
  },[])

  async function handleLogin(){
    try{
      const res = await signInWithPopup(auth, provider)
      // onAuthStateChanged will handle loading
      console.log('Logged in:', res.user.email)
    }catch(e){
      console.error('Login failed', e)
      alert('Login failed: ' + e.message)
    }
  }

  async function handleLogout(){
    await signOut(auth)
    setUser(null)
    setMoods(getLocal())
  }

  async function onSave(dateStr, data){
    // update local state first
    const updated = {...moods, [dateStr]: data}
    setMoods(updated)
    // always save locally as fallback
    saveLocal(dateStr, data)

    // if logged in, persist to Firestore
    if(user){
      const ref = doc(db, 'users', user.uid)
      try{
        await updateDoc(ref, { moods: updated })
      }catch(err){
        // if update fails (doc may not exist), setDoc
        await setDoc(ref, { moods: updated }, { merge: true })
      }
    }
  }

  function onSelectDate(d){
    setSelectedDate(d)
    setShowYearOverview(false)
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <header className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Moodboard — Vision Calendar</h1>
          <div className="flex items-center gap-3">
            {!user ? (
              <button onClick={handleLogin} className="px-3 py-1 bg-indigo-600 text-white rounded shadow text-sm">Login with Google</button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">{user.email}</div>
                <button onClick={handleLogout} className="px-2 py-1 border rounded text-sm">Logout</button>
              </div>
            )}
            <button onClick={()=>setShowYearOverview(v=>!v)} className="px-3 py-1 bg-white rounded shadow text-sm">Year Overview</button>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1">Local-first. When signed in, data is synced to your Firestore user document.</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          { showYearOverview && <YearOverview onSelectDate={onSelectDate} /> }
          <Calendar
            viewDate={viewDate}
            onChangeViewDate={setViewDate}
            onSelectDate={onSelectDate}
            selectedDate={selectedDate}
            reloadFlag={0}
            moodboards={moods}
          />
        </div>

        <div>
          <DayEditor
            dateStr={selectedDate}
            onSave={onSave}
            getExisting={()=> moods?.[selectedDate] ?? {}}
          />
        </div>
      </main>
    </div>
  )
}

function formatDate(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
