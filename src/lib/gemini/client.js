/**
 * Gemini client helper
 * - If `GEMINI_API_URL` is provided, the helper will POST to that URL with the
 *   environment `GEMINI_API_KEY` (as `Authorization: Bearer <key>` if present).
 * - Otherwise, a local mock extractor is used for development so flows can be
 *   tested without a real Gemini key.
 */
import fetch from 'node-fetch'

function mockExtract(text) {
  // Regex parser for our standard template format
  const nameMatch = text.match(/Nama Penyewa:\s*([^\n\r]+)/i)
  const productMatch = text.match(/Produk:\s*([^\n\r]+)/i)
  const qtyMatch = text.match(/Jumlah Unit:\s*(\d+)/i)
  const durationMatch = text.match(/Waktu Sewa:\s*([^\n\r]+)/i)
  const dateMatch = text.match(/Tanggal Mulai:\s*([\d\-\/]+)/i)
  const notesMatch = text.match(/Catatan:\s*([^\n\r]+)/i)

  const tenantName = nameMatch ? nameMatch[1].trim() : 'Penyewa Demo'
  let productName = productMatch ? productMatch[1].trim() : 'Sony A7 III Body'
  
  // Clean up productName matching to match our seeded product names
  if (productName.toLowerCase().includes('sony') || productName.toLowerCase().includes('a7')) {
    productName = 'Sony A7 III Body'
  } else if (productName.toLowerCase().includes('dji') || productName.toLowerCase().includes('mini')) {
    productName = 'DJI Mini 3 Pro'
  } else if (productName.toLowerCase().includes('light') || productName.toLowerCase().includes('lighting')) {
    productName = 'Lighting Kit Pro'
  } else if (productName.toLowerCase().includes('tripod')) {
    productName = 'Tripod Carbon'
  }

  const quantity = qtyMatch ? Number(qtyMatch[1]) : 1
  const notes = notesMatch ? notesMatch[1].trim() : 'Booking via WhatsApp AI'

  let startDateStr = dateMatch ? dateMatch[1].trim() : null
  let startDate = null
  let endDate = null

  if (startDateStr) {
    // Normalise slash to dash
    startDateStr = startDateStr.replace(/\//g, '-')
    const d = new Date(startDateStr)
    if (!isNaN(d.getTime())) {
      startDate = d.toISOString().split('T')[0]
      
      // Calculate duration in days
      let days = 1
      if (durationMatch) {
        const daysParsed = parseInt(durationMatch[1])
        if (!isNaN(daysParsed)) days = daysParsed
      }
      const endD = new Date(d.getTime() + days * 24 * 3600 * 1000)
      endDate = endD.toISOString().split('T')[0]
    }
  }

  if (!startDate) {
    const today = new Date()
    startDate = today.toISOString().split('T')[0]
    endDate = new Date(today.getTime() + 24 * 3600 * 1000).toISOString().split('T')[0]
  }

  return {
    intent: 'booking_inquiry',
    customerName: tenantName,
    items: [
      {
        productName,
        quantity,
        unit: 'daily',
      }
    ],
    startDate,
    endDate,
    notes,
    raw: { mocked: true, parsedFromTemplate: true },
    confidence: 0.95, // High confidence since it follows standard structure
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
