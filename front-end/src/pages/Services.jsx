// Services.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import BookingForm from '../components/BookingForm'

export default function Services() {
  const [services, setServices] = useState([])
  const [q, setQ] = useState('')
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/services', {
        params: {
          q: q || undefined,
          pincode: pincode || undefined
        }
      })
      const items = Array.isArray(res.data) ? res.data : (res.data.value || [])
      setServices(items)
    } catch (err) {
      setError(err.message || 'Failed to load services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [q, pincode])

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && <div className="text-center py-4">Loading services...</div>}
      {error && <div className="text-red-600 text-center py-4">Error: {error}</div>}
      {!loading && !error && services.length === 0 && (
        <div className="text-center py-4 text-gray-600">No active providers found for the selected criteria</div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search service type"
          className="border p-2 rounded w-full max-w-md"
        />
        <input
          value={pincode}
          onChange={e => setPincode(e.target.value)}
          placeholder="Pincode"
          className="border p-2 rounded w-40"
        />
        <button
          onClick={() => { setLoading(true); api.get('/api/services', { params: { q: q || undefined, pincode: pincode || undefined } }).then(r=>setServices(Array.isArray(r.data)?r.data:(r.data.value||[]))).catch(()=>setServices([])).finally(()=>setLoading(false)) }}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {services.map(s => (
          <div key={s.id} className="border rounded-lg shadow-sm p-4 bg-white">
            <h3 className="font-bold text-lg mb-1">{s.serviceName}</h3>
            <p className="text-sm text-gray-700 mb-2">{s.description}</p>
            <div className="font-medium mb-1">Price/hr: ₹{s.pricingPerHour ?? '—'}</div>
            {s.provider && (
              <div className="text-sm text-gray-600 mb-3">Provider: <Link to={`/providers/${s.provider.id}`} className="text-blue-600 hover:underline">{s.provider.name}</Link> — {s.provider.pincode ?? 'pincode N/A'}</div>
            )}

            {/* BookingForm now only shows necessary booking inputs and a "View Details" option */}
            <BookingForm service={s} onBooked={(b) => {}} />
          </div>
        ))}
      </div>
    </div>
  )
}


