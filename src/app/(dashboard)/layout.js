import { requireTenantAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }) {
  const { user, tenantId, role } = await requireTenantAuth()

  // Fetch tenant name
  let tenantName = 'Workspace'
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    })
    if (tenant) tenantName = tenant.name
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
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
