import React from 'react'
import { AuthProvider, useAuth } from './components/AuthProvider'
import LandingPage from './pages/LandingPage'
import ScannerPage from './pages/ScannerPage'
import AuthPage from './pages/AuthPage'

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = React.useState('landing')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: 2, background: '#1E2A45', borderRadius: 2, overflow: 'hidden', maxWidth: 200, margin: '0 auto 12px' }}>
            <div style={{ height: '100%', width: '35%', background: '#00D4FF', animation: 'sweep 1.3s ease-in-out infinite' }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#00D4FF' }}>Loading KangTaoo…</div>
          <style>{`@keyframes sweep{0%{transform:translateX(-100%)}100%{transform:translateX(320%)}}`}</style>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    if (page === 'landing') return <LandingPage onStart={() => setPage('auth')} />
    return <AuthPage />
  }

  // Logged in → go straight to scanner
  return <ScannerPage onBack={() => setPage('landing')} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
