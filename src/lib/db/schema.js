/**
 * Rentivo — Database Schema (Drizzle ORM)
 * =========================================
 * Arsitektur: Shared DB, Shared Schema dengan isolasi Row Level Security (RLS).
 * Setiap tabel tenant-scoped memiliki kolom tenant_id yang digunakan oleh
 * policy RLS Supabase untuk memastikan isolasi data antar tenant.
 *
 * Tabel Platform (tanpa RLS, diakses via service_role key):
 *   - superadmins
 *   - tenants
 *
 * Tabel Tenant-Scoped (dilindungi RLS):
 *   - tenant_members, customers, products, pricing_tiers,
 *     inventory_units, bookings, booking_items, invoices,
 *     invoice_payments, returns, conversations, messages, ai_drafts
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const tenantStatusEnum = pgEnum('tenant_status', [
  'active',
  'suspended',
  'pending',
])

export const userRoleEnum = pgEnum('user_role', [
  'superadmin',
  'owner',
  'admin',
  'staff',
])

export const inventoryUnitStatusEnum = pgEnum('inventory_unit_status', [
  'available',
  'rented',
  'checking', // Sedang pengecekan kondisi setelah dikembalikan
  'maintenance',
])

export const bookingStatusEnum = pgEnum('booking_status', [
  'draft',       // AI draft, belum disetujui admin
  'confirmed',   // Disetujui, menunggu pembayaran
  'active',      // Barang sudah diserahkan ke pelanggan
  'returning',   // Proses pengembalian
  'completed',   // Selesai, barang kembali & diperiksa
  'cancelled',
])

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'unpaid',
  'partial',
  'paid',
  'refunded',
])

export const pricingUnitEnum = pgEnum('pricing_unit', [
  'hourly',
  'daily',
  'weekly',
])

export const messageDirectionEnum = pgEnum('message_direction', [
  'inbound',
  'outbound',
])

export const aiDraftStatusEnum = pgEnum('ai_draft_status', [
  'pending',   // Menunggu review admin
  'approved',  // Disetujui → booking dibuat
  'rejected',  // Ditolak
])

export const returnConditionEnum = pgEnum('return_condition', [
  'good',
  'minor_damage',
  'major_damage',
  'lost',
])

// ─────────────────────────────────────────────
// PLATFORM TABLES (no RLS, service_role only)
// ─────────────────────────────────────────────

/**
 * Akun SuperAdmin Rentivo — platform-level, bukan tenant.
 * Diakses hanya via service_role key.
 */
export const superadmins = pgTable('superadmins', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  supabaseUserId: uuid('supabase_user_id').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Registry workspace tenant (bisnis rental).
 * Setiap tenant mendapatkan slug unik yang digunakan untuk routing.
 */
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  status: tenantStatusEnum('status').default('active').notNull(),
  logoUrl: text('logo_url'),
  phoneNumber: varchar('phone_number', { length: 20 }), // Nomor WA bisnis
  address: text('address'),
  city: varchar('city', { length: 100 }),
  planType: varchar('plan_type', { length: 50 }).default('basic').notNull(), // 'basic', 'pro', 'enterprise'
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('trial').notNull(), // 'trial', 'active', 'expired', 'unpaid'
  subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),
  bankName: varchar('bank_name', { length: 100 }),
  bankAccountNumber: varchar('bank_account_number', { length: 100 }),
  bankAccountName: varchar('bank_account_name', { length: 255 }),
  bookingTemplate: text('booking_template'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_tenants_slug').on(t.slug),
  index('idx_tenants_status').on(t.status),
])

// ─────────────────────────────────────────────
// TENANT-SCOPED TABLES (dilindungi RLS)
// Semua tabel di bawah memiliki tenant_id dan diakses
// via anon/authenticated key dengan RLS aktif.
// ─────────────────────────────────────────────

/**
 * Anggota tim tenant — Owner, Admin, Staff.
 * supabase_user_id menghubungkan ke auth.users Supabase.
 */
export const tenantMembers = pgTable('tenant_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  supabaseUserId: uuid('supabase_user_id').notNull(),
  role: userRoleEnum('role').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_tenant_members_unique').on(t.tenantId, t.supabaseUserId),
  index('idx_tenant_members_tenant').on(t.tenantId),
])

