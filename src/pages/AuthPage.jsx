import React, { useState } from 'react'
import { useAuth } from '../components/AuthProvider'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function AuthPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/auth?action=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      login(data)
    } catch (e) {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleLogin() {
    setGoogleLoading(true)
    // Load Google Identity Services
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) { setError('Google login failed'); setGoogleLoading(false); return }
          try {
            const res = await fetch('/api/auth-google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ googleToken: response.access_token }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Google login failed'); return }
            login(data)
          } catch (e) {
            setError('Google login failed')
          } finally {
            setGoogleLoading(false)
          }
        },
      }).requestAccessToken()
    }
    script.onerror = () => { setError('Failed to load Google login'); setGoogleLoading(false) }
    document.head.appendChild(script)
  }

  const inp = {
    width: '100%', background: '#111827', border: '1px solid #1E2A45',
    borderRadius: 6, color: '#F0F4FF', fontFamily: 'inherit',
    fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
            Kang<span style={{ color: '#00D4FF' }}>Taoo</span>
          </div>
          <div style={{ fontSize: 13, color: '#8892A4' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#161D2E', border: '1px solid #1E2A45', borderRadius: 14, padding: 28 }}>

          {/* Google button */}
          <button onClick={handleGoogleLogin} disabled={googleLoading}
            style={{ width: '100%', background: '#fff', color: '#1a1a2e', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, padding: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, opacity: googleLoading ? 0.7 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#1E2A45' }}/>
            <span style={{ fontSize: 12, color: '#8892A4' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#1E2A45' }}/>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#8892A4', display: 'block', marginBottom: 6 }}>Name</label>
                <input style={inp} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#8892A4', display: 'block', marginBottom: 6 }}>Email</label>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#8892A4', display: 'block', marginBottom: 6 }}>Password</label>
              <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            {error && (
              <div style={{ background: 'rgba(255,91,127,0.08)', border: '1px solid rgba(255,91,127,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#FF5B7F', marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#00D4FF', color: '#0A0F1E', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8892A4' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              style={{ background: 'none', border: 'none', color: '#00D4FF', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#8892A4' }}>
          © {new Date().getFullYear()} KangTaoo · For web developers in Malaysia 🇲🇾
        </div>
      </div>
    </div>
  )
}
