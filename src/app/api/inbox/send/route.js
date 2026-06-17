import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, conversations, customers } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { eq, and } from 'drizzle-orm'

/**
 * POST /api/inbox/send
 * --------------------
 * Menyimpan pesan keluar ke database DAN mengirimkan ke WhatsApp
 * nyata via Baileys microservice (jika tersedia).
 *
 * Menerima form data:
 * - conversationId: string (UUID)
 * - content: string (isi pesan)
 */
export async function POST(request) {
  try {
    const { tenantId } = await requireTenantAuth()

    // Parse form data
    const formData = await request.formData()
    const conversationId = formData.get('conversationId')
    const content = formData.get('content')

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ ok: false, error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    // Ambil conversation beserta nomor HP customer untuk pengiriman WA
    const conv = await db.query.conversations.findFirst({
      where: and(eq(conversations.tenantId, tenantId), eq(conversations.id, conversationId)),
    })

    if (!conv) {
      return NextResponse.json({ ok: false, error: 'Percakapan tidak ditemukan' }, { status: 404 })
    }

    // Ambil nomor HP customer — prioritaskan whatsappJid untuk pengiriman WA
    let customerPhone = null
    if (conv.customerId) {
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, conv.customerId),
      })
      customerPhone = customer?.whatsappJid || customer?.phoneNumber || null
      console.log('[Send] Customer found:', { 
        id: customer?.id, 
        name: customer?.name,
        whatsappJid: customer?.whatsappJid, 
        phoneNumber: customer?.phoneNumber,
        using: customerPhone 
      })
    }

    // Insert outbound message ke database
    const [newMsg] = await db.insert(messages).values({
      tenantId,
      conversationId,
      direction: 'outbound',
      content: content.trim(),
      sentAt: new Date(),
    }).returning()

    // Update conversation meta preview
    await db.update(conversations).set({
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 200),
    }).where(eq(conversations.id, conversationId))

    // Kirim pesan ke WhatsApp nyata via Baileys microservice
    let baileysSuccess = false
    let baileysError = null
    let baileysUrl = process.env.NEXT_PUBLIC_BAILEYS_SERVICE_URL || process.env.BAILEYS_SERVICE_URL

    console.log('[Send] Baileys config:', {
      url: baileysUrl ? 'present' : 'missing',
      customerPhone: customerPhone ? 'present' : 'missing',
    })

    if (baileysUrl && customerPhone) {
      baileysUrl = baileysUrl.trim().replace(/\/$/, '')
      if (!baileysUrl.startsWith('http://') && !baileysUrl.startsWith('https://')) {
        baileysUrl = `https://${baileysUrl}`
      }
      try {
        console.log('[Send] Sending to Baileys:', { url: `${baileysUrl}/api/send-message`, to: customerPhone })
        const sendResp = await fetch(`${baileysUrl}/api/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': process.env.BAILEYS_WEBHOOK_SECRET ?? '',
          },
          body: JSON.stringify({
            to: customerPhone,
            text: content.trim(),
          }),
          signal: AbortSignal.timeout(8000),
        })

        if (sendResp.ok) {
          baileysSuccess = true
          console.log('[Send] Pesan WA berhasil terkirim ke', customerPhone)
        } else {
          const errBody = await sendResp.text().catch(() => '')
          baileysError = `Status ${sendResp.status}: ${errBody}`
          console.warn('[Send] Baileys gagal:', baileysError)
        }
      } catch (baileysErr) {
        baileysError = baileysErr?.message ?? String(baileysErr)
        console.warn('[Send] Baileys error:', baileysError)
      }
    } else {
      baileysError = `Config: baileysUrl=${baileysUrl ? 'present' : 'MISSING'}, customerPhone=${customerPhone || 'MISSING'}`
      console.warn('[Send] Cannot send WA:', baileysError)
    }

    return NextResponse.json({
      ok: true,
      messageId: newMsg.id,
      conversationId,
      baileysSuccess,
      baileysError,
    })
  } catch (err) {
    console.error('[Send Chat] Error:', err)
    return NextResponse.json({ ok: false, error: 'Gagal mengirim pesan' }, { status: 500 })
  }
}
