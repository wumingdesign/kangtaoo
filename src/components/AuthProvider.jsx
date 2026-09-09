import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kt_token')
    if (!token) { setLoading(false); return }
    // Verify token with server
    fetch('/api/auth?action=me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.userId) setUser({ ...data, token })
        else localStorage.removeItem('kt_token')
      })
      .catch(() => localStorage.removeItem('kt_token'))
      .finally(() => setLoading(false))
  }, [])

  function login(userData) {
    localStorage.setItem('kt_token', userData.token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('kt_token')
    setUser(null)
  }

  function getAuthHeader() {
    const token = localStorage.getItem('kt_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  )
}
