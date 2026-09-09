import { MongoClient } from 'mongodb'
import { randomBytes } from 'crypto'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'kangtaoo-secret-change-in-production'
)

async function getDb() {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  await client.connect()
  return { client, db: client.db('kangtaoo') }
}

async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { googleToken } = req.body
  if (!googleToken) return res.status(400).json({ error: 'Google token required' })

  let client
  try {
    // Verify Google token and get user info
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${googleToken}` }
    })
    if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google token' })
    const googleUser = await googleRes.json()

    const conn = await getDb()
    client = conn.client
    const users = conn.db.collection('users')

    // Find or create user
    let user = await users.findOne({ email: googleUser.email.toLowerCase() })
    if (!user) {
      const userId = 'user_' + randomBytes(8).toString('hex')
      await users.insertOne({
        userId,
        email: googleUser.email.toLowerCase(),
        name: googleUser.name,
        picture: googleUser.picture,
        provider: 'google',
        googleId: googleUser.sub,
        createdAt: Date.now(),
      })
      user = await users.findOne({ userId })
    } else if (!user.googleId) {
      // Link Google to existing email account
      await users.updateOne({ email: googleUser.email.toLowerCase() }, {
        $set: { googleId: googleUser.sub, picture: googleUser.picture, provider: 'google' }
      })
    }

    const token = await signToken({ userId: user.userId, email: user.email })
    return res.status(200).json({ token, userId: user.userId, email: user.email, name: user.name, picture: user.picture })
  } catch (e) {
    console.error('Google auth error:', e.message)
    return res.status(500).json({ error: e.message })
  } finally {
    if (client) await client.close().catch(() => {})
  }
}
