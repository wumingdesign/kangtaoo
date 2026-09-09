export default async function handler(req, res) {
  const checks = {
    mongoUri: !!process.env.MONGODB_URI,
    mongoUriPrefix: process.env.MONGODB_URI?.slice(0, 20) || 'NOT SET',
    googleKey: !!process.env.GOOGLE_PLACES_API_KEY,
    googleKeyPrefix: process.env.GOOGLE_PLACES_API_KEY?.slice(0, 8) || 'NOT SET',
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    blobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 15) || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  }

  // Test MongoDB connection
  try {
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
    await client.connect()
    const db = client.db('kangtaoo')
    const count = await db.collection('drafts').countDocuments()
    await client.close()
    checks.mongoConnected = true
    checks.draftCount = count
  } catch(e) {
    checks.mongoConnected = false
    checks.mongoError = e.message
  }

  return res.status(200).json(checks)
}
