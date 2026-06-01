/**
 * Gemini client helper
 * - If `GEMINI_API_URL` is provided, the helper will POST to that URL with the
 *   environment `GEMINI_API_KEY` (as `Authorization: Bearer <key>` if present).
 * - Otherwise, a local mock extractor is used for development so flows can be
 *   tested without a real Gemini key.
 */
import fetch from 'node-fetch'

function mockExtract(text) {
  // Very small heuristic extractor for dev: finds numbers and date-like tokens.
  const items = []
  const qtyMatches = text.match(/(\d+)\s*(unit|buah|pcs|item|unit)/i)
  if (qtyMatches) {
    items.push({ productName: 'Unknown Item', quantity: Number(qtyMatches[1]), unit: 'unit' })
  }

  // naive date match (YYYY-MM-DD or dd/mm/yyyy or dd-mm-yyyy)
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
  let startDate = null
  let endDate = null
  if (dateMatch) {
    startDate = dateMatch[0]
    endDate = dateMatch[0]
  }

  return {
    intent: 'booking_inquiry',
    items,
    startDate,
    endDate,
    notes: text.slice(0, 800),
    raw: { mocked: true },
    confidence: 0.55,
  }
}

export async function analyzeText(text) {
  if (!text) return { extractedData: {}, confidence: null }

  const apiUrl = process.env.GEMINI_API_URL
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiUrl || !apiKey) {
    console.warn('GEMINI_API_URL or GEMINI_API_KEY not set — using mock extractor')
    const res = mockExtract(text)
    return { extractedData: res, confidence: res.confidence }
  }

  try {
    const body = {
      // Generic contract — the external adapter should accept { prompt } or { text }
      prompt: `Extract booking intent and structured fields as JSON from the following message:\n\n${text}`,
      maxTokens: 800,
      temperature: 0.0,
      format: 'json',
    }

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const txt = await resp.text()
      console.error('Gemini API error:', resp.status, txt)
      return { extractedData: {}, confidence: null }
    }

    const data = await resp.json()

    // Expecting the adapter to return { extractedData: {...}, confidence: 0.9 }
    if (data.extractedData) {
      return { extractedData: data.extractedData, confidence: data.confidence ?? null }
    }

    // Fallback: if body contains `text` field with JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return { extractedData: parsed, confidence: parsed.confidence ?? null }
      } catch {}
    }

    // If the API returns `result` with `content` try to parse JSON inside
    if (data.result?.content) {
      try {
        const parsed = JSON.parse(data.result.content)
        return { extractedData: parsed, confidence: parsed.confidence ?? null }
      } catch {}
    }

    // As last resort, use mock extractor
    return mockExtract(text)
  } catch (err) {
    console.error('analyzeText error:', err)
    return mockExtract(text)
  }
}
