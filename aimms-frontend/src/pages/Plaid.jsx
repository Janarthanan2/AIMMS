import React, {useEffect, useState} from 'react'
import API from '../api'
export default function Plaid(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=> {
    let cancelled = false
    API.get('/plaid').then(res=>{ if(!cancelled) setItems(res.data || []) }).catch(()=>{}).finally(()=>{ if(!cancelled) setLoading(false) })
    return ()=> cancelled = true
  },[])
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Plaid</h2>
      {loading ? <div>Loading...</div> : (
        <div className="overflow-auto">
          <pre className="text-sm">{JSON.stringify(items,null,2)}</pre>
        </div>
      )}
    </div>
  )
}
