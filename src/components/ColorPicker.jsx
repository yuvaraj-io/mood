import React from 'react'

const presets = ['#FFD54F','#FF8A80','#80D8FF','#A7FFEB','#CFD8DC','#B39DDB']

export default function ColorPicker({ value, onChange, disabled }){
  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">Highlight Color</div>
      <div className="flex items-center gap-3">
        {presets.map(c=>(
          <button key={c} onClick={()=>!disabled && onChange(c)}
            className="w-8 h-8 rounded-full border" style={{background:c}} aria-label={c}></button>
        ))}
        <input type="color" value={value} onChange={(e)=>!disabled && onChange(e.target.value)} className="ml-2"/>
      </div>
    </div>
  )
}