/**
 * Pelanggan bisnis rental — auto-created dari profil WhatsApp.
 * Satu nomor WA = satu pelanggan per tenant.
 */
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull(),
  whatsappJid: varchar('whatsapp_jid', { length: 100 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  notes: text('notes'),
  totalBookings: integer('total_bookings').default(0).notNull(),
  totalSpent: numeric('total_spent', { precision: 15, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_customers_phone_tenant').on(t.tenantId, t.phoneNumber),
  index('idx_customers_tenant').on(t.tenantId),
])

/**
 * Jenis produk rental (misal: Kamera Sony A7III, Drone DJI Mini 3).
 * Satu produk memiliki banyak unit fisik (inventory_units) dan
 * banyak tier harga (pricing_tiers).
 */
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  imageUrl: text('image_url'),
  depositAmount: numeric('deposit_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_products_tenant').on(t.tenantId),
  index('idx_products_category').on(t.tenantId, t.category),
])

/**
 * Tier harga per produk — hourly / daily / weekly.
 * Satu produk bisa punya satu atau lebih tier.
 */
export const pricingTiers = pgTable('pricing_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  unit: pricingUnitEnum('unit').notNull(),
  price: numeric('price', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_pricing_tiers_unique').on(t.productId, t.unit),
  index('idx_pricing_tiers_product').on(t.productId),
])

/**
 * Unit fisik inventaris per produk.
 * Pessimistic lock diterapkan pada tabel ini saat booking disetujui
 * menggunakan SELECT ... FOR UPDATE dalam transaksi Drizzle.
 */
export const inventoryUnits = pgTable('inventory_units', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  serialNumber: varchar('serial_number', { length: 100 }),
  unitCode: varchar('unit_code', { length: 50 }).notNull(), // Misal: "KAM-A7III-01"
  status: inventoryUnitStatusEnum('status').default('available').notNull(),
  condition: text('condition'), // Catatan kondisi terkini
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_inventory_units_code').on(t.tenantId, t.unitCode),
  index('idx_inventory_units_product').on(t.productId),
  index('idx_inventory_units_status').on(t.tenantId, t.status),
])

/**
 * Pesanan / booking rental.
 * Status machine: draft → confirmed → active → returning → completed | cancelled
 */
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  bookingNumber: varchar('booking_number', { length: 50 }).notNull(),
  status: bookingStatusEnum('status').default('draft').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  notes: text('notes'),
  approvedBy: uuid('approved_by').references(() => tenantMembers.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_bookings_number').on(t.tenantId, t.bookingNumber),
  index('idx_bookings_tenant').on(t.tenantId),
  index('idx_bookings_customer').on(t.customerId),
  index('idx_bookings_status').on(t.tenantId, t.status),
  index('idx_bookings_dates').on(t.tenantId, t.startDate, t.endDate),
])

/**
 * Item-item dalam satu booking — unit fisik yang disewa beserta harganya.
 */
export const bookingItems = pgTable('booking_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  inventoryUnitId: uuid('inventory_unit_id').notNull().references(() => inventoryUnits.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  pricingUnit: pricingUnitEnum('pricing_unit').notNull(),
  pricePerUnit: numeric('price_per_unit', { precision: 15, scale: 2 }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_booking_items_booking').on(t.bookingId),
  index('idx_booking_items_unit').on(t.inventoryUnitId),
])

/**
 * Invoice per booking.
 * Rental fee dan deposit dilacak terpisah.
 */
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').notNull().unique().references(() => bookings.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  status: invoiceStatusEnum('status').default('unpaid').notNull(),
  rentalAmount: numeric('rental_amount', { precision: 15, scale: 2 }).notNull(),
  depositAmount: numeric('deposit_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  damageFee: numeric('damage_fee', { precision: 15, scale: 2 }).default('0').notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_invoices_number').on(t.tenantId, t.invoiceNumber),
  index('idx_invoices_tenant').on(t.tenantId),
  index('idx_invoices_status').on(t.tenantId, t.status),
])

/**
 * Riwayat pembayaran per invoice.
 * Bukti transfer disimpan di Supabase Storage, URL-nya di sini.
 */
