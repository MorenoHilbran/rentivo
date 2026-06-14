import { db } from '@/lib/db'
import {
  tenants,
  supportTickets,
  products,
  customers,
  bookings,
  invoices,
  tenantMembers
} from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'
import { TableCard } from '@/components/ManagementUI'
import {
  Users,
  Globe,
  LifeBuoy,
  Package,
  CalendarDays,
  ReceiptText,
  UserCheck
} from 'lucide-react'

export const metadata = {
  title: 'Statistik & Master | Rentivo Admin',
}

export const dynamic = 'force-dynamic'

export default async function MasterStatsPage() {
  // Fetch platform metrics counts
  const [tenantsCount] = await db.select({ count: sql`count(*)` }).from(tenants)
  const [activeTenantsCount] = await db.select({ count: sql`count(*)` }).from(tenants).where(eq(tenants.status, 'active'))
  const [suspendedTenantsCount] = await db.select({ count: sql`count(*)` }).from(tenants).where(eq(tenants.status, 'suspended'))

  const [ticketsCount] = await db.select({ count: sql`count(*)` }).from(supportTickets)
  const [openTicketsCount] = await db.select({ count: sql`count(*)` }).from(supportTickets).where(eq(supportTickets.status, 'open'))
  const [resolvedTicketsCount] = await db.select({ count: sql`count(*)` }).from(supportTickets).where(eq(supportTickets.status, 'resolved'))

  const [productsCount] = await db.select({ count: sql`count(*)` }).from(products)
  const [customersCount] = await db.select({ count: sql`count(*)` }).from(customers)
  const [bookingsCount] = await db.select({ count: sql`count(*)` }).from(bookings)
  const [invoicesCount] = await db.select({ count: sql`count(*)` }).from(invoices)
  const [membersCount] = await db.select({ count: sql`count(*)` }).from(tenantMembers)

  // Fetch all tenants to aggregate subscription stats in memory
  let allTenantsList = []
  try {
    allTenantsList = await db.query.tenants.findMany()
  } catch (e) {
    console.error('Failed to fetch tenants for statistics', e)
  }

  const plans = { basic: 0, pro: 0, enterprise: 0 }
  const billingStatuses = { trial: 0, active: 0, expired: 0, unpaid: 0 }

  allTenantsList.forEach(t => {
    const pType = t.planType || 'basic'
    const sStatus = t.subscriptionStatus || 'trial'
    if (plans[pType] !== undefined) plans[pType]++
    if (billingStatuses[sStatus] !== undefined) billingStatuses[sStatus]++
  })

  const tCount = Number(tenantsCount?.count ?? 0)
  const activeCount = Number(activeTenantsCount?.count ?? 0)
  const suspendedCount = Number(suspendedTenantsCount?.count ?? 0)

  const tickCount = Number(ticketsCount?.count ?? 0)
  const openCount = Number(openTicketsCount?.count ?? 0)
  const resolvedCount = Number(resolvedTicketsCount?.count ?? 0)

  const prodCount = Number(productsCount?.count ?? 0)
  const custCount = Number(customersCount?.count ?? 0)
  const bookCount = Number(bookingsCount?.count ?? 0)
  const invCount = Number(invoicesCount?.count ?? 0)
  const memCount = Number(membersCount?.count ?? 0)

  return (
    <div className="p-xl max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Statistik & Master Data</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Pantau seluruh statistik ekosistem platform Rentivo SaaS secara real-time.
        </p>
      </div>

      {/* Row 1: KPI Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Workspace Card */}
        <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
            <Globe size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', opacity: 0.6 }}>Total Tenant</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-on-surface)', marginTop: '4px', lineHeight: 1 }}>{tCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '6px' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{activeCount} Aktif</span> • {suspendedCount} Suspend
            </div>
          </div>
        </div>

        {/* Tickets Card */}
        <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-error-container)', color: 'var(--color-error)' }}>
            <LifeBuoy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', opacity: 0.6 }}>Tiket Bantuan</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-on-surface)', marginTop: '4px', lineHeight: 1 }}>{tickCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '6px' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{openCount} Terbuka</span> • {resolvedCount} Selesai
            </div>
          </div>
        </div>

        {/* Members Card */}
        <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', opacity: 0.6 }}>Pengguna Sistem</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-on-surface)', marginTop: '4px', lineHeight: 1 }}>{memCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '6px' }}>
              Pemilik & staff operasional tenant
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Subscriptions Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Plan type breakdown */}
        <TableCard title="Distribusi Paket Layanan" description="Breakdown jenis plan berlangganan dari semua tenant.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            {Object.entries(plans).map(([plan, count]) => {
              const percentage = tCount > 0 ? Math.round((count / tCount) * 100) : 0
              return (
                <div key={plan} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--color-on-surface)' }}>{plan} Plan</span>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>{count} Tenant ({percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: plan === 'enterprise' ? 'var(--color-error)' : plan === 'pro' ? 'var(--color-primary)' : 'var(--color-outline)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </TableCard>

        {/* Subscription status breakdown */}
        <TableCard title="Status Pembayaran & Billing" description="Status pembayaran saat ini untuk tenant berlangganan.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            {Object.entries(billingStatuses).map(([status, count]) => {
              const percentage = tCount > 0 ? Math.round((count / tCount) * 100) : 0
              return (
                <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--color-on-surface)' }}>{status}</span>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>{count} Tenant ({percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: status === 'active' ? 'var(--color-success)' : status === 'trial' ? 'var(--color-warning)' : 'var(--color-error)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </TableCard>
      </div>

      {/* Row 3: Platform Data Volume Monitoring */}
      <TableCard title="Volume Data Transaksional Platform" description="Jumlah rekaman data operasional yang tersimpan di seluruh tenant.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '8px 0' }}>
          {/* Products count */}
          <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '12px', padding: '16px', background: 'var(--color-surface-container-low)', textAlign: 'center' }}>
            <Package size={20} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Produk Terdaftar</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-on-surface)', marginTop: '4px' }}>{prodCount}</div>
          </div>

          {/* Customers count */}
          <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '12px', padding: '16px', background: 'var(--color-surface-container-low)', textAlign: 'center' }}>
            <UserCheck size={20} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Total Pelanggan</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-on-surface)', marginTop: '4px' }}>{custCount}</div>
          </div>

          {/* Bookings count */}
          <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '12px', padding: '16px', background: 'var(--color-surface-container-low)', textAlign: 'center' }}>
            <CalendarDays size={20} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Total Booking/Order</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-on-surface)', marginTop: '4px' }}>{bookCount}</div>
          </div>

          {/* Invoices count */}
          <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '12px', padding: '16px', background: 'var(--color-surface-container-low)', textAlign: 'center' }}>
            <ReceiptText size={20} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Invoice Terbit</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-on-surface)', marginTop: '4px' }}>{invCount}</div>
          </div>
        </div>
      </TableCard>
    </div>
  )
}
