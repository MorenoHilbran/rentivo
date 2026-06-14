/**
 * Rentivo — Session & Auth Helpers
 * Utility untuk membaca user session dan tenant context di Server Components.
 *
 * Error handling: Semua Supabase auth calls dibungkus try-catch agar
 * ENOTFOUND / timeout tidak menghasilkan unhandled exception — melainkan
 * redirect ke /login yang lebih informatif.
 */
import { db } from '@/lib/db'
import { tenantMembers, tenants } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

/**
 * Ambil session user saat ini. Redirect ke /login jika tidak ada session
 * atau jika Supabase tidak bisa diakses (project paused, ENOTFOUND, dll).
 */
export async function requireAuth() {
  let user = null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data?.user ?? null
    }
  } catch (err) {
    // Supabase tidak tersedia — log sekali saja, tidak spam
    const msg = err?.message ?? String(err)
    if (!globalThis.__supabaseErrLogged) {
      globalThis.__supabaseErrLogged = true
      console.error(
        '[Session] Tidak dapat terhubung ke Supabase:',
        msg.includes('ENOTFOUND')
          ? 'Project Supabase tidak ditemukan / sedang di-pause. Cek dashboard Supabase Anda.'
          : msg
      )
    }
  }

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Ambil session user + tenant context.
 * Melempar redirect jika tidak ada session atau tidak ada tenant_id.
 */
export async function requireTenantAuth(allowedRoles = ['owner', 'admin', 'staff']) {
  const user = await requireAuth()

  let tenantId = null
  let role = null
  let memberActive = true

  try {
    const membershipRows = await db
      .select({ 
        tenantId: tenantMembers.tenantId, 
        role: tenantMembers.role,
        isActive: tenantMembers.isActive
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.supabaseUserId, user.id))
      .limit(1)

    const membership = membershipRows[0]
    if (membership) {
      tenantId = membership.tenantId
      role = membership.role
      memberActive = membership.isActive
    }
  } catch (dbErr) {
    console.error('[Session] DB error saat lookup tenant:', dbErr?.message ?? dbErr)
  }

  if (role === 'superadmin') {
    redirect('/superadmin')
  }

  if (!tenantId || !memberActive) {
    redirect('/login?error=Akun+Anda+nonaktif+atau+tidak+terdaftar+di+workspace+manapun.')
  }

  // Check tenant suspension status
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    })
    if (!tenant) {
      redirect('/login')
    }
    if (tenant.status === 'suspended') {
      redirect('/login?error=Workspace+Anda+ditangguhkan+(suspended).+Hubungi+admin+Rentivo.')
    }
  } catch (err) {
    console.error('[Session] DB error saat lookup tenant status:', err)
  }

  // Enforce allowed roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'staff') {
      redirect('/returns')
    } else {
      redirect('/dashboard')
    }
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
