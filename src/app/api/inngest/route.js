import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customers, conversations, messages, aiDrafts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'

function normalizePhone(number) {
  if (!number) return number
  if (number.includes('@lid')) {
    const cleanNum = number.split('@')[0].replace(/[^0-9]/g, '')
    return `${cleanNum}@lid`
  }
  return number.replace(/[^0-9+]/g, '')
}

function verifySignature(rawBody, signature) {
  const key = process.env.BAILEYS_WEBHOOK_SECRET || process.env.INNGEST_SIGNING_KEY
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

    // Check if the message matches our booking template format
    const hasTemplate = content.includes('Nama Penyewa:') || content.includes('Produk:')

    if (!hasTemplate) {
      // It's a greeting/other message. Reply with our booking template!
      const templateText = `Halo! Selamat datang di Rentivo. Silakan isi format berikut untuk melakukan pemesanan:

Nama Penyewa: [Nama Anda]
Produk: [Nama Produk, cth: Sony A7 III Body]
Jumlah Unit: [Jumlah, cth: 1]
Waktu Sewa: [Hari/Jam, cth: 3 hari]
Tanggal Mulai: [Format YYYY-MM-DD, cth: 2026-06-10]
Catatan: [Catatan Anda]`

      // Insert outbound auto-reply message
      await db.insert(messages).values({
        tenantId,
        conversationId: conv.id,
        direction: 'outbound',
        content: templateText,
        sentAt: new Date(sentAt.getTime() + 1000),
      })

      // Update conversation with auto-reply message
      await db.update(conversations).set({
        lastMessageAt: new Date(sentAt.getTime() + 1000),
        lastMessagePreview: templateText.substring(0, 200),
      }).where(eq(conversations.id, conv.id))

      // Send auto-reply template to WhatsApp via Baileys Bridge
      let replied = false
      let replyError = null
      let baileysUrl = process.env.NEXT_PUBLIC_BAILEYS_SERVICE_URL || process.env.BAILEYS_SERVICE_URL
      if (baileysUrl && from) {
        baileysUrl = baileysUrl.trim().replace(/\/$/, '')
        if (!baileysUrl.startsWith('http://') && !baileysUrl.startsWith('https://')) {
          baileysUrl = `https://${baileysUrl}`
        }
        try {
          const sendResp = await fetch(`${baileysUrl}/api/send-message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': process.env.BAILEYS_WEBHOOK_SECRET ?? '',
            },
            body: JSON.stringify({
              to: from,
              text: templateText,
            }),
            signal: AbortSignal.timeout(5000),
          })
          if (sendResp.ok) {
            replied = true
            console.log('[Baileys] Auto-reply template sent to', from)
          } else {
            const errTxt = await sendResp.text().catch(() => '')
            replyError = `Status ${sendResp.status}: ${errTxt}`
            console.warn('[Baileys] Failed to send auto-reply: ', replyError)
          }
        } catch (err) {
          replyError = err.message
          console.warn('[Baileys] Failed to send auto-reply: ', err.message)
        }
      } else {
        replyError = `Config error: baileysUrl=${baileysUrl ? 'present' : 'missing'}, from=${from ? 'present' : 'missing'}`
        console.warn('[Baileys] Cannot send auto-reply: ', replyError)
      }

      return NextResponse.json({
        ok: true,
        repliedWithTemplate: true,
        customerId: customer.id,
        conversationId: conv.id,
        baileysSuccess: replied,
        baileysError: replyError
      })
    }

    // 5) Create an AI draft placeholder since the customer replied with template data
    const [draft] = await db.insert(aiDrafts).values({
      tenantId,
      messageId: msg.id,
      conversationId: conv.id,
      customerId: customer.id,
      status: 'pending',
      extractedData: {},
      confidence: null,
    }).returning()

    // Synchronously run the AI analysis so that draft information updates instantly for testing
    const { analyzeDraftById } = await import('@/lib/inngest/geminiAnalyze')
    await analyzeDraftById(draft.id)

    return NextResponse.json({ ok: true, customerId: customer.id, conversationId: conv.id, messageId: msg.id, draftId: draft.id })
  } catch (err) {
    console.error('inngest webhook error:', err)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
