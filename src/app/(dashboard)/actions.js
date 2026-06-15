'use server'

import { db, pool } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import {
  bookings,
  bookingItems,
  customers,
  invoicePayments,
  invoices,
  inventoryUnits,
  pricingTiers,
  products,
  returns,
  tenantMembers,
  tenants,
  aiDrafts,
  messages,
  conversations,
} from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/server'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function parseAmount(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseDate(value, fallback = new Date()) {
  if (!value) return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function redirectWith(path, type, message) {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}

function refreshPaths() {
  revalidatePath('/dashboard')
  revalidatePath('/bookings')
  revalidatePath('/customers')
  revalidatePath('/inventory')
  revalidatePath('/invoices')
  revalidatePath('/returns')
}

async function getTenantMemberId(tenantId, userId) {
  const member = await db.query.tenantMembers.findFirst({
    where: and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.supabaseUserId, userId)),
  })

  return member?.id ?? null
}

export async function upsertCustomerAction(formData) {
  const { user, tenantId } = await requireTenantAuth()
  void user

  const name = String(formData.get('name') ?? '').trim()
  const phoneNumber = String(formData.get('phoneNumber') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim() || null
  const address = String(formData.get('address') ?? '').trim() || null
  const notes = String(formData.get('notes') ?? '').trim() || null

  if (!name || !phoneNumber) {
    redirectWith('/customers', 'error', 'Nama dan nomor telepon wajib diisi')
  }

  const existing = await db.query.customers.findFirst({
    where: (customer, { and, eq }) => and(eq(customer.tenantId, tenantId), eq(customer.phoneNumber, phoneNumber)),
  })

  if (existing) {
    await db.update(customers).set({ name, email, address, notes, updatedAt: new Date() }).where(eq(customers.id, existing.id))
  } else {
    await db.insert(customers).values({ tenantId, name, phoneNumber, email, address, notes })
  }

  refreshPaths()
  redirect('/customers')
}

export async function createProductAction(formData) {
  const { tenantId } = await requireTenantAuth()

  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim() || null
  const description = String(formData.get('description') ?? '').trim() || null
  const depositAmount = parseAmount(formData.get('depositAmount'))
  const isActive = formData.get('isActive') === 'on'

  if (!name) {
    redirectWith('/inventory', 'error', 'Nama produk wajib diisi')
  }

  const existing = await db.query.products.findFirst({
    where: (product, { and, eq }) => and(eq(product.tenantId, tenantId), eq(product.name, name)),
  })

  if (existing) {
    await db.update(products).set({ category, description, depositAmount: String(depositAmount), isActive, updatedAt: new Date() }).where(eq(products.id, existing.id))
  } else {
    await db.insert(products).values({ tenantId, name, category, description, depositAmount: String(depositAmount), isActive })
  }

  refreshPaths()
  redirect('/inventory')
}

export async function createInventoryUnitAction(formData) {
  const { tenantId } = await requireTenantAuth()

  const productId = String(formData.get('productId') ?? '').trim()
  const unitCode = String(formData.get('unitCode') ?? '').trim()
  const serialNumber = String(formData.get('serialNumber') ?? '').trim() || null
  const condition = String(formData.get('condition') ?? '').trim() || null
  const status = String(formData.get('status') ?? 'available')

  if (!productId || !unitCode) {
    redirectWith('/inventory', 'error', 'Produk dan kode unit wajib diisi')
  }

  await db.insert(inventoryUnits).values({ tenantId, productId, unitCode, serialNumber, condition, status })
  refreshPaths()
  redirect('/inventory')
}

export async function createManualBookingAction(formData) {
  const { user, tenantId } = await requireTenantAuth()
  const memberId = await getTenantMemberId(tenantId, user.id)

  const customerId = String(formData.get('customerId') ?? '').trim()
  const productId = String(formData.get('productId') ?? '').trim()
  const quantity = Math.max(1, Number(formData.get('quantity') ?? 1))
  const pricingUnit = String(formData.get('pricingUnit') ?? 'daily')
  const startDate = parseDate(formData.get('startDate'))
  const endDate = parseDate(formData.get('endDate'), new Date(startDate.getTime() + 24 * 60 * 60 * 1000))
  const notes = String(formData.get('notes') ?? '').trim() || null

  if (!customerId || !productId) {
    redirectWith('/bookings', 'error', 'Pelanggan dan produk wajib dipilih')
  }

  const customer = await db.query.customers.findFirst({
    where: (customer, { and, eq }) => and(eq(customer.tenantId, tenantId), eq(customer.id, customerId)),
  })
  const product = await db.query.products.findFirst({
    where: (product, { and, eq }) => and(eq(product.tenantId, tenantId), eq(product.id, productId)),
  })

  if (!customer || !product) {
    redirectWith('/bookings', 'error', 'Customer atau produk tidak ditemukan')
  }

  const tier = await db.query.pricingTiers.findFirst({
    where: (priceTier, { and, eq }) => and(eq(priceTier.tenantId, tenantId), eq(priceTier.productId, productId), eq(priceTier.unit, pricingUnit)),
  })

  const availableUnits = await db
    .select({ id: inventoryUnits.id })
    .from(inventoryUnits)
    .where(and(eq(inventoryUnits.tenantId, tenantId), eq(inventoryUnits.productId, productId), eq(inventoryUnits.status, 'available')))
    .orderBy(desc(inventoryUnits.createdAt))
    .limit(quantity)

  if (availableUnits.length < quantity) {
    redirectWith('/bookings', 'error', 'Unit tersedia tidak cukup')
  }

  const connection = await pool.connect()

  try {
    await connection.query('BEGIN')
    const txDb = drizzle(connection, { schema, logger: process.env.NODE_ENV === 'development' })

    const bookingNumber = `BKG-${Date.now().toString().slice(-8)}`
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`
    const rentalAmount = Number(tier?.price ?? 0) * quantity
    const depositAmount = Number(product.depositAmount ?? 0) * quantity
    const totalAmount = rentalAmount + depositAmount

    const [booking] = await txDb.insert(bookings).values({
      tenantId,
      customerId,
      bookingNumber,
      status: 'confirmed',
      startDate,
      endDate,
      notes,
      approvedBy: memberId,
      approvedAt: new Date(),
    }).returning()

    for (const unit of availableUnits) {
      await txDb.insert(bookingItems).values({
        tenantId,
        bookingId: booking.id,
        inventoryUnitId: unit.id,
        productId,
        pricingUnit,
        pricePerUnit: String(Number(tier?.price ?? 0)),
        quantity: 1,
        subtotal: String(Number(tier?.price ?? 0)),
      })

      await connection.query(`UPDATE inventory_units SET status = 'rented', updated_at = now() WHERE id = $1`, [unit.id])
    }

    await txDb.insert(invoices).values({
      tenantId,
      bookingId: booking.id,
      invoiceNumber,
      status: 'unpaid',
      rentalAmount: String(rentalAmount),
      depositAmount: String(depositAmount),
      damageFee: '0',
      totalAmount: String(totalAmount),
      paidAmount: '0',
      dueDate: startDate,
      notes,
    })

    await connection.query('COMMIT')
  } catch (error) {
    await connection.query('ROLLBACK')
    console.error('createManualBookingAction error:', error)
    redirectWith('/bookings', 'error', error instanceof Error ? error.message : 'Gagal membuat booking manual')
  } finally {
    connection.release()
  }

  refreshPaths()
  redirect('/bookings')
}

export async function recordInvoicePaymentAction(formData) {
  const { user, tenantId } = await requireTenantAuth()
  const memberId = await getTenantMemberId(tenantId, user.id)

  const invoiceId = String(formData.get('invoiceId') ?? '').trim()
  const amount = parseAmount(formData.get('amount'))
  const bankName = String(formData.get('bankName') ?? '').trim() || null
  const accountName = String(formData.get('accountName') ?? '').trim() || null
  const transferNote = String(formData.get('transferNote') ?? '').trim() || null
  const isVerified = formData.get('isVerified') === 'on'

  if (!invoiceId || amount <= 0) {
    redirectWith('/invoices', 'error', 'Invoice dan nominal pembayaran wajib diisi')
  }

  const invoice = await db.query.invoices.findFirst({
    where: (invoiceRow, { and, eq }) => and(eq(invoiceRow.tenantId, tenantId), eq(invoiceRow.id, invoiceId)),
  })

  if (!invoice) {
    redirectWith('/invoices', 'error', 'Invoice tidak ditemukan')
  }

  const currentPaidAmount = Number(invoice.paidAmount ?? 0)
  const nextPaidAmount = currentPaidAmount + amount
  const totalAmount = Number(invoice.totalAmount ?? 0)
  const nextStatus = nextPaidAmount >= totalAmount ? 'paid' : 'partial'

  await db.insert(invoicePayments).values({
    tenantId,
    invoiceId,
    amount: String(amount),
    bankName,
    accountName,
    transferNote,
    isVerified,
    verifiedBy: memberId,
    verifiedAt: isVerified ? new Date() : null,
  })

  await db.update(invoices).set({ paidAmount: String(nextPaidAmount), status: nextStatus, updatedAt: new Date() }).where(eq(invoices.id, invoiceId))

  refreshPaths()
  redirect('/invoices')
}

export async function recordReturnAction(formData) {
  const { user, tenantId } = await requireTenantAuth()
  const memberId = await getTenantMemberId(tenantId, user.id)

  const bookingId = String(formData.get('bookingId') ?? '').trim()
  const returnedAt = parseDate(formData.get('returnedAt'))
  const condition = String(formData.get('condition') ?? 'good')
  const conditionNotes = String(formData.get('conditionNotes') ?? '').trim() || null
  const damageFee = parseAmount(formData.get('damageFee'))

  if (!bookingId) {
    redirectWith('/returns', 'error', 'Booking wajib dipilih')
  }

  const booking = await db.query.bookings.findFirst({
    where: (bookingRow, { and, eq }) => and(eq(bookingRow.tenantId, tenantId), eq(bookingRow.id, bookingId)),
  })

  if (!booking) {
    redirectWith('/returns', 'error', 'Booking tidak ditemukan')
  }

  const existingReturn = await db.query.returns.findFirst({
    where: (returnRow, { and, eq }) => and(eq(returnRow.tenantId, tenantId), eq(returnRow.bookingId, bookingId)),
  })

  if (existingReturn) {
    redirectWith('/returns', 'error', 'Pengembalian untuk booking ini sudah ada')
  }

  const bookingLines = await db.select({ unitId: bookingItems.inventoryUnitId }).from(bookingItems).where(and(eq(bookingItems.tenantId, tenantId), eq(bookingItems.bookingId, bookingId)))

  await db.insert(returns).values({
    tenantId,
    bookingId,
    returnedAt,
    condition,
    conditionNotes,
    damageFee: String(damageFee),
    processedBy: memberId,
  })

  for (const line of bookingLines) {
    await db.update(inventoryUnits).set({
      status: condition === 'good' ? 'available' : 'checking',
      condition: conditionNotes,
      updatedAt: new Date(),
    }).where(eq(inventoryUnits.id, line.unitId))
  }

  const relatedInvoice = await db.query.invoices.findFirst({
    where: (invoiceRow, { and, eq }) => and(eq(invoiceRow.tenantId, tenantId), eq(invoiceRow.bookingId, bookingId)),
  })

  if (relatedInvoice && damageFee > 0) {
    const nextDamageFee = Number(relatedInvoice.damageFee ?? 0) + damageFee
    const nextTotalAmount = Number(relatedInvoice.rentalAmount ?? 0) + Number(relatedInvoice.depositAmount ?? 0) + nextDamageFee

    await db.update(invoices).set({ damageFee: String(nextDamageFee), totalAmount: String(nextTotalAmount), updatedAt: new Date() }).where(eq(invoices.id, relatedInvoice.id))
  }

  await db.update(bookings).set({ status: 'completed', updatedAt: new Date() }).where(eq(bookings.id, bookingId))

  // Send status update notification to customer
  await sendAIStatusNotification(tenantId, booking, 'completed')

  refreshPaths()
  redirect('/returns')
}

export async function updateTenantSettingsAction(formData) {
  const { tenantId } = await requireTenantAuth()

  const name = String(formData.get('name') ?? '').trim()
  const phoneNumber = String(formData.get('phoneNumber') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim() || null
  const city = String(formData.get('city') ?? '').trim() || null
  const bankName = String(formData.get('bankName') ?? '').trim() || null
  const bankAccountNumber = String(formData.get('bankAccountNumber') ?? '').trim() || null
  const bankAccountName = String(formData.get('bankAccountName') ?? '').trim() || null
  const bookingTemplate = String(formData.get('bookingTemplate') ?? '').trim() || null

  if (!name) {
    redirectWith('/settings', 'error', 'Nama bisnis wajib diisi')
  }

  await db.update(tenants).set({
    name,
    phoneNumber,
    address,
    city,
    bankName,
    bankAccountNumber,
    bankAccountName,
    bookingTemplate,
    updatedAt: new Date()
  }).where(eq(tenants.id, tenantId))

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  redirect('/settings?success=' + encodeURIComponent('Pengaturan berhasil disimpan'))
}

export async function approveDraftFromInboxAction(draftId) {
  try {
    const { tenantId } = await requireTenantAuth()

    const draft = await db.query.aiDrafts.findFirst({
      where: (d, { eq, and }) => and(eq(d.tenantId, tenantId), eq(d.id, draftId)),
    })

    if (!draft) {
      return { ok: false, error: 'Draft tidak ditemukan' }
    }

    const { createBookingFromDraft } = await import('@/lib/booking/createFromDraft')
    const result = await createBookingFromDraft(draft)

    // Send approval notification with bank details to the customer
    try {
      const customer = await db.query.customers.findFirst({
        where: (c, { eq }) => eq(c.id, draft.customerId),
      })

      const tenant = await db.query.tenants.findFirst({
        where: (t, { eq }) => eq(t.id, tenantId),
      })

      if (customer && customer.phoneNumber) {
        const totalFormatted = Number(result.invoice.totalAmount).toLocaleString('id-ID')
        let bankText = ''
        if (tenant?.bankName && tenant?.bankAccountNumber) {
          bankText = `\nSilakan lakukan transfer ke rekening berikut:\nBank: ${tenant.bankName}\nNo. Rekening: ${tenant.bankAccountNumber}\nAtas Nama: ${tenant.bankAccountName || tenant.name}\n\nKirimkan bukti transfer (foto/screenshot) di sini setelah melakukan pembayaran.`
        } else {
          bankText = `\nSilakan hubungi kami untuk informasi detail rekening pembayaran.`
        }

        const approvalText = `Pesanan Anda sudah dibuat!\n\nTotal Pembayaran: Rp ${totalFormatted}\n${bankText}`

        // Find the conversation for this customer
        const conv = await db.query.conversations.findFirst({
          where: (c, { eq, and }) => and(eq(c.tenantId, tenantId), eq(c.customerId, customer.id)),
        })

        if (conv) {
          // 1) Save outbound message to database
          await db.insert(messages).values({
            tenantId,
            conversationId: conv.id,
            direction: 'outbound',
            content: approvalText,
            sentAt: new Date(),
          })

          // 2) Update conversation meta
          await db.update(conversations).set({
            lastMessageAt: new Date(),
            lastMessagePreview: approvalText.substring(0, 200),
          }).where(eq(conversations.id, conv.id))

          // 3) Call WhatsApp Bridge to send actual message
          let baileysUrl = process.env.NEXT_PUBLIC_BAILEYS_SERVICE_URL || process.env.BAILEYS_SERVICE_URL
          if (baileysUrl) {
            baileysUrl = baileysUrl.trim().replace(/\/$/, '')
            if (!baileysUrl.startsWith('http://') && !baileysUrl.startsWith('https://')) {
              baileysUrl = `https://${baileysUrl}`
            }
            await fetch(`${baileysUrl}/api/send-message`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-webhook-secret': process.env.BAILEYS_WEBHOOK_SECRET ?? '',
              },
              body: JSON.stringify({
                to: customer.whatsappJid || customer.phoneNumber,
                text: approvalText,
              }),
              signal: AbortSignal.timeout(5000),
            })
          }
        }
      }
    } catch (notificationErr) {
      console.error('[Approval Notification] Failed to send notification:', notificationErr.message)
    }

    refreshPaths()
    revalidatePath('/inbox')
    return { ok: true, bookingId: result.booking.id }
  } catch (err) {
    console.error('Error approving draft:', err)
    return { ok: false, error: err.message || String(err) }
  }
}

