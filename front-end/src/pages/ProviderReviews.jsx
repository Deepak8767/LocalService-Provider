// ProviderReviews.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function ProviderReviews(){
  const { user } = useAuth()
  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('newest')

  useEffect(()=>{
    if(!user || !user.id) return
    let mounted = true
    const id = user.id
    setLoading(true)
    setError(null)

    Promise.all([
      api.get(`/api/providers/${id}/rating`).then(r=>r.data).catch(()=>({average:0,count:0})),
      api.get(`/api/providers/${id}/reviews`).then(r=>Array.isArray(r.data)?r.data:[]).catch(()=>[])
    ]).then(([rt, rv]) => {
      if(!mounted) return
      setRating(rt)
      setReviews(rv)
    }).catch(() => {
      if(!mounted) return
      setError('Failed to load reviews')
    }).finally(()=> mounted && setLoading(false))

    return ()=> mounted = false
  }, [user])

  const sorted = [...reviews].sort((a,b)=>{
    if(sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if(sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if(sort === 'highest') return b.rating - a.rating
    if(sort === 'lowest') return a.rating - b.rating
    return 0
  })

  if(!user) return <div className="container mx-auto p-6">Please login to view your reviews.</div>
  if(user.role !== 'PROVIDER') return <div className="container mx-auto p-6">Only providers can view this page.</div>

  return (
    <div className="container mx-auto p-6">
      <div className="bg-slate-50 p-6 rounded-lg shadow">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Reviews & Ratings</h2>
            <p className="text-sm text-slate-500">What customers said about your services</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{(rating.average || 0).toFixed(1)}</div>
              <div className="flex items-center justify-center mt-1">
                {Array.from({length:5}).map((_,i)=> (
                  <span key={i} className={`text-xl ${i < Math.round(rating.average) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <div className="text-sm text-slate-500 mt-1">{rating.count ?? 0} reviews</div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Sort</label>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({length:3}).map((_,i)=> (
              <div key={i} className="animate-pulse bg-white p-4 rounded shadow-sm" style={{minHeight:80}} />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="space-y-4">
            {sorted.length === 0 ? (
              <div className="text-slate-500">No reviews yet — encourage customers to share feedback after a job.</div>
            ) : sorted.map(r => (
              <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">{(r.user?.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{r.user?.name || 'Anonymous'}</div>
                      <div className="text-xs text-slate-400">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.createdAt))}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{r.rating} <span className="text-yellow-500">★</span></div>
                  </div>

                  <div className="mt-2 text-slate-700">{r.comment}</div>

                  {r.reply && (
                    <div className="mt-3 ml-0 p-3 bg-slate-50 border-l-4 border-slate-200 rounded">
                      <div className="text-xs text-slate-500">Your reply</div>
                      <div className="mt-1 text-sm text-slate-700">{r.reply}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
