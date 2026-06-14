/**
 * Gemini client — Native Google Generative AI integration
 * =========================================================
 * Menggunakan Google Gemini 2.0 Flash langsung via official REST API.
 * Tidak memerlukan proxy URL tambahan — cukup set GEMINI_API_KEY.
 *
 * Fallback: Jika API Key tidak tersedia, mock regex extractor digunakan
 * agar flow development tetap bisa berjalan tanpa konfigurasi tambahan.
 */

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * JSON Schema untuk structured output Gemini.
 * Memastikan response 100% valid dan tidak pernah salah format.
 */
const BOOKING_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: ['booking_request', 'price_inquiry', 'availability_check', 'greeting', 'complaint', 'other'],
      description: 'Intent utama dari pesan pengguna',
    },
    customerName: {
      type: 'string',
      description: 'Nama penyewa yang disebutkan dalam pesan, atau string kosong jika tidak ada',
    },
    items: {
      type: 'array',
      description: 'Daftar produk yang ingin disewa',
      items: {
        type: 'object',
        properties: {
          productName: {
            type: 'string',
            description: 'Nama produk / alat yang ingin disewa',
          },
          quantity: {
            type: 'integer',
            description: 'Jumlah unit yang diinginkan',
            minimum: 1,
          },
          unit: {
            type: 'string',
            enum: ['hourly', 'daily', 'weekly'],
            description: 'Satuan waktu sewa',
          },
        },
        required: ['productName', 'quantity', 'unit'],
      },
    },
    startDate: {
      type: 'string',
      description: 'Tanggal mulai sewa dalam format ISO 8601 (YYYY-MM-DD), string kosong jika tidak disebutkan',
    },
    endDate: {
      type: 'string',
      description: 'Tanggal selesai sewa dalam format ISO 8601 (YYYY-MM-DD), string kosong jika tidak disebutkan',
    },
    notes: {
      type: 'string',
      description: 'Catatan tambahan dari penyewa, atau string kosong',
    },
    confidence: {
      type: 'number',
      description: 'Tingkat keyakinan ekstraksi antara 0.0 sampai 1.0',
      minimum: 0.0,
      maximum: 1.0,
    },
  },
  required: ['intent', 'customerName', 'items', 'startDate', 'endDate', 'notes', 'confidence'],
}

/**
 * Fallback mock extractor berbasis regex.
 * Dipakai saat GEMINI_API_KEY tidak tersedia.
 */
function mockExtract(text) {
  const nameMatch = text.match(/Nama Penyewa:\s*([^\n\r]+)/i)
  const productMatch = text.match(/Produk:\s*([^\n\r]+)/i)
  const qtyMatch = text.match(/Jumlah Unit:\s*(\d+)/i)
  const durationMatch = text.match(/Waktu Sewa:\s*([^\n\r]+)/i)
  const dateMatch = text.match(/Tanggal Mulai:\s*([\d\-\/]+)/i)
  const notesMatch = text.match(/Catatan:\s*([^\n\r]+)/i)

  const tenantName = nameMatch ? nameMatch[1].trim() : 'Penyewa Demo'
  let productName = productMatch ? productMatch[1].trim() : 'Sony A7 III Body'

  // Normalise product names ke seeded products
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
  let startDate = ''
  let endDate = ''

  if (startDateStr) {
    startDateStr = startDateStr.replace(/\//g, '-')
    const d = new Date(startDateStr)
    if (!isNaN(d.getTime())) {
      startDate = d.toISOString().split('T')[0]
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
    intent: 'booking_request',
    customerName: tenantName,
    items: [{ productName, quantity, unit: 'daily' }],
    startDate,
    endDate,
    notes,
    confidence: 0.85,
    raw: { mocked: true },
  }
}

/**
 * Analisis teks pesan WhatsApp menggunakan Gemini 2.0 Flash.
 * Mengembalikan data terstruktur untuk membuat AI Draft booking.
 *
 * @param {string} text - Isi pesan dari pelanggan
 * @returns {{ extractedData: object, confidence: number|null }}
 */
export async function analyzeText(text) {
  if (!text || text.trim().length < 5) {
    return { extractedData: {}, confidence: null }
  }

  const apiKey = process.env.GEMINI_API_KEY

  // Fallback ke mock jika API key tidak ada
  if (!apiKey) {
    console.warn('[Gemini] GEMINI_API_KEY tidak diset — menggunakan mock extractor')
    const res = mockExtract(text)
    return { extractedData: res, confidence: res.confidence }
  }

  const today = new Date().toISOString().split('T')[0]
  const systemPrompt = `Kamu adalah asisten CRM penyewaan alat. Tugasmu menganalisis pesan WhatsApp dari pelanggan bisnis rental Indonesia.

Ekstrak informasi pemesanan dengan akurat dari pesan berikut. Tanggal hari ini adalah: ${today}.

Aturan penting:
- Jika pelanggan menyebut "besok", hitung dari tanggal hari ini (${today})
- Jika pelanggan menyebut "minggu depan", tambah 7 hari dari hari ini
- Jika durasi disebutkan tanpa tanggal mulai, gunakan hari ini sebagai tanggal mulai
- Jika tidak ada informasi produk jelas, kembalikan items array kosong
- Konversi semua tanggal ke format YYYY-MM-DD
- Jika intent bukan booking (hanya sapaan/pertanyaan), kembalikan items kosong dan confidence rendah
- confidence harus mencerminkan seberapa yakin kamu terhadap data yang diekstrak (0.0 - 1.0)

Nama produk yang tersedia di sistem:
- Sony A7 III Body (kamera mirrorless full-frame)
- DJI Mini 3 Pro (drone)
- Lighting Kit Pro (paket lampu studio)
- Tripod Carbon (tripod ringan)

Usahakan mencocokkan nama produk yang disebutkan pelanggan ke nama yang ada di sistem di atas.`

  try {
    const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nPesan pelanggan:\n${text}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: BOOKING_EXTRACTION_SCHEMA,
      },
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error(`[Gemini] API error ${resp.status}:`, errText)
      // Fallback ke mock saat API error
      const res = mockExtract(text)
      return { extractedData: res, confidence: res.confidence }
    }

    const data = await resp.json()

    // Parse JSON dari Gemini structured output
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) {
      console.warn('[Gemini] Respons kosong dari Gemini API, fallback ke mock')
      const res = mockExtract(text)
      return { extractedData: res, confidence: res.confidence }
    }

    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch (parseErr) {
      console.error('[Gemini] Gagal parse JSON response:', parseErr)
      const res = mockExtract(text)
      return { extractedData: res, confidence: res.confidence }
    }

    // Validasi minimal: pastikan confidence dan items ada
    if (typeof parsed.confidence !== 'number') {
      parsed.confidence = parsed.items?.length > 0 ? 0.7 : 0.3
    }

    return {
      extractedData: parsed,
      confidence: parsed.confidence,
    }
  } catch (err) {
    console.error('[Gemini] Network error:', err)
    const res = mockExtract(text)
    return { extractedData: res, confidence: res.confidence }
  }
}
