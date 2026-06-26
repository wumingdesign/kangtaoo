import React from 'react'

const BADGE = {
  hot: { background: 'rgba(255,91,127,0.15)', color: '#FF5B7F', border: '1px solid rgba(255,91,127,0.3)' },
  warm: { background: 'rgba(255,179,71,0.15)', color: '#FFB347', border: '1px solid rgba(255,179,71,0.3)' },
  cold: { background: 'rgba(138,148,164,0.1)', color: '#8892A4', border: '1px solid rgba(138,148,164,0.2)' },
}
const TOP_BORDER = { hot: '#FF5B7F', warm: '#FFB347', cold: '#3A4460' }
const TEMP_LABEL = { hot: '🔥 Hot', warm: '◈ Warm', cold: '· Cold' }

export default function LeadCard({ lead, location, view, onPitch, onSkip }) {
  const isList = view === 'list'

  const websiteEl = lead.website === undefined
    ? <span style={{ color: 'var(--muted)', fontSize: 10 }}>Checking…</span>
    : lead.website
      ? <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>
          🌐 {lead.website.replace(/https?:\/\//, '').replace(/\/$/, '').slice(0, 36)}
        </a>
      : <span style={{ color: 'var(--red)' }}>🚫 No website</span>

  const metaBlock = (
    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.85, marginBottom: isList ? 0 : 8 }}>
      <span style={{ textTransform: 'capitalize' }}>{lead.type}</span><br />
      <a href={lead.mapsUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
        📍 {lead.address}
      </a><br />
      {lead.phone && <span>📞 {lead.phone}<br /></span>}
      {websiteEl}
      {lead.rating && <span><br />⭐ {lead.rating} · {lead.reviews || 0} reviews</span>}
    </div>
  )

  const sigsBlock = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: isList ? 0 : 8 }}>
      {(lead.sigs || []).map((s, i) => (
        <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{s}</span>
      ))}
    </div>
  )

  if (isList) {
    return (
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${TOP_BORDER[lead.temp] || '#3A4460'}`,
        borderRadius: 8, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(lead.name + ' ' + location)}`} target="_blank" rel="noreferrer"
              style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.25)', textDecoration: 'none' }}>
              🔍 Verify
            </a>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, ...BADGE[lead.temp] }}>{TEMP_LABEL[lead.temp]}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{lead.type}</div>
        </div>
        {metaBlock}
        {sigsBlock}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100 }}>
          <button onClick={onPitch} style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 700, padding: '7px', cursor: 'pointer' }}>
            Draft Pitch
          </button>
          <button onClick={onSkip} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 5, fontSize: 11, padding: '6px', cursor: 'pointer' }}>
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
      padding: 16, borderTop: `2px solid ${TOP_BORDER[lead.temp] || '#3A4460'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(lead.name + ' ' + location)}`} target="_blank" rel="noreferrer"
              style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.25)', textDecoration: 'none' }}>
              🔍 Verify
            </a>
          </div>
        </div>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0, ...BADGE[lead.temp] }}>
          {TEMP_LABEL[lead.temp]}
        </span>
      </div>
      {metaBlock}
      {sigsBlock}
      <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 12 }}>
        "{lead.hook}"
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onPitch} style={{ flex: 1, background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 700, padding: '7px', cursor: 'pointer' }}>
          Draft Pitch
        </button>
        <button onClick={onSkip} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 5, fontSize: 11, padding: '7px 10px', cursor: 'pointer' }}>
          Skip
        </button>
      </div>
    </div>
  )
}
