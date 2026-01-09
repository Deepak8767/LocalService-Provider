import axios from 'axios'

axios.get('http://localhost:7373/api/services')
  .catch(() => {})
