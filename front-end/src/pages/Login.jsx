import { useState } from 'react'
import api from '../api/api'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login, normalizeAndLogin } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/users/login', { email, password })
      toast.success('Logged in successfully!')
      normalizeAndLogin(res.data)

      const role = (res.data.role || '').toUpperCase()
      if (role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (role === 'PROVIDER') {
        navigate('/provider/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data || 'Invalid email or password')
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 border border-gray-100">
        
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">Login to continue to <span className="font-semibold text-blue-600">Local Guardian</span></p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
