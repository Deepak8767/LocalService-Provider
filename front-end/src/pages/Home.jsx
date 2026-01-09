import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api/api'
import background from '../assets/images/bag.webp'
import bookImg from '../assets/images/books.jpg'
import scheduleImg from '../assets/images/banner.png'
import relaxImg from '../assets/images/relax.jpeg'
import plumberImg from '../assets/images/background.jpg'
import electricianImg from '../assets/images/electrician.jpg'
import cleaningImg from '../assets/images/cleaning.jpg'
import featureImg from '../assets/images/abc.png' 

export default function Home() {
  const [services, setServices] = useState([])

  useEffect(() => {
    api.get('/api/services')
      .then(r => {
        const items = Array.isArray(r.data) ? r.data : (r.data.value || [])
        setServices(items.slice(0, 3))
      }).catch(e => {
        setServices([])
      })
  }, [])

  const getServiceImage = (serviceName) => {
    if (serviceName.toLowerCase().includes('plumber')) return plumberImg
    if (serviceName.toLowerCase().includes('electrician')) return electricianImg
    return cleaningImg
  }

  const steps = [
    { title: 'Book', desc: 'Select the service you need and request a professional near you.', img: bookImg },
    { title: 'Schedule', desc: 'Choose a convenient date and time for the provider to visit.', img: scheduleImg },
    { title: 'Relax', desc: 'Verified professionals will handle the job while you enjoy peace of mind.', img: relaxImg }
  ]

  return (
    <div className="container mx-auto px-4 py-12">

      {/* Hero Section */}
      <section
        className="bg-cover bg-center h-96 rounded-lg flex items-center justify-center shadow-lg relative"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="absolute inset-0 bg-white/60 rounded-lg"></div>

        <div className="relative text-center text-black p-6 rounded z-10">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-sm">
            Find Trusted Local Professionals
          </h1>
          <p className="mt-2 text-lg md:text-xl font-medium drop-shadow-sm">
            Quick bookings. Verified providers. Peace of mind.
          </p>
          <Link
            to="/services"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mt-16 text-center relative">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 w-72">
              <img
                src={step.img}
                alt={step.title}
                className="w-24 h-24 mx-auto rounded-full mb-4 object-cover border-4 border-blue-200"
              />
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-[-2rem] transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Features Section - Updated with Bigger Image */}
      <section id="features" className="py-16 bg-blue-50 mt-16 rounded-lg shadow-inner">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* Left Image - Bigger */}
            <div className="flex justify-center">
              <img
                src={featureImg}
                alt="Helpful Feature"
                className="rounded-2xl shadow-2xl w-full md:w-[90%] lg:w-[95%] xl:w-[100%] object-cover border-4 border-white"
              />
            </div>

            {/* Right Text */}
            <div>
              <ul className="space-y-6 text-gray-700">
                <li>
                  <h4 className="text-xl font-semibold">Quick Response Time</h4>
                  <p>We prioritize efficiency, ensuring you get a prompt response and quick resolution for your service requests.</p>
                </li>
                <li>
                  <h4 className="text-xl font-semibold">Wide Range of Services</h4>
                  <p>Whether it's plumbing, electrical, cleaning, or any other household need, we’ve got experts ready to help.</p>
                </li>
                <li>
                  <h4 className="text-xl font-semibold">Transparent Pricing</h4>
                  <p>No hidden fees! Get clear pricing upfront, so you always know what to expect.</p>
                </li>
                <li>
                  <h4 className="text-xl font-semibold">Real-Time Booking Updates</h4>
                  <p>Track your booking status and receive timely updates — stay informed at every step.</p>
                </li>
                <li>
                  <h4 className="text-xl font-semibold">Customer Satisfaction Guarantee</h4>
                  <p>If you’re not satisfied, we’ll make it right — ensuring your complete peace of mind.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Services Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-4 text-center">Our Services</h2>
        <p className="text-center text-gray-600 mb-8">Explore available services and providers.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.length === 0 && (
            <div className="col-span-1 md:col-span-3 text-center text-gray-600">
              No services available right now. Please check back later.
            </div>
          )}
          {services.map(s => (
            <div key={s.id} className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src={getServiceImage(s.serviceName)}
                alt={s.serviceName}
                className="w-24 h-24 mx-auto rounded-full mb-4 object-cover border-4 border-blue-200"
              />
              <h4 className="text-xl font-bold mb-2">{s.serviceName}</h4>
              <p className="text-gray-600">{s.description}</p>
              <Link
                to="/services"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition-all duration-300"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
