import React from 'react'
export default function NotesEditor({ value, onChange, disabled }){
  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">Notes (optional)</div>
      <textarea value={value} onChange={(e)=>!disabled && onChange(e.target.value)}
        rows={6} maxLength={500}
        className="w-full p-2 border rounded bg-white"></textarea>
      <div className="text-xs text-slate-400 mt-1">{value.length}/500</div>
    </div>
  )
}
