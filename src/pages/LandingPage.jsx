import React from 'react'

const S = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 40px', borderBottom: '1px solid var(--border)' },
  logo: { fontFamily: 'monospace', fontWeight: 700, fontSize: 20 },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  tag: { fontFamily: 'monospace', fontSize: 11, color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.4)', padding: '3px 10px', borderRadius: 3 },
  hero: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px' },
  eyebrow: { fontFamily: 'monospace', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  eyeLine: { width: 32, height: 1, background: 'var(--cyan)', opacity: 0.4 },
  h1: { fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 },
  h1Accent: { color: 'var(--cyan)' },
  sub: { color: 'var(--muted)', fontSize: 16, maxWidth: 500, lineHeight: 1.7, marginBottom: 40 },
  btnRow: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: { background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '13px 32px', cursor: 'pointer', transition: 'opacity 0.15s' },
  btnSecondary: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, padding: '13px 24px', cursor: 'pointer' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 900, margin: '60px auto 0', padding: '0 24px', width: '100%' },
  feat: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' },
  featIcon: { fontSize: 24, marginBottom: 10 },
  featTitle: { fontWeight: 600, fontSize: 14, marginBottom: 6 },
  featDesc: { fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 },
  footer: { textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', marginTop: 60 },
}

const FEATURES = [
  { icon: '📍', title: 'Real Google Places Data', desc: 'Pulls live business listings — real names, addresses, phone numbers and website status.' },
  { icon: '🔥', title: 'Hot Lead Detection', desc: 'Automatically flags businesses with no website. 7 out of 10 SMEs in Malaysia still lack one.' },
  { icon: '✍️', title: 'AI Pitch Writing', desc: 'One click generates a personalised cold email for each lead. No templates, no cringe.' },
  { icon: '📊', title: 'Up to 60 Results', desc: 'Fetches all available Google results across 3 pages so you never miss a potential client.' },
  { icon: '📋', title: 'Grid & List View', desc: 'Switch between card grid and compact list. Export all leads to CSV anytime.' },
  { icon: '🚀', title: 'More Coming Soon', desc: 'Lead tracker, saved lists, team sharing and subscription plans — all on the roadmap.' },
]

export default function LandingPage({ onStart }) {
  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>Kang<span style={{ color: 'var(--cyan)' }}>Taoo</span></div>
        <div style={S.navRight}>
          <div style={S.tag}>Beta v1.0</div>
          <button style={S.btnPrimary} onClick={onStart}>Launch App →</button>
        </div>
      </nav>

      <div style={S.hero}>
        <div style={S.eyebrow}>
          <span style={S.eyeLine} />
          Find your kangtao
          <span style={S.eyeLine} />
        </div>
        <h1 style={S.h1}>
          Find businesses that<br />
          <span style={S.h1Accent}>need your skills.</span>
        </h1>
        <p style={S.sub}>
          KangTaoo scans Google Places for real local businesses without a website —
          then writes the cold email for you. Built for Malaysian web developers.
        </p>
        <div style={S.btnRow}>
          <button style={S.btnPrimary} onClick={onStart}>Start Scanning Free →</button>
          <button style={S.btnSecondary} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
            See how it works
          </button>
        </div>
      </div>

      <div id="features" style={S.features}>
        {FEATURES.map(f => (
          <div key={f.title} style={S.feat} className="fade-in">
            <div style={S.featIcon}>{f.icon}</div>
            <div style={S.featTitle}>{f.title}</div>
            <div style={S.featDesc}>{f.desc}</div>
          </div>
        ))}
      </div>

      <footer style={S.footer}>
        © {new Date().getFullYear()} KangTaoo · Built for web developers in Malaysia 🇲🇾
      </footer>
    </div>
  )
}