export async function rejectDraftFromInboxAction(draftId, reason = 'Ditolak oleh admin') {
  const { tenantId } = await requireTenantAuth()

  await db.update(aiDrafts).set({
    status: 'rejected',
    rejectReason: reason,
    updatedAt: new Date()
  }).where(and(eq(aiDrafts.tenantId, tenantId), eq(aiDrafts.id, draftId)))

  refreshPaths()
  revalidatePath('/inbox')
  return { ok: true }
}

export async function sendManualChatAction(formData) {
  const { tenantId } = await requireTenantAuth()

  const conversationId = String(formData.get('conversationId') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!conversationId || !content) {
    redirectWith('/inbox', 'error', 'Pesan tidak boleh kosong')
  }

  const conv = await db.query.conversations.findFirst({
    where: (c, { eq, and }) => and(eq(c.tenantId, tenantId), eq(c.id, conversationId)),
  })

  if (!conv) {
    redirectWith('/inbox', 'error', 'Percakapan tidak ditemukan')
  }

  // Insert outbound message
  await db.insert(schema.messages).values({
    tenantId,
    conversationId,
    direction: 'outbound',
    content,
    sentAt: new Date(),
  })

  // Update conversation lastMessage preview
  await db.update(conversations).set({
    lastMessageAt: new Date(),
    lastMessagePreview: content.substring(0, 200),
  }).where(eq(conversations.id, conversationId))

  revalidatePath('/inbox')
  redirect(`/inbox?conversationId=${conversationId}`)
}

