import { requireTenantAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { bookings, invoices, inventoryUnits } from '@/lib/db/schema'
import { eq, sql, and, gte } from 'drizzle-orm'

export const metadata = {
  title: 'Dashboard | Rentivo',
}

/* Format angka sebagai Rupiah */
function formatRupiah(value) {
  if (!value || value === 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardPage() {
  const { user, tenantId, role } = await requireTenantAuth()

  // --- Real Queries ---
  // 1. Revenue (Paid Invoices)
  const revenueResult = await db.select({
    totalRevenue: sql`sum(${invoices.paidAmount})`.mapWith(Number),
  }).from(invoices)
  .where(and(eq(invoices.tenantId, tenantId), eq(invoices.status, 'paid')))
  
  const totalRevenue = revenueResult[0]?.totalRevenue || 0

  // 2. Booking Stats (Active vs Completed vs Draft)
  const activeBookings = await db.select({ count: sql`count(*)`.mapWith(Number) })
    .from(bookings)
    .where(and(eq(bookings.tenantId, tenantId), eq(bookings.status, 'active')))
  
  const activeBookingsCount = activeBookings[0]?.count || 0

  // 3. Inventory Stats
  const totalInventory = await db.select({ count: sql`count(*)`.mapWith(Number) })
    .from(inventoryUnits)
    .where(eq(inventoryUnits.tenantId, tenantId))
  
  const availableInventory = await db.select({ count: sql`count(*)`.mapWith(Number) })
    .from(inventoryUnits)
    .where(and(eq(inventoryUnits.tenantId, tenantId), eq(inventoryUnits.status, 'available')))

  const totalInvCount = totalInventory[0]?.count || 0
  const availInvCount = availableInventory[0]?.count || 0
  const utilizedInvCount = totalInvCount - availInvCount
  const utilizationRate = totalInvCount > 0 ? Math.round((utilizedInvCount / totalInvCount) * 100) : 0

  return (
    <div className="flex-1 overflow-y-auto p-lg bg-background">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-background">Dashboard Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Real-time operations and performance metrics.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm rounded px-3 py-1.5 focus:border-primary focus:ring-0">
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
        </div>
      </div>

      {/* Admin View Focus: Actionable Alerts */}
      <section className="mb-xl">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-sm uppercase tracking-wider">Admin Operations Queue</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* Task 1 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col justify-between hover:bg-surface transition-colors cursor-pointer border-l-2 border-l-primary">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">receipt_long</span>
              </div>
              <span className="font-title-sm text-title-sm text-on-background bg-surface-container px-2 py-0.5 rounded">0</span>
            </div>
            <div>
              <h4 className="font-title-sm text-title-sm text-on-background mb-1">Menunggu Verifikasi Pembayaran</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Payments awaiting manual check.</p>
            </div>
          </div>

          {/* Task 2 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col justify-between hover:bg-surface transition-colors cursor-pointer border-l-2 border-l-tertiary">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded bg-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-container">local_shipping</span>
              </div>
              <span className="font-title-sm text-title-sm text-on-background bg-surface-container px-2 py-0.5 rounded">0</span>
            </div>
            <div>
              <h4 className="font-title-sm text-title-sm text-on-background mb-1">Pengembalian Hari Ini</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Scheduled inventory returns.</p>
            </div>
          </div>

          {/* Task 3 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col justify-between hover:bg-surface transition-colors cursor-pointer border-l-2 border-l-error">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-error-container">warning</span>
              </div>
              <span className="font-title-sm text-title-sm text-error bg-error-container/50 px-2 py-0.5 rounded">0</span>
            </div>
            <div>
              <h4 className="font-title-sm text-title-sm text-on-background mb-1">Invoice Jatuh Tempo</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Overdue client invoices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner View Focus: Analytics & Performance */}
      <section>
        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-sm uppercase tracking-wider">Business Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          {/* Revenue Chart (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-title-sm text-title-sm text-on-background">Total Revenue (All Time)</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Gross volume across all time</p>
              </div>
              <div className="font-headline-md text-headline-md text-primary">{formatRupiah(totalRevenue)}</div>
            </div>

            {/* Pure CSS Flat Bar Chart */}
            <div className="flex-1 flex items-end gap-2 h-48 mt-auto border-b border-outline-variant pb-2 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-surface-variant w-full h-0"></div>
                <div className="border-t border-surface-variant w-full h-0"></div>
                <div className="border-t border-surface-variant w-full h-0"></div>
              </div>

              <div className="flex-1 flex flex-col justify-end group z-10">
                <div className="w-full bg-primary/20 chart-bar rounded-t-sm" style={{ height: '40%' }}></div>
                <div className="text-center font-label-caps text-label-caps text-outline mt-2">Jan</div>
              </div>
              <div className="flex-1 flex flex-col justify-end group z-10">
                <div className="w-full bg-primary/40 chart-bar rounded-t-sm" style={{ height: '65%' }}></div>
                <div className="text-center font-label-caps text-label-caps text-outline mt-2">Feb</div>
              </div>
              <div className="flex-1 flex flex-col justify-end group z-10">
                <div className="w-full bg-primary/60 chart-bar rounded-t-sm" style={{ height: '50%' }}></div>
                <div className="text-center font-label-caps text-label-caps text-outline mt-2">Mar</div>
              </div>
              <div className="flex-1 flex flex-col justify-end group z-10">
                <div className="w-full bg-primary/80 chart-bar rounded-t-sm" style={{ height: '85%' }}></div>
                <div className="text-center font-label-caps text-label-caps text-outline mt-2">Apr</div>
              </div>
              <div className="flex-1 flex flex-col justify-end group z-10">
                <div className="w-full bg-primary chart-bar rounded-t-sm" style={{ height: '100%' }}></div>
                <div className="text-center font-label-caps text-label-caps text-on-surface mt-2 font-bold">May</div>
              </div>
            </div>
          </div>

          {/* Right Column Metrics */}
          <div className="flex flex-col gap-md">
            {/* Active Bookings Rate */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-outline">calendar_month</span>
                <h4 className="font-title-sm text-title-sm text-on-background">Active Bookings</h4>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="font-display-lg text-display-lg text-on-background">{activeBookingsCount}</span>
                <span className="font-body-sm text-body-sm text-primary flex items-center pb-1"><span className="material-symbols-outlined text-[16px]">trending_up</span></span>
              </div>
              <div className="w-full h-8 bg-surface-container rounded overflow-hidden flex items-end">
                <div className="h-2 bg-primary w-1/4"></div>
                <div className="h-4 bg-primary w-1/4"></div>
                <div className="h-3 bg-primary w-1/4"></div>
                <div className="h-6 bg-primary w-1/4"></div>
              </div>
              <p className="font-label-caps text-label-caps text-outline mt-3">Bookings currently active</p>
            </div>

            {/* Inventory Utilization */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-outline">category</span>
                <h4 className="font-title-sm text-title-sm text-on-background">Inventory Utilization</h4>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="font-display-lg text-display-lg text-on-background">{utilizationRate}%</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant pb-1">Utilized ({utilizedInvCount}/{totalInvCount})</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mb-2">
                <div className="h-full bg-tertiary" style={{ width: `${utilizationRate}%` }}></div>
              </div>
              <div className="flex justify-between font-label-caps text-label-caps text-outline">
                <span>0%</span>
                <span>Target: 75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
