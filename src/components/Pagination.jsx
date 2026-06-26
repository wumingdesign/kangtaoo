import React from 'react'

export default function Pagination({ currentPage, totalPages, total, perPage, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push({ type: 'page', num: i })
    } else if (Math.abs(i - currentPage) === 2) {
      pages.push({ type: 'ellipsis', num: i })
    }
  }

  const from = (currentPage - 1) * perPage + 1
  const to = Math.min(currentPage * perPage, total)

  const btnStyle = (active) => ({
    background: active ? 'var(--cyan)' : 'var(--card)',
    color: active ? 'var(--bg)' : 'var(--muted)',
    border: `1px solid ${active ? 'var(--cyan)' : 'var(--border)'}`,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    padding: '7px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' }}>
      <button style={btnStyle(false)} disabled={currentPage <= 1} onClick={() => onChange(currentPage - 1)}>← Prev</button>
      {pages.map((p, i) =>
        p.type === 'ellipsis'
          ? <span key={i} style={{ fontSize: 12, color: 'var(--muted)', padding: '0 4px' }}>…</span>
          : <button key={p.num} style={btnStyle(p.num === currentPage)} onClick={() => onChange(p.num)}>{p.num}</button>
      )}
      <button style={btnStyle(false)} disabled={currentPage >= totalPages} onClick={() => onChange(currentPage + 1)}>Next →</button>
      <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{from}–{to} of {total}</span>
    </div>
  )
}
