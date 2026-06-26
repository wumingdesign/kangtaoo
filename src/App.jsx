import React, { useState } from 'react'
import LandingPage from './pages/LandingPage'
import ScannerPage from './pages/ScannerPage'

export default function App() {
  const [page, setPage] = useState('landing')

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {page === 'landing' && <LandingPage onStart={() => setPage('scanner')} />}
      {page === 'scanner' && <ScannerPage onBack={() => setPage('landing')} />}
    </div>
  )
}
