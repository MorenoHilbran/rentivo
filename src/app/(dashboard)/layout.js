import { requireTenantAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Sidebar from '@/components/Sidebar'

export async function generateMetadata() {
  let tenantName = 'Rentivo'
  try {
    const { tenantId } = await requireTenantAuth()
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    })
    if (tenant) tenantName = tenant.name
  } catch (e) {}

  return {
    title: {
      template: `%s | ${tenantName}`,
      default: tenantName,
    },
  }
}

export default async function DashboardLayout({ children }) {
  const { user, tenantId, role } = await requireTenantAuth()

  // Fetch tenant name
  let tenantName = 'Workspace'
  let pendingDraftsCount = 0
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    })
    if (tenant) tenantName = tenant.name

    const drafts = await db.query.aiDrafts.findMany({
      where: (d, { eq, and }) => and(eq(d.tenantId, tenantId), eq(d.status, 'pending')),
    })
    pendingDraftsCount = drafts.length
  } catch (e) {
    // DB not connected yet during dev
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={{
          name: user.user_metadata?.name ?? user.email,
          email: user.email,
        }}
        role={role}
        tenantName={tenantName}
        tenantId={tenantId}
        pendingDraftsCount={pendingDraftsCount}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
