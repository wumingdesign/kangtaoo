import React, { useState, useEffect, useRef, useCallback } from 'react'

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
  companyName: 'WuMing', tagline: 'Web Development', yourName: 'Alex',
  jobTitle: 'Web Developer', email: '', phone: '', whatsapp: '',
  location: 'Kuching, Sarawak', primaryColor: '#0A2540', accentColor: '#00D4FF',
  logo: null, logoSize: 64, logoAlign: 'center', buttonAlign: 'center', footerAlign: 'left',
  fontFamily: 'Segoe UI, Arial, sans-serif', fontWeight: '400', fontStyle: 'normal',
  fontSize: 15, fontColor: '#2d2d3a', fontAlign: 'left',
}

const DEFAULT_MOCKUP = {
  headline: 'Professional Services', subheadline: 'in Kuching, Sarawak',
  tagline: 'Professional · Trusted · Experienced',
  cta1: 'Get Free Consultation', cta2: 'Our Services →',
  bgColor: '#0A2540', bgColor2: '#00D4FF', bgImage: null,
  bgOverlayOpacity: 0.55,
  navBg: '#0A2540', accentColor: '#00D4FF',
  domain: 'yourbusiness.com.my',
  navLogoType: 'text', navLogoText: '', navLogoImg: null, showNavText: true, bgFit: 'cover', bgPosition: 'center center',
  gradientStops: [{color:'#0A2540',opacity:1,pos:0},{color:'#00D4FF',opacity:0.15,pos:100}],
  showServices: true, services: ['Legal Advice', 'Documentation', 'Representation', 'Consultation', 'Contact Us'],
  heroFont: 'Arial', headlineColor: '#ffffff', subColor: '#00D4FF',
}

function getGoogleFontLink(fontFamily) {
  const found = FONT_OPTIONS.find(f => f.value === fontFamily)
  if (!found || !found.google) return ''
  return `<link href="https://fonts.googleapis.com/css2?family=${found.google}&display=swap" rel="stylesheet"/>`
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#','')
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
  return `rgba(${r},${g},${b},${alpha})`
}

