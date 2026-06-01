import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'

const DEMO_TENANT_EMAIL = 'owner@rentivo.demo'
const DEMO_TENANT_PASSWORD = 'DemoOwner123!'
const DEMO_SUPERADMIN_EMAIL = 'superadmin@rentivo.demo'
const DEMO_SUPERADMIN_PASSWORD = 'DemoAdmin123!'
const DEMO_TENANT_SLUG = 'rentivo-demo'

const currentDir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(currentDir, '..', '.env.local') })
dotenv.config({ path: resolve(currentDir, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function isoDateOnly(date) {
  return date.toISOString()
}

async function ensureAuthUser({ email, password, metadata }) {
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    throw listError
  }

  const existing = usersData.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())

  if (existing) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: metadata,
    })

    if (updateError) throw updateError

    return existing.id
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (error) throw error

  return data.user.id
}

async function wipeDemoTenant(tenantId) {
  const {
    aiDrafts,
    bookings,
    bookingItems,
    conversations,
    customers,
    invoicePayments,
    invoices,
    inventoryUnits,
    pricingTiers,
    products,
    returns,
    tenantMembers,
    messages,
  } = await import('../src/lib/db/schema.js')
  const { db } = await import('../src/lib/db/index.js')

  await db.delete(invoicePayments).where(eq(invoicePayments.tenantId, tenantId))
  await db.delete(returns).where(eq(returns.tenantId, tenantId))
  await db.delete(aiDrafts).where(eq(aiDrafts.tenantId, tenantId))
  await db.delete(messages).where(eq(messages.tenantId, tenantId))
  await db.delete(conversations).where(eq(conversations.tenantId, tenantId))
  await db.delete(bookingItems).where(eq(bookingItems.tenantId, tenantId))
  await db.delete(invoices).where(eq(invoices.tenantId, tenantId))
  await db.delete(bookings).where(eq(bookings.tenantId, tenantId))
  await db.delete(inventoryUnits).where(eq(inventoryUnits.tenantId, tenantId))
  await db.delete(pricingTiers).where(eq(pricingTiers.tenantId, tenantId))
  await db.delete(products).where(eq(products.tenantId, tenantId))
  await db.delete(customers).where(eq(customers.tenantId, tenantId))
  await db.delete(tenantMembers).where(eq(tenantMembers.tenantId, tenantId))
}

