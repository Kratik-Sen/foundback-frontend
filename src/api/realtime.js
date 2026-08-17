import { io } from 'socket.io-client'

const isVercelProduction = import.meta.env.PROD
  && typeof window !== 'undefined'
  && window.location.hostname.endsWith('.vercel.app')

export function connectRealtime(options = {}) {
  // Vercel Functions do not keep a Socket.IO server alive. Pages use their
  // REST polling fallback in this deployment instead of retrying a 404 loop.
  if (isVercelProduction) return null
  return io(import.meta.env.VITE_SOCKET_URL || window.location.origin, options)
}
