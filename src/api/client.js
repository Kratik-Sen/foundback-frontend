import axios from 'axios'

// Production REST calls must stay on the frontend origin. Vercel rewrites
// `/api` to the backend, which keeps the HTTP-only session cookie first-party.
const baseURL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api')

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = error.response?.data || { message: error.message || 'Unable to reach FoundBack' }
    normalized.status = error.response?.status
    return Promise.reject(normalized)
  },
)

export default api