// Draw mockup on canvas and return base64 PNG
async function renderMockupToBase64(lead, mockupCfg, brand) {
  return new Promise((resolve) => {
    const W = 560, H = 420
    const canvas = document.createElement('canvas')
    canvas.width = W * 2; canvas.height = H * 2 // 2x for retina
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)

    const cfg = { ...DEFAULT_MOCKUP, ...mockupCfg }
    const bizName = (lead.name || 'Your Business').slice(0, 20).toUpperCase()
    const { bgColor, bgColor2, accentColor, navBg, headlineColor, subColor } = cfg

    // Browser chrome
    ctx.fillStyle = '#e0e2e6'
    ctx.fillRect(0, 0, W, 28)
    // Traffic lights
    ;[['#ff5f57', 14], ['#febc2e', 28], ['#28c840', 42]].forEach(([c, x]) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, 14, 5, 0, Math.PI * 2); ctx.fill()
    })
    // URL bar
    ctx.fillStyle = '#fff'; ctx.beginPath()
    ctx.roundRect(56, 6, W - 70, 16, 8); ctx.fill()
    ctx.fillStyle = '#999'; ctx.font = '8px Arial'; ctx.textAlign = 'center'
    ctx.fillText(cfg.domain || `www.${bizName.toLowerCase().replace(/[^a-z]/g,'')}.com.my`, W / 2, 17)

    // Nav
    ctx.fillStyle = navBg
    ctx.fillRect(0, 28, W, 40)
    // Nav logo: image > text > business name, controlled by showNavText toggle
    if (cfg.navLogoImg) {
      const logoImg = new window.Image()
      logoImg.src = cfg.navLogoImg
      try {
        const lh = 24, lw = Math.min(120, lh * (logoImg.width / logoImg.height || 3))
        ctx.drawImage(logoImg, 18, 40, lw, lh)
      } catch(e) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left'
        ctx.fillText(cfg.showNavText !== false ? (cfg.navLogoText || bizName.slice(0,18)) : '', 18, 53)
      }
    } else if (cfg.showNavText !== false) {
      const navLogo = cfg.navLogoText || bizName.slice(0, 18)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left'
      ctx.fillText(navLogo, 18, 53)
    }
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '9px Arial'
    ;['Home', 'About', 'Services'].forEach((item, i) => ctx.fillText(item, 340 + i * 50, 53))
    ctx.fillStyle = accentColor; ctx.beginPath()
    ctx.roundRect(485, 38, 60, 22, 3); ctx.fill()
    ctx.fillStyle = navBg; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'
    ctx.fillText('Contact Us', 515, 53)

    // Hero background (starts at 68 = 28 browser + 40 nav)
    if (cfg.bgImage) {
      const img = new window.Image()
      img.onload = () => {
        // Step 1: draw bg image with chosen fit
        const fit = cfg.bgFit || 'cover'
        const ix = 0, iy = 68, iw = W, ih = 272
        ctx.save()
        ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip()
        const pos = cfg.bgPosition || 'center center'
        const [posH, posV] = pos.split(' ')
        function getOffset(total, size, align) {
          if (align === 'left' || align === 'top') return 0
          if (align === 'right' || align === 'bottom') return total - size
          return (total - size) / 2
        }
        if (fit === 'contain') {
          const scale = Math.min(iw/img.width, ih/img.height)
          const sw = img.width*scale, sh = img.height*scale
          ctx.drawImage(img, ix+getOffset(iw,sw,posH), iy+getOffset(ih,sh,posV), sw, sh)
        } else if (fit === 'stretch') {
          ctx.drawImage(img, ix, iy, iw, ih)
        } else {
          const scale = Math.max(iw/img.width, ih/img.height)
          const sw = img.width*scale, sh = img.height*scale
          ctx.drawImage(img, ix+getOffset(iw,sw,posH), iy+getOffset(ih,sh,posV), sw, sh)
        }
        ctx.restore()
        // Step 2: gradient overlay ON TOP of bg image using gradientStops
        const overlayStops = cfg.gradientStops || [{color:bgColor,opacity:0.55,pos:0},{color:bgColor,opacity:0.1,pos:100}]
        const overlayGrad = ctx.createLinearGradient(ix, iy, ix+iw, iy+ih)
        overlayStops.forEach(s => overlayGrad.addColorStop(s.pos/100, hexToRgba(s.color, s.opacity)))
        ctx.fillStyle = overlayGrad
        ctx.fillRect(ix, iy, iw, ih)
        // Step 3: content on top
        drawHeroContent()
        drawServices()
        drawFade()
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => { drawBgGradient(); drawHeroContent(); drawServices(); drawFade(); resolve(canvas.toDataURL('image/png')) }
      img.src = cfg.bgImage
    } else {
      drawBgGradient(); drawHeroContent(); drawServices(); drawFade()
      resolve(canvas.toDataURL('image/png'))
    }

    function drawBgGradient() {
      const grad = ctx.createLinearGradient(0, 68, W, 340)
      const stops = cfg.gradientStops || [{color:'#0A2540',opacity:1,pos:0},{color:'#00D4FF',opacity:0.15,pos:100}]
      stops.forEach(s => grad.addColorStop(s.pos/100, hexToRgba(s.color, s.opacity)))
      ctx.fillStyle = grad
      ctx.fillRect(0, 68, W, 272)
      ctx.fillStyle = hexToRgba(accentColor, 0.08)
      ctx.beginPath(); ctx.arc(W - 60, 180, 100, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = hexToRgba(accentColor, 0.12)
      ctx.beginPath(); ctx.arc(W - 30, 120, 60, 0, Math.PI * 2); ctx.fill()
    }

    function drawHeroContent() {
      const startY = 130
      ctx.fillStyle = headlineColor; ctx.font = `bold 26px ${cfg.heroFont}`; ctx.textAlign = 'left'
      ctx.fillText(cfg.headline.slice(0, 28), 36, startY)
      ctx.fillStyle = subColor; ctx.font = `bold 22px ${cfg.heroFont}`
      ctx.fillText(cfg.subheadline.slice(0, 30), 36, startY + 32)
      ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = `12px ${cfg.heroFont}`
      ctx.fillText(cfg.tagline.slice(0, 50), 36, startY + 58)
      // CTA buttons
      ctx.fillStyle = accentColor; ctx.beginPath()
      ctx.roundRect(36, startY + 76, 150, 32, 5); ctx.fill()
      ctx.fillStyle = navBg; ctx.font = `bold 11px ${cfg.heroFont}`; ctx.textAlign = 'center'
      ctx.fillText(cfg.cta1.slice(0, 22), 111, startY + 97)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath()
      ctx.roundRect(198, startY + 76, 110, 32, 5); ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.font = `11px ${cfg.heroFont}`
      ctx.fillText(cfg.cta2.slice(0, 18), 253, startY + 97)
    }

    function drawServices() {
      if (!cfg.showServices) return
      ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 340, W, 80)
      ctx.fillStyle = '#aaa'; ctx.font = '8px Arial'; ctx.textAlign = 'center'
      ctx.fillText('OUR SERVICES', W / 2, 360)
      const svcs = cfg.services.slice(0, 5)
      const icons = ['⚖', '📋', '🏛', '🤝', '📞']
      svcs.forEach((svc, i) => {
        const x = 56 + i * 112
        ctx.font = '16px Arial'; ctx.fillText(icons[i] || '•', x, 392)
        ctx.fillStyle = '#555'; ctx.font = '8px Arial'; ctx.textAlign = 'center'
        ctx.fillText(svc.slice(0, 14), x, 410)
        ctx.fillStyle = '#aaa'
      })
    }

    function drawFade() {
      // No bottom fade - clean mockup
    }
  })
}

