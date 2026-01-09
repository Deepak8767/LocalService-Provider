import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:7373',
})

export default api
