'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

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
    .set({ status: newStatus })
    .where(eq(tenants.id, tenantId))

  revalidatePath('/superadmin')
}
