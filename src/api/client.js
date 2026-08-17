import axios from 'axios'

// Production REST calls must stay on the frontend origin. Vercel rewrites
// `/api` to the backend, which keeps the HTTP-only session cookie first-party.
const baseURL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api')

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
})

const technicalMessagePattern = /(?:Cast to|BSONError|ObjectId|Mongo(?:Server)?Error|ValidationError|E11000|ECONN|ENOTFOUND|Cannot (?:read|set) properties|is not defined|Unexpected token|Network Error|timeout of \d+ms)/i

function friendlyFallback(status) {
  if (!status) return 'We could not connect to FoundBack. Please check your connection and try again.'
  if (status === 400 || status === 422) return 'Please check the information you entered and try again.'
  if (status === 401) return 'Please sign in again to continue.'
  if (status === 403) return 'You do not have permission to complete this action.'
  if (status === 404) return 'We could not find the requested information.'
  if (status === 409) return 'This information already exists or was changed. Please refresh and try again.'
  if (status === 413) return 'The selected file is too large.'
  if (status >= 500) return 'Something went wrong. Please try again in a moment.'
  return 'We could not complete that action. Please try again.'
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const responseData = error.response?.data
    const normalized = responseData && typeof responseData === 'object' ? { ...responseData } : {}
    const serverMessage = typeof normalized.message === 'string' ? normalized.message.trim() : ''
    const mustHideDetails = status >= 500 || technicalMessagePattern.test(serverMessage || error.message || '')

    normalized.message = !mustHideDetails && serverMessage ? serverMessage : friendlyFallback(status)
    normalized.status = status
    delete normalized.stack
    return Promise.reject(normalized)
  },
)

export default api
