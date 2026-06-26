import React, { useState, useEffect } from 'react'

export default function PitchModal({ lead, location, onClose }) {
  const [pitch, setPitch] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => { fetchPitch() }, [lead])

  async function fetchPitch() {
    setLoading(true)
    const prompt = `Write a short friendly cold outreach email (under 120 words) from a freelance web developer.
Business: ${lead.name}, ${lead.type}, ${lead.address}
Issue: ${lead.temp === 'hot' ? 'They have NO website at all' : 'Their website needs improvement'}
Signals: ${(lead.sigs || []).join(', ')}
Hook: ${lead.hook}
Rules: no generic opener, lead with their specific problem, one concrete benefit, soft CTA (free audit or 15-min call), warm and human not salesy, sign off as Alex (freelance web developer).`

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setPitch(data.text || 'Error generating pitch.')
    } catch {
      setPitch('Error generating pitch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function copyPitch() {
    navigator.clipboard.writeText(pitch).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 540 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{lead.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>{lead.address}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>✕</button>
        </div>
        <textarea
          value={loading ? 'Writing personalised pitch…' : pitch}
          onChange={e => setPitch(e.target.value)}
          rows={10}
          style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.65, resize: 'vertical', minHeight: 180 }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            onClick={copyPitch}
            disabled={loading}
            style={{ flex: 1, background: copied ? 'var(--green)' : 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, padding: 10, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button
            onClick={fetchPitch}
            disabled={loading}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, fontSize: 13, padding: '10px 14px', cursor: 'pointer' }}
          >
            ↺ Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}
