import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customers, conversations, messages, aiDrafts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'

function normalizePhone(number) {
  if (!number) return number
  return number.replace(/[^0-9+]/g, '')
}

function verifySignature(rawBody, signature) {
  const key = process.env.INNGEST_SIGNING_KEY
  if (!key) return true // if no key configured, skip verification (dev)
  if (!signature) return false

  const h = crypto.createHmac('sha256', key).update(rawBody).digest('hex')
  // Accept either raw hex or 'sha256=' prefixed
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
    const event = body?.event
    const payload = body?.payload

    if (!event || !payload) {
      return NextResponse.json({ ok: false, error: 'Missing event or payload' }, { status: 400 })
    }

    if (event !== 'chat.received') {
      return NextResponse.json({ ok: false, error: 'Unsupported event' }, { status: 400 })
    }

    const tenantId = payload.tenantId
    const from = normalizePhone(payload.from)
    const content = payload.content ?? ''
    const waMessageId = payload.waMessageId ?? null
    const mediaUrl = payload.mediaUrl ?? null
    const mediaType = payload.mediaType ?? null
    const sentAt = payload.sentAt ? new Date(payload.sentAt) : new Date()

    if (!tenantId || !from) {
      return NextResponse.json({ ok: false, error: 'tenantId and from required' }, { status: 400 })
    }

    // 1) Find or create customer by phone
    let customer = await db.query.customers.findFirst({
      where: (c, { eq }) => and(eq(c.tenantId, tenantId), eq(c.phoneNumber, from)),
    })

    if (!customer) {
      const [newCustomer] = await db.insert(customers).values({
        tenantId,
        name: payload.name ?? from,
        phoneNumber: from,
      }).returning()
      customer = newCustomer
    }

    // 2) Find or create conversation for this customer
    let conv = await db.query.conversations.findFirst({
      where: (c, { eq }) => and(eq(c.tenantId, tenantId), eq(c.customerId, customer.id)),
    })

    if (!conv) {
      const [newConv] = await db.insert(conversations).values({
        tenantId,
        customerId: customer.id,
        waConversationId: payload.waConversationId ?? null,
        lastMessageAt: sentAt,
        lastMessagePreview: content.substring(0, 200),
        unreadCount: 1,
      }).returning()
      conv = newConv
    }

    // 3) Insert message
    const [msg] = await db.insert(messages).values({
      tenantId,
      conversationId: conv.id,
      waMessageId,
      direction: 'inbound',
      content,
      mediaUrl,
      mediaType,
      aiAnalysis: {},
      isRead: false,
      sentAt,
    }).returning()

    // 4) Update conversation meta
    await db.update(conversations).set({
      lastMessageAt: sentAt,
      lastMessagePreview: content.substring(0, 200),
      unreadCount: conv.unreadCount + 1,
    }).where(eq(conversations.id, conv.id))

    // 5) Create an AI draft placeholder (Gemini analysis will fill this later)
    await db.insert(aiDrafts).values({
      tenantId,
      messageId: msg.id,
      conversationId: conv.id,
      customerId: customer.id,
      status: 'pending',
      extractedData: {},
      confidence: null,
    })

    return NextResponse.json({ ok: true, customerId: customer.id, conversationId: conv.id, messageId: msg.id })
  } catch (err) {
    console.error('inngest webhook error:', err)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
