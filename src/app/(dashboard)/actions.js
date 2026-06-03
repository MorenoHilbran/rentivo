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
} from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { and, desc, eq } from 'drizzle-orm'
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

  refreshPaths()
  redirect('/returns')
}

export async function updateTenantSettingsAction(formData) {
  const { tenantId } = await requireTenantAuth()

  const name = String(formData.get('name') ?? '').trim()
  const phoneNumber = String(formData.get('phoneNumber') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim() || null
  const city = String(formData.get('city') ?? '').trim() || null

  if (!name) {
    redirectWith('/settings', 'error', 'Nama bisnis wajib diisi')
  }

  await db.update(tenants).set({
    name,
    phoneNumber,
    address,
    city,
    updatedAt: new Date()
  }).where(eq(tenants.id, tenantId))

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  redirect('/settings?success=' + encodeURIComponent('Pengaturan berhasil disimpan'))
}

export async function approveDraftFromInboxAction(draftId) {
  const { tenantId } = await requireTenantAuth()

  const draft = await db.query.aiDrafts.findFirst({
    where: (d, { eq, and }) => and(eq(d.tenantId, tenantId), eq(d.id, draftId)),
  })

  if (!draft) {
    throw new Error('Draft tidak ditemukan')
  }

  const { createBookingFromDraft } = await import('@/lib/booking/createFromDraft')
  const result = await createBookingFromDraft(draft)

  refreshPaths()
  revalidatePath('/inbox')
  return { ok: true, bookingId: result.booking.id }
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

  await db.update(bookings).set({
    status: nextStatus,
    updatedAt: new Date()
  }).where(eq(bookings.id, bookingId))

  refreshPaths()
  revalidatePath('/bookings')
  return { ok: true }
}