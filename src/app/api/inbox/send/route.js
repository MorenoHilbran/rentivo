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
      return NextResponse.redirect(new URL('/inbox?error=Pesan+tidak+boleh+kosong', request.url), 303)
    }

    // Ambil conversation beserta nomor HP customer untuk pengiriman WA
    const conv = await db.query.conversations.findFirst({
      where: (c, { eq, and }) => and(eq(c.tenantId, tenantId), eq(c.id, conversationId)),
    })

    if (!conv) {
      return NextResponse.redirect(new URL('/inbox?error=Percakapan+tidak+ditemukan', request.url), 303)
    }

    // Ambil nomor HP customer
    let customerPhone = null
    if (conv.customerId) {
      const customer = await db.query.customers.findFirst({
        where: (c, { eq }) => eq(c.id, conv.customerId),
      })
      customerPhone = customer?.whatsappJid || customer?.phoneNumber ?? null
    }

    // Insert outbound message ke database
    await db.insert(messages).values({
      tenantId,
      conversationId,
      direction: 'outbound',
      content: content.trim(),
      sentAt: new Date(),
    })

    // Update conversation meta preview
    await db.update(conversations).set({
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 200),
    }).where(eq(conversations.id, conversationId))

    // Kirim pesan ke WhatsApp nyata via Baileys microservice
    // Ini dilakukan secara fire-and-forget: jika Baileys tidak running,
    // pesan tetap tersimpan di database — tidak ada error fatal.
    let baileysUrl = process.env.NEXT_PUBLIC_BAILEYS_SERVICE_URL || process.env.BAILEYS_SERVICE_URL
    if (baileysUrl && customerPhone) {
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
            to: customerPhone,
            text: content.trim(),
          }),
          // Timeout singkat agar tidak memblokir redirect user
          signal: AbortSignal.timeout(5000),
        })

        if (!sendResp.ok) {
          const errBody = await sendResp.text().catch(() => '')
          console.warn(`[Baileys] Kirim pesan gagal (${sendResp.status}):`, errBody)
        } else {
          console.log('[Baileys] Pesan WA terkirim ke', customerPhone)
        }
      } catch (baileysErr) {
        // Baileys tidak running / timeout — tidak fatal, pesan tetap di DB
        console.warn('[Baileys] Microservice tidak tersedia atau timeout:', baileysErr?.message ?? baileysErr)
      }
    }

    // Redirect kembali ke thread percakapan (303 See Other = standard POST redirect)
    return NextResponse.redirect(new URL(`/inbox?conversationId=${conversationId}`, request.url), 303)
  } catch (err) {
    console.error('[Send Chat] Error:', err)
    return NextResponse.redirect(new URL('/inbox?error=Gagal+mengirim+pesan', request.url), 303)
  }
}