export async function updateBookingStatusAction(bookingId, nextStatus) {
  const { tenantId } = await requireTenantAuth()

  const booking = await db.query.bookings.findFirst({
    where: (b, { eq, and }) => and(eq(b.tenantId, tenantId), eq(b.id, bookingId))
  })

  if (!booking) {
    throw new Error('Booking tidak ditemukan')
  }

  if (nextStatus === 'cancelled') {
    const bookingLines = await db
      .select({ unitId: bookingItems.inventoryUnitId })
      .from(bookingItems)
      .where(and(eq(bookingItems.tenantId, tenantId), eq(bookingItems.bookingId, bookingId)))

    const unitIds = bookingLines.map((line) => line.unitId).filter(Boolean)
    if (unitIds.length > 0) {
      await db.update(inventoryUnits).set({
        status: 'available',
        updatedAt: new Date()
      }).where(and(eq(inventoryUnits.tenantId, tenantId), inArray(inventoryUnits.id, unitIds)))
    }
  }

  await db.update(bookings).set({
    status: nextStatus,
    updatedAt: new Date()
  }).where(eq(bookings.id, bookingId))

  // Send status update notification to customer
  await sendAIStatusNotification(tenantId, booking, nextStatus)

  refreshPaths()
  revalidatePath('/bookings')
  return { ok: true }
}

