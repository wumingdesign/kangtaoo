import React, { useState, useEffect } from 'react'

// Generate or retrieve a persistent userId stored in localStorage
export function getUserId() {
  let id = localStorage.getItem('kt_user_id')
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    localStorage.setItem('kt_user_id', id)
  }
  return id
}

export function createDraftId() {
  return 'draft_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

export async function saveDraft(draft) {
  const userId = getUserId()
  const res = await fetch(`/api/drafts?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...draft, userId }),
  })
  if (!res.ok) throw new Error('Failed to save draft')
  window.dispatchEvent(new CustomEvent('kt_draft_saved'))
  return res.json()
}

export async function deleteDraftApi(id) {
  const userId = getUserId()
  const res = await fetch(`/api/drafts?userId=${userId}&draftId=${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete draft')
  return res.json()
}

export async function loadDrafts() {
  const userId = getUserId()
  const res = await fetch(`/api/drafts?userId=${userId}`)
  if (!res.ok) throw new Error('Failed to load drafts')
  const data = await res.json()
  return data.drafts || []
}

const TEMP_COLORS = {
  hot: { background: 'rgba(255,91,127,0.15)', color: '#FF5B7F', border: '1px solid rgba(255,91,127,0.3)' },
  warm: { background: 'rgba(255,179,71,0.15)', color: '#FFB347', border: '1px solid rgba(255,179,71,0.3)' },
  cold: { background: 'rgba(138,148,164,0.1)', color: '#8892A4', border: '1px solid rgba(138,148,164,0.2)' },
}

export default function DraftsPanel({ onOpenDraft, onClose }) {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchDrafts()
    const onSaved = () => fetchDrafts()
    window.addEventListener('kt_draft_saved', onSaved)
    return () => window.removeEventListener('kt_draft_saved', onSaved)
  }, [])

  async function fetchDrafts() {
    try {
      setError('')
      const data = await loadDrafts()
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
        setDrafts(prev => prev.filter(d => d.id !== id))
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

  const fmt = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' +
      d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
  }

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
            <button onClick={fetchDrafts} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, fontSize: 11, padding: '5px 12px', cursor: 'pointer' }}>
              ↺ Refresh
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>✕</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by business name or pitch content…"
            style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '9px 14px', outline: 'none' }}
          />
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
                <>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                  <div>No drafts yet.</div>
                  <div style={{ fontSize: 11, marginTop: 6 }}>Save a pitch from the lead scanner to see it here.</div>
                </>
              ) : (
                <div>No drafts match "{search}"</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(draft => {
                const tc = TEMP_COLORS[draft.lead?.temp] || TEMP_COLORS.cold
                return (
                  <div key={draft.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `3px solid ${tc.color}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{draft.lead?.name || 'Untitled'}</div>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, ...tc }}>
                          {draft.lead?.temp === 'hot' ? '🔥 Hot' : draft.lead?.temp === 'warm' ? '◈ Warm' : '· Cold'}
                        </span>
                        {draft.hasMockup && (
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.25)' }}>🖥 Mockup</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                        📍 {draft.lead?.address} · {fmt(draft.savedAt)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {draft.pitch?.slice(0, 160)}…
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => onOpenDraft(draft)}
                        style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        ✏️ Open & Edit
                      </button>
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

        {/* Footer */}
        {!loading && drafts.length > 0 && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>☁️ Drafts synced to MongoDB · accessible from any device</div>
          </div>
        )}
      </div>
    </div>
  )
}
