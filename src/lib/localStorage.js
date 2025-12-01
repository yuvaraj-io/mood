const KEY = 'moodboards_v1'

export function getAllMoodboards(){
  try{
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  }catch(e){
    console.error(e)
    return {}
  }
}

export function getMoodboard(dateStr){
  const all = getAllMoodboards()
  return all[dateStr] || null
}

export function saveMoodboard(dateStr, data){
  const all = getAllMoodboards()
  all[dateStr] = {...data, lastUpdated: new Date().toISOString()}
  // Prune to last 5 years if needed
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 5)
  const keys = Object.keys(all).sort().reverse()
  const pruned = {}
  for(const k of keys){
    const dt = new Date(k)
    if(dt >= cutoff){
      pruned[k] = all[k]
    }
  }
  localStorage.setItem(KEY, JSON.stringify(pruned))
}
