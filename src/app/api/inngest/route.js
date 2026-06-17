import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customers, conversations, messages, aiDrafts, tenants, products, inventoryUnits } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'
import crypto from 'crypto'

/**
 * Normalize raw WhatsApp JID for messaging purposes.
 * Preserves @lid format or strips to digits.
 * This value is stored in `whatsappJid` and used to SEND messages back.
 */
function normalizeJid(number) {
  if (!number) return number
  if (number.includes('@lid')) {
    const cleanNum = number.split('@')[0].replace(/[^0-9]/g, '')
    return `${cleanNum}@lid`
  }
  return number.replace(/[^0-9+]/g, '')
}

/**
 * Extract a real, human-readable phone number for display & CRM.
 * - LID-based JIDs → returns null (not a real phone number)
 * - Regular numbers → normalized to Indonesian 62xxx format
 * This value is stored in `phoneNumber`.
 */
function toDisplayPhone(rawFrom) {
  if (!rawFrom) return null
  // LID JIDs are internal WhatsApp IDs, not real phone numbers
  if (rawFrom.includes('@lid')) return null

  let phone = rawFrom.replace(/@.*$/, '').replace(/[^0-9+]/g, '')
  if (!phone) return null

  // Remove leading + if present
  phone = phone.replace(/^\+/, '')

  // Indonesian normalization: 08xxx → 628xxx
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1)
  }

  // Short numbers without country code (e.g. 81234567890) → prefix with 62
  if (phone.length >= 9 && phone.length <= 12 && !phone.startsWith('62')) {
    phone = '62' + phone
  }

  return phone
}

/**
 * Normalize any phone number input to consistent 62xxx format.
 * Used for phone numbers extracted from template messages.
 */
