import { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { CalendarDays, MapPin, ClipboardList, User, FileText } from 'lucide-react'

export default function UserDashboard() {
  const [bookings, setBookings] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    api.get('/api/bookings', { params: { userId: user.id } })
      .then(r => {
        setBookings(Array.isArray(r.data) ? r.data : (r.data.value || []))
      })
      .catch(e => {
      })
  }, [user])

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => reject(false)
      document.body.appendChild(script)
    })
  }

  const payBooking = async (b) => {
    try {
      const ok = await loadRazorpayScript()
      if (!ok) { alert('Failed to load payment SDK'); return }
      // get order info from backend
      const r = await api.get(`/api/bookings/${b.id}/order`)
      const info = r.data
      if (!info || !info.orderId) { alert('Payment not available for this booking'); return }

      const options = {
        key: info.keyId || process.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round((info.amount || b.providerAmount || 0) * 100),
        currency: info.currency || 'INR',
        name: 'Local Guardian',
        description: `Payment for booking ${b.id}`,
        order_id: info.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(`/api/bookings/${b.id}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
            alert('Payment successful')
            const updated = await api.get('/api/bookings', { params: { userId: user.id } })
            setBookings(Array.isArray(updated.data) ? updated.data : (updated.data.value || []))
          } catch (e) {
            alert('Payment verification failed')
          }
        }
      }

      const rz = new window.Razorpay(options)
      rz.open()
    } catch (e) {
      alert('Payment initialization failed')
    }
  }
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">My Bookings</h2>
        <p className="text-gray-600 text-lg">
          You must be logged in to see your bookings.{' '}
          <a href="/login" className="text-blue-600 font-medium hover:underline">Login</a>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Bookings</h2>

        {bookings.length === 0 ? (
          <div className="text-center text-gray-600 bg-white py-12 rounded-2xl shadow-md">
            <ClipboardList className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="text-lg">You have no bookings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-lg text-gray-800">
                    {b.service?.serviceName}
                  </div>

                  {b.status === 'AWAITING_PAYMENT' && (b.providerAmount || b.providerAmount === 0) && (
                    <div className="mt-4">
                      <button onClick={() => payBooking(b)} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Pay ₹{b.providerAmount}
                      </button>
                    </div>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      b.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : b.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-blue-500" />
                    <span>Provider: {b.service?.provider?.name ?? '—'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-blue-500" />
                    <span>{new Date(b.date).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-500" />
                    <span>{b.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-blue-500" />
                    <span>Description: {b.service?.description ?? '—'}</span>
                  </div>

                  {b.providerNote && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-2">
                      <p className="text-sm text-blue-800">
                        <strong>Provider note:</strong> {b.providerNote}
                      </p>
                    </div>
                  )}
                  {b.userNote && (
                    <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded mt-2">
                      <p className="text-sm text-gray-800">
                        <strong>Your note:</strong> {b.userNote}
                      </p>
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
