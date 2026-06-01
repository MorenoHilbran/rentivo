/**
 * Rentivo — Session & Auth Helpers
 * Utility untuk membaca user session dan tenant context di Server Components.
 */
import { db } from '@/lib/db'
import { tenantMembers } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

/**
 * Ambil session user saat ini. Redirect ke /login jika tidak ada session.
 * Gunakan di Server Components dan Server Actions yang memerlukan auth.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

/**
 * Ambil session user + tenant context.
 * Melempar redirect jika tidak ada session atau tidak ada tenant_id.
 */
export async function requireTenantAuth() {
  const user = await requireAuth()

  let tenantId = user.user_metadata?.tenant_id
  let role = user.user_metadata?.role

  if (!tenantId) {
    const membershipRows = await db
      .select({ tenantId: tenantMembers.tenantId, role: tenantMembers.role })
      .from(tenantMembers)
      .where(eq(tenantMembers.supabaseUserId, user.id))
      .limit(1)

    const membership = membershipRows[0]

    if (membership) {
      tenantId = membership.tenantId
      role = membership.role
    }
  }

  if (!tenantId || role === 'superadmin') {
    redirect('/login')
  }

  return { user, tenantId, role }
}

/**
 * Require SuperAdmin role.
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()
  const role = user.user_metadata?.role

  if (role !== 'superadmin') {
    redirect('/dashboard')
  }

  return user
}
