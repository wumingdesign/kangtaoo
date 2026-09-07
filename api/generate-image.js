// api/generate-image.js — DALL-E 3 image generation proxy
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt, size = '1792x1024', quality = 'standard' } = req.body
  if (!prompt) return res.status(400).json({ error: 'prompt required' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured. Add OPENAI_API_KEY to Vercel environment variables.' })

  try {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,        // '1024x1024' | '1792x1024' | '1024x1792'
        quality,     // 'standard' | 'hd'
        response_format: 'url',
      }),
    })
    const data = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || 'OpenAI error' })
    return res.status(200).json({ url: data.data?.[0]?.url })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
