import Link from 'next/link'
import SectionPage from '@/components/SectionPage'
import { requireTenantAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { aiDrafts, bookings, invoices, inventoryUnits } from '@/lib/db/schema'
import { eq, sql, and } from 'drizzle-orm'

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

async function countRows(table, tenantId, condition) {
  const query = db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(table)
    .where(condition ? and(eq(table.tenantId, tenantId), condition) : eq(table.tenantId, tenantId))

  const result = await query
  return result[0]?.count || 0
}

function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClass =
    tone === 'primary'
      ? 'border-l-primary bg-primary-fixed/35'
      : tone === 'tertiary'
        ? 'border-l-tertiary bg-tertiary-container/20'
        : tone === 'error'
          ? 'border-l-error bg-error-container/35'
          : 'border-l-secondary bg-surface-container-low'

  return (
    <div className={`rounded-2xl border border-outline-variant border-l-4 p-lg shadow-[var(--shadow-sm)] ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant">{label}</p>
          <div className="mt-2 font-display-lg text-display-lg text-on-background">{value}</div>
        </div>
        <div className="rounded-full bg-surface-container-lowest px-3 py-1 font-label-caps text-label-caps text-on-surface-variant">
          Live
        </div>
      </div>
      <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
    </div>
  )
}

function WorkflowCard({ icon, title, description, meta, accentClass, href }) {
  return (
    <Link href={href} className="group block rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass}`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-title-sm text-title-sm text-on-background">{title}</h3>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface-container px-4 py-3">
        <span className="font-body-sm text-body-sm text-on-surface-variant">{meta}</span>
        <span className="font-label-caps text-label-caps text-primary group-hover:underline">Buka</span>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const { tenantId, role } = await requireTenantAuth()

  const [revenueResult, activeBookingsCount, draftBookingsCount, returningBookingsCount, unpaidInvoicesCount, pendingDraftsCount, totalInvCount, availInvCount] = await Promise.all([
    db.select({
      totalRevenue: sql`sum(${invoices.paidAmount})`.mapWith(Number),
    }).from(invoices).where(and(eq(invoices.tenantId, tenantId), eq(invoices.status, 'paid'))),
    countRows(bookings, tenantId, eq(bookings.status, 'active')),
    countRows(bookings, tenantId, eq(bookings.status, 'draft')),
    countRows(bookings, tenantId, eq(bookings.status, 'returning')),
    countRows(invoices, tenantId, eq(invoices.status, 'unpaid')),
    countRows(aiDrafts, tenantId, eq(aiDrafts.status, 'pending')),
    countRows(inventoryUnits, tenantId),
    countRows(inventoryUnits, tenantId, eq(inventoryUnits.status, 'available')),
  ])

  const totalRevenue = revenueResult[0]?.totalRevenue || 0
  const utilizedInvCount = totalInvCount - availInvCount
  const utilizationRate = totalInvCount > 0 ? Math.round((utilizedInvCount / totalInvCount) * 100) : 0
  const roleLabel = role === 'owner' ? 'Pemilik' : role === 'admin' ? 'Admin' : 'Staff'

  const monthBars = [32, 54, 47, 78, 100, 68]

  return (
    <SectionPage
      title="Dashboard"
      description="Ringkasan operasional yang tetap mendukung input manual, WhatsApp, dan otomatisasi AI. AI membantu menyusun data, tetapi kontrol proses tetap di tangan admin."
      actions={(
        <>
          <select className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <Link href="/bookings" className="btn btn-primary">
            Booking Manual
          </Link>
        </>
      )}
    >
      <section className="grid gap-md md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Pendapatan" value={formatRupiah(totalRevenue)} hint="Total pembayaran yang sudah lunas." tone="primary" />
        <StatCard label="Booking Aktif" value={activeBookingsCount} hint="Unit yang sedang disewa pelanggan." />
        <StatCard label="Draft AI / Manual" value={draftBookingsCount + pendingDraftsCount} hint="Antrian booking yang belum final." tone="tertiary" />
        <StatCard label="Invoice Belum Lunas" value={unpaidInvoicesCount} hint="Perlu follow-up atau verifikasi pembayaran." tone="error" />
        <StatCard label="Utilisasi Inventory" value={`${utilizationRate}%`} hint={`Tersedia ${availInvCount} dari ${totalInvCount} unit.`} />
      </section>

      <section className="grid gap-md lg:grid-cols-3">
        <WorkflowCard
          href="/bookings"
          icon="edit_calendar"
          title="Input Manual"
          description="Booking, pelanggan, inventaris, invoice, dan retur bisa dikelola manual kapan saja."
          meta="Jalur utama operasional tetap ada tanpa AI."
          accentClass="bg-primary-fixed text-primary"
        />
        <WorkflowCard
          href="/inbox"
          icon="sms"
          title="WhatsApp Inbox"
          description="Pesan masuk menjadi sumber data awal, lalu dibuat draft untuk ditinjau admin."
          meta="Kanal otomatisasi, bukan satu-satunya sumber data."
          accentClass="bg-secondary-container text-on-surface"
        />
        <WorkflowCard
          href="/settings"
          icon="smart_toy"
          title="AI Assist"
          description="AI membantu ekstraksi intent, item, dan tanggal agar input lebih cepat dan konsisten."
          meta="Admin tetap menyetujui sebelum booking dibuat."
          accentClass="bg-tertiary-container text-on-tertiary"
        />
      </section>

      <section className="grid gap-md lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="font-title-sm text-title-sm text-on-background">Booking lifecycle</h2>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Alur kerja dibuat agar tetap bisa manual, lalu AI hanya mempercepat tahap intake.</p>
            </div>
            <div className="rounded-full bg-surface-container px-3 py-1 font-label-caps text-label-caps text-on-surface-variant">
              {roleLabel}
            </div>
          </div>

          <div className="mt-lg grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Draft', value: draftBookingsCount, tone: 'bg-primary-fixed text-primary' },
              { label: 'Active', value: activeBookingsCount, tone: 'bg-secondary-container text-on-surface' },
              { label: 'Returning', value: returningBookingsCount, tone: 'bg-tertiary-container text-on-tertiary' },
              { label: 'Paid invoices', value: totalRevenue ? 'OK' : '0', tone: 'bg-surface-container text-on-surface' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-outline-variant bg-surface-container-low p-md">
                <div className={`inline-flex rounded-full px-3 py-1 font-label-caps text-label-caps ${item.tone}`}>{item.label}</div>
                <div className="mt-3 font-headline-md text-headline-md text-on-background">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--shadow-sm)]">
          <h2 className="font-title-sm text-title-sm text-on-background">Queue operasional</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Review draft AI', value: pendingDraftsCount, note: 'Butuh persetujuan admin sebelum jadi booking.' },
              { label: 'Invoice belum lunas', value: unpaidInvoicesCount, note: 'Bisa tetap ditagih manual jika diperlukan.' },
              { label: 'Pengembalian aktif', value: returningBookingsCount, note: 'Perlu check-in dan evaluasi kondisi barang.' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-outline-variant bg-surface-container p-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-title-sm text-title-sm text-on-background">{item.label}</div>
                    <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{item.note}</div>
                  </div>
                  <div className="rounded-full bg-surface-container-lowest px-3 py-1 font-display-lg text-title-sm text-on-background">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-lg rounded-2xl border border-outline-variant bg-surface-container-low p-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">Revenue trend</p>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Ilustrasi cepat untuk membaca performa bulanan.</p>
              </div>
              <div className="font-headline-md text-headline-md text-primary">{formatRupiah(totalRevenue)}</div>
            </div>
            <div className="mt-4 flex h-36 items-end gap-2">
              {monthBars.map((height, index) => (
                <div key={String(height) + index} className="flex-1">
                  <div className="mx-auto w-full max-w-12 rounded-t-2xl bg-primary/70" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SectionPage>
  )
}
