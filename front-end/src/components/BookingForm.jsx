import { useState } from 'react'
import api from '../api/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export default function BookingForm({ service, onBooked }){
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const { user } = useAuth()

  const submit = async e => {
    e.preventDefault()
    if(!user){ toast.error('Please login to book'); return }
    try{
      if(!service || !service.id){ toast.error('Invalid service selected'); return }
  const payload = { userId: user.id, serviceId: service.id, date: date || new Date().toISOString(), status: 'BOOKED', address, userNote: note }
      const res = await api.post('/api/bookings', payload)
      toast.success('Booking created')
      onBooked && onBooked(res.data)
    }catch(err){
      toast.error('Booking failed')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2 mt-2">
      <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Service address" className="w-full border p-2" />
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note for provider (optional)" className="w-full border p-2" rows={2} />
      <input value={date} onChange={e=>setDate(e.target.value)} type="datetime-local" className="w-full border p-2" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Book</button>
    </form>
  )
}
