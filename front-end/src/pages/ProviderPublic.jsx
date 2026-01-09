import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { toast } from 'react-toastify'
import BookingForm from '../components/BookingForm'

export default function ProviderPublic() {
  const { id } = useParams()
  const { user } = useAuth()
  const [provider, setProvider] = useState(null)
  const [services, setServices] = useState([])
  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/api/users/${id}`).then(r => setProvider(r.data)).catch(() => setProvider(null))
    api.get('/api/services', { params: { providerId: id } }).then(r => setServices(Array.isArray(r.data) ? r.data : [])).catch(() => setServices([]))
    api.get(`/api/providers/${id}/rating`).then(r => setRating(r.data)).catch(() => setRating({ average: 0, count: 0 }))
    api.get(`/api/providers/${id}/reviews`).then(r => setReviews(Array.isArray(r.data) ? r.data : [])).catch(() => setReviews([]))
  }, [id])

  const submitReview = async () => {
    if (!user || !user.id) return toast.error('Please login to submit a review')
    try {
      const url = `/api/providers/${id}/reviews`
      const payload = { userId: user.id, rating: newRating, comment: newComment }
      const resp = await api.post(url, payload)
      toast.success('Review submitted')
      const r1 = await api.get(`/api/providers/${id}/reviews`)
      setReviews(Array.isArray(r1.data) ? r1.data : [])
      const r2 = await api.get(`/api/providers/${id}/rating`)
      setRating(r2.data)
      setNewComment('')
      setNewRating(5)
    } catch (e) {
      const status = e.response?.status
      const serverMsg = e.response?.data?.error || e.response?.data || e.message
      if (status) {
        toast.error(`Review failed (${status}): ${String(serverMsg)}`)
      } else {
        toast.error(String(serverMsg || 'Failed to submit review'))
      }
    }
  }

  if (!provider) return <div className="container mx-auto p-4">Provider not found</div>

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">{provider.name}</h2>
        <div className="text-sm text-gray-600 mb-4">{provider.email} • {provider.pincode}</div>
        <div className="mb-4">Average Rating: {rating.average ?? 0} ({rating.count ?? 0} reviews)
          <div className="inline-block ml-3 align-middle">{
            Array.from({length: 5}).map((_,i) => (
              <span key={i} className={`text-sm ${i < Math.round(rating.average) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
            ))
          }</div>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.length === 0 ? <div className="text-gray-500">No services</div> : services.map(s => (
            <div key={s.id} className="border rounded p-3 bg-gray-50">
              <div className="font-medium">{s.serviceName}</div>
              <div className="text-sm text-gray-700">{s.description}</div>
              <div className="text-sm mt-1">Price/hr: ₹{s.pricingPerHour}</div>
              <div className="mt-2">
                {user && user.role !== 'PROVIDER' ? (
                  <BookingForm service={s} onBooked={(b) => { toast.success('Booked successfully'); }} />
                ) : (
                  <div className="text-sm text-gray-500 mt-2">Login as a user to book this service.</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Reviews</h3>

        {user && user.role !== 'PROVIDER' && (
          <div className="border rounded p-3 mb-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <label className="font-medium">Your Rating:</label>
              <div>
                { [5,4,3,2,1].map(v => (
                  <button key={v} type="button" onClick={() => setNewRating(v)} className={`text-lg ${v <= newRating ? 'text-yellow-500' : 'text-gray-300'} px-1`}>{'★'}</button>
                )) }
              </div>
            </div>
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full border rounded p-2 mb-2" placeholder="Write your review (optional)" />
            <div className="flex gap-2">
              <button onClick={async () => {
                if (submittingReview) return
                setSubmittingReview(true)
                try {
                  await submitReview()
                } finally {
                  setSubmittingReview(false)
                }
              }} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              <button onClick={() => { setNewComment(''); setNewRating(5) }} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {reviews.length === 0 ? <div className="text-gray-500">No reviews yet.</div> : reviews.map(r => (
            <div key={r.id} className="border rounded p-3 bg-white">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">{r.user?.name}</div>
                <div className="text-sm text-gray-600">{r.rating} ★</div>
              </div>
              <div className="text-sm text-gray-700 mb-1">{r.comment}</div>
              <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
