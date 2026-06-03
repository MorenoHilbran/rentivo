import Link from 'next/link'
import SectionPage from '@/components/SectionPage'
import { requireTenantAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { aiDrafts, bookings, invoices, inventoryUnits } from '@/lib/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import RevenueChart from '@/components/RevenueChart'
import { 
  TrendingUp, 
  Calendar, 
  Layers, 
  AlertCircle, 
  Percent, 
  Edit3, 
  MessageSquare, 
  Sparkles, 
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react'

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

function StatCard({ label, value, hint, tone = 'default', icon: Icon }) {
  const toneConfigs = {
    primary: {
      border: 'border-t-teal-600 border-t-4',
      bg: 'bg-gradient-to-br from-teal-50/40 to-white',
      text: 'text-teal-900',
      iconBg: 'bg-teal-50 text-teal-700',
    },
    tertiary: {
      border: 'border-t-orange-600 border-t-4',
      bg: 'bg-gradient-to-br from-orange-50/35 to-white',
      text: 'text-orange-900',
      iconBg: 'bg-orange-50 text-orange-700',
    },
    error: {
      border: 'border-t-rose-600 border-t-4',
      bg: 'bg-gradient-to-br from-rose-50/40 to-white',
      text: 'text-rose-900',
      iconBg: 'bg-rose-50 text-rose-700',
    },
    default: {
      border: 'border-t-slate-400 border-t-4',
      bg: 'bg-gradient-to-br from-slate-50/40 to-white',
      text: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
    }
  }

  const current = toneConfigs[tone] || toneConfigs.default

  return (
    <div className={`rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${current.border} ${current.bg}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-label-caps text-label-caps text-on-surface-variant font-semibold tracking-wider">{label}</p>
          <div className="mt-2 font-display-lg text-2xl font-bold text-on-background tracking-tight">{value}</div>
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${current.iconBg} transition-transform duration-300 hover:rotate-6`}>
            <Icon className="h-5 w-5 shrink-0" />
          </div>
        )}
      </div>
      <p className="mt-3 font-body-sm text-xs text-on-surface-variant/90 leading-relaxed">{hint}</p>
    </div>
  )
}

