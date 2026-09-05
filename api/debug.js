// Temporary debug endpoint - DELETE after fixing
export default async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_API_KEY || 'NOT SET'
  res.status(200).json({
    keySet: !!process.env.GOOGLE_PLACES_API_KEY,
    keyPrefix: key.slice(0, 8),
    keySuffix: key.slice(-4),
    keyLength: key.length,
    mongoSet: !!process.env.MONGODB_URI,
  })
}
