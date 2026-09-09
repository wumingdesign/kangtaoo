// api/drafts.js — MongoDB draft storage (stores everything including images)
import { MongoClient } from 'mongodb'

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
}

const uri = process.env.MONGODB_URI
let client, db

async function getDb() {
  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    await client.connect()
    db = client.db('kangtaoo')
  }
  return db
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = await getDb()
    const col = db.collection('drafts')
    const { userId } = req.query

    if (!userId) return res.status(400).json({ error: 'userId required' })

    // GET — fetch all drafts for this user
    if (req.method === 'GET') {
      const drafts = await col
        .find({ userId }, {
          projection: {
            // Exclude large image fields from list view for speed
            // They are loaded when opening individual draft
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

    // POST — save or update a draft
    if (req.method === 'POST') {
      const draft = req.body
      if (!draft?.id) return res.status(400).json({ error: 'draft.id required' })

      // Server-side safety: always strip large base64 fields
      const safe = { ...draft }
      if (safe.mockupCfg) safe.mockupCfg = { ...safe.mockupCfg, bgImage: null, navLogoImg: null }
      if (safe.brand) safe.brand = { ...safe.brand, logo: null }
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

    // GET single draft with full data (images included)
    if (req.method === 'GET' && req.query.draftId) {
      const draft = await col.findOne({ id: req.query.draftId, userId })
      if (!draft) return res.status(404).json({ error: 'Draft not found' })
      return res.status(200).json({ draft })
    }

    // DELETE — remove a draft
    if (req.method === 'DELETE') {
      const { draftId } = req.query
      if (!draftId) return res.status(400).json({ error: 'draftId required' })
      await col.deleteOne({ id: draftId, userId })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    console.error('Drafts API error:', e)
    return res.status(500).json({ error: e.message })
  }
}
