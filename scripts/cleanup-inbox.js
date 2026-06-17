/**
 * Script: Bersihkan data chat (messages, ai_drafts, conversations, customers)
 * untuk tenant tertentu berdasarkan slug.
 *
 * Usage: node scripts/cleanup-inbox.js <tenant-slug>
 * Contoh: node scripts/cleanup-inbox.js sewamotorpurwokerto
 */
import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { eq } from 'drizzle-orm'
import * as schema from '../src/lib/db/schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '..', '.env.local') })

const {
  tenants,
  customers,
  conversations,
  messages,
  aiDrafts,
} = schema

const slug = process.argv[2]
if (!slug) {
  console.error('❌ Usage: node scripts/cleanup-inbox.js <tenant-slug>')
  process.exit(1)
}

const pool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 1,
  connectionTimeoutMillis: 10000,
})

const db = drizzle(pool, { schema })

async function main() {
  console.log(`\n🔍 Mencari tenant dengan slug: "${slug}"...`)

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  })

  if (!tenant) {
    console.error(`❌ Tenant dengan slug "${slug}" tidak ditemukan!`)

    // List available tenants
    const allTenants = await db.query.tenants.findMany()
    if (allTenants.length > 0) {
      console.log('\n📋 Tenant yang tersedia:')
      for (const t of allTenants) {
        console.log(`   - ${t.slug} (${t.name}) [ID: ${t.id}]`)
      }
    }
    process.exit(1)
  }

  const tenantId = tenant.id
  console.log(`✅ Tenant ditemukan: ${tenant.name} [ID: ${tenantId}]`)

  // Count existing data
  const existingMessages = await db.query.messages.findMany({ where: eq(messages.tenantId, tenantId) })
  const existingDrafts = await db.query.aiDrafts.findMany({ where: eq(aiDrafts.tenantId, tenantId) })
  const existingConvs = await db.query.conversations.findMany({ where: eq(conversations.tenantId, tenantId) })
  const existingCustomers = await db.query.customers.findMany({ where: eq(customers.tenantId, tenantId) })

  console.log(`\n📊 Data yang akan dihapus:`)
  console.log(`   - Messages:      ${existingMessages.length}`)
  console.log(`   - AI Drafts:     ${existingDrafts.length}`)
  console.log(`   - Conversations: ${existingConvs.length}`)
  console.log(`   - Customers:     ${existingCustomers.length}`)

  if (existingMessages.length === 0 && existingDrafts.length === 0 && existingConvs.length === 0 && existingCustomers.length === 0) {
    console.log('\n✨ Tidak ada data chat untuk dihapus. Sudah bersih!')
    process.exit(0)
  }

  // Delete in order (respecting foreign keys)
  console.log('\n🗑️  Menghapus data...')

  // 1. AI Drafts (references messages, conversations, customers)
  const delDrafts = await db.delete(aiDrafts).where(eq(aiDrafts.tenantId, tenantId)).returning()
  console.log(`   ✅ AI Drafts dihapus: ${delDrafts.length}`)

  // 2. Messages (references conversations)
  const delMessages = await db.delete(messages).where(eq(messages.tenantId, tenantId)).returning()
  console.log(`   ✅ Messages dihapus: ${delMessages.length}`)

  // 3. Conversations (references customers)
  const delConvs = await db.delete(conversations).where(eq(conversations.tenantId, tenantId)).returning()
  console.log(`   ✅ Conversations dihapus: ${delConvs.length}`)

  // 4. Customers
  const delCustomers = await db.delete(customers).where(eq(customers.tenantId, tenantId)).returning()
  console.log(`   ✅ Customers dihapus: ${delCustomers.length}`)

  console.log(`\n🎉 Kotak masuk tenant "${tenant.name}" berhasil dibersihkan!\n`)
}

main()
  .catch((err) => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
  .finally(() => pool.end())
