import React from 'react'
const MOODS = [
  {key:'happy', label:'😀 Happy'},
  {key:'neutral', label:'😐 Neutral'},
  {key:'sad', label:'😢 Sad'},
  {key:'angry', label:'😡 Angry'},
  {key:'tired', label:'😴 Tired'},
  {key:'motivated', label:'💪 Motivated'},
  {key:'loved', label:'😍 Loved'},
  {key:'focused', label:'🎯 Focused'},
]

export default function MoodPicker({ value, onChange, disabled }){
  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">Mood</div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map(m=>(
          <button key={m.key} onClick={()=>!disabled && onChange(m.key)}
            className={`px-3 py-2 rounded border ${value===m.key ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-white'}`}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
