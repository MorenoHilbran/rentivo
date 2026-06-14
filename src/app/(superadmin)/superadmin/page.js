import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import SuperAdminClient from './SuperAdminClient'
import { Notice } from '@/components/ManagementUI'

export const metadata = {
  title: 'SuperAdmin | Rentivo',
}

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage({ searchParams: searchParamsPromise }) {
  const allTenants = await db.query.tenants.findMany({
    orderBy: [desc(tenants.createdAt)],
  })

  const searchParams = await searchParamsPromise
  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  return (
    <div className="p-xl max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Admin Command Center</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Kelola semua workspace (tenant) yang terdaftar, status billing langganan, dan pembatasan akses platform.
        </p>
      </div>

      {feedbackMessage ? (
        <Notice
          tone={feedbackKey === 'error' ? 'error' : 'success'}
          title={feedbackKey === 'error' ? 'Gagal Melakukan Aksi' : 'Berhasil'}
          message={feedbackMessage}
        />
      ) : null}

      <SuperAdminClient tenants={allTenants} />
    </div>
  )
}