export async function createTicketAction(formData) {
  const { tenantId } = await requireTenantAuth()

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const priority = String(formData.get('priority') ?? 'medium').trim()

  if (!title || !description) {
    redirectWith('/tickets', 'error', 'Judul dan deskripsi tiket wajib diisi')
  }

  await db.insert(schema.supportTickets).values({
    tenantId,
    title,
    description,
    priority,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath('/tickets')
  redirect('/tickets?success=' + encodeURIComponent('Tiket bantuan berhasil dikirim ke SuperAdmin'))
}

export async function addTeamMemberAction(formData) {
  const { tenantId } = await requireTenantAuth(['owner'])

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()
  const targetRole = String(formData.get('role') ?? 'staff').trim()

  if (!name || !email || !password) {
    redirectWith('/settings', 'error', 'Nama, Email, dan Password wajib diisi')
  }

  if (password.length < 8) {
    redirectWith('/settings', 'error', 'Password minimal 8 karakter')
  }

  if (!['admin', 'staff'].includes(targetRole)) {
    redirectWith('/settings', 'error', 'Role tidak valid')
  }

  const adminSupabase = await createAdminClient()

  // 1. Create Supabase Auth User
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: targetRole,
      tenant_id: tenantId,
    },
  })

  if (authError || !authData.user) {
    const message = authError?.message ?? 'Gagal menambahkan anggota tim'
    redirectWith('/settings', 'error', message)
  }

  try {
    // 2. Insert into tenant_members
    await db.insert(tenantMembers).values({
      tenantId,
      supabaseUserId: authData.user.id,
      role: targetRole,
      name,
      email,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 3. Update user metadata with tenant slug
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId)
    })
    
    await adminSupabase.auth.admin.updateUserById(authData.user.id, {
      data: {
        role: targetRole,
        tenant_id: tenantId,
        tenant_slug: tenant?.slug ?? '',
        name,
      },
    })
  } catch (err) {
    console.error('Error adding team member db:', err)
    // Clean up Auth user if DB insert fails
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    redirectWith('/settings', 'error', 'Gagal menyimpan data anggota tim ke database')
  }

  revalidatePath('/settings')
  redirect('/settings?success=' + encodeURIComponent(`Anggota tim ${name} berhasil ditambahkan`))
}

