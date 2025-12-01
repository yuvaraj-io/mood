import React from 'react'

export default function Calendar({ viewDate, onChangeViewDate, onSelectDate, selectedDate, moodboards }) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const today = new Date()

  const weeks = []
  let cells = []
  for(let i=0;i<startDay;i++) cells.push(null)
  for(let d=1; d<=daysInMonth; d++) cells.push(new Date(year, month, d))
  while(cells.length) weeks.push(cells.splice(0,7))

  const moodToEmoji = m => ({happy:'😀', neutral:'😐', sad:'😢', angry:'😡', tired:'😴', motivated:'💪', loved:'😍', focused:'🎯'})[m] || ''

  function isFuture(date){
    if(!date) return false
    const comp = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const td = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return comp > td
  }

  return (
    <div className="bg-white rounded shadow p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <button onClick={()=>onChangeViewDate(new Date(year, month-1, 1))} className="px-2">◀</button>
          <button onClick={()=>onChangeViewDate(new Date(year, month+1, 1))} className="px-2">▶</button>
        </div>
        <div className="font-medium">{viewDate.toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
        <div className="text-sm text-slate-500">Today: {today.toISOString().slice(0,10)}</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {['S','M','T','W','T','F','S'].map((x, index)=> <div key={index}>{x}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2">
        {weeks.map((week,wi)=> week.map((d,di)=>{
          const key = d ? d.toISOString().slice(0,10) : `empty-${wi}-${di}`
          const exists = d && moodboards && moodboards[key]
          const disabled = isFuture(d)
          const isSelected = key === selectedDate
          return (
            <button key={key}
              className={`p-2 h-20 border rounded text-left flex flex-col justify-between ${disabled ? 'bg-slate-100 opacity-60 cursor-not-allowed' : 'bg-white'} ${isSelected ? 'ring-2 ring-indigo-300' : ''}`}
              onClick={()=>{ if(!disabled && d) onSelectDate(key) }}
              disabled={disabled}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm">{d? d.getDate() : ''}</div>
                <div className="text-lg">{ exists ? moodToEmoji(moodboards[key].mood) : '' }</div>
              </div>

              <div className="flex justify-end">
                { exists && moodboards[key].color && <span className="w-3 h-3 rounded-full border" style={{background: moodboards[key].color}} /> }
              </div>

              <div className="text-[10px] text-slate-500">{ exists && moodboards[key].notes ? moodboards[key].notes.slice(0,20) + '...' : '' }</div>
            </button>
          )
        }))}
      </div>
    </div>
  )
}