export const invoicePayments = pgTable('invoice_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  proofImageUrl: text('proof_image_url'), // Supabase Storage URL
  bankName: varchar('bank_name', { length: 100 }),
  accountName: varchar('account_name', { length: 255 }),
  transferNote: text('transfer_note'),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedBy: uuid('verified_by').references(() => tenantMembers.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_invoice_payments_invoice').on(t.invoiceId),
  index('idx_invoice_payments_tenant').on(t.tenantId),
])

/**
 * Pengembalian barang — Full Return only (MVP).
 * Staff memasukkan kondisi barang dan biaya denda jika ada.
 */
export const returns = pgTable('returns', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').notNull().unique().references(() => bookings.id),
  returnedAt: timestamp('returned_at', { withTimezone: true }).notNull(),
  condition: returnConditionEnum('condition').notNull(),
  conditionNotes: text('condition_notes'),
  damageFee: numeric('damage_fee', { precision: 15, scale: 2 }).default('0').notNull(),
  processedBy: uuid('processed_by').references(() => tenantMembers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_returns_booking').on(t.bookingId),
  index('idx_returns_tenant').on(t.tenantId),
])

/**
 * Thread percakapan WhatsApp per pelanggan.
 * Satu pelanggan = satu conversation per tenant.
 */
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  waConversationId: varchar('wa_conversation_id', { length: 255 }), // ID dari Baileys
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  lastMessagePreview: text('last_message_preview'),
  unreadCount: integer('unread_count').default(0).notNull(),
  isAssigned: boolean('is_assigned').default(false).notNull(),
  assignedTo: uuid('assigned_to').references(() => tenantMembers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_conversations_tenant').on(t.tenantId),
  index('idx_conversations_customer').on(t.customerId),
  index('idx_conversations_last_message').on(t.tenantId, t.lastMessageAt),
])

/**
 * Pesan individual dalam percakapan.
 * aiAnalysis menyimpan hasil analisis Gemini (intent, entities) sebagai JSONB.
 */
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  waMessageId: varchar('wa_message_id', { length: 255 }), // ID dari Baileys
  direction: messageDirectionEnum('direction').notNull(),
  content: text('content'),
  mediaUrl: text('media_url'), // Supabase Storage URL untuk gambar/file
  mediaType: varchar('media_type', { length: 50 }), // image, document, audio
  aiAnalysis: jsonb('ai_analysis'), // { intent, entities, confidence }
  isRead: boolean('is_read').default(false).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_messages_conversation').on(t.conversationId),
  index('idx_messages_tenant').on(t.tenantId),
  index('idx_messages_sent_at').on(t.conversationId, t.sentAt),
])

/**
 * Draft pesanan yang digenerate oleh Gemini AI.
 * Admin harus mereview dan menekan "Setujui" sebelum booking dibuat.
 * Tidak ada penulisan otomatis ke bookings tanpa persetujuan admin.
 */
export const aiDrafts = pgTable('ai_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  messageId: uuid('message_id').references(() => messages.id),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  customerId: uuid('customer_id').references(() => customers.id),
  status: aiDraftStatusEnum('status').default('pending').notNull(),
  // Data terstruktur yang diekstrak Gemini
  extractedData: jsonb('extracted_data').notNull(), // { items: [{productName, quantity, unit}], startDate, endDate, notes }
  confidence: numeric('confidence', { precision: 4, scale: 3 }), // 0.000 - 1.000
  // Setelah disetujui, booking_id diisi
  bookingId: uuid('booking_id').references(() => bookings.id),
  reviewedBy: uuid('reviewed_by').references(() => tenantMembers.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectReason: text('reject_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_ai_drafts_tenant').on(t.tenantId),
  index('idx_ai_drafts_status').on(t.tenantId, t.status),
  index('idx_ai_drafts_conversation').on(t.conversationId),
])

export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).default('open').notNull(), // 'open', 'in_progress', 'resolved'
  priority: varchar('priority', { length: 50 }).default('medium').notNull(), // 'low', 'medium', 'high'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_support_tickets_tenant').on(t.tenantId),
  index('idx_support_tickets_status').on(t.status),
])
