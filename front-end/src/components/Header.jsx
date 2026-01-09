import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api/api'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [services, setServices] = useState([])
  const [showServices, setShowServices] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    api.get('/api/services')
      .then(r => setServices(Array.isArray(r.data) ? r.data : (r.data.value || [])))
      .catch(() => {})
  }, [])

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center relative">

        {/* Logo */}
        <div className="text-2xl font-bold text-white tracking-wide hover:text-yellow-300 transition-all duration-300 cursor-pointer">
          Local Guardian
        </div>

        {/* Navigation */}
        <nav className="mt-3 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center relative">
          <button
            onClick={(e) => {
              e.preventDefault()
              // If admin is logged in, send them to the admin dashboard (pending providers view)
              if (user && String(user.role).toUpperCase() === 'ADMIN') {
                navigate('/admin/dashboard')
              } else {
                navigate('/')
              }
            }}
            className="text-white hover:text-yellow-300 transition-all duration-300 font-medium"
          >
            Home
          </button>

          {/* Services with hover panel */}
          <div 
            className="relative"
            onMouseEnter={() => setShowServices(true)}
            onMouseLeave={() => setShowServices(false)}
          >
            <span className="text-white hover:text-yellow-300 cursor-pointer transition-all duration-300 font-medium">Services ⬇</span>
            {showServices && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg p-4 z-50">
                {services.length > 0 ? services.map(s => (
                  <Link key={s.id} to="/services" className="block px-2 py-1 rounded hover:bg-blue-100 transition-all">
                    {s.serviceName}
                  </Link>
                )) : <p className="text-gray-500">No services available</p>}
              </div>
            )}
          </div>

          {!user && <Link to="/login" className="text-white hover:text-yellow-300 transition-all duration-300 font-medium">Login</Link>}
          {!user && <Link to="/register" className="text-white hover:text-yellow-300 transition-all duration-300 font-medium">Register</Link>}
          {user && (
            <div className="relative">
              <button onClick={()=>setShowMenu(s=>!s)} className="flex items-center gap-2 text-white font-medium px-3 py-1 rounded hover:bg-white/10 transition">
                <span>{user.name}</span>
                <span className="text-sm">▾</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg text-gray-800 p-2 z-50">
                  <Link to="/services" onClick={()=>setShowMenu(false)} className="block px-2 py-1 rounded hover:bg-gray-100">Services</Link>
                  {user.role !== 'ADMIN' && (
                    <Link to="/user/dashboard" onClick={()=>setShowMenu(false)} className="block px-2 py-1 rounded hover:bg-gray-100">My Bookings</Link>
                  )}
                  {user.role === 'PROVIDER' && <Link to="/provider/dashboard" onClick={()=>setShowMenu(false)} className="block px-2 py-1 rounded hover:bg-gray-100">Provider Bookings</Link>}
                  {user.role === 'PROVIDER' && <Link to="/provider/reviews" onClick={()=>setShowMenu(false)} className="block px-2 py-1 rounded hover:bg-gray-100">Reviews</Link>}
                  <Link to={user.role === 'PROVIDER' ? "/provider/profile" : "/user/profile"} onClick={()=>setShowMenu(false)} className="block px-2 py-1 rounded hover:bg-gray-100">Profile</Link>
                  <button onClick={() => { setShowMenu(false); handleLogout() }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
