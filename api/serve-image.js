import { getDownloadUrl } from '@vercel/blob'

export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'url required' })

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Not configured' })
  }

  try {
    // Generate a signed download URL for private blobs (valid 1 hour)
    const downloadUrl = await getDownloadUrl(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      expiresIn: 3600,
    })
    // Redirect to signed URL
    res.setHeader('Cache-Control', 'public, max-age=3500')
    return res.redirect(downloadUrl)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