export async function toggleTeamMemberStatusAction(memberId, currentStatus) {
  const { tenantId } = await requireTenantAuth(['owner'])

  // Get member details to ensure they belong to this tenant
  const member = await db.query.tenantMembers.findFirst({
    where: and(eq(tenantMembers.id, memberId), eq(tenantMembers.tenantId, tenantId))
  })

  if (!member) {
    throw new Error('Anggota tim tidak ditemukan')
  }

  const newStatus = !currentStatus

  await db.update(tenantMembers).set({
    isActive: newStatus,
    updatedAt: new Date()
  }).where(eq(tenantMembers.id, memberId))

  revalidatePath('/settings')
  return { ok: true }
}

export async function updateTeamMemberRoleAction(memberId, targetRole) {
  const { tenantId } = await requireTenantAuth(['owner'])

  if (!['admin', 'staff'].includes(targetRole)) {
    throw new Error('Role tidak valid')
  }

  const member = await db.query.tenantMembers.findFirst({
    where: and(eq(tenantMembers.id, memberId), eq(tenantMembers.tenantId, tenantId))
  })

  if (!member) {
    throw new Error('Anggota tim tidak ditemukan')
  }

  // Update in database
  await db.update(tenantMembers).set({
    role: targetRole,
    updatedAt: new Date()
  }).where(eq(tenantMembers.id, memberId))

  // Update in Supabase Auth user metadata
  const adminSupabase = await createAdminClient()
  await adminSupabase.auth.admin.updateUserById(member.supabaseUserId, {
    data: {
      role: targetRole,
    },
  })

  revalidatePath('/settings')
  return { ok: true }
}

