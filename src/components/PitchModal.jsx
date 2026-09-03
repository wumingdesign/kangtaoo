import React, { useState, useEffect, useRef } from 'react'

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
  logoAlign: 'left',
  buttonAlign: 'left',
  footerAlign: 'left',
}

function buildEmailHTML({ pitch, brand, lead }) {
  const {
    companyName, tagline, yourName, jobTitle, email, phone,
    whatsapp, location: loc, primaryColor, accentColor, logo,
    logoAlign = 'left', buttonAlign = 'left', footerAlign = 'left',
  } = brand

  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${yourName}, I'd like to learn more about your web development services.`)}`
    : null

  const paragraphs = pitch.split('\n').filter(p => p.trim())

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Email from ${companyName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
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
              ? `<img src="${logo}" alt="${companyName} logo" style="height:48px;max-width:160px;object-fit:contain;display:block;"/>`
              : `<div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${companyName}</div>`
            }
            ${tagline ? `<div style="font-size:12px;color:${accentColor};margin-top:4px;letter-spacing:0.05em;text-transform:uppercase;">${tagline}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Accent bar -->
  <tr><td style="height:3px;background:linear-gradient(90deg,${accentColor},${primaryColor});"></td></tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 36px 24px;">
      <p style="margin:0 0 8px;font-size:15px;color:#1a1a2e;">Hi there,</p>
      ${paragraphs.map((p, i) => {
        // Bold key phrases
        const formatted = p
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em>$1</em>')
        return `<p style="margin:${i === 0 ? '16px' : '12px'} 0 0;font-size:15px;color:#2d2d3a;line-height:1.7;">${formatted}</p>`
      }).join('')}

      <!-- CTA -->
      <table cellpadding="0" cellspacing="0" style="margin-top:28px;width:100%;">
        <tr>
          <td align="${buttonAlign}">
            ${waLink
              ? `<a href="${waLink}" style="display:inline-block;background:${accentColor};color:#0A0F1E;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;">Chat on WhatsApp →</a>`
              : `<a href="mailto:${email}" style="display:inline-block;background:${accentColor};color:#0A0F1E;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;">Get in Touch →</a>`
            }
          </td>
        </tr>
      </table>

      <!-- Sign off -->
      <p style="margin:28px 0 0;font-size:14px;color:#555;">Warm regards,</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#1a1a2e;">${yourName}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#888;">${brand.jobTitle || 'Web Developer'}</p>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding:0 36px;"><hr style="border:none;border-top:1px solid #eee;margin:0;"/></td></tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 36px 28px;background:#fafbfc;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:#999;line-height:1.6;text-align:${footerAlign};">
            ${companyName} · ${loc}
            ${email ? ` · <a href="mailto:${email}" style="color:#999;">${email}</a>` : ''}
            ${phone ? ` · ${phone}` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export default function PitchModal({ lead, location, onClose }) {
  const [pitch, setPitch] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('preview') // 'preview' | 'html' | 'text' | 'brand'
  const [brand, setBrand] = useState(() => {
    try { return { ...DEFAULT_BRAND, ...JSON.parse(localStorage.getItem('kt_brand') || '{}') } }
    catch { return DEFAULT_BRAND }
  })
  const [copied, setCopied] = useState(false)
  const logoInputRef = useRef(null)

  useEffect(() => { fetchPitch() }, [lead])
  // Only auto-build HTML when pitch is freshly generated, NOT on brand changes
  // Brand tab has a live "Apply brand" button to avoid overwriting user edits
  useEffect(() => {
    if (!loading && pitch) setHtmlContent(buildEmailHTML({ pitch, brand, lead }))
  }, [pitch, loading])

  function saveBrand(updates) {
    const next = { ...brand, ...updates }
    setBrand(next)
    try { localStorage.setItem('kt_brand', JSON.stringify(next)) } catch {}
  }

  async function fetchPitch() {
    setLoading(true)
    const prompt = `Write a short friendly cold outreach email body (under 120 words) from a freelance web developer.
Business: ${lead.name}, ${lead.type}, ${lead.address}
Issue: ${lead.temp === 'hot' ? 'They have NO website at all' : 'Their website needs improvement'}
Signals: ${(lead.sigs || []).join(', ')}
Hook: ${lead.hook}
Rules:
- No greeting line (we add that separately)
- No sign-off (we add that separately)
- Lead with their specific problem
- One concrete benefit
- End with a soft question leading to CTA
- Warm, human, not salesy
- 3-4 short paragraphs max
- Plain text only, no markdown`

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setPitch(data.text?.trim() || 'Error generating pitch.')
      setHtmlContent('') // will rebuild via useEffect
    } catch {
      setPitch('Error generating pitch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => saveBrand({ logo: ev.target.result })
    reader.readAsDataURL(file)
  }

  function copyContent() {
    const text = tab === 'text' ? pitch : htmlContent
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }


  const tabStyle = (t) => ({
    background: tab === t ? 'var(--border)' : 'transparent',
    color: tab === t ? 'var(--cyan)' : 'var(--muted)',
    border: 'none',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 12,
    borderRadius: 4,
    transition: 'all 0.15s',
  })

  const fieldStyle = {
    width: '100%',
    background: '#111827',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text)',
    fontFamily: 'inherit',
    fontSize: 12,
    padding: '7px 10px',
    outline: 'none',
    marginTop: 4,
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
    >
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, width: '100%', maxWidth: 1000, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>

        {/* Modal header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px 0' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{lead.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{lead.address}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '14px 24px 0', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          {[['preview', '👁 Preview'], ['html', '</> HTML'], ['text', '📝 Plain Text'], ['brand', '🎨 Brand']].map(([t, label]) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 13 }}>
              <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 200, margin: '0 auto 12px' }}>
                <div style={{ height: '100%', width: '35%', background: 'var(--cyan)', animation: 'sweep 1.3s ease-in-out infinite' }} />
              </div>
              Writing personalised pitch…
            </div>
          ) : tab === 'preview' ? (
            <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
              <iframe
                srcDoc={htmlContent}
                style={{ width: '100%', height: 640, border: 'none', borderRadius: 8 }}
                title="Email preview"
              />
            </div>
          ) : tab === 'html' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Edit HTML directly — changes show in Preview tab</div>
                <button onClick={() => setHtmlContent(buildEmailHTML({ pitch, brand, lead }))}
                  style={{ fontSize: 11, color: 'var(--cyan)', background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
                  ↺ Reset
                </button>
              </div>
              <textarea
                value={htmlContent}
                onChange={e => setHtmlContent(e.target.value)}
                style={{ width: '100%', height: 540, fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5, background: '#111827', border: '1px solid var(--border)', borderRadius: 6, color: '#F0F4FF', padding: 12, resize: 'vertical', outline: 'none' }}
              />
            </div>
          ) : tab === 'text' ? (
            <textarea
              value={pitch}
              onChange={e => setPitch(e.target.value)}
              style={{ width: '100%', height: 300, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.65, background: '#111827', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: 12, resize: 'vertical' }}
            />
          ) : (
            /* Brand settings */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Logo upload */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Company Logo</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {brand.logo
                    ? <img src={brand.logo} alt="logo" style={{ height: 48, maxWidth: 160, objectFit: 'contain', background: brand.primaryColor, padding: 8, borderRadius: 6 }} />
                    : <div style={{ width: 80, height: 48, background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--muted)' }}>No logo</div>
                  }
                  <div>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer' }}
                    >
                      Upload Logo
                    </button>
                    {brand.logo && (
                      <button
                        onClick={() => saveBrand({ logo: null })}
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, fontSize: 12, padding: '7px 12px', cursor: 'pointer', marginLeft: 8 }}
                      >
                        Remove
                      </button>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>PNG or JPG, transparent bg looks best</div>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </div>
              </div>

              {/* Alignment controls */}
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[['Logo Alignment', 'logoAlign'], ['Button Alignment', 'buttonAlign'], ['Footer Alignment', 'footerAlign']].map(([label, key]) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['left', 'center', 'right'].map(align => (
                        <button key={align} onClick={() => saveBrand({ [key]: align })}
                          style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 500, borderRadius: 5, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                            background: brand[key] === align ? 'var(--cyan)' : 'var(--bg2)',
                            color: brand[key] === align ? 'var(--bg)' : 'var(--muted)',
                            borderColor: brand[key] === align ? 'var(--cyan)' : 'var(--border)',
                          }}>
                          {align === 'left' ? '⬅ Left' : align === 'center' ? '↔ Center' : 'Right ➡'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {[
                ['Company Name', 'companyName', 'e.g. WuMing'],
                ['Tagline', 'tagline', 'e.g. Web Development'],
                ['Your Name', 'yourName', 'e.g. Alex'],
                ['Job Title', 'jobTitle', 'e.g. Web Developer, Director'],
                ['Your Location', 'location', 'e.g. Kuching, Sarawak'],
                ['Email', 'email', 'your@email.com'],
                ['Phone', 'phone', 'e.g. 016-123 4567'],
                ['WhatsApp Number', 'whatsapp', 'e.g. 60161234567 (with country code)'],
              ].map(([label, key, ph]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <input
                    style={fieldStyle}
                    value={brand[key] || ''}
                    placeholder={ph}
                    onChange={e => saveBrand({ [key]: e.target.value })}
                  />
                </div>
              ))}

              {/* Color pickers */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Header Color</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <input type="color" value={brand.primaryColor} onChange={e => saveBrand({ primaryColor: e.target.value })}
                    style={{ width: 36, height: 36, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2, background: 'none' }} />
                  <input style={{ ...fieldStyle, marginTop: 0 }} value={brand.primaryColor} onChange={e => saveBrand({ primaryColor: e.target.value })} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accent Color</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <input type="color" value={brand.accentColor} onChange={e => saveBrand({ accentColor: e.target.value })}
                    style={{ width: 36, height: 36, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2, background: 'none' }} />
                  <input style={{ ...fieldStyle, marginTop: 0 }} value={brand.accentColor} onChange={e => saveBrand({ accentColor: e.target.value })} />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'var(--muted)' }}>
                <span>💾 Brand settings auto-save. Click Apply to update the preview with your latest changes.</span>
                <button onClick={() => { setHtmlContent(buildEmailHTML({ pitch, brand, lead })); setTab('preview'); }}
                  style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 700, padding: '7px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Apply & Preview
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '0 24px 20px', display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button
            onClick={copyContent}
            disabled={loading}
            style={{ flex: 1, background: copied ? 'var(--green)' : 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, padding: 10, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {copied ? '✓ Copied!' : tab === 'text' ? 'Copy Plain Text' : 'Copy HTML'}
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
