import SectionPage from '@/components/SectionPage'
import { db } from '@/lib/db'
import { conversations, customers, messages, aiDrafts, tenants, products, inventoryUnits } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq, and } from 'drizzle-orm'
import InboxClient from '@/components/InboxClient'

export const metadata = { title: 'Kotak Masuk' }

export default async function InboxPage({ searchParams }) {
  const { tenantId } = await requireTenantAuth(['owner', 'admin'])

  // Fetch tenant details for the phone connection
  let tenant = null
  try {
    tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId)
    })
  } catch (e) {
    console.error('InboxPage tenant fetch error:', e)
  }

  // Fetch all conversations for this tenant
  const convRows = await db
    .select({
      id: conversations.id,
      lastMessageAt: conversations.lastMessageAt,
      lastMessagePreview: conversations.lastMessagePreview,
      unreadCount: conversations.unreadCount,
      customerName: customers.name,
      customerPhone: customers.phoneNumber,
    })
    .from(conversations)
    .leftJoin(customers, eq(conversations.customerId, customers.id))
    .where(eq(conversations.tenantId, tenantId))
    .orderBy(desc(conversations.lastMessageAt))

  // Determine active selected conversation
  let activeConvId = searchParams?.conversationId ?? null
  if (!activeConvId && convRows.length > 0) {
    activeConvId = convRows[0].id
  }

  // Fetch messages and pending drafts if a conversation is active
  let activeMessages = []
  let pendingDraft = null

  if (activeConvId) {
    try {
      activeMessages = await db
        .select()
        .from(messages)
        .where(and(eq(messages.tenantId, tenantId), eq(messages.conversationId, activeConvId)))
        .orderBy(messages.sentAt)

      pendingDraft = await db.query.aiDrafts.findFirst({
        where: (d, { eq, and }) => and(
          eq(d.tenantId, tenantId), 
          eq(d.conversationId, activeConvId), 
          eq(d.status, 'pending')
        ),
      })
    } catch (e) {
      console.error('InboxPage active conversation messages query error:', e)
    }
  }

  // Fetch all products of the tenant with available units count
  let productsWithStock = []
  try {
    const allProducts = await db.query.products.findMany({
      where: eq(products.tenantId, tenantId),
    })
    for (const prod of allProducts) {
      const units = await db.query.inventoryUnits.findMany({
        where: (u, { eq, and }) => and(
          eq(u.tenantId, tenantId),
          eq(u.productId, prod.id),
          eq(u.status, 'available')
        )
      })
      productsWithStock.push({
        id: prod.id,
        name: prod.name,
        availableStock: units.length
      })
    }
  } catch (err) {
    console.error('Failed to fetch products with stock in InboxPage:', err)
  }

  return (
    <SectionPage
      title="Kotak Masuk"
      description="Kelola percakapan WhatsApp masuk dan tinjau draf pemesanan otomatis dari AI sebelum disimpan secara resmi."
    >
      <InboxClient 
        conversations={convRows}
        activeConvId={activeConvId}
        messages={activeMessages}
        pendingDraft={pendingDraft}
        tenantId={tenantId}
        tenantPhone={tenant?.phoneNumber ?? null}
        productsWithStock={productsWithStock}
      />
    </SectionPage>
  )
}