export async function deleteTeamMemberAction(memberId) {
  const { tenantId } = await requireTenantAuth(['owner'])

  const member = await db.query.tenantMembers.findFirst({
    where: and(eq(tenantMembers.id, memberId), eq(tenantMembers.tenantId, tenantId))
  })

  if (!member) {
    throw new Error('Anggota tim tidak ditemukan')
  }

  // Delete from database
  await db.delete(tenantMembers).where(eq(tenantMembers.id, memberId))

  // Delete from Supabase Auth
  const adminSupabase = await createAdminClient()
  await adminSupabase.auth.admin.deleteUser(member.supabaseUserId)

  revalidatePath('/settings')
  return { ok: true }
}

// ─── Booking & Data Deletion CRUD Actions ──────────────────────────────────────

export async function deleteBookingAction(bookingId) {
  try {
    const { tenantId } = await requireTenantAuth()

    // 1. Delete returns related to this booking
    await db.delete(returns).where(and(eq(returns.tenantId, tenantId), eq(returns.bookingId, bookingId)))

    // 2. Free up any inventory units that were allocated to this booking
    const items = await db.query.bookingItems.findMany({
      where: (bi, { eq }) => eq(bi.bookingId, bookingId)
    })

    const unitIds = items.map(i => i.inventoryUnitId).filter(Boolean)
    if (unitIds.length > 0) {
      await db.update(inventoryUnits).set({
        status: 'available',
        updatedAt: new Date()
      }).where(and(eq(inventoryUnits.tenantId, tenantId), inArray(inventoryUnits.id, unitIds)))
    }

    // 3. Delete the booking (cascades to bookingItems and invoices)
    await db.delete(bookings).where(and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)))

    refreshPaths()
    return { ok: true }
  } catch (err) {
    console.error('deleteBookingAction error:', err)
    return { ok: false, error: err.message || String(err) }
  }
}

