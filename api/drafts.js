// api/drafts.js — MongoDB draft storage
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
let client, db

async function getDb() {
  if (!client) {
    client = new MongoClient(uri)
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

    // GET — fetch all drafts for user
    if (req.method === 'GET') {
      const drafts = await col
        .find({ userId })
        .sort({ savedAt: -1 })
        .limit(100)
        .toArray()
      return res.status(200).json({ drafts })
    }

    // POST — save or update draft
    if (req.method === 'POST') {
      const draft = req.body
      if (!draft?.id) return res.status(400).json({ error: 'draft.id required' })

      // Safety: strip any base64 data that slipped through
      const safe = { ...draft }
      if (safe.mockupCfg) safe.mockupCfg = { ...safe.mockupCfg, bgImage: null, navLogoImg: null }
      if (safe.brand) safe.brand = { ...safe.brand, logo: null }
      safe.htmlContent = '' // always strip — rebuilt on client

      // Check size (MongoDB 16MB limit, we target <100KB per draft)
      const size = JSON.stringify(safe).length
      if (size > 500000) return res.status(413).json({ error: 'Draft too large (' + Math.round(size/1024) + 'KB). Images must be uploaded separately.' })

      await col.updateOne(
        { id: safe.id, userId },
        { $set: { ...safe, userId, updatedAt: Date.now() }, $setOnInsert: { savedAt: safe.savedAt || Date.now() } },
        { upsert: true }
      )
      return res.status(200).json({ ok: true })
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
