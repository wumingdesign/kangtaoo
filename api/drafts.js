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
      await col.updateOne(
        { id: draft.id, userId },
        { $set: { ...draft, userId, updatedAt: Date.now() } },
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
