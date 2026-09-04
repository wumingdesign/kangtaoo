import React, { useState, useEffect, useRef } from 'react'

const FONT_OPTIONS = [
  { label: 'Segoe UI (Default)', value: 'Segoe UI, Arial, sans-serif', google: null },
  { label: 'Inter', value: 'Inter, sans-serif', google: 'Inter:wght@400;500;700' },
  { label: 'Roboto', value: 'Roboto, sans-serif', google: 'Roboto:wght@400;500;700' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif', google: 'Montserrat:wght@400;500;700' },
  { label: 'Poppins', value: 'Poppins, sans-serif', google: 'Poppins:wght@400;500;700' },
  { label: 'Futura / Trebuchet', value: 'Trebuchet MS, sans-serif', google: null },
  { label: 'Avenir Next / Nunito', value: 'Nunito, sans-serif', google: 'Nunito:wght@400;500;700' },
  { label: 'Arial', value: 'Arial, sans-serif', google: null },
  { label: 'Georgia', value: 'Georgia, serif', google: null },
  { label: 'Times New Roman', value: 'Times New Roman, serif', google: null },
  { label: 'Verdana', value: 'Verdana, sans-serif', google: null },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif', google: null },
]

const DEFAULT_BRAND = {
  companyName: 'WuMing',
  tagline: 'Web Development',
  yourName: 'Alex',
  jobTitle: 'Web Developer',
  email: '',
  phone: '',
  whatsapp: '',
  location: 'Kuching, Sarawak',
  primaryColor: '#0A2540',
  accentColor: '#00D4FF',
  logo: null,
  logoSize: 64,
  logoAlign: 'left',
  buttonAlign: 'left',
  footerAlign: 'left',
  fontFamily: 'Segoe UI, Arial, sans-serif',
  fontWeight: '400',
  fontStyle: 'normal',
  fontSize: 15,
  fontColor: '#2d2d3a',
  fontAlign: 'left',
}

function getGoogleFontLink(fontFamily) {
  const found = FONT_OPTIONS.find(f => f.value === fontFamily)
  if (!found || !found.google) return ''
  return `<link href="https://fonts.googleapis.com/css2?family=${found.google}&display=swap" rel="stylesheet"/>`
}

function buildEmailHTML({ pitch, brand, lead, mockupSvg }) {
  const {
    companyName, tagline, yourName, jobTitle, email, phone,
    whatsapp, location: loc, primaryColor, accentColor, logo,
    logoSize = 64, logoAlign = 'left', buttonAlign = 'left', footerAlign = 'left',
    fontFamily = 'Segoe UI, Arial, sans-serif', fontWeight = '400',
    fontStyle = 'normal', fontSize = 15, fontColor = '#2d2d3a', fontAlign = 'left',
  } = brand

  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${yourName}, I'd like to learn more about your web development services.`)}`
    : null

  const paragraphs = pitch.split('\n').filter(p => p.trim())
  const googleFont = getGoogleFontLink(fontFamily)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
${googleFont}
<title>Email from ${companyName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:${fontFamily};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:${primaryColor};padding:28px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="${logoAlign}">
            ${logo
              ? `<img src="${logo}" alt="${companyName} logo" style="height:${logoSize}px;max-width:${logoSize * 3}px;object-fit:contain;display:inline-block;"/>`
              : `<div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${companyName}</div>`
            }
            ${tagline ? `<div style="font-size:12px;color:${accentColor};margin-top:4px;letter-spacing:0.08em;text-transform:uppercase;">${tagline}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Accent bar -->
  <tr><td style="height:3px;background:linear-gradient(90deg,${accentColor},${primaryColor});"></td></tr>

  ${mockupSvg ? `
  <!-- Hero Mockup Card -->
  <tr>
    <td style="padding:20px 36px 0;">
      <div style="border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.12);border:1px solid #e0e2e6;position:relative;">
        ${mockupSvg}
        <div style="position:absolute;bottom:0;left:0;right:0;height:40px;background:linear-gradient(transparent,#ffffff);"></div>
      </div>
      <p style="margin:8px 0 0;font-size:10px;color:#bbb;text-align:center;letter-spacing:0.05em;">WEBSITE CONCEPT PROPOSAL</p>
    </td>
  </tr>
  ` : ''}

  <!-- Body -->
  <tr>
    <td style="padding:${mockupSvg ? '24px' : '36px'} 36px 24px;">
      <p style="margin:0 0 8px;font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};font-style:${fontStyle};color:${fontColor};text-align:${fontAlign};">Hi there,</p>
      ${paragraphs.map((p, i) => {
        const formatted = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>')
        return `<p style="margin:${i === 0 ? '16px' : '12px'} 0 0;font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};font-style:${fontStyle};color:${fontColor};line-height:1.7;text-align:${fontAlign};">${formatted}</p>`
      }).join('')}

      <!-- CTA -->
      <table cellpadding="0" cellspacing="0" style="margin-top:28px;width:100%;">
        <tr>
          <td align="${buttonAlign}">
            ${waLink
              ? `<a href="${waLink}" style="display:inline-block;background:${accentColor};color:#0A0F1E;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;font-family:${fontFamily};">Chat on WhatsApp →</a>`
              : `<a href="mailto:${email}" style="display:inline-block;background:${accentColor};color:#0A0F1E;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;font-family:${fontFamily};">Get in Touch →</a>`
            }
          </td>
        </tr>
      </table>

      <p style="margin:28px 0 0;font-family:${fontFamily};font-size:${fontSize}px;color:#555;">Warm regards,</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#1a1a2e;font-family:${fontFamily};">${yourName}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#888;font-family:${fontFamily};">${jobTitle || 'Web Developer'}</p>
    </td>
  </tr>

  <tr><td style="padding:0 36px;"><hr style="border:none;border-top:1px solid #eee;margin:0;"/></td></tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 36px 28px;background:#fafbfc;">
      <p style="margin:0;font-size:12px;color:#999;line-height:1.6;text-align:${footerAlign};font-family:${fontFamily};">
        ${companyName} · ${loc}
        ${email ? ` · <a href="mailto:${email}" style="color:#999;">${email}</a>` : ''}
        ${phone ? ` · ${phone}` : ''}
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function buildMockupSvg({ lead, brand }) {
  const { accentColor = '#00D4FF', primaryColor = '#0A2540' } = brand
  const bizName = (lead.name || 'Your Business').toUpperCase()
  const bizType = lead.type || 'Professional Services'
  const addr = (lead.address || '').split(',')[0]

  // Generate a plausible nav and hero color scheme from brand
  const heroGrad = `${primaryColor}, ${accentColor}22`

  return `<svg width="600" height="280" viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
  <defs>
    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.15" />
    </linearGradient>
    <linearGradient id="fadeOut" x1="0" y1="0" x2="0" y2="1">
      <stop offset="60%" stop-color="white" stop-opacity="0"/>
      <stop offset="100%" stop-color="white" stop-opacity="1"/>
    </linearGradient>
    <clipPath id="roundClip"><rect width="600" height="280" rx="0"/></clipPath>
  </defs>

  <!-- Browser chrome -->
  <rect width="600" height="280" fill="#f0f2f5"/>
  <rect width="600" height="32" fill="#e0e2e6"/>
  <circle cx="16" cy="16" r="5" fill="#ff5f57"/>
  <circle cx="30" cy="16" r="5" fill="#febc2e"/>
  <circle cx="44" cy="16" r="5" fill="#28c840"/>
  <rect x="60" y="8" width="480" height="16" rx="8" fill="#fff" opacity="0.8"/>
  <text x="300" y="20" text-anchor="middle" font-size="9" fill="#999" font-family="Arial">www.${bizName.toLowerCase().replace(/[^a-z]/g,'')}.com.my</text>

  <!-- Website body -->
  <rect y="32" width="600" height="248" fill="#ffffff" clip-path="url(#roundClip)"/>

  <!-- Nav -->
  <rect y="32" width="600" height="44" fill="${primaryColor}"/>
  <text x="24" y="59" font-size="13" font-weight="700" fill="white" font-family="Arial">${bizName.slice(0,18)}</text>
  <text x="370" y="59" font-size="10" fill="rgba(255,255,255,0.7)" font-family="Arial">Home</text>
  <text x="415" y="59" font-size="10" fill="rgba(255,255,255,0.7)" font-family="Arial">About</text>
  <text x="460" y="59" font-size="10" fill="rgba(255,255,255,0.7)" font-family="Arial">Services</text>
  <rect x="510" y="48" width="70" height="20" rx="3" fill="${accentColor}"/>
  <text x="545" y="62" text-anchor="middle" font-size="9" font-weight="700" fill="${primaryColor}" font-family="Arial">Contact Us</text>

  <!-- Hero section -->
  <rect y="76" width="600" height="130" fill="url(#heroGrad)"/>

  <!-- Hero text -->
  <text x="36" y="112" font-size="20" font-weight="700" fill="white" font-family="Arial">${bizType}</text>
  <text x="36" y="134" font-size="20" font-weight="700" fill="${accentColor}" font-family="Arial">in Kuching, Sarawak</text>
  <text x="36" y="156" font-size="10" fill="rgba(255,255,255,0.75)" font-family="Arial">Professional · Trusted · Experienced</text>
  <rect x="36" y="168" width="110" height="26" rx="4" fill="${accentColor}"/>
  <text x="91" y="185" text-anchor="middle" font-size="10" font-weight="700" fill="${primaryColor}" font-family="Arial">Get Free Consultation</text>
  <rect x="156" y="168" width="90" height="26" rx="4" fill="transparent" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  <text x="201" y="185" text-anchor="middle" font-size="10" fill="white" font-family="Arial">Our Services →</text>

  <!-- Hero illustration (abstract shapes) -->
  <circle cx="480" cy="120" r="60" fill="${accentColor}" opacity="0.08"/>
  <circle cx="530" cy="95" r="35" fill="${accentColor}" opacity="0.12"/>
  <rect x="430" y="90" width="80" height="80" rx="8" fill="white" opacity="0.06"/>

  <!-- Services strip -->
  <rect y="206" width="600" height="74" fill="#f8f9fa"/>
  <text x="300" y="225" text-anchor="middle" font-size="9" fill="#999" font-family="Arial">OUR SERVICES</text>
  ${[['⚖', 'Legal Advice', 60], ['📋', 'Documentation', 180], ['🏛', 'Court Representation', 300], ['🤝', 'Consultation', 420], ['📞', 'Contact Us', 540]].map(([icon, label, x]) =>
    `<text x="${x}" y="248" text-anchor="middle" font-size="14">${icon}</text>
     <text x="${x}" y="264" text-anchor="middle" font-size="7" fill="#666" font-family="Arial">${label}</text>`
  ).join('')}

  <!-- Fade overlay -->
  <rect y="32" width="600" height="248" fill="url(#fadeOut)"/>


</svg>`
}

export default function PitchModal({ lead, location, onClose }) {
  const [pitch, setPitch] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('preview') // 'preview' | 'html' | 'text'
  const [showBrand, setShowBrand] = useState(true)
  const [showMockup, setShowMockup] = useState(true)
  const [mockupSvg, setMockupSvg] = useState('')
  const [generatingMockup, setGeneratingMockup] = useState(false)
  const [brand, setBrand] = useState(() => {
    try { return { ...DEFAULT_BRAND, ...JSON.parse(localStorage.getItem('kt_brand') || '{}') } }
    catch { return DEFAULT_BRAND }
  })
  const [copied, setCopied] = useState(false)
  const logoInputRef = useRef(null)

  useEffect(() => { fetchPitch() }, [lead])

  useEffect(() => {
    if (!loading && pitch) {
      const svg = showMockup ? buildMockupSvg({ lead, brand }) : ''
      setMockupSvg(svg)
      setHtmlContent(buildEmailHTML({ pitch, brand, lead, mockupSvg: svg }))
    }
  }, [pitch, loading])

  function saveBrand(updates) {
    const next = { ...brand, ...updates }
    setBrand(next)
    try { localStorage.setItem('kt_brand', JSON.stringify(next)) } catch {}
  }

  function applyAndPreview() {
    const svg = showMockup ? buildMockupSvg({ lead, brand }) : ''
    setMockupSvg(svg)
    setHtmlContent(buildEmailHTML({ pitch, brand, lead, mockupSvg: svg }))
  }

  function toggleMockup() {
    const next = !showMockup
    setShowMockup(next)
    const svg = next ? buildMockupSvg({ lead, brand }) : ''
    setMockupSvg(svg)
    setHtmlContent(buildEmailHTML({ pitch, brand, lead, mockupSvg: svg }))
  }

  async function fetchPitch() {
    setLoading(true)
    const prompt = `Write a short friendly cold outreach email body (under 120 words) from a web developer.
Business: ${lead.name}, ${lead.type}, ${lead.address}
Issue: ${lead.temp === 'hot' ? 'They have NO website at all' : 'Their website needs improvement'}
Signals: ${(lead.sigs || []).join(', ')}
Hook: ${lead.hook}
Rules: No greeting line. No sign-off. Lead with their specific problem. One concrete benefit. End with soft question leading to CTA. Warm, human, not salesy. 3-4 short paragraphs. Plain text only, no markdown.`
    try {
      const res = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setPitch(data.text?.trim() || 'Error generating pitch.')
    } catch { setPitch('Error generating pitch.') }
    finally { setLoading(false) }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => saveBrand({ logo: ev.target.result })
    reader.readAsDataURL(file)
  }

  function copyContent() {
    const text = activeTab === 'text' ? pitch : htmlContent
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const tabBtn = (t, label) => (
    <button key={t} onClick={() => setActiveTab(t)} style={{
      background: activeTab === t ? '#1E2A45' : 'transparent',
      color: activeTab === t ? 'var(--cyan)' : 'var(--muted)',
      border: 'none', padding: '7px 16px', cursor: 'pointer', fontSize: 12,
      borderRadius: 5, transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  const fieldStyle = {
    width: '100%', background: '#111827', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', fontFamily: 'inherit',
    fontSize: 12, padding: '7px 10px', outline: 'none', marginTop: 4,
  }

  const sectionLabel = (txt) => (
    <div style={{ fontSize: 10, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid var(--border)' }}>{txt}</div>
  )

  const alignToggle = (key, label) => (
    <div>
      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', gap: 3 }}>
        {['left','center','right'].map(a => (
          <button key={a} onClick={() => saveBrand({ [key]: a })} style={{
            flex: 1, padding: '5px 0', fontSize: 10, borderRadius: 4, cursor: 'pointer', border: '1px solid',
            background: brand[key] === a ? 'var(--cyan)' : 'var(--bg2)',
            color: brand[key] === a ? 'var(--bg)' : 'var(--muted)',
            borderColor: brand[key] === a ? 'var(--cyan)' : 'var(--border)',
          }}>{a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, width: '100%', maxWidth: showBrand ? 1300 : 860, maxHeight: '96vh', display: 'flex', flexDirection: 'column', transition: 'max-width 0.25s' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px 0' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{lead.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{lead.address}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setShowBrand(v => !v)} style={{ fontSize: 11, padding: '5px 12px', background: showBrand ? 'var(--cyan)' : 'var(--bg2)', color: showBrand ? 'var(--bg)' : 'var(--muted)', border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer' }}>
              🎨 {showBrand ? 'Hide Brand' : 'Show Brand'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>✕</button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 2, padding: '10px 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg2)', borderRadius: 6, padding: 3 }}>
            {tabBtn('preview', '👁 Preview')}
            {tabBtn('html', '</> HTML')}
            {tabBtn('text', '📝 Plain Text')}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={showMockup} onChange={toggleMockup} style={{ accentColor: 'var(--cyan)' }} />
              Show website mockup
            </label>
            <button onClick={applyAndPreview} style={{ fontSize: 11, color: 'var(--cyan)', background: 'transparent', border: '1px solid rgba(0,212,255,0.35)', borderRadius: 5, padding: '5px 12px', cursor: 'pointer' }}>
              ↺ Apply & Refresh
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 0 }}>

          {/* Left — preview/html/text */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 13 }}>
                <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 200, margin: '0 auto 12px' }}>
                  <div style={{ height: '100%', width: '35%', background: 'var(--cyan)', animation: 'sweep 1.3s ease-in-out infinite' }} />
                </div>
                Writing personalised pitch…
              </div>
            ) : activeTab === 'preview' ? (
              <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                <iframe srcDoc={htmlContent} style={{ width: '100%', height: 680, border: 'none' }} title="Email preview" />
              </div>
            ) : activeTab === 'html' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Edit HTML — changes show in Preview after Apply & Refresh</div>
                  <button onClick={applyAndPreview} style={{ fontSize: 11, color: 'var(--cyan)', background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>↺ Reset</button>
                </div>
                <textarea value={htmlContent} onChange={e => setHtmlContent(e.target.value)}
                  style={{ width: '100%', height: 580, fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5, background: '#111827', border: '1px solid var(--border)', borderRadius: 6, color: '#F0F4FF', padding: 12, resize: 'vertical', outline: 'none' }} />
              </div>
            ) : (
              <textarea value={pitch} onChange={e => setPitch(e.target.value)}
                style={{ width: '100%', height: 580, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.65, background: '#111827', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: 12, resize: 'vertical', outline: 'none' }} />
            )}
          </div>

          {/* Right — Brand panel */}
          {showBrand && (
            <div style={{ width: 320, borderLeft: '1px solid var(--border)', overflow: 'auto', padding: '16px', flexShrink: 0, background: '#0D1424' }}>

              {sectionLabel('Company Logo')}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {brand.logo
                  ? <img src={brand.logo} alt="logo" style={{ height: 40, maxWidth: 100, objectFit: 'contain', background: brand.primaryColor, padding: 6, borderRadius: 5 }} />
                  : <div style={{ width: 60, height: 40, background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--muted)' }}>No logo</div>
                }
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={() => logoInputRef.current?.click()} style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, padding: '5px 10px', cursor: 'pointer' }}>Upload</button>
                  {brand.logo && <button onClick={() => saveBrand({ logo: null })} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 5, fontSize: 10, padding: '4px 8px', cursor: 'pointer' }}>Remove</button>}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </div>
              {brand.logo && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Logo Size — <span style={{ color: 'var(--cyan)' }}>{brand.logoSize || 64}px</span></div>
                  <input type="range" min="32" max="160" value={brand.logoSize || 64} onChange={e => saveBrand({ logoSize: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                </div>
              )}

              {sectionLabel('Alignment')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                {alignToggle('logoAlign', 'Logo')}
                {alignToggle('buttonAlign', 'Button')}
                {alignToggle('footerAlign', 'Footer')}
              </div>

              {sectionLabel('Brand Info')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {[
                  ['Company Name', 'companyName', 'WuMing'],
                  ['Tagline', 'tagline', 'Web Development'],
                  ['Your Name', 'yourName', 'Alex'],
                  ['Job Title', 'jobTitle', 'Web Developer'],
                  ['Location', 'location', 'Kuching, Sarawak'],
                  ['Email', 'email', 'you@email.com'],
                  ['Phone', 'phone', '016-123 4567'],
                  ['WhatsApp', 'whatsapp', '60161234567'],
                ].map(([label, key, ph]) => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <input style={fieldStyle} value={brand[key] || ''} placeholder={ph} onChange={e => saveBrand({ [key]: e.target.value })} />
                  </div>
                ))}
              </div>

              {sectionLabel('Typography')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Font Family</div>
                  <select style={{ ...fieldStyle }} value={brand.fontFamily} onChange={e => saveBrand({ fontFamily: e.target.value })}>
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Font Size — <span style={{ color: 'var(--cyan)' }}>{brand.fontSize || 15}px</span></div>
                  <input type="range" min="12" max="20" value={brand.fontSize || 15} onChange={e => saveBrand({ fontSize: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--cyan)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Font Weight</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[['300','Light'],['400','Regular'],['500','Medium'],['700','Bold']].map(([val, lbl]) => (
                      <button key={val} onClick={() => saveBrand({ fontWeight: val })} style={{ flex: 1, padding: '5px 2px', fontSize: 10, fontWeight: val, borderRadius: 4, cursor: 'pointer', border: '1px solid',
                        background: (brand.fontWeight || '400') === val ? 'var(--cyan)' : 'var(--bg2)',
                        color: (brand.fontWeight || '400') === val ? 'var(--bg)' : 'var(--muted)',
                        borderColor: (brand.fontWeight || '400') === val ? 'var(--cyan)' : 'var(--border)',
                      }}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Font Style</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[['normal','Normal'],['italic','Italic']].map(([val, lbl]) => (
                      <button key={val} onClick={() => saveBrand({ fontStyle: val })} style={{ flex: 1, padding: '5px 2px', fontSize: 10, fontStyle: val, borderRadius: 4, cursor: 'pointer', border: '1px solid',
                        background: (brand.fontStyle || 'normal') === val ? 'var(--cyan)' : 'var(--bg2)',
                        color: (brand.fontStyle || 'normal') === val ? 'var(--bg)' : 'var(--muted)',
                        borderColor: (brand.fontStyle || 'normal') === val ? 'var(--cyan)' : 'var(--border)',
                      }}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Font Color</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input type="color" value={brand.fontColor || '#2d2d3a'} onChange={e => saveBrand({ fontColor: e.target.value })} style={{ width: 34, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
                    <input style={{ ...fieldStyle, marginTop: 0, flex: 1 }} value={brand.fontColor || '#2d2d3a'} onChange={e => saveBrand({ fontColor: e.target.value })} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Text Alignment</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[['left','⬅ Left'],['center','↔ Center'],['right','Right ➡'],['justify','⇔ Justify']].map(([val, lbl]) => (
                      <button key={val} onClick={() => saveBrand({ fontAlign: val })} style={{
                        flex: 1, padding: '5px 2px', fontSize: 9, borderRadius: 4, cursor: 'pointer', border: '1px solid',
                        background: (brand.fontAlign || 'left') === val ? 'var(--cyan)' : 'var(--bg2)',
                        color: (brand.fontAlign || 'left') === val ? 'var(--bg)' : 'var(--muted)',
                        borderColor: (brand.fontAlign || 'left') === val ? 'var(--cyan)' : 'var(--border)',
                      }}>{lbl}</button>
                    ))}
                  </div>
                </div>
              </div>

              {sectionLabel('Colors')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[['Header Color', 'primaryColor'], ['Accent Color', 'accentColor']].map(([label, key]) => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <input type="color" value={brand[key]} onChange={e => saveBrand({ [key]: e.target.value })} style={{ width: 34, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
                      <input style={{ ...fieldStyle, marginTop: 0, flex: 1 }} value={brand[key]} onChange={e => saveBrand({ [key]: e.target.value })} />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={applyAndPreview} style={{ width: '100%', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, padding: '10px', cursor: 'pointer' }}>
                ↺ Apply & Preview
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: 8, borderTop: '1px solid var(--border)' }}>
          <button onClick={copyContent} disabled={loading}
            style={{ flex: 1, background: copied ? 'var(--green)' : 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, padding: 10, cursor: 'pointer', transition: 'background 0.2s' }}>
            {copied ? '✓ Copied!' : activeTab === 'text' ? 'Copy Plain Text' : 'Copy HTML'}
          </button>
          <button onClick={fetchPitch} disabled={loading}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, fontSize: 13, padding: '10px 16px', cursor: 'pointer' }}>
            ↺ Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}
