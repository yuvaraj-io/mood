import React from 'react'
import { getAllMoodboards } from '../lib/localStorage'

export default function YearOverview({ onSelectDate }){
  const today = new Date()
  const thisYear = today.getFullYear()
  const years = []
  for(let i=thisYear; i>thisYear-5; i--) years.push(i)
  const all = getAllMoodboards()

  function monthPreview(year, month){
    const key = Object.keys(all).find(k=> k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
    return key ? all[key] : null
  }

  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <div className="text-sm text-slate-600 mb-2">Year Overview</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {years.map(y=>(
          <div key={y} className="border rounded p-2">
            <div className="font-medium mb-2">{y}</div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {Array.from({length:12}).map((_,m)=> {
                const preview = monthPreview(y,m)
                const filled = !!preview
                const key = `${y}-${String(m+1).padStart(2,'0')}-01`
                return <button key={key} onClick={()=> onSelectDate(preview ? Object.keys(getAllMoodboards()).find(k=>k.startsWith(`${y}-${String(m+1).padStart(2,'0')}`)) || `${y}-${String(m+1).padStart(2,'0')}-01` : `${y}-${String(m+1).padStart(2,'0')}-01`)}
                  className={`p-2 rounded border text-left ${filled ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <div className="text-xs font-medium">{new Date(y, m, 1).toLocaleString(undefined,{month:'short'})}</div>
                  <div className="text-xs text-slate-500">{filled ? 'Has' : '—'}</div>
                </button>
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
