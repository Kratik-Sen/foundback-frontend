import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      return data.user
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    setUser(data.user)
    return data
  }
  const register = async (values) => {
    const payload = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'profileImage') {
        if (value?.[0]) payload.append(key, value[0])
      } else if (value !== undefined && value !== null) payload.append(key, value)
    })
    const { data } = await api.post('/auth/register', payload)
    setUser(data.user)
    return data
  }
  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, refresh, setUser }), [user, loading, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
