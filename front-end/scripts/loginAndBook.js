import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:7373' })

async function run(){
  try{
    const loginRes = await api.post('/api/users/login', { email: 'testuser@example.com', password: 'password123' })
    const user = loginRes.data

    if(!user || !user.id){
      return
    }

    const bookingPayload = {
      userId: user.id,
      serviceId: 1,
      date: new Date().toISOString(),
      status: 'BOOKED',
      address: '123 Main St'
    }
    await api.post('/api/bookings', bookingPayload)
  }catch(e){
    // suppressed debug output
  }
}

run()
