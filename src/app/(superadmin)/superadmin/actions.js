'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { tenants, tenantMembers, supportTickets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50)
}

export async function toggleTenantStatus(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || session.user.user_metadata?.role !== 'superadmin') {
    throw new Error('Unauthorized')
  }

  const tenantId = formData.get('tenantId')
  const currentStatus = formData.get('currentStatus')

  if (!tenantId || !currentStatus) {
    throw new Error('Missing data')
  }

  const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'

  await db.update(tenants)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId))

  revalidatePath('/superadmin')
  redirect('/superadmin?success=Status+workspace+berhasil+diubah')
}

export async function createTenantWorkspaceAction(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || session.user.user_metadata?.role !== 'superadmin') {
    throw new Error('Unauthorized')
  }

  const businessName = String(formData.get('businessName') ?? '').trim()
  const ownerName = String(formData.get('ownerName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()
  const phoneNumber = String(formData.get('phoneNumber') ?? '').trim() || null
  const city = String(formData.get('city') ?? '').trim() || null
  const address = String(formData.get('address') ?? '').trim() || null
  const planType = String(formData.get('planType') ?? 'basic').trim()
  const subscriptionStatus = String(formData.get('subscriptionStatus') ?? 'trial').trim()
  const expiresAtStr = formData.get('subscriptionExpiresAt')

  if (!businessName || !ownerName || !email || !password) {
    redirect('/superadmin?error=Nama+bisnis,+nama+pemilik,+email,+dan+password+wajib+diisi')
  }

  const adminSupabase = await createAdminClient()

  // 1. Create owner user in Supabase auth
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: ownerName,
      role: 'owner',
    },
  })

  if (authError || !authData.user) {
    const msg = authError?.message ?? 'Gagal membuat user auth'
    redirect(`/superadmin?error=${encodeURIComponent(msg)}`)
  }

  let redirectTo = null
  try {
    // 2. Generate slug
    let slug = slugify(businessName)
    const baseSlug = slug
    let attempt = 0
    while (attempt < 5) {
      const existing = await db.query.tenants.findFirst({
        where: (t, { eq }) => eq(t.slug, slug),
      })
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null

    // 3. Create Tenant
    const [tenant] = await db.insert(tenants).values({
      name: businessName,
      slug,
      status: 'active',
      phoneNumber,
      address,
      city,
      planType,
      subscriptionStatus,
      subscriptionExpiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    // 4. Create Member
    await db.insert(tenantMembers).values({
      tenantId: tenant.id,
      supabaseUserId: authData.user.id,
      role: 'owner',
      name: ownerName,
      email,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 5. Update user metadata with tenant ID
    await adminSupabase.auth.admin.updateUserById(authData.user.id, {
      data: {
        role: 'owner',
        tenant_id: tenant.id,
        tenant_slug: slug,
        name: ownerName,
      },
    })

    redirectTo = `/superadmin?success=Workspace+${encodeURIComponent(businessName)}+berhasil+dibuat`
  } catch (err) {
    console.error('Superadmin tenant creation error:', err)
    // Rollback auth user if creation failed
    if (authData?.user?.id) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
    }
    redirectTo = `/superadmin?error=${encodeURIComponent(err.message ?? 'Gagal membuat workspace')}`
  }

  revalidatePath('/superadmin')
  if (redirectTo) redirect(redirectTo)
}

export async function updateSubscriptionAction(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || session.user.user_metadata?.role !== 'superadmin') {
    throw new Error('Unauthorized')
  }

  const tenantId = formData.get('tenantId')
  const planType = formData.get('planType')
  const subscriptionStatus = formData.get('subscriptionStatus')
  const expiresAtStr = formData.get('subscriptionExpiresAt')

  if (!tenantId || !planType || !subscriptionStatus) {
    redirect('/superadmin?error=Semua+field+langganan+wajib+diisi')
  }

  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null

  await db.update(tenants)
    .set({
      planType,
      subscriptionStatus,
      subscriptionExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))

  revalidatePath('/superadmin')
  redirect('/superadmin?success=Status+langganan+berhasil+diperbarui')
}

export async function updateTicketStatusAction(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || session.user.user_metadata?.role !== 'superadmin') {
    throw new Error('Unauthorized')
  }

  const ticketId = formData.get('ticketId')
  const status = formData.get('status')

  if (!ticketId || !status) {
    redirect('/superadmin/tickets?error=Data+tidak+lengkap')
  }

  await db.update(supportTickets)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId))

  revalidatePath('/superadmin/tickets')
  redirect('/superadmin/tickets?success=Status+tiket+berhasil+diperbarui')
}
