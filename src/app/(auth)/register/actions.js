'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { tenants, tenantMembers } from '@/lib/db/schema'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50)
}

export async function registerAction(formData) {
  const businessName = formData.get('businessName')
  const ownerName = formData.get('ownerName')
  const email = formData.get('email')
  const password = formData.get('password')
  const phone = formData.get('phone')
  const city = formData.get('city')

  if (!businessName || !ownerName || !email || !password) {
    redirect('/register?error=Semua+field+wajib+diisi')
  }

  if (password.length < 8) {
    redirect('/register?error=Password+minimal+8+karakter')
  }

  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  // 1. Buat akun Supabase Auth via service role agar tidak terkena rate limit signup publik
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: ownerName,
      role: 'owner',
      // tenant_id akan diisi setelah tenant dibuat
    },
  })

  if (authError || !authData.user) {
    const message = authError?.message ?? 'Pendaftaran gagal'
    redirect(`/register?error=${encodeURIComponent(message)}`)
  }

  try {
    // 2. Buat slug unik untuk tenant
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

    // 3. Buat tenant
    const [tenant] = await db.insert(tenants).values({
      name: businessName,
      slug,
      status: 'active',
      phoneNumber: phone,
      city,
    }).returning()

    // 4. Buat tenant member (Owner)
    await db.insert(tenantMembers).values({
      tenantId: tenant.id,
      supabaseUserId: authData.user.id,
      role: 'owner',
      name: ownerName,
      email,
    })

    // 5. Update user metadata dengan tenant_id dan role
    await adminSupabase.auth.admin.updateUserById(authData.user.id, {
      data: {
        role: 'owner',
        tenant_id: tenant.id,
        tenant_slug: slug,
        name: ownerName,
      },
    })

    // 6. Buat session login agar user bisa langsung masuk ke setup page
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Auto sign-in after register failed:', signInError)
      redirect('/login?error=Akun+berhasil+dibuat,+silakan+masuk+untuk+melanjutkan')
    }
  } catch (err) {
    console.error('Tenant provisioning error:', err)

    if (authData?.user?.id) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
    }

    redirect('/register?error=Terjadi+kesalahan+saat+membuat+workspace')
  }

  redirect('/register/setup')
}

export async function saveSetupAction(formData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const tenantId = session.user.user_metadata?.tenant_id
  if (!tenantId) {
    redirect('/dashboard')
  }

  const phone = String(formData.get('phone') ?? '').trim()
  if (phone) {
    await db.update(tenants).set({
      phoneNumber: phone,
      updatedAt: new Date()
    }).where(eq(tenants.id, tenantId))
  }

  redirect('/dashboard')
}
