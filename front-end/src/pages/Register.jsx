import { useState } from 'react'
import api from '../api/api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
  role: 'USER',
  address: '',
  district: '',
  phoneNo: '',       // must be phoneNo
  pincode: '',       // must be pincode
  serviceType: '',   // old field kept for compatibility
  // provider service details
  serviceName: '',
  serviceDescription: '',
  pricingPerHour: '',
  serviceStatus: 'AVAILABLE',
  state: ''
});



  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    // client-side validation
    const phoneRe = /^\d{10}$/
    const pinRe = /^\d{6}$/
  // presence checks
  if(!form.name) { toast.error('Name is required'); return }
  if(!form.email) { toast.error('Email is required'); return }
  if(!form.password) { toast.error('Password is required'); return }
  if(form.role === 'USER' && !form.address) { toast.error('Address is required for users'); return }
    if (form.phoneNo && !phoneRe.test(form.phoneNo)) {
      toast.error('Phone number must be 10 digits')
      return
    }
    if (form.pincode && !pinRe.test(form.pincode)) {
      toast.error('Pincode must be 6 digits')
      return
    }
    if (form.role === 'PROVIDER') {
      if (!form.serviceType && !form.serviceName) { toast.error('Service name or type is required for providers'); return }
      if (!form.state) { toast.error('State is required for providers'); return }
      if (!form.pricingPerHour) { toast.error('Pricing per hour is required for providers'); return }
    }
    try {
      const payload = { ...form }
      if (form.role !== 'PROVIDER') {
        delete payload.serviceName
        delete payload.serviceDescription
        delete payload.pricingPerHour
        delete payload.serviceStatus
      }
      const res = await api.post('/api/users/register', payload)
      toast.success('Registered successfully!')
      login(res.data)
      if (res.data.role?.toUpperCase() === 'PROVIDER') navigate('/provider/dashboard')
      else navigate('/user/dashboard')
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Create Your Account
        </h2>

  <form onSubmit={submit} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              type="email"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              type="password"
              placeholder="Enter password"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">User</option>
              <option value="PROVIDER">Provider</option>
            </select>
          </div>

          {/* Other fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <input
              placeholder="Address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="border p-2 rounded-lg"
            />
            <input
              placeholder="District"
              value={form.district}
              onChange={e => setForm({ ...form, district: e.target.value })}
              className="border p-2 rounded-lg"
            />
            <input
              placeholder="Phone No"
              value={form.phoneNo}
              onChange={e => setForm({ ...form, phoneNo: e.target.value })}
              className="border p-2 rounded-lg"
              type="tel"
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={e => setForm({ ...form, pincode: e.target.value })}
              className="border p-2 rounded-lg"
            />
            {form.role === 'PROVIDER' && (
              <>
                <input
                  placeholder="Service Name (e.g. Electrician)"
                  value={form.serviceName}
                  onChange={e => setForm({ ...form, serviceName: e.target.value })}
                  className="border p-2 rounded-lg"
                  required
                />
                <input
                  placeholder="Service Type (optional)"
                  value={form.serviceType}
                  onChange={e => setForm({ ...form, serviceType: e.target.value })}
                  className="border p-2 rounded-lg"
                />
                <input
                  placeholder="Pricing per hour (INR)"
                  value={form.pricingPerHour}
                  onChange={e => setForm({ ...form, pricingPerHour: e.target.value })}
                  className="border p-2 rounded-lg"
                  type="number"
                  step="0.01"
                  required
                />
                <select
                  value={form.serviceStatus}
                  onChange={e => setForm({ ...form, serviceStatus: e.target.value })}
                  className="border p-2 rounded-lg"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="NOT_AVAILABLE">Not available</option>
                </select>
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="border p-2 rounded-lg"
                  required
                />
                <textarea
                  placeholder="Short service description"
                  value={form.serviceDescription}
                  onChange={e => setForm({ ...form, serviceDescription: e.target.value })}
                  className="border p-2 rounded-lg col-span-1 md:col-span-2"
                />
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-300 mt-4"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
