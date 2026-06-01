import { db, pool } from '../db/index.js'
import * as schema from '../db/schema.js'
import { aiDrafts, bookings, bookingItems, invoices, inventoryUnits, pricingTiers, products } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'

/**
 * Create booking + booking_items + invoice from an ai_draft record.
 * Assumptions:
 * - `extractedData` contains: { items: [{ productName, quantity, unit }], startDate, endDate, notes }
 * - Pricing is fetched by productName matching `products.name` (simple approach)
 * - Inventory assignment is not selecting specific units; booking_items store product-level quantity
 * - Invoice is created with rentalAmount = sum(price * qty), depositAmount taken from product.depositAmount
 * - BookingNumber / InvoiceNumber generated naively with timestamp
 */
export async function createBookingFromDraft(draft) {
  if (!draft) throw new Error('draft required')

  const tenantId = draft.tenantId
  const extracted = draft.extractedData || {}
  const items = extracted.items || []
  const startDate = extracted.startDate ? new Date(extracted.startDate) : new Date()
  const endDate = extracted.endDate ? new Date(extracted.endDate) : new Date(startDate.getTime() + 24 * 3600 * 1000)

  // Generate booking number
  const bookingNumber = `BKG-${Date.now().toString().slice(-8)}`

  // Compute rental totals
  let rentalAmount = 0n
  let depositAmount = 0n

  const bookingItemsValues = []

  for (const it of items) {
    // Find product by name
    const prod = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.tenantId, tenantId) && eq(p.name, it.productName),
    })

    if (!prod) continue

    // Choose pricing tier matching unit
    const tier = await db.query.pricingTiers.findFirst({
      where: (t, { and, eq }) => and(eq(t.tenantId, tenantId), eq(t.productId, prod.id), eq(t.unit, it.unit || 'daily')),
    })

    const price = tier ? BigInt(Math.round(Number(tier.price) || 0)) : 0n
    const qty = Number(it.quantity || 1)

    const subtotal = price * BigInt(qty)
    rentalAmount += subtotal
    depositAmount += BigInt(Math.round(Number(prod.depositAmount || 0))) * BigInt(qty)

    bookingItemsValues.push({
      tenantId,
      inventoryUnitId: null,
      productId: prod.id,
      pricingUnit: tier ? tier.unit : 'daily',
      pricePerUnit: price.toString(),
      quantity: qty,
      subtotal: subtotal.toString(),
    })
  }

  // Perform transactional creation with inventory locking
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const txDb = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' })

    // 1) Insert booking
    const [booking] = await txDb.insert(bookings).values({
      tenantId,
      customerId: draft.customerId,
      bookingNumber,
      status: 'confirmed',
      startDate,
      endDate,
      notes: extracted.notes ?? null,
    }).returning()

    // 2) For each item, allocate inventory units (SELECT FOR UPDATE SKIP LOCKED)
    for (const it of items) {
      const prod = await txDb.query.products.findFirst({
        where: (p, { eq }) => eq(p.tenantId, tenantId) && eq(p.name, it.productName),
      })

      if (!prod) continue

      const tier = await txDb.query.pricingTiers.findFirst({
        where: (t, { and, eq }) => and(eq(t.tenantId, tenantId), eq(t.productId, prod.id), eq(t.unit, it.unit || 'daily')),
      })

      const price = tier ? BigInt(Math.round(Number(tier.price) || 0)) : 0n
      const qty = Number(it.quantity || 1)

      // Select available unit ids with FOR UPDATE SKIP LOCKED
      const selectSql = `SELECT id FROM inventory_units WHERE tenant_id = $1 AND product_id = $2 AND status = 'available' LIMIT $3 FOR UPDATE SKIP LOCKED`
      const selRes = await client.query(selectSql, [tenantId, prod.id, qty])
      if (selRes.rows.length < qty) {
        throw new Error(`Not enough available units for product ${it.productName}`)
      }

      const unitIds = selRes.rows.map((r) => r.id)

      // Mark units as rented
      const updSql = `UPDATE inventory_units SET status = 'rented', updated_at = now() WHERE id = ANY($1::uuid[])`
      await client.query(updSql, [unitIds])

      // Insert booking_items for each unit
      for (const unitId of unitIds) {
        await txDb.insert(bookingItems).values({
          tenantId,
          bookingId: booking.id,
          inventoryUnitId: unitId,
          productId: prod.id,
          pricingUnit: tier ? tier.unit : 'daily',
          pricePerUnit: price.toString(),
          quantity: 1,
          subtotal: price.toString(),
        })
      }

      rentalAmount += price * BigInt(qty)
      depositAmount += BigInt(Math.round(Number(prod.depositAmount || 0))) * BigInt(qty)
    }

    // 3) Create invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`
    const totalAmount = (rentalAmount + depositAmount).toString()

    const [invoice] = await txDb.insert(invoices).values({
      tenantId,
      bookingId: booking.id,
      invoiceNumber,
      status: 'unpaid',
      rentalAmount: rentalAmount.toString(),
      depositAmount: depositAmount.toString(),
      damageFee: '0',
      totalAmount,
      paidAmount: '0',
    }).returning()

    // 4) Link booking to draft
    await txDb.update(aiDrafts).set({ bookingId: booking.id, status: 'approved' }).where(eq(aiDrafts.id, draft.id))

    await client.query('COMMIT')
    return { booking, invoice }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
