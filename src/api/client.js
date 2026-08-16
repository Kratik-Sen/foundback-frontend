import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
