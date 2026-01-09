import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { toast } from 'react-toastify'

export default function ProviderProfile() {
  const { user, login, normalizeAndLogin } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [address, setAddress] = useState(user?.address ?? '')
  const [district, setDistrict] = useState(user?.district ?? '')
  const [pincode, setPincode] = useState(user?.pincode ?? '')
  const [role] = useState(user?.role ?? 'PROVIDER')
  const [services, setServices] = useState([])
  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    district: user?.district ?? '',
    pincode: user?.pincode ?? ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!user || !user.id) return
    api
      .get('/api/services', { params: { providerId: user.id } })
      .then(r => setServices(Array.isArray(r.data) ? r.data : (r.data.value || [])))
      .catch(() => setServices([]))
    // load rating and reviews for this provider
    api.get(`/api/providers/${user.id}/rating`).then(r => setRating(r.data)).catch(() => setRating({ average: 0, count: 0 }))
    api.get(`/api/providers/${user.id}/reviews`).then(r => setReviews(Array.isArray(r.data) ? r.data : [])).catch(() => setReviews([]))
  }, [user])

  const save = async values => {
    setSaving(true)
    try {
      const vals = values ?? { name, email, phone, address, district, pincode, role }
      if (user && user.id) {
        try {
          await api.put(`/api/users/${user.id}`, {
            name: vals.name,
            email: vals.email,
            phoneNo: vals.phone,
            address: vals.address,
            district: vals.district,
            pincode: vals.pincode,
            role: vals.role
          })
          toast.success('Profile updated successfully!')
        } catch (e) {
          toast.error(e.response?.data || 'Failed to update profile')
          return
        }
      }
      const updated = { ...user, ...vals }
      if (typeof normalizeAndLogin === 'function') normalizeAndLogin(updated)
      else login(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-3xl font-bold mb-3">Provider Profile</h2>
        <p className="text-gray-600">You must be logged in to view your profile.</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">My Provider Profile</h2>

        {/* PASSWORD FORM */}
        <div className="flex justify-end mb-3">
          <button
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => setShowPasswordForm(s => !s)}
          >
            {showPasswordForm ? 'Hide Password Form' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <div className="border rounded-xl p-5 bg-gray-50 mb-6">
            <h3 className="text-lg font-semibold mb-3">Change Password</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Old Password</label>
                <input
                  type="password"
                  className="border rounded w-full p-2 mt-1"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  className="border rounded w-full p-2 mt-1"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  className="border rounded w-full p-2 mt-1"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={async () => {
                  if (!oldPassword || !newPassword) return toast.error('Please fill all fields')
                  if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
                  try {
                    await api.post(`/api/users/${user.id}/change-password`, { oldPassword, newPassword })
                    toast.success('Password changed successfully!')
                    setOldPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setShowPasswordForm(false)
                  } catch (e) {
                    toast.error(e.response?.data || 'Failed to change password')
                  }
                }}
              >
                Change Password
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* PROFILE DETAILS */}
        {!editing ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField label="Name" value={user.name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="Phone" value={user.phone ?? '—'} />
              <ProfileField label="Address" value={user.address ?? '—'} />
              <ProfileField label="District" value={user.district ?? '—'} />
              <ProfileField label="Pincode" value={user.pincode ?? '—'} />
              <ProfileField label="Role" value={user.role ?? 'PROVIDER'} />
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setDraft({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    district: user.district,
                    pincode: user.pincode
                  })
                  setEditing(true)
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium px-5 py-2 rounded-lg"
              >
                Edit Profile
              </button>
            </div>

            {/* SERVICES LIST */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">My Services</h3>
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-4 border rounded-lg">No services yet.</p>
              ) : (
                <div className="space-y-4">
                  {services.map(s => (
                    <div key={s.id} className="border rounded-xl p-4 bg-gray-50 shadow-sm">
                      <ServiceItem
                        service={s}
                        onUpdated={updated =>
                          setServices(list => list.map(x => (x.id === updated.id ? updated : x)))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* REVIEWS & RATING */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">Ratings & Reviews</h3>
              <div className="mb-4">
                <div className="text-lg font-medium">Average Rating: {rating.average ?? 0} ({rating.count ?? 0} reviews)
                  <div className="inline-block ml-3 align-middle">{
                    Array.from({length: 5}).map((_,i) => (
                      <span key={i} className={`text-sm ${i < Math.round(rating.average) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                    ))
                  }</div>
                </div>
              </div>

              {/* Review submission: only allow non-provider users to submit */}
              {user && user.role !== 'PROVIDER' && (
                <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Leave a review</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm">Rating:</label>
                    <div>
                      { [5,4,3,2,1].map(v => (
                        <button key={v} onClick={() => setNewRating(v)} className={`text-lg ${v <= newRating ? 'text-yellow-500' : 'text-gray-300'} px-1`}>{'★'}</button>
                      )) }
                    </div>
                  </div>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write your review" className="w-full border rounded p-2 mb-2" />
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      if (!user || !user.id) return toast.error('Please login to submit a review')
                      try {
                        await api.post(`/api/providers/${user.id}/reviews`, { userId: user.id, rating: newRating, comment: newComment })
                        toast.success('Review submitted')
                        // reload reviews and rating
                        const r1 = await api.get(`/api/providers/${user.id}/reviews`)
                        setReviews(Array.isArray(r1.data) ? r1.data : [])
                        const r2 = await api.get(`/api/providers/${user.id}/rating`)
                        setRating(r2.data)
                        setNewComment('')
                        setNewRating(5)
                      } catch (e) {
                        toast.error(e.response?.data?.error || 'Failed to submit review')
                      }
                    }} className="bg-blue-600 text-white px-3 py-1 rounded">Submit Review</button>
                    <button onClick={() => { setNewComment(''); setNewRating(5) }} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="border rounded p-3 bg-white">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium">{r.user?.name}</div>
                        <div className="text-sm text-gray-600">{r.rating} ★</div>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{r.comment}</div>
                      <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <EditProfileForm
            draft={draft}
            setDraft={setDraft}
            save={save}
            saving={saving}
            cancel={() => setEditing(false)}
            role={role}
            user={user}
          />
        )}
      </div>
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  )
}

function EditProfileForm({ draft, setDraft, save, saving, cancel, role }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {['name', 'email', 'phone', 'address', 'district', 'pincode'].map(field => (
        <div key={field}>
          <label className="text-sm font-medium capitalize">{field}</label>
          <input
            className="border rounded w-full p-2 mt-1"
            value={draft[field]}
            onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))}
          />
        </div>
      ))}
      <div>
        <label className="text-sm font-medium">Role</label>
        <input className="border rounded w-full p-2 bg-gray-100 mt-1" value={role} disabled />
      </div>
      <div className="flex justify-end mt-4 gap-3">
        <button
          onClick={() => save(draft)}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={cancel} className="bg-gray-200 px-5 py-2 rounded hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </div>
  )
}

function ServiceItem({ service, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    description: service.description ?? '',
    pricingPerHour: service.pricingPerHour ?? '',
    status: service.status ?? ''
  })

  const save = async () => {
    try {
      const res = await api.put(`/api/services/${service.id}`, draft)
      onUpdated(res.data || res)
      setEditing(false)
      toast.success('Service updated!')
    } catch (e) {
      toast.error(e.response?.data || 'Failed to update service')
    }
  }

  return (
    <div>
      <div className="text-lg font-semibold mb-1">{service.serviceName}</div>
      {!editing ? (
        <div className="space-y-1 text-sm text-gray-700">
          <p>{service.description}</p>
          <p>Pricing: ₹{service.pricingPerHour}</p>
          <p>Status: {service.status}</p>
          <button
            onClick={() => setEditing(true)}
            className="text-blue-600 hover:underline text-sm mt-2"
          >
            Edit Service
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium">Description</label>
            <input
              className="border rounded w-full p-1 mt-1"
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Pricing per hour (₹)</label>
            <input
              className="border rounded w-full p-1 mt-1"
              value={draft.pricingPerHour}
              onChange={e => setDraft(d => ({ ...d, pricingPerHour: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="border rounded w-full p-1 mt-1"
              value={draft.status}
              onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={save}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setDraft({
                  description: service.description ?? '',
                  pricingPerHour: service.pricingPerHour ?? '',
                  status: service.status ?? ''
                })
              }}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
