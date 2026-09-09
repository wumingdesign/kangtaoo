import { put } from '@vercel/blob'

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { imageData, filename } = req.body
  if (!imageData || !filename) return res.status(400).json({ error: 'imageData and filename required' })

  try {
    const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!matches) return res.status(400).json({ error: 'Invalid image data' })

    const mimeType = matches[1]
    const buffer = Buffer.from(matches[2], 'base64')

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({ error: 'BLOB_READ_WRITE_TOKEN not set', fallback: true })
    }

    // Use 'public' if store allows it, otherwise 'private'
    // For private stores we serve via /api/serve-image instead
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimeType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return res.status(200).json({ url: blob.url })
  } catch (e) {
    // Private store — try with private access and return a served URL
    if (e.message?.includes('private store')) {
      try {
        const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/)
        const buffer = Buffer.from(matches[2], 'base64')
        const blob = await put(filename, buffer, {
          access: 'private',
          contentType: matches[1],
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        // Return the blob URL — private blobs need token to serve
        return res.status(200).json({ url: blob.url, isPrivate: true })
      } catch (e2) {
        return res.status(500).json({ error: e2.message, fallback: true })
      }
    }
    console.error('Blob upload error:', e)
    return res.status(500).json({ error: e.message, fallback: true })
  }
}
