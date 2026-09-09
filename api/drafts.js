import { MongoClient } from 'mongodb'

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
}

// Fix: create fresh client each time to avoid stale connections in serverless
async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable not set')
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 8000,
  })
  await client.connect()
  return { client, db: client.db('kangtaoo') }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  let client
  try {
    const conn = await getDb()
    client = conn.client
    const col = conn.db.collection('drafts')
    const { userId, draftId } = req.query

    if (!userId) return res.status(400).json({ error: 'userId required' })

    // GET single draft
    if (req.method === 'GET' && draftId) {
      const draft = await col.findOne({ id: draftId, userId })
      if (!draft) return res.status(404).json({ error: 'Draft not found' })
      return res.status(200).json({ draft })
    }

    // GET all drafts for user
    if (req.method === 'GET') {
      const drafts = await col
        .find({ userId }, {
          projection: {
            'mockupCfg.bgImage': 0,
            'mockupCfg.navLogoImg': 0,
            'brand.logo': 0,
            htmlContent: 0,
          }
        })
        .sort({ updatedAt: -1, savedAt: -1 })
        .limit(100)
        .toArray()
      return res.status(200).json({ drafts })
    }

    // POST — save or update
    if (req.method === 'POST') {
      const draft = req.body
      if (!draft?.id) return res.status(400).json({ error: 'draft.id required' })

      // Strip any base64 that slipped through (safety net)
      const safe = { ...draft }
      if (safe.mockupCfg) {
        const bg = safe.mockupCfg.bgImage
        const nl = safe.mockupCfg.navLogoImg
        safe.mockupCfg = {
          ...safe.mockupCfg,
          bgImage: bg?.startsWith('http') ? bg : null,
          navLogoImg: nl?.startsWith('http') ? nl : null,
        }
      }
      if (safe.brand) {
        const logo = safe.brand.logo
        safe.brand = { ...safe.brand, logo: logo?.startsWith('http') ? logo : null }
      }
      safe.htmlContent = ''

      await col.updateOne(
        { id: safe.id, userId },
        {
          $set: { ...safe, userId, updatedAt: Date.now() },
          $setOnInsert: { savedAt: safe.savedAt || Date.now() }
        },
        { upsert: true }
      )
      return res.status(200).json({ ok: true })
    }

    // DELETE
    if (req.method === 'DELETE') {
      if (!draftId) return res.status(400).json({ error: 'draftId required' })
      await col.deleteOne({ id: draftId, userId })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (e) {
    console.error('Drafts API error:', e.message)
    return res.status(500).json({ error: e.message })
  } finally {
    // Always close the connection to avoid serverless connection leaks
    if (client) await client.close().catch(() => {})
  }
}