export async function deleteCustomerAction(customerId) {
  try {
    const { tenantId } = await requireTenantAuth()

    // 1. Find all bookings for this customer
    const customerBookings = await db.query.bookings.findMany({
      where: (b, { eq, and }) => and(eq(b.tenantId, tenantId), eq(b.customerId, customerId))
    })
    
    const bookingIds = customerBookings.map(b => b.id)
    if (bookingIds.length > 0) {
      // Delete returns for these bookings
      await db.delete(returns).where(and(eq(returns.tenantId, tenantId), inArray(returns.bookingId, bookingIds)))

      // Free up inventory units
      const items = await db.query.bookingItems.findMany({
        where: (bi, { eq }) => inArray(bi.bookingId, bookingIds)
      })
      const unitIds = items.map(i => i.inventoryUnitId).filter(Boolean)
      if (unitIds.length > 0) {
        await db.update(inventoryUnits).set({
          status: 'available',
          updatedAt: new Date()
        }).where(and(eq(inventoryUnits.tenantId, tenantId), inArray(inventoryUnits.id, unitIds)))
      }

      // Delete bookings (cascades to bookingItems and invoices)
      await db.delete(bookings).where(and(eq(bookings.tenantId, tenantId), inArray(bookings.id, bookingIds)))
    }

    // 2. Delete conversations (cascades to messages)
    await db.delete(conversations).where(and(eq(conversations.tenantId, tenantId), eq(conversations.customerId, customerId)))

    // 3. Delete AI Drafts
    await db.delete(aiDrafts).where(and(eq(aiDrafts.tenantId, tenantId), eq(aiDrafts.customerId, customerId)))

    // 4. Delete customer
    await db.delete(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, customerId)))

    refreshPaths()
    return { ok: true }
  } catch (err) {
    console.error('deleteCustomerAction error:', err)
    return { ok: false, error: err.message || String(err) }
  }
}

export async function deleteInventoryUnitAction(unitId) {
  try {
    const { tenantId } = await requireTenantAuth()

    // 1. Nullify references in bookingItems
    await db.update(bookingItems).set({ inventoryUnitId: null }).where(eq(bookingItems.inventoryUnitId, unitId))

    // 2. Delete unit
    await db.delete(inventoryUnits).where(and(eq(inventoryUnits.tenantId, tenantId), eq(inventoryUnits.id, unitId)))

    refreshPaths()
    return { ok: true }
  } catch (err) {
    console.error('deleteInventoryUnitAction error:', err)
    return { ok: false, error: err.message || String(err) }
  }
}

export async function deleteInvoiceAction(invoiceId) {
  try {
    const { tenantId } = await requireTenantAuth()

    // Delete invoice (cascades to payments in database)
    await db.delete(invoices).where(and(eq(invoices.tenantId, tenantId), eq(invoices.id, invoiceId)))

    refreshPaths()
    return { ok: true }
  } catch (err) {
    console.error('deleteInvoiceAction error:', err)
    return { ok: false, error: err.message || String(err) }
  }
}

export async function deleteReturnAction(returnId) {
  try {
    const { tenantId } = await requireTenantAuth()

    const ret = await db.query.returns.findFirst({
      where: (r, { eq, and }) => and(eq(r.tenantId, tenantId), eq(r.id, returnId))
    })

    if (ret) {
      // Revert booking status back to 'active'
      await db.update(bookings).set({
        status: 'active',
        updatedAt: new Date()
      }).where(eq(bookings.id, ret.bookingId))

      // Revert inventory units back to 'rented'
      const items = await db.query.bookingItems.findMany({
        where: (bi, { eq }) => eq(bi.bookingId, ret.bookingId)
      })
      const unitIds = items.map(i => i.inventoryUnitId).filter(Boolean)
      if (unitIds.length > 0) {
        await db.update(inventoryUnits).set({
          status: 'rented',
          updatedAt: new Date()
        }).where(and(eq(inventoryUnits.tenantId, tenantId), inArray(inventoryUnits.id, unitIds)))
      }
    }

    await db.delete(returns).where(and(eq(returns.tenantId, tenantId), eq(returns.id, returnId)))

    refreshPaths()
    return { ok: true }
  } catch (err) {
    console.error('deleteReturnAction error:', err)
    return { ok: false, error: err.message || String(err) }
  }
}

