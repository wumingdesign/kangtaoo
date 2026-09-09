// api/places.js — Google Places proxy
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Google API key not configured' })

  const { query, type, placeId } = req.body

  try {
    // ── Place Details (website + phone) ──
    if (type === 'details' && placeId) {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=website,formatted_phone_number&key=${apiKey}`
      const r = await fetch(url)
      const data = await r.json()
      if (data.status !== 'OK') return res.status(200).json({ result: null, status: data.status })
      return res.status(200).json({ result: data.result || null })
    }

    // ── Text Search — fetch all pages (up to 60 results) ──
    if (!query) return res.status(400).json({ error: 'query required' })

    const allResults = []
    let pageToken = null
    let pages = 0

    do {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
      if (pageToken) url += `&pagetoken=${encodeURIComponent(pageToken)}`

      const r = await fetch(url)
      const data = await r.json()

      if (data.status === 'INVALID_REQUEST' && pages > 0) break // page token expired
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        return res.status(200).json({ error: data.status, results: allResults })
      }

      allResults.push(...(data.results || []))
      pageToken = data.next_page_token || null
      pages++

      // Google requires 2s delay before next_page_token is usable
      if (pageToken && pages < 3) {
        await new Promise(r => setTimeout(r, 2000))
      }
    } while (pageToken && pages < 3)

    return res.status(200).json({ results: allResults, total: allResults.length })
  } catch (e) {
    console.error('Places API error:', e)
    return res.status(500).json({ error: e.message })
  }
}
