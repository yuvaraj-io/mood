import React, { useEffect, useState } from 'react'
import MoodPicker from './MoodPicker'
import ColorPicker from './ColorPicker'
import NotesEditor from './NotesEditor'

export default function DayEditor({ dateStr, onSave, getExisting }){
  const [mood, setMood] = useState('')
  const [color, setColor] = useState('#FFD54F')
  const [notes, setNotes] = useState('')
  const [disabled, setDisabled] = useState(false)

  useEffect(()=>{
    const parts = dateStr.split('-').map(Number)
    const d = new Date(parts[0], parts[1]-1, parts[2])
    const today = new Date()
    const td = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    setDisabled(d > td)
    const existing = getExisting()
    if(existing){
      setMood(existing.mood || '')
      setColor(existing.color || '#FFD54F')
      setNotes(existing.notes || '')
    } else {
      setMood('')
      setColor('#FFD54F')
      setNotes('')
    }
  },[dateStr, getExisting])

  function handleSave(){
    onSave(dateStr, { mood, color, notes })
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-slate-500">Editing</div>
          <div className="font-medium">{dateStr}</div>
        </div>
        <div className="text-sm text-slate-400">{disabled ? 'Future (locked)' : 'Editable'}</div>
      </div>

      <div className="space-y-4">
        <MoodPicker value={mood} onChange={setMood} disabled={disabled} />
        <ColorPicker value={color} onChange={setColor} disabled={disabled} />
        <NotesEditor value={notes} onChange={setNotes} disabled={disabled} />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={disabled} className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Save</button>
          <button onClick={()=>{ setMood(''); setNotes(''); setColor('#FFD54F') }} className="px-3 py-2 border rounded">Reset</button>
        </div>
      </div>
    </div>
  )
}
