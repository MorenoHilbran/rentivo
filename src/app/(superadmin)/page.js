import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { toggleTenantStatus } from './actions'

export const metadata = {
  title: 'SuperAdmin | Rentivo',
}

export default async function SuperAdminPage() {
  const allTenants = await db.query.tenants.findMany({
    orderBy: [desc(tenants.createdAt)],
  })

  return (
    <div className="p-xl max-w-7xl mx-auto">
      <div className="mb-lg">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Admin Command Center</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Kelola semua workspace (tenant) yang terdaftar di platform.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col">
        <div className="p-md border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface">Daftar Workspace</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Workspace</th>
                <th>Slug</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Tgl Dibuat</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {allTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="font-medium text-on-surface">{tenant.name}</td>
                  <td className="text-on-surface-variant font-code text-code">{tenant.slug}</td>
                  <td className="text-on-surface-variant">{tenant.phoneNumber || '-'}</td>
                  <td>
                    <span className={`badge ${
                      tenant.status === 'active' ? 'badge-success' : 
                      tenant.status === 'suspended' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {tenant.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-on-surface-variant text-body-sm">
                    {new Date(tenant.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="text-right">
                    <form action={toggleTenantStatus}>
                      <input type="hidden" name="tenantId" value={tenant.id} />
                      <input type="hidden" name="currentStatus" value={tenant.status} />
                      <button 
                        type="submit"
                        className={`btn btn-sm ${tenant.status === 'suspended' ? 'btn-primary' : 'btn-danger'}`}
                      >
                        {tenant.status === 'suspended' ? 'Aktifkan' : 'Suspend'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {allTenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-xl text-on-surface-variant">
                    Belum ada workspace yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