function buildEmailHTML({ pitch, brand, mockupBase64 }) {
  const {
    companyName, tagline, yourName, jobTitle, email, phone,
    whatsapp, location: loc, primaryColor, accentColor, logo,
    logoSize = 64, logoAlign = 'center', buttonAlign = 'center', footerAlign = 'left',
    fontFamily = 'Segoe UI, Arial, sans-serif', fontWeight = '400',
    fontStyle = 'normal', fontSize = 15, fontColor = '#2d2d3a', fontAlign = 'left',
  } = brand

  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${yourName}, I'd like to learn more about your web development services.`)}`
    : null
  const paragraphs = pitch.split('\n').filter(p => p.trim())
  const googleFont = getGoogleFontLink(fontFamily)

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
${googleFont}<title>Email from ${companyName}</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:${fontFamily};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${primaryColor};padding:28px 36px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="${logoAlign}">
    ${logo ? `<img src="${logo}" alt="${companyName}" style="height:${logoSize}px;max-width:${logoSize*3}px;object-fit:contain;display:inline-block;"/>` : `<div style="font-size:22px;font-weight:700;color:#fff;">${companyName}</div>`}
    ${tagline ? `<div style="font-size:12px;color:${accentColor};margin-top:4px;letter-spacing:0.08em;text-transform:uppercase;">${tagline}</div>` : ''}
  </td></tr></table>
</td></tr>
<tr><td style="height:3px;background:linear-gradient(90deg,${accentColor},${primaryColor});"></td></tr>
${mockupBase64 ? `
<tr><td style="padding:20px 36px 0;">
  <div style="border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.12);border:1px solid #e0e2e6;">
    <img src="${mockupBase64}" alt="Website Concept" style="display:block;width:100%;max-width:528px;"/>
  </div>
</td></tr>` : ''}
<tr><td style="padding:${mockupBase64 ? '20px' : '36px'} 36px 24px;">
  <p style="margin:0 0 8px;font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};font-style:${fontStyle};color:${fontColor};text-align:${fontAlign};">Hi there,</p>
  ${paragraphs.map((p, i) => {
    const f = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>')
    return `<p style="margin:${i===0?'16px':'12px'} 0 0;font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};font-style:${fontStyle};color:${fontColor};line-height:1.7;text-align:${fontAlign};">${f}</p>`
  }).join('')}
  <table cellpadding="0" cellspacing="0" style="margin-top:28px;width:100%;"><tr><td align="${buttonAlign}">
    ${waLink
      ? `<a href="${waLink}" style="display:inline-block;background:${accentColor};color:#0A0F1E;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;font-family:${fontFamily};">Chat on WhatsApp →</a>`
      : `<a href="mailto:${email}" style="display:inline-block;background:${accentColor};color:#0A0F1E;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;font-family:${fontFamily};">Get in Touch →</a>`}
  </td></tr></table>
  <p style="margin:28px 0 0;font-family:${fontFamily};font-size:${fontSize}px;color:#555;">Warm regards,</p>
  <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#1a1a2e;font-family:${fontFamily};">${yourName}</p>
  <p style="margin:2px 0 0;font-size:13px;color:#888;font-family:${fontFamily};">${jobTitle || 'Web Developer'}</p>
</td></tr>
<tr><td style="padding:0 36px;"><hr style="border:none;border-top:1px solid #eee;margin:0;"/></td></tr>
<tr><td style="padding:20px 36px 28px;background:#fafbfc;">
  <p style="margin:0;font-size:12px;color:#999;line-height:1.6;text-align:${footerAlign};font-family:${fontFamily};">
    ${companyName} · ${loc}${email ? ` · <a href="mailto:${email}" style="color:#999;">${email}</a>` : ''}${phone ? ` · ${phone}` : ''}
  </p>
</td></tr>
</table></td></tr></table></body></html>`
}


function MockupPanel({ mockupCfg, saveMockup, showMockup, setShowMockup, bgImgInputRef, handleBgImgUpload, applyAndPreview, mockupBase64 }) {
  const navLogoInputRef = React.useRef(null)
  const fs = { width: '100%', background: '#111827', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text)', fontFamily: 'inherit', fontSize: 12, padding: '7px 10px', outline: 'none', marginTop: 3 }
  const sl = (txt) => <div style={{ fontSize: 11, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid var(--border)', marginTop: 16 }}>{txt}</div>
  const lbl = (txt) => <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2, marginTop: 8 }}>{txt}</div>

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%' }}>
      {/* Left: preview of mockup */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {mockupBase64 && showMockup ? (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <img src={mockupBase64} alt="Mockup preview" style={{ width: '100%', display: 'block' }}/>
          </div>
        ) : (
          <div style={{ height: 300, background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Enable mockup and click Apply & Preview
          </div>
        )}
        <button onClick={applyAndPreview} style={{ width: '100%', marginTop: 12, background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, padding: 10, cursor: 'pointer' }}>
          ↺ Apply & Refresh Preview
        </button>
      </div>

      {/* Right: controls */}
      <div style={{ width: 300, flexShrink: 0, overflowY: 'auto', flex: '0 0 300px' }}>
        {sl('Toggle')}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
          <input type="checkbox" checked={showMockup} onChange={e => setShowMockup(e.target.checked)} style={{ width: 14, height: 14, accentColor: 'var(--cyan)', flexShrink: 0 }}/>
          Show website mockup in email
        </label>

        {showMockup && <>
          {sl('Nav & Domain')}
          <div>{lbl('Domain Name')}<input style={fs} value={mockupCfg.domain||''} placeholder="yourbusiness.com.my" onChange={e => saveMockup({domain:e.target.value})}/></div>
          <div style={{marginTop:10}}>
            {lbl('Nav Logo Image')}
            <div style={{display:'flex',gap:8,marginTop:4,alignItems:'center'}}>
              {mockupCfg.navLogoImg
                ? <img src={mockupCfg.navLogoImg} alt="nav logo" style={{height:28,maxWidth:80,objectFit:'contain',background:'#1E2A45',padding:4,borderRadius:4}}/>
                : <div style={{width:50,height:28,background:'var(--bg2)',border:'1px dashed var(--border)',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'var(--muted)'}}>None</div>
              }
              <button onClick={() => navLogoInputRef.current?.click()} style={{background:'var(--bg2)',border:'1px solid var(--border)',color:'var(--muted)',borderRadius:4,fontSize:10,padding:'5px 8px',cursor:'pointer'}}>
                📷 Upload
              </button>
              {mockupCfg.navLogoImg && <button onClick={() => saveMockup({navLogoImg:null})} style={{background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',borderRadius:4,fontSize:10,padding:'5px 6px',cursor:'pointer'}}>✕</button>}
            </div>
            <input ref={navLogoInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => {
              const file = e.target.files[0]; if(!file) return
              const r = new FileReader(); r.onload = ev => saveMockup({navLogoImg:ev.target.result}); r.readAsDataURL(file)
            }}/>
          </div>
          <div style={{marginTop:8}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:12,color:'var(--muted)'}}>
              <input type="checkbox" checked={mockupCfg.showNavText !== false} onChange={e => saveMockup({showNavText:e.target.checked})} style={{width:14,height:14,accentColor:'var(--cyan)',flexShrink:0}}/>
              Show text logo in nav
            </label>
            {mockupCfg.showNavText !== false && (
              <div style={{marginTop:6}}>{lbl('Nav Text (blank = business name)')}<input style={fs} value={mockupCfg.navLogoText||''} placeholder="Leave blank to use business name" onChange={e => saveMockup({navLogoText:e.target.value})}/></div>
            )}
          </div>

          {sl('Hero Content')}
          {[['Headline','headline','Professional Services'],['Sub Headline','subheadline','in Kuching, Sarawak'],['Tagline','tagline','Professional · Trusted · Experienced'],['CTA Button 1','cta1','Get Free Consultation'],['CTA Button 2','cta2','Our Services →']].map(([lb,key,ph]) => (
            <div key={key}>{lbl(lb)}<input style={fs} value={mockupCfg[key]||''} placeholder={ph} onChange={e => saveMockup({[key]:e.target.value})}/></div>
          ))}

          {sl('Background Gradient')}
          {(mockupCfg.gradientStops || [{color:'#0A2540',opacity:1,pos:0},{color:'#00D4FF',opacity:0.15,pos:100}]).map((stop,i,arr) => (
            <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',marginBottom:6}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                <span style={{fontSize:10,color:'var(--muted)',flex:1}}>Stop {i+1}</span>
                {arr.length > 2 && <button onClick={() => { const s=[...arr]; s.splice(i,1); saveMockup({gradientStops:s}) }} style={{background:'transparent',border:'none',color:'var(--red)',cursor:'pointer',fontSize:12,padding:0}}>✕</button>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:6,alignItems:'center',marginBottom:6}}>
                <input type="color" value={stop.color} onChange={e=>{const s=[...arr];s[i]={...s[i],color:e.target.value};saveMockup({gradientStops:s})}} style={{width:28,height:26,border:'none',borderRadius:3,cursor:'pointer',padding:2}}/>
                <input style={{...fs,marginTop:0}} value={stop.color} onChange={e=>{const s=[...arr];s[i]={...s[i],color:e.target.value};saveMockup({gradientStops:s})}}/>
                <span style={{fontSize:10,color:'var(--muted)',whiteSpace:'nowrap'}}>{stop.pos}%</span>
              </div>
              <div>
                <div style={{fontSize:9,color:'var(--muted)',marginBottom:2}}>Opacity — {Math.round(stop.opacity*100)}%</div>
                <input type="range" min="0" max="100" value={Math.round(stop.opacity*100)}
                  onChange={e=>{const s=[...arr];s[i]={...s[i],opacity:Number(e.target.value)/100};saveMockup({gradientStops:s})}}
                  style={{width:'100%',accentColor:'var(--cyan)'}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:'var(--muted)',marginBottom:2}}>Position — {stop.pos}%</div>
                <input type="range" min="0" max="100" value={stop.pos}
                  onChange={e=>{const s=[...arr];s[i]={...s[i],pos:Number(e.target.value)};saveMockup({gradientStops:s})}}
                  style={{width:'100%',accentColor:'var(--cyan)'}}/>
              </div>
            </div>
          ))}
          <button onClick={() => {
            const arr = mockupCfg.gradientStops || [{color:'#0A2540',opacity:1,pos:0},{color:'#00D4FF',opacity:0.15,pos:100}]
            saveMockup({gradientStops:[...arr,{color:'#ffffff',opacity:0.1,pos:50}]})
          }} style={{width:'100%',background:'transparent',border:'1px dashed var(--border)',color:'var(--muted)',borderRadius:5,fontSize:11,padding:'6px',cursor:'pointer',marginBottom:10}}>
            + Add gradient stop
          </button>

          {sl('Background Image')}
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <button onClick={() => bgImgInputRef.current?.click()} style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:5, fontSize:11, padding:'7px', cursor:'pointer' }}>
              {mockupCfg.bgImage ? '✓ Set — change' : '📷 Upload image'}
            </button>
            {mockupCfg.bgImage && <button onClick={() => saveMockup({bgImage:null})} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:5, fontSize:11, padding:'7px 10px', cursor:'pointer' }}>✕</button>}
          </div>
          <input ref={bgImgInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleBgImgUpload}/>
          {mockupCfg.bgImage && <>
            {lbl('Fit Mode')}
            <div style={{display:'flex',gap:4,marginTop:4,marginBottom:10}}>
              {[['cover','Cover'],['contain','Contain'],['stretch','Stretch']].map(([val,lb]) => (
                <button key={val} onClick={() => saveMockup({bgFit:val})} style={{flex:1,padding:'5px 2px',fontSize:10,borderRadius:4,cursor:'pointer',border:'1px solid',
                  background:(mockupCfg.bgFit||'cover')===val?'var(--cyan)':'var(--bg2)',
                  color:(mockupCfg.bgFit||'cover')===val?'var(--bg)':'var(--muted)',
                  borderColor:(mockupCfg.bgFit||'cover')===val?'var(--cyan)':'var(--border)'}}>
                  {lb}
                </button>
              ))}
            </div>
            {lbl('Image Position')}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginTop:4,maxWidth:140}}>
              {[
                ['top left','↖'],['top center','⬆'],['top right','↗'],
                ['center left','⬅'],['center center','✛'],['center right','➡'],
                ['bottom left','↙'],['bottom center','⬇'],['bottom right','↘'],
              ].map(([val,icon]) => (
                <button key={val} onClick={() => saveMockup({bgPosition:val})}
                  title={val}
                  style={{padding:'6px 0',fontSize:14,borderRadius:4,cursor:'pointer',border:'1px solid',textAlign:'center',
                    background:(mockupCfg.bgPosition||'center center')===val?'var(--cyan)':'var(--bg2)',
                    color:(mockupCfg.bgPosition||'center center')===val?'var(--bg)':'var(--muted)',
                    borderColor:(mockupCfg.bgPosition||'center center')===val?'var(--cyan)':'var(--border)'}}>
                  {icon}
                </button>
              ))}
            </div>
          </>}

          {sl('Colors')}
          {[['Nav Color','navBg','#0A2540'],['Accent Color','accentColor','#00D4FF'],['Headline Color','headlineColor','#ffffff'],['Sub Headline Color','subColor','#00D4FF']].map(([lb,key,def]) => (
            <div key={key}>{lbl(lb)}
              <div style={{ display:'flex',gap:8,marginTop:3 }}>
                <input type="color" value={mockupCfg[key]||def} onChange={e => saveMockup({[key]:e.target.value})} style={{ width:32,height:30,border:'none',borderRadius:4,cursor:'pointer',padding:2 }}/>
                <input style={{...fs,marginTop:0,flex:1}} value={mockupCfg[key]||def} onChange={e => saveMockup({[key]:e.target.value})}/>
              </div>
            </div>
          ))}

          {sl('Services Bar')}
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--muted)', marginBottom:8 }}>
            <input type="checkbox" checked={mockupCfg.showServices !== false} onChange={e => saveMockup({showServices:e.target.checked})} style={{ width:14,height:14,accentColor:'var(--cyan)',flexShrink:0 }}/>
            Show services bar
          </label>
          {mockupCfg.showServices !== false && (mockupCfg.services || DEFAULT_MOCKUP.services).map((svc, i) => (
            <div key={i}>{lbl(`Service ${i+1}`)}
              <input style={fs} value={svc} onChange={e => {
                const updated = [...(mockupCfg.services || DEFAULT_MOCKUP.services)]
                updated[i] = e.target.value
                saveMockup({ services: updated })
              }}/>
            </div>
          ))}
        </>}
      </div>
    </div>
  )
}

export default function PitchModal({ lead, location, onClose }) {
  const [pitch, setPitch] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('preview')
  const [showBrand, setShowBrand] = useState(true)
  const [showMockup, setShowMockup] = useState(true)
  const [mockupBase64, setMockupBase64] = useState('')
  const [mockupCfg, setMockupCfg] = useState(() => {
    try { return { ...DEFAULT_MOCKUP, ...JSON.parse(localStorage.getItem('kt_mockup') || '{}') } }
    catch { return DEFAULT_MOCKUP }
  })
  const [brand, setBrand] = useState(() => {
    try { return { ...DEFAULT_BRAND, ...JSON.parse(localStorage.getItem('kt_brand') || '{}') } }
    catch { return DEFAULT_BRAND }
  })
  const [copied, setCopied] = useState(false)
  const logoInputRef = useRef(null)
  const bgImgInputRef = useRef(null)

  useEffect(() => { fetchPitch() }, [lead])

  useEffect(() => {
    if (!loading && pitch) applyAndPreview()
  }, [pitch, loading])

  // Sync mockup defaults from lead data on first load
  useEffect(() => {
    if (lead) {
      setMockupCfg(prev => ({
        ...prev,
        headline: prev.headline === DEFAULT_MOCKUP.headline ? (lead.type || 'Professional Services') : prev.headline,
        navBg: brand.primaryColor,
        accentColor: brand.accentColor,
        bgColor: brand.primaryColor,
      }))
    }
  }, [lead])

  function saveBrand(updates) {
    const next = { ...brand, ...updates }
    setBrand(next)
    try { localStorage.setItem('kt_brand', JSON.stringify(next)) } catch {}
  }

  function saveMockup(updates) {
    const next = { ...mockupCfg, ...updates }
    setMockupCfg(next)
    try { localStorage.setItem('kt_mockup', JSON.stringify(next)) } catch {}
  }

  async function applyAndPreview() {
    let b64 = ''
    if (showMockup) {
      b64 = await renderMockupToBase64(lead, mockupCfg, brand)
      setMockupBase64(b64)
    } else {
      setMockupBase64('')
    }
    setHtmlContent(buildEmailHTML({ pitch, brand, mockupBase64: showMockup ? b64 : '' }))
  }

  async function fetchPitch() {
    setLoading(true)
    const prompt = `Write a short friendly cold outreach email body (under 120 words) from a web developer.
Business: ${lead.name}, ${lead.type}, ${lead.address}
Issue: ${lead.temp === 'hot' ? 'They have NO website at all' : 'Their website needs improvement'}
Signals: ${(lead.sigs || []).join(', ')}
Hook: ${lead.hook}
Rules: No greeting line. No sign-off. Lead with their specific problem. One concrete benefit. End with soft question. Warm and human. 3-4 short paragraphs. Plain text only.`
    try {
      const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      setPitch(data.text?.trim() || 'Error.')
    } catch { setPitch('Error generating pitch.') }
    finally { setLoading(false) }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0]; if (!file) return
    const r = new FileReader(); r.onload = ev => saveBrand({ logo: ev.target.result }); r.readAsDataURL(file)
  }

  function handleBgImgUpload(e) {
    const file = e.target.files[0]; if (!file) return
    const r = new FileReader(); r.onload = ev => saveMockup({ bgImage: ev.target.result }); r.readAsDataURL(file)
  }

  function copyContent() {
    const text = activeTab === 'text' ? pitch : htmlContent
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const fs = { width: '100%', background: '#111827', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text)', fontFamily: 'inherit', fontSize: 11, padding: '6px 9px', outline: 'none', marginTop: 3 }
  const sl = (txt) => <div style={{ fontSize: 9, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid var(--border)', marginTop: 12 }}>{txt}</div>
  const lbl = (txt) => <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{txt}</div>
  const togRow = (key, opts, obj, setter) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {opts.map(([val, lbTxt]) => (
        <button key={val} onClick={() => setter({ [key]: val })} style={{ flex: 1, padding: '4px 2px', fontSize: 9, borderRadius: 3, cursor: 'pointer', border: '1px solid',
          background: (obj[key] || opts[0][0]) === val ? 'var(--cyan)' : 'var(--bg2)',
          color: (obj[key] || opts[0][0]) === val ? 'var(--bg)' : 'var(--muted)',
          borderColor: (obj[key] || opts[0][0]) === val ? 'var(--cyan)' : 'var(--border)',
        }}>{lbTxt}</button>
      ))}
    </div>
  )

  const tabBtn = (t, txt) => (
    <button key={t} onClick={() => setActiveTab(t)} style={{ background: activeTab === t ? '#1E2A45' : 'transparent', color: activeTab === t ? 'var(--cyan)' : 'var(--muted)', border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: 11, borderRadius: 4 }}>{txt}</button>
  )

  // Brand panel sections
  const BrandPanel = () => (
    <div style={{ width: 290, borderLeft: '1px solid var(--border)', overflow: 'auto', padding: '12px 14px', flexShrink: 0, background: '#0D1424', fontSize: 11 }}>

      {true && <>
        {sl('Logo')}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {brand.logo ? <img src={brand.logo} alt="logo" style={{ height: 36, maxWidth: 90, objectFit: 'contain', background: brand.primaryColor, padding: 4, borderRadius: 4 }} /> : <div style={{ width: 52, height: 36, background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--muted)' }}>None</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <button onClick={() => logoInputRef.current?.click()} style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 600, padding: '4px 8px', cursor: 'pointer' }}>Upload</button>
            {brand.logo && <button onClick={() => saveBrand({ logo: null })} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 4, fontSize: 9, padding: '3px 6px', cursor: 'pointer' }}>Remove</button>}
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
        </div>
        {brand.logo && <>
          {lbl(`Size — ${brand.logoSize || 64}px`)}
          <input type="range" min="32" max="160" value={brand.logoSize || 64} onChange={e => saveBrand({ logoSize: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--cyan)', marginBottom: 6 }} />
        </>}

        {sl('Alignment')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 4 }}>
          {[['logoAlign','Logo'],['buttonAlign','Button'],['footerAlign','Footer']].map(([key, lb]) => (
            <div key={key}>{lbl(lb)}{togRow(key, [['left','⬅'],['center','↔'],['right','➡']], brand, saveBrand)}</div>
          ))}
        </div>

        {sl('Brand Info')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[['Company Name','companyName','WuMing'],['Tagline','tagline','Web Development'],['Your Name','yourName','Alex'],['Job Title','jobTitle','Web Developer'],['Location','location','Kuching, Sarawak'],['Email','email','you@email.com'],['Phone','phone','016-123 4567'],['WhatsApp','whatsapp','60161234567']].map(([lb, key, ph]) => (
            <div key={key}>{lbl(lb)}<input style={fs} value={brand[key]||''} placeholder={ph} onChange={e => saveBrand({[key]: e.target.value})}/></div>
          ))}
        </div>

        {sl('Typography')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div>{lbl('Font Family')}<select style={fs} value={brand.fontFamily} onChange={e => saveBrand({fontFamily: e.target.value})}>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
          <div>{lbl(`Font Size — ${brand.fontSize||15}px`)}<input type="range" min="12" max="20" value={brand.fontSize||15} onChange={e => saveBrand({fontSize: Number(e.target.value)})} style={{ width:'100%', accentColor:'var(--cyan)' }}/></div>
          <div>{lbl('Weight')}{togRow('fontWeight',[['300','Light'],['400','Regular'],['500','Medium'],['700','Bold']],brand,saveBrand)}</div>
          <div>{lbl('Style')}{togRow('fontStyle',[['normal','Normal'],['italic','Italic']],brand,saveBrand)}</div>
          <div>{lbl('Alignment')}{togRow('fontAlign',[['left','⬅ Left'],['center','Center'],['right','Right ➡'],['justify','Justify']],brand,saveBrand)}</div>
          <div>{lbl('Font Color')}
            <div style={{ display:'flex', gap:5, marginTop:3 }}>
              <input type="color" value={brand.fontColor||'#2d2d3a'} onChange={e => saveBrand({fontColor:e.target.value})} style={{ width:30,height:28,border:'none',borderRadius:3,cursor:'pointer',padding:2 }}/>
              <input style={{...fs,marginTop:0,flex:1}} value={brand.fontColor||'#2d2d3a'} onChange={e => saveBrand({fontColor:e.target.value})}/>
            </div>
          </div>
        </div>

        {sl('Colors')}
        {[['Header Color','primaryColor'],['Accent Color','accentColor']].map(([lb,key]) => (
          <div key={key} style={{ marginBottom: 5 }}>{lbl(lb)}
            <div style={{ display:'flex',gap:5,marginTop:3 }}>
              <input type="color" value={brand[key]} onChange={e => saveBrand({[key]:e.target.value})} style={{ width:30,height:28,border:'none',borderRadius:3,cursor:'pointer',padding:2 }}/>
              <input style={{...fs,marginTop:0,flex:1}} value={brand[key]} onChange={e => saveBrand({[key]:e.target.value})}/>
            </div>
          </div>
        ))}
      </>}

      {false && <>
        {sl('Mockup Toggle')}
        <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:11, color:'var(--muted)', marginBottom:8 }}>
          <input type="checkbox" checked={showMockup} onChange={e => setShowMockup(e.target.checked)} style={{ accentColor:'var(--cyan)' }}/>
          Show website mockup in email
        </label>

        {showMockup && <>
          {sl('Nav & Domain')}
          <div>{lbl('Domain Name')}<input style={fs} value={mockupCfg.domain||''} placeholder="yourbusiness.com.my" onChange={e => saveMockup({domain:e.target.value})}/></div>
          <div style={{marginTop:10}}>
            {lbl('Nav Logo Image')}
            <div style={{display:'flex',gap:8,marginTop:4,alignItems:'center'}}>
              {mockupCfg.navLogoImg
                ? <img src={mockupCfg.navLogoImg} alt="nav logo" style={{height:28,maxWidth:80,objectFit:'contain',background:'#1E2A45',padding:4,borderRadius:4}}/>
                : <div style={{width:50,height:28,background:'var(--bg2)',border:'1px dashed var(--border)',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'var(--muted)'}}>None</div>
              }
              <button onClick={() => navLogoInputRef.current?.click()} style={{background:'var(--bg2)',border:'1px solid var(--border)',color:'var(--muted)',borderRadius:4,fontSize:10,padding:'5px 8px',cursor:'pointer'}}>
                📷 Upload
              </button>
              {mockupCfg.navLogoImg && <button onClick={() => saveMockup({navLogoImg:null})} style={{background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',borderRadius:4,fontSize:10,padding:'5px 6px',cursor:'pointer'}}>✕</button>}
            </div>
            <input ref={navLogoInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => {
              const file = e.target.files[0]; if(!file) return
              const r = new FileReader(); r.onload = ev => saveMockup({navLogoImg:ev.target.result}); r.readAsDataURL(file)
            }}/>
          </div>
          <div style={{marginTop:8}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:12,color:'var(--muted)'}}>
              <input type="checkbox" checked={mockupCfg.showNavText !== false} onChange={e => saveMockup({showNavText:e.target.checked})} style={{width:14,height:14,accentColor:'var(--cyan)',flexShrink:0}}/>
              Show text logo in nav
            </label>
            {mockupCfg.showNavText !== false && (
              <div style={{marginTop:6}}>{lbl('Nav Text (blank = business name)')}<input style={fs} value={mockupCfg.navLogoText||''} placeholder="Leave blank to use business name" onChange={e => saveMockup({navLogoText:e.target.value})}/></div>
            )}
          </div>

          {sl('Hero Content')}
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {[['Headline','headline','Professional Services'],['Sub Headline','subheadline','in Kuching, Sarawak'],['Tagline','tagline','Professional · Trusted · Experienced'],['CTA Button 1','cta1','Get Free Consultation'],['CTA Button 2','cta2','Our Services →']].map(([lb,key,ph]) => (
              <div key={key}>{lbl(lb)}<input style={fs} value={mockupCfg[key]||''} placeholder={ph} onChange={e => saveMockup({[key]:e.target.value})}/></div>
            ))}
          </div>

          {sl('Background')}
          <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:6 }}>
            <div>{lbl('BG Color From')}
              <div style={{ display:'flex',gap:5,marginTop:3 }}>
                <input type="color" value={mockupCfg.bgColor||'#0A2540'} onChange={e => saveMockup({bgColor:e.target.value})} style={{ width:30,height:28,border:'none',borderRadius:3,cursor:'pointer',padding:2 }}/>
                <input style={{...fs,marginTop:0,flex:1}} value={mockupCfg.bgColor||'#0A2540'} onChange={e => saveMockup({bgColor:e.target.value})}/>
              </div>
            </div>
            <div>{lbl('BG Color To (gradient)')}
              <div style={{ display:'flex',gap:5,marginTop:3 }}>
                <input type="color" value={mockupCfg.bgColor2||'#00D4FF'} onChange={e => saveMockup({bgColor2:e.target.value})} style={{ width:30,height:28,border:'none',borderRadius:3,cursor:'pointer',padding:2 }}/>
                <input style={{...fs,marginTop:0,flex:1}} value={mockupCfg.bgColor2||'#00D4FF'} onChange={e => saveMockup({bgColor2:e.target.value})}/>
              </div>
            </div>
            <div>
              <div>{lbl('BG Image Overlay Opacity — ' + Math.round((mockupCfg.bgOverlayOpacity||0.55)*100) + '%')}
            <input type="range" min="0" max="100" value={Math.round((mockupCfg.bgOverlayOpacity||0.55)*100)}
              onChange={e => saveMockup({bgOverlayOpacity: Number(e.target.value)/100})}
              style={{ width:'100%', accentColor:'var(--cyan)', marginTop:4 }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--muted)', marginTop:1 }}><span>Transparent</span><span>Solid</span></div>
          </div>
          {lbl('Background Image (optional)')}
              <div style={{ display:'flex', gap:5, marginTop:3 }}>
                <button onClick={() => bgImgInputRef.current?.click()} style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:4, fontSize:10, padding:'5px', cursor:'pointer' }}>
                  {mockupCfg.bgImage ? '✓ Image set — change' : '📷 Upload image'}
                </button>
                {mockupCfg.bgImage && <button onClick={() => saveMockup({bgImage:null})} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:4, fontSize:10, padding:'5px 8px', cursor:'pointer' }}>✕</button>}
              </div>
              <input ref={bgImgInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleBgImgUpload}/>
          {mockupCfg.bgImage && <>
            {lbl('Image Fit Mode')}
            <div style={{display:'flex',gap:4,marginTop:4}}>
              {[['cover','Cover'],['contain','Contain'],['stretch','Stretch']].map(([val,lb]) => (
                <button key={val} onClick={() => saveMockup({bgFit:val})} style={{flex:1,padding:'5px 2px',fontSize:10,borderRadius:4,cursor:'pointer',border:'1px solid',
                  background:(mockupCfg.bgFit||'cover')===val?'var(--cyan)':'var(--bg2)',
                  color:(mockupCfg.bgFit||'cover')===val?'var(--bg)':'var(--muted)',
                  borderColor:(mockupCfg.bgFit||'cover')===val?'var(--cyan)':'var(--border)'}}>
                  {lb}
                </button>
              ))}
            </div>
          </>}
            </div>
          </div>

          {sl('Colors')}
          <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:6 }}>
            {[['Nav Color','navBg'],['Accent Color','accentColor'],['Headline Color','headlineColor'],['Sub Headline Color','subColor']].map(([lb,key]) => (
              <div key={key}>{lbl(lb)}
                <div style={{ display:'flex',gap:5,marginTop:3 }}>
                  <input type="color" value={mockupCfg[key]||'#ffffff'} onChange={e => saveMockup({[key]:e.target.value})} style={{ width:30,height:28,border:'none',borderRadius:3,cursor:'pointer',padding:2 }}/>
                  <input style={{...fs,marginTop:0,flex:1}} value={mockupCfg[key]||''} onChange={e => saveMockup({[key]:e.target.value})}/>
                </div>
              </div>
            ))}
          </div>

          {sl('Services Bar')}
          <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:11, color:'var(--muted)', marginBottom:6 }}>
            <input type="checkbox" checked={mockupCfg.showServices !== false} onChange={e => saveMockup({showServices:e.target.checked})} style={{ accentColor:'var(--cyan)' }}/>
            Show services bar
          </label>
          {mockupCfg.showServices !== false && (mockupCfg.services || DEFAULT_MOCKUP.services).map((svc, i) => (
            <div key={i} style={{ marginBottom:3 }}>
              {lbl(`Service ${i+1}`)}
              <input style={fs} value={svc} onChange={e => {
                const updated = [...(mockupCfg.services || DEFAULT_MOCKUP.services)]
                updated[i] = e.target.value
                saveMockup({ services: updated })
              }}/>
            </div>
          ))}
        </>}
      </>}

      <button onClick={applyAndPreview} style={{ width:'100%', background:'var(--cyan)', color:'var(--bg)', border:'none', borderRadius:6, fontSize:12, fontWeight:700, padding:'9px', cursor:'pointer', marginTop:14 }}>
        ↺ Apply & Preview
      </button>
    </div>
  )

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:12, overflowY:'auto' }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, width:'100%', maxWidth: showBrand ? 1260 : 860, maxHeight:'96vh', display:'flex', flexDirection:'column', transition:'max-width 0.25s' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'14px 18px 0' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>{lead.name}</div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{lead.address}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={() => setShowBrand(v => !v)} style={{ fontSize:11, padding:'5px 12px', background: showBrand ? 'var(--cyan)' : 'var(--bg2)', color: showBrand ? 'var(--bg)' : 'var(--muted)', border:'1px solid var(--border)', borderRadius:5, cursor:'pointer' }}>
              🎨 {showBrand ? 'Hide Panel' : 'Show Panel'}
            </button>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:20, lineHeight:1, padding:0 }}>✕</button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:2, padding:'10px 18px 0', borderBottom:'1px solid var(--border)', paddingBottom:8, alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:2, background:'var(--bg2)', borderRadius:6, padding:2 }}>
            {tabBtn('preview', '👁 Preview')}
            {tabBtn('html', '</> HTML')}
            {tabBtn('text', '📝 Plain Text')}
            {tabBtn('mockup', '🖥 Mockup')}
          </div>
          <button onClick={applyAndPreview} style={{ fontSize:11, color:'var(--cyan)', background:'transparent', border:'1px solid rgba(0,212,255,0.35)', borderRadius:5, padding:'5px 12px', cursor:'pointer' }}>
            ↺ Apply & Refresh
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:'hidden', display:'flex' }}>
          <div style={{ flex:1, overflow:'auto', padding:'14px 18px' }}>
            {loading ? (
              <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)', fontSize:13 }}>
                <div style={{ height:2, background:'var(--border)', borderRadius:2, overflow:'hidden', maxWidth:200, margin:'0 auto 12px' }}>
                  <div style={{ height:'100%', width:'35%', background:'var(--cyan)', animation:'sweep 1.3s ease-in-out infinite' }}/>
                </div>Writing personalised pitch…
              </div>
            ) : activeTab === 'preview' ? (
              <div style={{ background:'#fff', borderRadius:8, overflow:'hidden', border:'1px solid #e0e0e0' }}>
                <iframe srcDoc={htmlContent} style={{ width:'100%', height:680, border:'none' }} title="Email preview"/>
              </div>
            ) : activeTab === 'html' ? (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>Edit HTML directly</div>
                  <button onClick={applyAndPreview} style={{ fontSize:11, color:'var(--cyan)', background:'transparent', border:'1px solid rgba(0,212,255,0.3)', borderRadius:4, padding:'3px 10px', cursor:'pointer' }}>↺ Reset</button>
                </div>
                <textarea value={htmlContent} onChange={e => setHtmlContent(e.target.value)}
                  style={{ width:'100%', height:580, fontFamily:'monospace', fontSize:11, lineHeight:1.5, background:'#111827', border:'1px solid var(--border)', borderRadius:6, color:'#F0F4FF', padding:12, resize:'vertical', outline:'none' }}/>
              </div>
            ) : activeTab === 'text' ? (
              <textarea value={pitch} onChange={e => setPitch(e.target.value)}
                style={{ width:'100%', height:580, fontFamily:'monospace', fontSize:13, lineHeight:1.65, background:'#111827', border:'1px solid var(--border)', borderRadius:6, color:'var(--text)', padding:12, resize:'vertical', outline:'none' }}/>
            ) : activeTab === 'mockup' ? (
              <MockupPanel mockupCfg={mockupCfg} saveMockup={saveMockup} showMockup={showMockup} setShowMockup={setShowMockup} bgImgInputRef={bgImgInputRef} handleBgImgUpload={handleBgImgUpload} applyAndPreview={applyAndPreview} mockupBase64={mockupBase64}/>
            ) : null}
          </div>
          {showBrand && activeTab === 'preview' && <BrandPanel/>}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 18px', display:'flex', gap:8, borderTop:'1px solid var(--border)' }}>
          <button onClick={copyContent} disabled={loading}
            style={{ flex:1, background: copied ? 'var(--green)' : 'var(--cyan)', color:'var(--bg)', border:'none', borderRadius:6, fontSize:13, fontWeight:700, padding:10, cursor:'pointer', transition:'background 0.2s' }}>
            {copied ? '✓ Copied!' : activeTab === 'text' ? 'Copy Plain Text' : 'Copy HTML'}
          </button>
          <button onClick={fetchPitch} disabled={loading}
            style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:6, fontSize:13, padding:'10px 16px', cursor:'pointer' }}>
            ↺ Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}