function normalizePhoneInput(phone) {
  if (!phone) return phone
  let clean = phone.replace(/[^0-9+]/g, '').replace(/^\+/, '')
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1)
  }
  if (clean.length >= 9 && clean.length <= 12 && !clean.startsWith('62')) {
    clean = '62' + clean
  }
  return clean
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
    const jid = normalizeJid(payload.from)           // JID for WhatsApp messaging (preserved @lid or raw digits)
    const displayPhone = toDisplayPhone(payload.from) // Real phone number for CRM display (62xxx format, null for LID)
    const content = payload.content ?? ''
    const waMessageId = payload.waMessageId ?? null
    const mediaUrl = payload.mediaUrl ?? null
    const mediaType = payload.mediaType ?? null
    const sentAt = payload.sentAt ? new Date(payload.sentAt) : new Date()

    if (!tenantId || !jid) {
      return NextResponse.json({ ok: false, error: 'tenantId and from required' }, { status: 400 })
    }

    // 1) Find or create customer by JID or phone number
    //    Search by: whatsappJid (exact JID match), phoneNumber (JID fallback), or displayPhone (normalized)
    const customerConditions = [
      eq(customers.whatsappJid, jid),
      eq(customers.phoneNumber, jid),
    ]
    if (displayPhone) {
      customerConditions.push(eq(customers.phoneNumber, displayPhone))
    }

    let customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.tenantId, tenantId),
        or(...customerConditions)
      ),
    })

    if (!customer) {
      // phoneNumber: use real phone number if available, otherwise fall back to JID
      const [newCustomer] = await db.insert(customers).values({
        tenantId,
        name: payload.name ?? (displayPhone || jid),
        phoneNumber: displayPhone || jid,
        whatsappJid: jid,
      }).returning()
      customer = newCustomer
    } else {
      // Update whatsappJid if missing, and upgrade phoneNumber if we now have a real one
      const updateData = {}
      if (!customer.whatsappJid) {
        updateData.whatsappJid = jid
      }
      // If phoneNumber is a LID value or missing, and we now have a real display phone, upgrade it
      if (displayPhone && (
        !customer.phoneNumber ||
        customer.phoneNumber.includes('@lid') ||
        customer.phoneNumber === jid
      )) {
        updateData.phoneNumber = displayPhone
      }
      if (Object.keys(updateData).length > 0) {
        await db.update(customers).set(updateData).where(eq(customers.id, customer.id))
        customer = { ...customer, ...updateData }
      }
    }

    // 2) Find or create conversation for this customer
    let conv = await db.query.conversations.findFirst({
      where: and(eq(conversations.tenantId, tenantId), eq(conversations.customerId, customer.id)),
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

    // Try to extract real name and phone number from template if present
    const hasTemplate = content.includes('Nama Penyewa:') || content.includes('Produk:')
    if (hasTemplate) {
      const extractedPhone = content.match(/(?:No\.\s*HP\s*\/\s*WhatsApp|WhatsApp|No\s*HP|Telepon|Phone):\s*([^\n\r]+)/i)?.[1]?.trim()
      const extractedName = content.match(/(?:Nama\s*Penyewa):\s*([^\n\r]+)/i)?.[1]?.trim()
      
      const updateData = {}
      if (extractedName && extractedName !== '[Nama Anda]' && !extractedName.includes('[') && !extractedName.includes(']')) {
        updateData.name = extractedName
      }
      if (extractedPhone && !extractedPhone.includes('[') && !extractedPhone.includes(']')) {
        const cleanPhone = normalizePhoneInput(extractedPhone)
        if (cleanPhone && cleanPhone.length >= 10) {
          updateData.phoneNumber = cleanPhone
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        await db.update(customers).set(updateData).where(eq(customers.id, customer.id))
        customer = { ...customer, ...updateData }
      }
    }

    // 4) Update conversation meta
    await db.update(conversations).set({
      lastMessageAt: sentAt,
      lastMessagePreview: content.substring(0, 200),
      unreadCount: conv.unreadCount + 1,
    }).where(eq(conversations.id, conv.id))

    // ── Helper: fetch tenant-specific product availability ──
    async function fetchTenantAvailability() {
      try {
        const allProds = await db.query.products.findMany({
          where: and(eq(products.tenantId, tenantId), eq(products.isActive, true)),
        })
        const lines = []
        for (const prod of allProds) {
          const units = await db.query.inventoryUnits.findMany({
            where: and(
              eq(inventoryUnits.tenantId, tenantId),
              eq(inventoryUnits.productId, prod.id),
              eq(inventoryUnits.status, 'available')
            )
          })
          lines.push(`- ${prod.name} (Tersedia: ${units.length} unit)`)
        }
        if (lines.length > 0) {
          return `Berikut adalah daftar produk yang tersedia saat ini:\n${lines.join('\n')}`
        } else {
          return `Maaf, saat ini semua produk kami sedang disewa atau tidak tersedia.`
        }
      } catch (err) {
        console.error('Failed to fetch product availability:', err)
        return ''
      }
    }

    // ── Helper: send auto-reply via Baileys Bridge ──
    async function sendViaBaileys(replyText) {
      let replied = false
      let replyError = null
      let baileysUrl = process.env.NEXT_PUBLIC_BAILEYS_SERVICE_URL || process.env.BAILEYS_SERVICE_URL
      if (baileysUrl && jid) {
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
            body: JSON.stringify({ to: jid, text: replyText }),
            signal: AbortSignal.timeout(5000),
          })
          if (sendResp.ok) {
            replied = true
            console.log('[Baileys] Auto-reply sent to', jid)
          } else {
            const errTxt = await sendResp.text().catch(() => '')
            replyError = `Status ${sendResp.status}: ${errTxt}`
            console.warn('[Baileys] Failed to send auto-reply:', replyError)
          }
        } catch (err) {
          replyError = err.message
          console.warn('[Baileys] Failed to send auto-reply:', err.message)
        }
      } else {
        replyError = `Config error: baileysUrl=${baileysUrl ? 'present' : 'missing'}, jid=${jid ? 'present' : 'missing'}`
        console.warn('[Baileys] Cannot send auto-reply:', replyError)
      }
      return { replied, replyError }
    }

    // ── Helper: insert outbound auto-reply message to DB ──
    async function insertOutboundReply(replyText, replyTime) {
      await db.insert(messages).values({
        tenantId,
        conversationId: conv.id,
        direction: 'outbound',
        content: replyText,
        sentAt: replyTime,
      })
      await db.update(conversations).set({
        lastMessageAt: replyTime,
        lastMessagePreview: replyText.substring(0, 200),
      }).where(eq(conversations.id, conv.id))
    }

    // Check if the message matches our booking template format
    if (!hasTemplate) {
      const lowerContent = content.toLowerCase()
      const isRentKeyword = lowerContent.includes('sewa') || lowerContent.includes('rental') || lowerContent.includes('rent') || lowerContent.includes('booking') || lowerContent.includes('pesan')

      // Fetch tenant details
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, tenantId),
      })
      const shopName = tenant?.name || 'Rentivo'

      if (isRentKeyword) {
        // ── CASE 2: Keyword sewa/rental detected → send booking template ──
        const availabilityInfo = await fetchTenantAvailability()

        const rawTemplate = tenant?.bookingTemplate || `Nama Penyewa: [Nama Anda]
No. HP / WhatsApp: [Nomor HP Anda]
Produk: [Nama Produk]
Jumlah Unit: [Jumlah, cth: 1]
Waktu Sewa: [Hari/Jam, cth: 3 hari]
Tanggal Mulai: [Format YYYY-MM-DD, cth: 2026-06-10]
Catatan: [Catatan Anda]`

        const templateText = `Halo! Terima kasih telah menghubungi ${shopName}. 🎉\n\n${availabilityInfo}\n\nSilakan isi format berikut untuk melakukan pemesanan:\n\n${rawTemplate}\n\nSalin dan isi template di atas, lalu kirim kembali ke sini ya!`

        const replyTime = new Date(sentAt.getTime() + 1000)
        await insertOutboundReply(templateText, replyTime)
        const { replied, replyError } = await sendViaBaileys(templateText)

        return NextResponse.json({
          ok: true,
          repliedWithTemplate: true,
          customerId: customer.id,
          conversationId: conv.id,
          baileysSuccess: replied,
          baileysError: replyError
        })
      } else {
        // ── CASE 1: First/general chat → welcome message with stock availability ──
        const availabilityInfo = await fetchTenantAvailability()

        const welcomeText = `Halo! Selamat datang di *${shopName}*. 👋\n\nKami menyediakan layanan penyewaan peralatan.\n\n📦 *Stok Tersedia Saat Ini:*\n${availabilityInfo}\n\nJika Anda tertarik untuk menyewa, silakan ketik *"sewa"* atau *"rental"* untuk mendapatkan formulir pemesanan. 😊`

        const replyTime = new Date(sentAt.getTime() + 1000)
        await insertOutboundReply(welcomeText, replyTime)
        const { replied, replyError } = await sendViaBaileys(welcomeText)

        return NextResponse.json({
          ok: true,
          repliedWithWelcome: true,
          customerId: customer.id,
          conversationId: conv.id,
          baileysSuccess: replied,
          baileysError: replyError
        })
      }
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

    // Load the updated draft to get the AI-generated response text
    const updatedDraft = await db.query.aiDrafts.findFirst({
      where: eq(aiDrafts.id, draft.id)
    })

    const confirmationText = updatedDraft?.extractedData?.aiResponseText || 'Silakan tunggu untuk konfirmasi ketersediaannya.'

    // Insert outbound message to database
    await db.insert(messages).values({
      tenantId,
      conversationId: conv.id,
      direction: 'outbound',
      content: confirmationText,
      sentAt: new Date(new Date().getTime() + 1000),
    })

    // Update conversation with confirmation message
    await db.update(conversations).set({
      lastMessageAt: new Date(new Date().getTime() + 1000),
      lastMessagePreview: confirmationText,
    }).where(eq(conversations.id, conv.id))

    // Send to WhatsApp via Baileys Bridge
    let replied = false
    let replyError = null
    let baileysUrl = process.env.NEXT_PUBLIC_BAILEYS_SERVICE_URL || process.env.BAILEYS_SERVICE_URL
    if (baileysUrl && jid) {
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
            to: jid,
            text: confirmationText,
          }),
          signal: AbortSignal.timeout(5000),
        })
        if (sendResp.ok) {
          replied = true
        } else {
          replyError = `Status ${sendResp.status}`
        }
      } catch (err) {
        replyError = err.message
      }
    }

    return NextResponse.json({
      ok: true,
      customerId: customer.id,
      conversationId: conv.id,
      messageId: msg.id,
      draftId: draft.id,
      repliedWithConfirmation: true,
      baileysSuccess: replied,
      baileysError: replyError
    })
  } catch (err) {
    console.error('inngest webhook error:', err)
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
