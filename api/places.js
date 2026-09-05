// api/places.js — Google Places proxy (keeps API key server-side)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { query, type } = req.body
  if (!query) return res.status(400).json({ error: 'query required' })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Google API key not configured' })

  try {
    if (type === 'details') {
      // Place Details
      const { placeId } = req.body
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,url,types&key=${apiKey}`
      const r = await fetch(url)
      const data = await r.json()
      return res.status(200).json(data)
    }

    // Text Search — returns up to 60 results across pages
    const allResults = []
    let pageToken = null
    let pages = 0

    do {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
      if (pageToken) url += `&pagetoken=${pageToken}`

      const r = await fetch(url)
      const data = await r.json()

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        return res.status(200).json({ error: data.status, results: allResults })
      }

      allResults.push(...(data.results || []))
      pageToken = data.next_page_token || null
      pages++

      // Google requires a short delay before next_page_token is valid
      if (pageToken && pages < 3) await new Promise(r => setTimeout(r, 2000))

    } while (pageToken && pages < 3)

    return res.status(200).json({ results: allResults, total: allResults.length })
  } catch (e) {
    console.error('Places API error:', e)
    return res.status(500).json({ error: e.message })
  }
}
