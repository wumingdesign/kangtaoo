// api/upload-image.js — Store images in Vercel Blob
import { put } from '@vercel/blob'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { imageData, filename } = req.body
  if (!imageData || !filename) return res.status(400).json({ error: 'imageData and filename required' })

  try {
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const mimeType = imageData.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/png'

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimeType,
    })

    return res.status(200).json({ url: blob.url })
  } catch (e) {
    console.error('Upload error:', e)
    return res.status(500).json({ error: e.message })
  }
}
