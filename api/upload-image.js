import { put } from '@vercel/blob'

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { imageData, filename } = req.body
  if (!imageData || !filename) return res.status(400).json({ error: 'imageData and filename required' })

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'BLOB_READ_WRITE_TOKEN not set', fallback: true })
  }

  try {
    const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!matches) return res.status(400).json({ error: 'Invalid image data' })

    const mimeType = matches[1]
    const buffer = Buffer.from(matches[2], 'base64')

    // Try public first, fall back to private automatically
    let blob
      try {
        const blob = await put(filename, buffer, {
          access: 'public',
          contentType: mimeType,
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        return res.status(200).json({ url: blob.url })
      } catch (e) {
        console.error('Blob upload error:', e)
        return res.status(500).json({ error: e.message })
      }
    
    // try {
    //   blob = await put(filename, buffer, {
    //     access: 'public',
    //     contentType: mimeType,
    //     addRandomSuffix: false,
    //     token: process.env.BLOB_READ_WRITE_TOKEN,
    //   })
    // } catch (e) {
    //   // Private store — use private access
    //   blob = await put(filename, buffer, {
    //     access: 'private',
    //     contentType: mimeType,
    //     addRandomSuffix: false,
    //     token: process.env.BLOB_READ_WRITE_TOKEN,
    //   })
    // }

    return res.status(200).json({ url: blob.url })
  } catch (e) {
    console.error('Blob upload error:', e)
    return res.status(500).json({ error: e.message, fallback: true })
  }
}
