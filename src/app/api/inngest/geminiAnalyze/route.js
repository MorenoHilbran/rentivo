import { NextResponse } from 'next/server'
import { analyzeDraftById } from '@/lib/inngest/geminiAnalyze'
import crypto from 'crypto'

function verifySignature(rawBody, signature) {
  const key = process.env.INNGEST_SIGNING_KEY
  if (!key) return true
  if (!signature) return false
  const h = crypto.createHmac('sha256', key).update(rawBody).digest('hex')
  if (signature === h) return true
  if (signature === `sha256=${h}`) return true
  return false
}

export async function POST(request) {
  try {
    const raw = await request.text()
    const signature = request.headers.get('x-inngest-signature')

    if (!verifySignature(raw, signature)) {
      return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
    }

    const body = JSON.parse(raw)
    const draftId = body?.draftId

    if (!draftId) {
      return NextResponse.json({ ok: false, error: 'draftId required' }, { status: 400 })
    }

    const result = await analyzeDraftById(draftId)
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    console.error('geminiAnalyze route error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
