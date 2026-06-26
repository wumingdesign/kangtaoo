import React, { useState, useRef } from 'react'
import LeadCard from '../components/LeadCard'
import PitchModal from '../components/PitchModal'
import Pagination from '../components/Pagination'

const PER_PAGE = 12

const SCAN_MSGS = [
  'Searching Google Places…',
  'Fetching business listings…',
  'Checking website presence…',
  'Scoring leads…',
  'Almost there…',
]

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function scoreLead(p) {
  if (!p.website) return 'hot'
  if ((p.rating || 5) < 3.5) return 'warm'
  if ((p.user_ratings_total || 999) < 15) return 'warm'
  return 'cold'
}

function buildSigs(p) {
  const s = []
  if (!p.website) s.push('No website found')
  else s.push('Has website')
  if ((p.user_ratings_total || 0) < 10) s.push('Few online reviews')
  if (p.rating && p.rating < 3.5) s.push(`Low rating (${p.rating}★)`)
  if ((p.user_ratings_total || 0) > 100) s.push('High traffic')
  return s.slice(0, 3)
}

function shapePlace(p, ind, idx) {
  return {
    idx,
    name: p.name,
    type: (p.types || [])
      .filter(t => !['point_of_interest', 'establishment', 'premise', 'geocode'].includes(t))
      .map(t => t.replace(/_/g, ' '))
      .slice(0, 2).join(', ') || ind,
    address: p.formatted_address || p.vicinity || '',
    phone: '',
    website: undefined,
    mapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
    temp: (p.rating && p.rating < 3.5) || ((p.user_ratings_total || 999) < 15) ? 'warm' : 'cold',
    sigs: [(p.user_ratings_total || 0) < 10 ? 'Few online reviews' : ((p.user_ratings_total || 0) > 100 ? 'High traffic' : 'Active listing'), 'Checking website…'],
    rating: p.rating || null,
    reviews: p.user_ratings_total || null,
    hook: 'Generating hook…',
    pid: p.place_id,
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

export default function ScannerPage({ onBack }) {
  const [apiKey, setApiKey] = useState('')
  const [apiKeySet, setApiKeySet] = useState(false)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [company, setCompany] = useState('')
  const [priority, setPriority] = useState('all')
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [allLeads, setAllLeads] = useState([])
  const [skipped, setSkipped] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [view, setView] = useState('grid')
  const [modal, setModal] = useState(null)
  const [error, setError] = useState('')
  const [loadProgress, setLoadProgress] = useState(null)
  const svcRef = useRef(null)
  const leadsRef = useRef([])
  const ivRef = useRef(null)

  // Keep leadsRef in sync for background updates
  const updateLeads = (newLeads) => {
    leadsRef.current = newLeads
    setAllLeads([...newLeads])
  }

  function saveApiKey() {
    const k = apiKey.trim()
    if (!k.startsWith('AIza')) { setError('API key must start with AIza'); return }
    setError('')
    const old = document.getElementById('gmaps-script')
    if (old) old.remove()
    const s = document.createElement('script')
    s.id = 'gmaps-script'
    s.src = `https://maps.googleapis.com/maps/api/js?key=${k}&libraries=places&callback=__mapsReady`
    s.async = true
    s.onerror = () => setError('Failed to load Maps SDK. Make sure: 1) Maps JavaScript API is enabled, 2) Places API is enabled, 3) Your API key allows kangtaoo.com as a referrer.')
    window.__mapsReady = () => {
      const el = document.getElementById('map-container')
      const map = new window.google.maps.Map(el, { center: { lat: 1.55, lng: 110.34 }, zoom: 12 })
      svcRef.current = new window.google.maps.places.PlacesService(map)
      setApiKeySet(true)
      setShowKeyInput(false)
    }
    document.head.appendChild(s)
  }

  function textSearch(q, pageToken) {
    return new Promise((res, rej) => {
      // Timeout after 15 seconds
      const timer = setTimeout(() => rej(new Error('Search timed out. Check your Google Places API key restrictions — make sure the domain kangtaoo.com is allowed, or set to unrestricted.')), 15000)
      const req = pageToken ? { query: q, pageToken } : { query: q }
      svcRef.current.textSearch(req, (results, status, pagination) => {
        clearTimeout(timer)
        if (status === 'OK' || status === 'ZERO_RESULTS') res({ results: results || [], pagination })
        else rej(new Error('Places error: ' + status + '. Check that Maps JavaScript API and Places API are enabled in Google Cloud Console.'))
      })
    })
  }

  function getDetail(pid) {
    return new Promise(res => {
      svcRef.current.getDetails(
        { placeId: pid, fields: ['website', 'formatted_phone_number'] },
        (r, s) => res(s === 'OK' ? r : null)
      )
    })
  }

  async function scan() {
    if (!apiKeySet || !svcRef.current) { setError('Please add your Google Places API key first.'); return }
    if (!industry.trim() || !location.trim()) { setError('Enter an industry and location.'); return }
    setError('')
    setScanning(true)
    setAllLeads([])
    leadsRef.current = []
    setCurrentPage(1)
    setSkipped({})
    setLoadProgress(null)
    setScanMsg(SCAN_MSGS[0])
    let msgIdx = 0
    ivRef.current = setInterval(() => {
      msgIdx++
      if (msgIdx < SCAN_MSGS.length - 1) setScanMsg(SCAN_MSGS[msgIdx])
    }, 900)

    const q = company.trim() ? `${company.trim()} ${location}` : `${industry} in ${location}`

    try {
      const { results: r1, pagination: p1 } = await textSearch(q)
      if (!r1.length) { setError('No results found. Try a different search term.'); return }

      clearInterval(ivRef.current)
      setScanning(false)

      const shaped1 = r1.map((p, i) => shapePlace(p, industry, i))
      leadsRef.current = shaped1
      setAllLeads([...shaped1])
      enrichBatch(shaped1)
      genHooks(shaped1)

      // Load pages 2 and 3 in background
      if (p1 && p1.hasNextPage) {
        setLoadProgress({ loaded: r1.length, total: 60 })
        await delay(2000)
        const { results: r2, pagination: p2 } = await textSearch(q, p1)
        const shaped2 = r2.map((p, i) => shapePlace(p, industry, leadsRef.current.length + i))
        const merged2 = [...leadsRef.current, ...shaped2]
        leadsRef.current = merged2
        setAllLeads([...merged2])
        setLoadProgress({ loaded: r1.length + r2.length, total: 60 })
        enrichBatch(shaped2)
        genHooks(shaped2)

        if (p2 && p2.hasNextPage) {
          await delay(2000)
          const { results: r3 } = await textSearch(q, p2)
          const shaped3 = r3.map((p, i) => shapePlace(p, industry, leadsRef.current.length + i))
          const merged3 = [...leadsRef.current, ...shaped3]
          leadsRef.current = merged3
          setAllLeads([...merged3])
          enrichBatch(shaped3)
          genHooks(shaped3)
        }
        setLoadProgress(null)
      }
    } catch (e) {
      setError(e.message)
      setScanning(false)
      clearInterval(ivRef.current)
    }
  }

  function enrichBatch(batch) {
    batch.forEach(lead => {
      getDetail(lead.pid).then(d => {
        const updated = leadsRef.current.map(l => {
          if (l.idx !== lead.idx) return l
          const phone = d?.formatted_phone_number || ''
          const website = d?.website || null
          return {
            ...l,
            phone,
            website,
            temp: scoreLead({ website, rating: l.rating, user_ratings_total: l.reviews }),
            sigs: buildSigs({ website, rating: l.rating, user_ratings_total: l.reviews }),
          }
        })
        leadsRef.current = updated
        setAllLeads([...updated])
      }).catch(() => {
        const updated = leadsRef.current.map(l => {
          if (l.idx !== lead.idx) return l
          return { ...l, website: null, temp: 'hot', sigs: ['No website found', 'Few online reviews'] }
        })
        leadsRef.current = updated
        setAllLeads([...updated])
      })
    })
  }

  async function genHooks(batch) {
    if (!batch.length) return
    const prompt = `For each business write one pitch hook sentence (max 12 words) for a web developer.\n\n${
      batch.map((l, i) => `${i + 1}. ${l.name} — signals: ${l.sigs.join(', ')}`).join('\n')
    }\n\nReturn ONLY a JSON array of ${batch.length} strings. No markdown.`
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      const raw = (data.text || '').replace(/```json|```/g, '').trim()
      const s = raw.indexOf('['), e = raw.lastIndexOf(']')
      const hooks = s > -1 ? JSON.parse(raw.slice(s, e + 1)) : []
      const updated = leadsRef.current.map(l => {
        const batchIdx = batch.findIndex(b => b.idx === l.idx)
        if (batchIdx === -1) return l
        return { ...l, hook: hooks[batchIdx] || 'A professional website could transform their business.' }
      })
      leadsRef.current = updated
      setAllLeads([...updated])
    } catch (e) {}
  }

  function getFiltered() {
    if (priority === 'hot') return allLeads.filter(l => l.temp === 'hot')
    if (priority === 'warm') return allLeads.filter(l => l.temp !== 'hot')
    return allLeads
  }

  function exportCSV() {
    const rows = [['Business', 'Type', 'Address', 'Phone', 'Website', 'Temperature', 'Signals', 'Rating', 'Reviews', 'Hook']]
    allLeads.forEach(l => rows.push([l.name, l.type, l.address, l.phone, l.website || '', l.temp, l.sigs.join(' | '), l.rating || '', l.reviews || '', l.hook]))
    const csv = rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'kangtaoo-leads.csv'
    a.click()
  }

  const filtered = getFiltered()
  const hot = filtered.filter(l => l.temp === 'hot').length
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div id="map-container" style={{ display: 'none' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 18 }}>
          Kang<span>Taoo</span>
        </button>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.4)', padding: '3px 10px', borderRadius: 3 }}>
          Lead Scanner · Beta
        </div>
      </nav>

      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 32px 60px' }}>

        {/* API Key Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '10px 14px', background: '#0D1424', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: apiKeySet ? 'var(--green)' : 'var(--red)', flexShrink: 0, transition: 'background 0.3s' }} />
          <div style={{ fontSize: 12, color: 'var(--muted)', flex: 1 }}>
            {apiKeySet ? 'Google Places API connected ✓' : 'Google Places API key required to fetch real business data'}
          </div>
          <button onClick={() => setShowKeyInput(v => !v)} style={{ fontSize: 11, color: 'var(--cyan)', background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
            {apiKeySet ? 'Change' : 'Add Key'}
          </button>
        </div>

        {/* API Key Input */}
        {showKeyInput && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 14 }}>
            <label style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, display: 'block' }}>
              Google Places API Key
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIza..." onKeyDown={e => e.key === 'Enter' && saveApiKey()} style={{ fontFamily: 'monospace' }} />
              <button onClick={saveApiKey} style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, padding: '9px 20px', cursor: 'pointer', flexShrink: 0 }}>
                Save
              </button>
            </div>
            <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, padding: '10px 14px', marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Enable <strong style={{ color: 'var(--text)' }}>Maps JavaScript API</strong> and <strong style={{ color: 'var(--text)' }}>Places API</strong> in Google Cloud Console. Your key stays in your browser only.
            </div>
          </div>
        )}

        {/* Search Form */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
            {[
              { label: 'Industry / Niche', val: industry, set: setIndustry, ph: 'e.g. lawyer, restaurant' },
              { label: 'Location', val: location, set: setLocation, ph: 'e.g. Kuching, Sarawak' },
              { label: 'Company Name (optional)', val: company, set: setCompany, ph: 'Search specific business' },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, display: 'block' }}>{label}</label>
                <input value={val} onChange={e => set(e.target.value)} placeholder={ph} onKeyDown={e => e.key === 'Enter' && scan()} />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, display: 'block' }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="all">All leads</option>
                <option value="hot">Hot (no website)</option>
                <option value="warm">Warm (has website)</option>
              </select>
            </div>
          </div>
          <button
            onClick={scan}
            disabled={scanning}
            style={{ width: '100%', marginTop: 4, background: scanning ? 'var(--border)' : 'var(--cyan)', color: scanning ? 'var(--muted)' : 'var(--bg)', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, padding: 11, cursor: scanning ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            {scanning ? scanMsg : '⬡ Scan for real leads'}
          </button>
        </div>

        {/* Scan animation */}
        {scanning && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 240, margin: '0 auto 8px' }}>
              <div style={{ height: '100%', width: '35%', background: 'var(--cyan)', animation: 'sweep 1.3s ease-in-out infinite' }} />
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--cyan)', opacity: 0.8 }}>{scanMsg}</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,91,127,0.08)', border: '1px solid rgba(255,91,127,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 14, fontSize: 12, color: 'var(--red)' }}>
            ⚠ {error}
          </div>
        )}

        {/* Load progress */}
        {loadProgress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', marginBottom: 14, fontSize: 12, color: 'var(--muted)' }}>
            <span>Loading more results…</span>
            <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--cyan)', width: `${Math.round(loadProgress.loaded / loadProgress.total * 100)}%`, transition: 'width 0.3s' }} />
            </div>
            <span style={{ color: 'var(--cyan)', whiteSpace: 'nowrap' }}>{loadProgress.loaded} / ~{loadProgress.total}</span>
          </div>
        )}

        {/* Stats */}
        {allLeads.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[['Total Leads', filtered.length], ['🔥 No Website', hot], ['◈ Warm / Cold', filtered.length - hot]].map(([lbl, val]) => (
              <div key={lbl} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--cyan)' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {allLeads.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{company || industry} · {location}</span>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'rgba(0,229,160,0.1)', color: 'var(--green)', border: '1px solid rgba(0,229,160,0.25)' }}>✓ Real data</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* View toggle */}
                <div style={{ display: 'flex', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                  {[['grid', '⊞ Grid'], ['list', '☰ List']].map(([v, label]) => (
                    <button key={v} onClick={() => setView(v)}
                      style={{ background: view === v ? 'var(--border)' : 'transparent', color: view === v ? 'var(--cyan)' : 'var(--muted)', border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: 13, transition: 'all 0.15s' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <button onClick={exportCSV} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, fontSize: 11, padding: '5px 12px', cursor: 'pointer' }}>
                  ↓ Export CSV
                </button>
              </div>
            </div>

            <div style={view === 'grid'
              ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }
              : { display: 'flex', flexDirection: 'column', gap: 8 }
            }>
              {paginated.filter(l => !skipped[l.idx]).map(lead => (
                <LeadCard
                  key={lead.idx}
                  lead={lead}
                  location={location}
                  view={view}
                  onPitch={() => setModal(lead)}
                  onSkip={() => setSkipped(s => ({ ...s, [lead.idx]: true }))}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={filtered.length}
              perPage={PER_PAGE}
              onChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            />
          </>
        )}
      </div>

      {modal && (
        <PitchModal
          lead={modal}
          location={location}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