async function main() {
  console.log('Seeding Rentivo demo data...')

  const {
    aiDrafts,
    bookings,
    bookingItems,
    conversations,
    customers,
    invoicePayments,
    invoices,
    inventoryUnits,
    pricingTiers,
    products,
    returns,
    superadmins,
    tenantMembers,
    tenants,
    messages,
  } = await import('../src/lib/db/schema.js')
  const { db } = await import('../src/lib/db/index.js')

  const ownerUserId = await ensureAuthUser({
    email: DEMO_TENANT_EMAIL,
    password: DEMO_TENANT_PASSWORD,
    metadata: {
      name: 'Moreno Demo',
      role: 'owner',
    },
  })

  const superadminUserId = await ensureAuthUser({
    email: DEMO_SUPERADMIN_EMAIL,
    password: DEMO_SUPERADMIN_PASSWORD,
    metadata: {
      name: 'Rentivo Super Admin',
      role: 'superadmin',
    },
  })

  let demoTenant = await db.query.tenants.findFirst({
    where: (tenant, { eq }) => eq(tenant.slug, DEMO_TENANT_SLUG),
  })

  if (demoTenant) {
    await wipeDemoTenant(demoTenant.id)
  } else {
    const [createdTenant] = await db.insert(tenants).values({
      name: 'Rentivo Demo Studio',
      slug: DEMO_TENANT_SLUG,
      status: 'active',
      phoneNumber: '081234567890',
      address: 'Jl. Merdeka No. 88',
      city: 'Purwokerto',
    }).returning()

    demoTenant = createdTenant
  }

  const [suspendedTenant] = await db
    .insert(tenants)
    .values({
      name: 'Rentivo Sunset Rentals',
      slug: 'rentivo-sunset',
      status: 'suspended',
      phoneNumber: '081122223333',
      address: 'Jl. Sunset Road 12',
      city: 'Bali',
    })
    .onConflictDoNothing()
    .returning()

  const [pendingTenant] = await db
    .insert(tenants)
    .values({
      name: 'Rentivo Pending Gear',
      slug: 'rentivo-pending',
      status: 'pending',
      phoneNumber: '089900001111',
      address: 'Jl. Pending No. 1',
      city: 'Yogyakarta',
    })
    .onConflictDoNothing()
    .returning()

  await db.insert(superadmins).values({
    email: DEMO_SUPERADMIN_EMAIL,
    name: 'Rentivo Super Admin',
    supabaseUserId: superadminUserId,
  }).onConflictDoUpdate({
    target: superadmins.email,
    set: {
      name: 'Rentivo Super Admin',
      supabaseUserId: superadminUserId,
      updatedAt: new Date(),
    },
  })

  await db.insert(tenantMembers).values({
    tenantId: demoTenant.id,
    supabaseUserId: ownerUserId,
    role: 'owner',
    name: 'Moreno Demo',
    email: DEMO_TENANT_EMAIL,
  })

  const [adminMember] = await db.insert(tenantMembers).values({
    tenantId: demoTenant.id,
    supabaseUserId: randomUUID(),
    role: 'admin',
    name: 'Alya Putri',
    email: 'alya@rentivo.demo',
  }).onConflictDoNothing().returning()

  const [staffMember] = await db.insert(tenantMembers).values({
    tenantId: demoTenant.id,
    supabaseUserId: randomUUID(),
    role: 'staff',
    name: 'Dimas Pratama',
    email: 'dimas@rentivo.demo',
  }).onConflictDoNothing().returning()

  const customerRows = await db.insert(customers).values([
    {
      tenantId: demoTenant.id,
      name: 'Nabila Rachma',
      phoneNumber: '081200000101',
      email: 'nabila@example.com',
      address: 'Jakarta Selatan',
      notes: 'Sering sewa untuk produksi konten',
      totalBookings: 4,
      totalSpent: '7800000',
    },
    {
      tenantId: demoTenant.id,
      name: 'Fajar Hidayat',
      phoneNumber: '081200000102',
      email: 'fajar@example.com',
      address: 'Bandung',
      notes: 'Butuh pengiriman pagi',
      totalBookings: 2,
      totalSpent: '2400000',
    },
    {
      tenantId: demoTenant.id,
      name: 'Citra Dewi',
      phoneNumber: '081200000103',
      email: 'citra@example.com',
      address: 'Surabaya',
      notes: 'Pelanggan baru',
      totalBookings: 1,
      totalSpent: '1200000',
    },
  ]).returning()

  const productRows = await db.insert(products).values([
    {
      tenantId: demoTenant.id,
      name: 'Sony A7 III Body',
      description: 'Body kamera full-frame untuk produksi profesional.',
      category: 'Camera',
      depositAmount: '5000000',
      isActive: true,
    },
    {
      tenantId: demoTenant.id,
      name: 'DJI Mini 3 Pro',
      description: 'Drone ringan untuk shot udara dan konten event.',
      category: 'Drone',
      depositAmount: '4000000',
      isActive: true,
    },
    {
      tenantId: demoTenant.id,
      name: 'Lighting Kit Pro',
      description: 'Paket lighting multi-lampu untuk studio.',
      category: 'Lighting',
      depositAmount: '1500000',
      isActive: true,
    },
    {
      tenantId: demoTenant.id,
      name: 'Tripod Carbon',
      description: 'Tripod ringan untuk kamera dan video.',
      category: 'Accessory',
      depositAmount: '750000',
      isActive: true,
    },
  ]).returning()

  const productMap = Object.fromEntries(productRows.map((product) => [product.name, product]))

  await db.insert(pricingTiers).values([
    { tenantId: demoTenant.id, productId: productMap['Sony A7 III Body'].id, unit: 'daily', price: '350000' },
    { tenantId: demoTenant.id, productId: productMap['Sony A7 III Body'].id, unit: 'weekly', price: '1900000' },
    { tenantId: demoTenant.id, productId: productMap['DJI Mini 3 Pro'].id, unit: 'daily', price: '450000' },
    { tenantId: demoTenant.id, productId: productMap['DJI Mini 3 Pro'].id, unit: 'weekly', price: '2500000' },
    { tenantId: demoTenant.id, productId: productMap['Lighting Kit Pro'].id, unit: 'daily', price: '250000' },
    { tenantId: demoTenant.id, productId: productMap['Lighting Kit Pro'].id, unit: 'weekly', price: '1400000' },
    { tenantId: demoTenant.id, productId: productMap['Tripod Carbon'].id, unit: 'daily', price: '75000' },
    { tenantId: demoTenant.id, productId: productMap['Tripod Carbon'].id, unit: 'weekly', price: '400000' },
  ]).onConflictDoNothing()

  const inventoryRows = await db.insert(inventoryUnits).values([
    { tenantId: demoTenant.id, productId: productMap['Sony A7 III Body'].id, unitCode: 'CAM-A7III-01', serialNumber: 'A7III-9001', status: 'rented', condition: 'Good' },
    { tenantId: demoTenant.id, productId: productMap['Sony A7 III Body'].id, unitCode: 'CAM-A7III-02', serialNumber: 'A7III-9002', status: 'available', condition: 'Good' },
    { tenantId: demoTenant.id, productId: productMap['Sony A7 III Body'].id, unitCode: 'CAM-A7III-03', serialNumber: 'A7III-9003', status: 'maintenance', condition: 'LCD flex check' },
    { tenantId: demoTenant.id, productId: productMap['DJI Mini 3 Pro'].id, unitCode: 'DRN-MINI3-01', serialNumber: 'MINI3-5001', status: 'available', condition: 'Good' },
    { tenantId: demoTenant.id, productId: productMap['DJI Mini 3 Pro'].id, unitCode: 'DRN-MINI3-02', serialNumber: 'MINI3-5002', status: 'rented', condition: 'Good' },
    { tenantId: demoTenant.id, productId: productMap['Lighting Kit Pro'].id, unitCode: 'LGT-PRO-01', serialNumber: 'LGT-1001', status: 'available', condition: 'Good' },
    { tenantId: demoTenant.id, productId: productMap['Lighting Kit Pro'].id, unitCode: 'LGT-PRO-02', serialNumber: 'LGT-1002', status: 'available', condition: 'Good' },
    { tenantId: demoTenant.id, productId: productMap['Tripod Carbon'].id, unitCode: 'TRP-CARB-01', serialNumber: 'TRP-2001', status: 'available', condition: 'Good' },
    { tenantId: demoTenant.id, productId: productMap['Tripod Carbon'].id, unitCode: 'TRP-CARB-02', serialNumber: 'TRP-2002', status: 'checking', condition: 'Joint tightened' },
  ]).returning()

  const customerMap = Object.fromEntries(customerRows.map((customer) => [customer.name, customer]))
  const inventoryMap = Object.fromEntries(inventoryRows.map((unit) => [unit.unitCode, unit]))

  const bookingRows = await db.insert(bookings).values([
    {
      tenantId: demoTenant.id,
      customerId: customerMap['Nabila Rachma'].id,
      bookingNumber: 'BKG-DEMO-001',
      status: 'active',
      startDate: daysFromNow(-2),
      endDate: daysFromNow(1),
      notes: 'Sewa untuk wedding content production',
      approvedBy: adminMember?.id ?? null,
      approvedAt: daysFromNow(-3),
    },
    {
      tenantId: demoTenant.id,
      customerId: customerMap['Fajar Hidayat'].id,
      bookingNumber: 'BKG-DEMO-002',
      status: 'confirmed',
      startDate: daysFromNow(2),
      endDate: daysFromNow(5),
      notes: 'Pickup sore hari',
      approvedBy: adminMember?.id ?? null,
      approvedAt: daysFromNow(-1),
    },
    {
      tenantId: demoTenant.id,
      customerId: customerMap['Citra Dewi'].id,
      bookingNumber: 'BKG-DEMO-003',
      status: 'completed',
      startDate: daysFromNow(-12),
      endDate: daysFromNow(-9),
      notes: 'Kembali tepat waktu',
      approvedBy: adminMember?.id ?? null,
      approvedAt: daysFromNow(-13),
    },
    {
      tenantId: demoTenant.id,
      customerId: customerMap['Fajar Hidayat'].id,
      bookingNumber: 'BKG-DEMO-004',
      status: 'draft',
      startDate: daysFromNow(6),
      endDate: daysFromNow(7),
      notes: 'Draft dari AI chat',
    },
  ]).returning()

  const bookingMap = Object.fromEntries(bookingRows.map((booking) => [booking.bookingNumber, booking]))

  await db.insert(bookingItems).values([
    {
      tenantId: demoTenant.id,
      bookingId: bookingMap['BKG-DEMO-001'].id,
      inventoryUnitId: inventoryMap['CAM-A7III-01'].id,
      productId: productMap['Sony A7 III Body'].id,
      pricingUnit: 'daily',
      pricePerUnit: '350000',
      quantity: 1,
      subtotal: '350000',
    },
    {
      tenantId: demoTenant.id,
      bookingId: bookingMap['BKG-DEMO-001'].id,
      inventoryUnitId: inventoryMap['DRN-MINI3-02'].id,
      productId: productMap['DJI Mini 3 Pro'].id,
      pricingUnit: 'daily',
      pricePerUnit: '450000',
      quantity: 1,
      subtotal: '450000',
    },
    {
      tenantId: demoTenant.id,
      bookingId: bookingMap['BKG-DEMO-002'].id,
      inventoryUnitId: inventoryMap['LGT-PRO-01'].id,
      productId: productMap['Lighting Kit Pro'].id,
      pricingUnit: 'daily',
      pricePerUnit: '250000',
      quantity: 1,
      subtotal: '250000',
    },
    {
      tenantId: demoTenant.id,
      bookingId: bookingMap['BKG-DEMO-003'].id,
      inventoryUnitId: inventoryMap['TRP-CARB-01'].id,
      productId: productMap['Tripod Carbon'].id,
      pricingUnit: 'daily',
      pricePerUnit: '75000',
      quantity: 1,
      subtotal: '75000',
    },
  ]).onConflictDoNothing()

  const invoiceRows = await db.insert(invoices).values([
    {
      tenantId: demoTenant.id,
      bookingId: bookingMap['BKG-DEMO-001'].id,
      invoiceNumber: 'INV-DEMO-001',
      status: 'partial',
      rentalAmount: '800000',
      depositAmount: '9000000',
      damageFee: '0',
      totalAmount: '9800000',
      paidAmount: '2000000',
      dueDate: daysFromNow(1),
      notes: 'Sisa dibayar saat pengembalian',
    },
    {
      tenantId: demoTenant.id,
      bookingId: bookingMap['BKG-DEMO-002'].id,
      invoiceNumber: 'INV-DEMO-002',
      status: 'unpaid',
      rentalAmount: '250000',
      depositAmount: '1500000',
      damageFee: '0',
      totalAmount: '1750000',
      paidAmount: '0',
      dueDate: daysFromNow(3),
      notes: 'Menunggu pelunasan',
    },
    {
      tenantId: demoTenant.id,
      bookingId: bookingMap['BKG-DEMO-003'].id,
      invoiceNumber: 'INV-DEMO-003',
      status: 'paid',
      rentalAmount: '75000',
      depositAmount: '750000',
      damageFee: '0',
      totalAmount: '825000',
      paidAmount: '825000',
      dueDate: daysFromNow(-8),
      notes: 'Lunas',
    },
  ]).returning()

  await db.insert(invoicePayments).values([
    {
      tenantId: demoTenant.id,
      invoiceId: invoiceRows[0].id,
      amount: '2000000',
      bankName: 'BCA',
      accountName: 'Moreno Demo',
      transferNote: 'DP booking aktif',
      isVerified: true,
      verifiedBy: adminMember?.id ?? null,
      verifiedAt: daysFromNow(-1),
    },
    {
      tenantId: demoTenant.id,
      invoiceId: invoiceRows[2].id,
      amount: '825000',
      bankName: 'BRI',
      accountName: 'Citra Dewi',
      transferNote: 'Pelunasan invoice',
      isVerified: true,
      verifiedBy: staffMember?.id ?? null,
      verifiedAt: daysFromNow(-7),
    },
  ]).onConflictDoNothing()

  await db.insert(returns).values({
    tenantId: demoTenant.id,
    bookingId: bookingMap['BKG-DEMO-003'].id,
    returnedAt: daysFromNow(-9),
    condition: 'minor_damage',
    conditionNotes: 'Tripod ada bekas gores ringan',
    damageFee: '150000',
    processedBy: staffMember?.id ?? null,
  }).onConflictDoNothing()

  await db.insert(conversations).values([
    {
      tenantId: demoTenant.id,
      customerId: customerMap['Nabila Rachma'].id,
      waConversationId: 'wa-demo-001',
      lastMessageAt: daysFromNow(-1),
      lastMessagePreview: 'Halo, saya mau sewa kamera untuk besok',
      unreadCount: 2,
      isAssigned: true,
      assignedTo: adminMember?.id ?? null,
    },
    {
      tenantId: demoTenant.id,
      customerId: customerMap['Fajar Hidayat'].id,
      waConversationId: 'wa-demo-002',
      lastMessageAt: daysFromNow(-3),
      lastMessagePreview: 'Apakah tersedia drone dengan baterai ekstra?',
      unreadCount: 1,
      isAssigned: false,
      assignedTo: null,
    },
  ]).onConflictDoNothing()

  const [conversationOne, conversationTwo] = await db.query.conversations.findMany({
    where: (conversation, { eq }) => eq(conversation.tenantId, demoTenant.id),
    orderBy: [desc(conversations.lastMessageAt)],
  })

  if (conversationOne && conversationTwo) {
    await db.insert(messages).values([
      {
        tenantId: demoTenant.id,
        conversationId: conversationOne.id,
        waMessageId: 'wa-msg-001',
        direction: 'inbound',
        content: 'Halo, saya mau sewa kamera untuk besok.',
        aiAnalysis: {
          intent: 'rental_request',
          confidence: 0.93,
          entities: {
            products: ['Sony A7 III Body'],
            startDate: isoDateOnly(daysFromNow(1)),
            endDate: isoDateOnly(daysFromNow(2)),
            notes: 'Produk untuk wedding content production',
          },
        },
        isRead: false,
        sentAt: daysFromNow(-1),
      },
      {
        tenantId: demoTenant.id,
        conversationId: conversationOne.id,
        waMessageId: 'wa-msg-002',
        direction: 'outbound',
        content: 'Siap, kami cek ketersediaan unitnya ya.',
        isRead: true,
        sentAt: daysFromNow(-1),
      },
      {
        tenantId: demoTenant.id,
        conversationId: conversationTwo.id,
        waMessageId: 'wa-msg-003',
        direction: 'inbound',
        content: 'Ada paket lighting lengkap untuk studio kecil?',
        aiAnalysis: {
          intent: 'product_question',
          confidence: 0.88,
          entities: {
            products: ['Lighting Kit Pro'],
          },
        },
        isRead: false,
        sentAt: daysFromNow(-3),
      },
    ]).onConflictDoNothing()
  }

  await db.insert(aiDrafts).values([
    {
      tenantId: demoTenant.id,
      messageId: null,
      conversationId: conversationOne?.id ?? null,
      customerId: customerMap['Nabila Rachma'].id,
      status: 'pending',
      extractedData: {
        items: [
          { productName: 'Sony A7 III Body', quantity: 1, unit: 'daily' },
          { productName: 'DJI Mini 3 Pro', quantity: 1, unit: 'daily' },
        ],
        startDate: isoDateOnly(daysFromNow(1)),
        endDate: isoDateOnly(daysFromNow(2)),
        notes: 'Booking dari chat masuk untuk esok hari',
      },
      confidence: '0.934',
    },
    {
      tenantId: demoTenant.id,
      messageId: null,
      conversationId: conversationTwo?.id ?? null,
      customerId: customerMap['Fajar Hidayat'].id,
      status: 'approved',
      extractedData: {
        items: [
          { productName: 'Lighting Kit Pro', quantity: 1, unit: 'daily' },
        ],
        startDate: isoDateOnly(daysFromNow(2)),
        endDate: isoDateOnly(daysFromNow(4)),
        notes: 'Draft sudah disetujui admin',
      },
      confidence: '0.911',
      bookingId: bookingMap['BKG-DEMO-002'].id,
      reviewedBy: adminMember?.id ?? null,
      reviewedAt: daysFromNow(-1),
    },
  ]).onConflictDoNothing()

  console.log('Seed completed.')
  console.log('Demo tenant:')
  console.log(`- email: ${DEMO_TENANT_EMAIL}`)
  console.log(`- password: ${DEMO_TENANT_PASSWORD}`)
  console.log(`- login: http://localhost:3000/login`)
  console.log('Superadmin demo:')
  console.log(`- email: ${DEMO_SUPERADMIN_EMAIL}`)
  console.log(`- password: ${DEMO_SUPERADMIN_PASSWORD}`)
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})