function WorkflowCard({ icon: Icon, title, description, meta, accentClass, href }) {
  return (
    <Link 
      href={href} 
      className="group block rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${accentClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-title-sm text-title-sm font-semibold text-on-background group-hover:text-primary transition-colors">{title}</h3>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface-container px-4 py-3 border border-outline-variant/30">
        <span className="font-body-sm text-xs text-on-surface-variant/80">{meta}</span>
        <span className="inline-flex items-center gap-1 font-label-caps text-label-caps font-bold text-primary group-hover:underline">
          Buka <ArrowRight className="h-3 w-3" />
        </span>
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

  return (
    <SectionPage
      title="Dashboard"
      description="Ringkasan operasional yang tetap mendukung input manual, WhatsApp, dan otomatisasi AI. AI membantu menyusun data, tetapi kontrol proses tetap di tangan admin."
      actions={(
        <>
          <select className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none hover:border-outline transition-colors cursor-pointer">
            <option>Semua Waktu</option>
            <option>30 Hari Terakhir</option>
            <option>Kuartal Ini</option>
            <option>Tahun Ini</option>
          </select>
          <Link href="/bookings" className="btn btn-primary gap-1">
            <Plus className="h-4 w-4" /> Booking Manual
          </Link>
        </>
      )}
    >
      <section className="grid gap-md md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Pendapatan" value={formatRupiah(totalRevenue)} hint="Total pembayaran yang sudah lunas." tone="primary" icon={TrendingUp} />
        <StatCard label="Booking Aktif" value={activeBookingsCount} hint="Unit yang sedang disewa pelanggan." tone="default" icon={Calendar} />
        <StatCard label="Draft AI / Manual" value={draftBookingsCount + pendingDraftsCount} hint="Antrian booking yang belum final." tone="tertiary" icon={Layers} />
        <StatCard label="Invoice Belum Lunas" value={unpaidInvoicesCount} hint="Perlu follow-up atau verifikasi pembayaran." tone="error" icon={AlertCircle} />
        <StatCard label="Utilisasi Inventory" value={`${utilizationRate}%`} hint={`Tersedia ${availInvCount} dari ${totalInvCount} unit.`} tone="default" icon={Percent} />
      </section>

      <section className="grid gap-md lg:grid-cols-3">
        <WorkflowCard
          href="/bookings"
          icon={Edit3}
          title="Input Manual"
          description="Booking, pelanggan, inventaris, invoice, dan retur bisa dikelola manual kapan saja."
          meta="Jalur utama operasional tetap ada tanpa AI."
          accentClass="bg-teal-50 text-teal-700"
        />
        <WorkflowCard
          href="/inbox"
          icon={MessageSquare}
          title="WhatsApp Inbox"
          description="Pesan masuk menjadi sumber data awal, lalu dibuat draft untuk ditinjau admin."
          meta="Kanal otomatisasi, bukan satu-satunya sumber data."
          accentClass="bg-sky-50 text-sky-700"
        />
        <WorkflowCard
          href="/settings"
          icon={Sparkles}
          title="AI Assist"
          description="AI membantu ekstraksi intent, item, dan tanggal agar input lebih cepat dan konsisten."
          meta="Admin tetap menyetujui sebelum booking dibuat."
          accentClass="bg-orange-50 text-orange-700"
        />
      </section>

      <section className="grid gap-md lg:grid-cols-[1.6fr_1fr]">
        {/* Left column: Lifecycle & Revenue Chart */}
        <div className="flex flex-col gap-md">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h2 className="font-title-sm text-title-sm font-semibold text-on-background">Siklus Booking</h2>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Alur kerja dirancang agar manual-first, lalu AI mempercepat pemasukan data.
                </p>
              </div>
              <div className="rounded-full bg-surface-container-low border border-outline-variant/50 px-3 py-1 text-xs font-semibold text-on-surface-variant">
                Peran: {roleLabel}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Draft', value: draftBookingsCount, tone: 'bg-orange-50 text-orange-800 border-orange-200/50' },
                { label: 'Aktif', value: activeBookingsCount, tone: 'bg-teal-50 text-teal-800 border-teal-200/50' },
                { label: 'Kembali', value: returningBookingsCount, tone: 'bg-sky-50 text-sky-800 border-sky-200/50' },
                { label: 'Lunas', value: totalRevenue ? 'OK' : '0', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200/50' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-outline-variant bg-surface-container-low/60 p-4 transition-all duration-200 hover:bg-surface-container-low">
                  <div className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.tone}`}>{item.label}</div>
                  <div className="mt-3 font-headline-md text-2xl font-bold text-on-background tracking-tight">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgraded Interactive Revenue Chart */}
          <RevenueChart totalRevenue={totalRevenue} />
        </div>

        {/* Right column: Operational Queue */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h2 className="font-title-sm text-title-sm font-semibold text-on-background mb-4">Antrian Operasional</h2>
          <div className="space-y-4">
            {[
              { label: 'Tinjau Draft AI', value: pendingDraftsCount, note: 'Butuh persetujuan admin sebelum menjadi booking resmi.', icon: Sparkles, color: 'text-orange-600' },
              { label: 'Invoice Belum Lunas', value: unpaidInvoicesCount, note: 'Bisa tetap ditagih secara manual bila diperlukan.', icon: AlertCircle, color: 'text-rose-600' },
              { label: 'Pengembalian Aktif', value: returningBookingsCount, note: 'Membutuhkan check-in dan evaluasi fisik unit.', icon: Calendar, color: 'text-sky-600' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-xl border border-outline-variant bg-surface-container-low/40 p-4 transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-title-sm text-body-md font-semibold text-on-background">{item.label}</div>
                        <div className="mt-1 font-body-sm text-xs text-on-surface-variant leading-relaxed">{item.note}</div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-surface-container px-3 py-1.5 font-mono text-body-md font-bold text-on-background border border-outline-variant/60">
                      {item.value}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </SectionPage>
  )
}