// Helper to notify customer of booking status changes via AI
export async function sendAIStatusNotification(tenantId, booking, nextStatus) {
  try {
    const customer = await db.query.customers.findFirst({
      where: (c, { eq }) => eq(c.id, booking.customerId),
    })

    const tenant = await db.query.tenants.findFirst({
      where: (t, { eq }) => eq(t.id, tenantId),
    })

    if (!customer || !customer.phoneNumber) return

    // Find products in this booking to make the AI response specific
    const items = await db.query.bookingItems.findMany({
      where: (bi, { eq }) => eq(bi.bookingId, booking.id),
    })
    const productIds = items.map(i => i.productId).filter(Boolean)
    
    let productNames = ''
    if (productIds.length > 0) {
      const prods = await db.query.products.findMany({
        where: (p, { eq }) => inArray(p.id, productIds)
      })
      productNames = prods.map(p => p.name).join(', ')
    }

    const apiKey = process.env.GEMINI_API_KEY
    const shopName = tenant?.name || 'Rentivo'
    const statusMap = {
      confirmed: 'dikonfirmasi (unit dipesan)',
      active: 'aktif (sewa dimulai)',
      returning: 'proses pengembalian',
      completed: 'selesai (sudah dikembalikan)',
      cancelled: 'dibatalkan'
    }
    const statusLabel = statusMap[nextStatus] || nextStatus

    let notificationText = ''
    if (apiKey) {
      try {
        const prompt = `Kamu adalah asisten CRM rental bernama Rentivo AI. Generate pesan pemberitahuan WhatsApp yang ramah, sopan, dan profesional untuk pelanggan tentang pembaruan status pesanan mereka.
        
Detail:
- Nama Toko/Rental: ${shopName}
- Nama Pelanggan: ${customer.name}
- Nomor Booking: ${booking.bookingNumber}
- Produk yang disewa: ${productNames || 'produk rental'}
- Status Baru: ${statusLabel}

Aturan:
- Gunakan bahasa Indonesia yang santun dan akrab.
- Sebutkan nama produk secara spesifik.
- Sebutkan nomor booking.
- Berikan penjelas/tips pendek yang relevan dengan produk dan status sewa tersebut (misalnya jika status 'active' untuk kamera, ingatkan untuk menjaga lensa/sensor; jika status 'completed', ucapkan terima kasih banyak).
- Jangan berikan markdown tebal/miring/kode, berikan teks polos (boleh pakai emoji ramah).
- JANGAN tampilkan label "Jawaban AI:" atau sejenisnya, langsung teks pesan.`

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
          }),
          signal: AbortSignal.timeout(5000),
        })

        if (resp.ok) {
          const data = await resp.json()
          notificationText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        }
      } catch (geminiErr) {
        console.error('[AI Status Notification] Gemini API error, fallback to template:', geminiErr)
      }
    }

    if (!notificationText) {
      const formattedStatus = statusLabel.toUpperCase()
      notificationText = `Halo ${customer.name}, pemberitahuan dari ${shopName}. Status pesanan Anda #${booking.bookingNumber} (${productNames || 'produk rental'}) saat ini telah diperbarui menjadi: ${formattedStatus}. Terima kasih.`
    }

    // Find conversation to log the message
    const conv = await db.query.conversations.findFirst({
      where: (c, { eq, and }) => and(eq(c.tenantId, tenantId), eq(c.customerId, customer.id)),
    })

    if (conv) {
      // 1) Save to DB
      await db.insert(messages).values({
        tenantId,
        conversationId: conv.id,
        direction: 'outbound',
        content: notificationText,
        sentAt: new Date(),
      })

      // 2) Update conversation
      await db.update(conversations).set({
        lastMessageAt: new Date(),
        lastMessagePreview: notificationText.substring(0, 200),
      }).where(eq(conversations.id, conv.id))

      // 3) Send to WA via Baileys Bridge
      let baileysUrl = process.env.NEXT_PUBLIC_BAILEYS_SERVICE_URL || process.env.BAILEYS_SERVICE_URL
      if (baileysUrl) {
        baileysUrl = baileysUrl.trim().replace(/\/$/, '')
        if (!baileysUrl.startsWith('http://') && !baileysUrl.startsWith('https://')) {
          baileysUrl = `https://${baileysUrl}`
        }
        await fetch(`${baileysUrl}/api/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': process.env.BAILEYS_WEBHOOK_SECRET ?? '',
          },
          body: JSON.stringify({
            to: customer.whatsappJid || customer.phoneNumber,
            text: notificationText,
          }),
          signal: AbortSignal.timeout(5000),
        })
      }
    }
  } catch (err) {
    console.error('[AI Status Notification] Error:', err)
  }
}