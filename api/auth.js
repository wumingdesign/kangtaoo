import { MongoClient } from 'mongodb'
import { createHash, randomBytes } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'kangtaoo-secret-change-in-production'
)

async function getDb() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  })
  await client.connect()
  return { client, db: client.db('kangtaoo') }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(password + salt).digest('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const attempt = createHash('sha256').update(password + salt).digest('hex')
  return attempt === hash
}

async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }

export default async function handler(req, res) {
  const { action } = req.query
  let client

  try {
    const conn = await getDb()
    client = conn.client
    const users = conn.db.collection('users')

    // ── REGISTER ──
    if (action === 'register' && req.method === 'POST') {
      const { email, password, name } = req.body
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

      const existing = await users.findOne({ email: email.toLowerCase() })
      if (existing) return res.status(409).json({ error: 'Email already registered' })

      const userId = 'user_' + randomBytes(8).toString('hex')
      await users.insertOne({
        userId,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        password: hashPassword(password),
        provider: 'email',
        createdAt: Date.now(),
      })

      const token = await signToken({ userId, email: email.toLowerCase() })
      return res.status(200).json({ token, userId, email: email.toLowerCase(), name: name || email.split('@')[0] })
    }

    // ── LOGIN ──
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

      const user = await users.findOne({ email: email.toLowerCase() })
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      const token = await signToken({ userId: user.userId, email: user.email })
      return res.status(200).json({ token, userId: user.userId, email: user.email, name: user.name })
    }

    // ── ME (verify token) ──
    if (action === 'me' && req.method === 'GET') {
      const authHeader = req.headers.authorization
      if (!authHeader) return res.status(401).json({ error: 'No token' })
      const token = authHeader.replace('Bearer ', '')
      const payload = await verifyToken(token)
      if (!payload) return res.status(401).json({ error: 'Invalid token' })

      const user = await users.findOne({ userId: payload.userId })
      if (!user) return res.status(404).json({ error: 'User not found' })

      return res.status(200).json({ userId: user.userId, email: user.email, name: user.name })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (e) {
    console.error('Auth error:', e.message)
    return res.status(500).json({ error: e.message })
  } finally {
    if (client) await client.close().catch(() => {})
  }
}
