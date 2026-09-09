import React, { useState, useEffect, useRef } from 'react'

// In-memory cache so drafts don't reload every open
let _cache = null
let _cacheTime = 0
const CACHE_TTL = 30000 // 30 seconds

export function getUserId() {
  // Use authenticated userId from JWT if available
  const token = localStorage.getItem('kt_token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.userId) return payload.userId
    } catch(e) {}
  }
  // Fallback to anonymous userId for unauthenticated use
  let id = localStorage.getItem('kt_user_id')
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    localStorage.setItem('kt_user_id', id)
  }
  return id
}

export function getAuthHeaders() {
  const token = localStorage.getItem('kt_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export function createDraftId() {
  return 'draft_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

export async function saveDraft(draft) {
  const userId = getUserId()
  const res = await fetch(`/api/drafts?userId=${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...draft, userId }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || `Server error ${res.status}`)
  }
  // Invalidate cache so next open reloads
  _cache = null
  window.dispatchEvent(new CustomEvent('kt_draft_saved'))
  return res.json()
}

export async function deleteDraftApi(id) {
  const userId = getUserId()
  const res = await fetch(`/api/drafts?userId=${userId}&draftId=${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Failed to delete draft')
  _cache = null
  return res.json()
}

export async function loadDrafts(force = false) {
  if (!force && _cache && Date.now() - _cacheTime < CACHE_TTL) return _cache
  const userId = getUserId()
  const res = await fetch(`/api/drafts?userId=${userId}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Failed to load drafts')
  const data = await res.json()
  _cache = data.drafts || []
  _cacheTime = Date.now()
  return _cache
}

// Load a single draft with full image data
export async function loadFullDraft(draftId) {
  const userId = getUserId()
  const res = await fetch(`/api/drafts?userId=${userId}&draftId=${draftId}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Failed to load draft')
  const data = await res.json()
  return data.draft
}

const TEMP_COLORS = {
  hot: { background: 'rgba(255,91,127,0.15)', color: '#FF5B7F', border: '1px solid rgba(255,91,127,0.3)' },
  warm: { background: 'rgba(255,179,71,0.15)', color: '#FFB347', border: '1px solid rgba(255,179,71,0.3)' },
  cold: { background: 'rgba(138,148,164,0.1)', color: '#8892A4', border: '1px solid rgba(138,148,164,0.2)' },
}

function fmt(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}

function OpenDraftButton({ draft, onOpenDraft }) {
  const [loading, setLoading] = React.useState(false)

  async function handleOpen() {
    setLoading(true)
    try {
      // Load full draft with images from MongoDB
      const full = await loadFullDraft(draft.id)
      onOpenDraft(full || draft)
    } catch(e) {
      // Fallback to list version if full load fails
      onOpenDraft(draft)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleOpen} disabled={loading}
      style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, padding: '7px 14px', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, opacity: loading ? 0.7 : 1 }}>
      {loading ? (<><span style={{display:'inline-block',width:10,height:10,border:'2px solid rgba(0,0,0,0.3)',borderTopColor:'var(--bg)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/> Loading…</>) : '✏️ Open & Edit'}
    </button>
  )
}

export default function DraftsPanel({ onOpenDraft, onClose }) {
  const [drafts, setDrafts] = useState(_cache || [])
  const [loading, setLoading] = useState(!_cache)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchDrafts(false)
    const onSaved = () => fetchDrafts(true)
    window.addEventListener('kt_draft_saved', onSaved)
    return () => window.removeEventListener('kt_draft_saved', onSaved)
  }, [])

  async function fetchDrafts(force = false) {
    // If cache is fresh and not forced, just show cache
    if (!force && _cache && Date.now() - _cacheTime < CACHE_TTL) {
      setDrafts(_cache)
      setLoading(false)
      return
    }
    try {
      setError('')
      if (!_cache) setLoading(true)
      const data = await loadDrafts(force)
      setDrafts(data)
    } catch (e) {
      setError('Could not load drafts: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (confirmDelete === id) {
      setDeleting(id)
      try {
        await deleteDraftApi(id)
        const updated = drafts.filter(d => d.id !== id)
        setDrafts(updated)
        _cache = updated
      } catch (e) {
        setError('Delete failed: ' + e.message)
      } finally {
        setDeleting(null)
        setConfirmDelete(null)
      }
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  function copyHtml(draft) {
    navigator.clipboard.writeText(draft.htmlContent || '').then(() => {
      setCopied(draft.id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const filtered = drafts.filter(d =>
    !search ||
    d.lead?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.pitch?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, width: '100%', maxWidth: 900, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>📁 Saved Drafts</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {loading ? 'Loading…' : `${drafts.length} draft${drafts.length !== 1 ? 's' : ''} · synced to MongoDB`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => fetchDrafts(true)}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, fontSize: 11, padding: '5px 12px', cursor: 'pointer' }}>
              ↺ Refresh
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>✕</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by business name or pitch content…"
            style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '9px 14px', outline: 'none' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {error && (
            <div style={{ background: 'rgba(255,91,127,0.08)', border: '1px solid rgba(255,91,127,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', marginBottom: 14 }}>
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 13 }}>
              <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 200, margin: '0 auto 12px' }}>
                <div style={{ height: '100%', width: '35%', background: 'var(--cyan)', animation: 'sweep 1.3s ease-in-out infinite' }} />
              </div>
              Loading drafts…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 13 }}>
              {drafts.length === 0 ? (
                <><div style={{ fontSize: 32, marginBottom: 12 }}>📭</div><div>No drafts yet.</div><div style={{ fontSize: 11, marginTop: 6 }}>Save a pitch from the lead scanner to see it here.</div></>
              ) : <div>No drafts match "{search}"</div>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(draft => {
                const tc = TEMP_COLORS[draft.lead?.temp] || TEMP_COLORS.cold
                const isUpdated = draft.updatedAt && draft.updatedAt !== draft.savedAt
                return (
                  <div key={draft.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `3px solid ${tc.color}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{draft.lead?.name || 'Untitled'}</div>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, ...tc }}>
                          {draft.lead?.temp === 'hot' ? '🔥 Hot' : draft.lead?.temp === 'warm' ? '◈ Warm' : '· Cold'}
                        </span>
                        {draft.hasMockup && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.25)' }}>🖥 Mockup</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                        📍 {draft.lead?.address}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>🕐 Created: {fmt(draft.savedAt)}</span>
                        {isUpdated && <span style={{ color: 'var(--cyan)' }}>✏️ Updated: {fmt(draft.updatedAt)}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {draft.pitch?.slice(0, 160)}…
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <OpenDraftButton draft={draft} onOpenDraft={onOpenDraft} />
                      <button onClick={() => copyHtml(draft)}
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: copied === draft.id ? 'var(--green)' : 'var(--muted)', borderRadius: 6, fontSize: 11, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {copied === draft.id ? '✓ Copied!' : '📋 Copy HTML'}
                      </button>
                      <button onClick={() => handleDelete(draft.id)} disabled={deleting === draft.id}
                        style={{ background: 'transparent', border: `1px solid ${confirmDelete === draft.id ? 'var(--red)' : 'var(--border)'}`, color: confirmDelete === draft.id ? 'var(--red)' : 'var(--muted)', borderRadius: 6, fontSize: 11, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: deleting === draft.id ? 0.5 : 1 }}>
                        {deleting === draft.id ? 'Deleting…' : confirmDelete === draft.id ? '⚠ Confirm?' : '🗑 Delete'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {!loading && drafts.length > 0 && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>☁️ Synced to MongoDB · accessible from any device</div>
            <button onClick={async () => {
              if (window.confirm(`Delete all ${drafts.length} drafts? This cannot be undone.`)) {
                for (const d of drafts) await deleteDraftApi(d.id).catch(() => {})
                setDrafts([])
                _cache = []
              }
            }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, fontSize: 11, padding: '5px 12px', cursor: 'pointer' }}>
              🗑 Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
