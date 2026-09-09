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

      console.log('Saving draft id:', draft.id, 'userId:', userId)

      // Deep clean — remove any base64, undefined, or problematic values
      function deepClean(obj) {
        if (obj === null || obj === undefined) return null
        if (typeof obj === 'string') {
          // Strip base64 data URLs
          if (obj.startsWith('data:')) return null
          return obj
        }
        if (Array.isArray(obj)) return obj.map(deepClean)
        if (typeof obj === 'object') {
          const clean = {}
          for (const [k, v] of Object.entries(obj)) {
            const cleaned = deepClean(v)
            if (cleaned !== undefined) clean[k] = cleaned
          }
          return clean
        }
        return obj
      }

      const safe = deepClean({ ...draft, htmlContent: '', userId })

      console.log('Safe draft size:', JSON.stringify(safe).length, 'bytes')

      const { savedAt, ...safeWithoutSavedAt } = safe
      await col.updateOne(
        { id: safe.id, userId },
        {
          $set: { ...safeWithoutSavedAt, updatedAt: Date.now() },
          $setOnInsert: { savedAt: savedAt || Date.now() }
        },
        { upsert: true }
      )
      console.log('Draft saved successfully:', draft.id)
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
