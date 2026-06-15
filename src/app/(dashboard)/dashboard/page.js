import Link from 'next/link'
import SectionPage from '@/components/SectionPage'
import { requireTenantAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { aiDrafts, bookings, invoices, inventoryUnits } from '@/lib/db/schema'
import { eq, sql, and, gte } from 'drizzle-orm'
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
  ArrowRight,
  ChevronDown
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
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
      accent: 'var(--color-primary)',
      iconBg: 'rgba(0,92,85,0.08)',
      iconColor: 'var(--color-primary)',
    },
    success: {
      accent: '#059669',
      iconBg: 'rgba(5,150,105,0.08)',
      iconColor: '#059669',
    },
    tertiary: {
      accent: '#f97316',
      iconBg: 'rgba(249,115,22,0.08)',
      iconColor: '#9a3412',
    },
    error: {
      accent: 'var(--color-error)',
      iconBg: 'var(--color-error-container)',
      iconColor: 'var(--color-error)',
    },
    info: {
      accent: '#0284c7',
      iconBg: 'rgba(2,132,199,0.08)',
      iconColor: '#0c4a6e',
    },
    default: {
      accent: 'var(--color-outline)',
      iconBg: 'var(--color-surface-container)',
      iconColor: 'var(--color-on-surface-variant)',
    }
  }

  const current = toneConfigs[tone] || toneConfigs.default

  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid var(--color-outline-variant)',
      borderLeft: `4px solid ${current.accent}`,
      background: 'var(--color-surface-container-lowest)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 12,
      transition: 'box-shadow 200ms ease, transform 200ms ease',
    }}
    className="hover:shadow-md hover:-translate-y-0.5"
    >
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>
            {label}
          </div>
          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: 'var(--color-on-surface)', trackingLetter: '-0.02em' }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: current.iconBg,
            color: current.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--color-on-surface-variant)', opacity: 0.75, lineHeight: 1.5 }}>
        {hint}
      </div>
    </div>
  )
}

function WorkflowCard({ icon: Icon, title, description, meta, accent, href }) {
  const colorConfigs = {
    teal: {
      accent: 'var(--color-primary)',
      bg: 'rgba(0,92,85,0.08)',
      color: 'var(--color-primary)',
    },
    sky: {
      accent: '#0284c7',
      bg: 'rgba(2,132,199,0.08)',
      color: '#0c4a6e',
    },
    orange: {
      accent: '#f97316',
      bg: 'rgba(249,115,22,0.08)',
      color: '#9a3412',
    }
  }

  const current = colorConfigs[accent] || colorConfigs.teal

  return (
    <Link 
      href={href} 
      style={{
        borderRadius: 16,
        border: '1px solid var(--color-outline-variant)',
        background: 'var(--color-surface-container-lowest)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 20,
        transition: 'all 200ms ease',
      }}
      className="group hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: current.bg,
          color: current.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid rgba(0,0,0,0.02)',
        }}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 750, color: 'var(--color-on-surface)' }} className="group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
            {description}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-surface-container-low)',
        borderRadius: 10,
        padding: '10px 14px',
        border: '1px solid var(--color-outline-variant)/40',
      }}>
        <span style={{ fontSize: 11.5, color: 'var(--color-on-surface-variant)' }}>{meta}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-primary)' }}>
          Buka <ArrowRight size={12} strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const { tenantId, role } = await requireTenantAuth(['owner', 'admin'])

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [revenueResult, activeBookingsCount, draftBookingsCount, returningBookingsCount, unpaidInvoicesCount, pendingDraftsCount, totalInvCount, availInvCount, sixMonthsInvoices] = await Promise.all([
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
    db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.status, 'paid'),
        gte(invoices.createdAt, sixMonthsAgo)
      )
    })
  ])

  const totalRevenue = revenueResult[0]?.totalRevenue || 0
  const utilizedInvCount = totalInvCount - availInvCount
  const utilizationRate = totalInvCount > 0 ? Math.round((utilizedInvCount / totalInvCount) * 100) : 0

  // Populate actual monthly data
  const monthsData = []
  const currentDate = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'short' })
    const monthYearKey = `${d.getFullYear()}-${d.getMonth()}`
    monthsData.push({
      month: monthLabel,
      monthYearKey,
      value: 0
    })
  }

  sixMonthsInvoices.forEach(inv => {
    const invDate = new Date(inv.createdAt)
    const key = `${invDate.getFullYear()}-${invDate.getMonth()}`
    const monthObj = monthsData.find(m => m.monthYearKey === key)
    if (monthObj) {
      monthObj.value += Number(inv.paidAmount ?? 0)
    }
  })

  const monthlyData = monthsData.map(m => ({
    month: m.month,
    value: m.value
  }))
  const roleLabel = role === 'owner' ? 'Pemilik' : role === 'admin' ? 'Admin' : 'Staff'

  return (
    <SectionPage
      title="Dashboard"
      description="Ringkasan operasional yang tetap mendukung input manual, WhatsApp, dan otomatisasi AI. AI membantu menyusun data, tetapi kontrol proses tetap di tangan admin."
      actions={(
        <>
          <div className="relative inline-block">
            <select className="rounded-xl border border-outline bg-surface-container-lowest pl-4 pr-9 py-1.5 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none hover:border-primary transition duration-200 cursor-pointer appearance-none h-[36px] shadow-sm font-medium">
              <option>Semua Waktu</option>
              <option>30 Hari Terakhir</option>
              <option>Kuartal Ini</option>
              <option>Tahun Ini</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown size={14} className="text-on-surface-variant/70" />
            </div>
          </div>
          <Link href="/bookings" className="btn btn-primary gap-1">
            <Plus className="h-4 w-4" /> Booking Manual
          </Link>
        </>
      )}
    >
      <section className="grid gap-lg md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Pendapatan" value={formatRupiah(totalRevenue)} hint="Total pembayaran yang sudah lunas." tone="primary" icon={TrendingUp} />
        <StatCard label="Booking Aktif" value={activeBookingsCount} hint="Unit yang sedang disewa pelanggan." tone="success" icon={Calendar} />
        <StatCard label="Draft AI / Manual" value={draftBookingsCount + pendingDraftsCount} hint="Antrian booking yang belum final." tone="tertiary" icon={Layers} />
        <StatCard label="Invoice Belum Lunas" value={unpaidInvoicesCount} hint="Perlu follow-up atau verifikasi pembayaran." tone="error" icon={AlertCircle} />
        <StatCard label="Utilisasi Inventory" value={`${utilizationRate}%`} hint={`Tersedia ${availInvCount} dari ${totalInvCount} unit.`} tone="info" icon={Percent} />
      </section>

      <section className="grid gap-lg lg:grid-cols-3">
        <WorkflowCard
          href="/bookings"
          icon={Edit3}
          title="Input Manual"
          description="Booking, pelanggan, inventaris, invoice, dan retur bisa dikelola manual kapan saja."
          meta="Jalur utama operasional tetap ada tanpa AI."
          accent="teal"
        />
        <WorkflowCard
          href="/inbox"
          icon={MessageSquare}
          title="WhatsApp Inbox"
          description="Pesan masuk menjadi sumber data awal, lalu dibuat draft untuk ditinjau admin."
          meta="Kanal otomatisasi, bukan satu-satunya sumber data."
          accent="sky"
        />
        <WorkflowCard
          href="/settings"
          icon={Sparkles}
          title="AI Assist"
          description="AI membantu ekstraksi intent, item, dan tanggal agar input lebih cepat dan konsisten."
          meta="Admin tetap menyetujui sebelum booking dibuat."
          accent="orange"
        />
      </section>

      <section className="grid gap-lg lg:grid-cols-[1.6fr_1fr]">
        {/* Left column: Lifecycle & Revenue Chart */}
        <div className="flex flex-col gap-lg">
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
                { label: 'Draft', value: draftBookingsCount, accent: '#f97316', bg: 'rgba(249,115,22,0.08)', text: '#9a3412' },
                { label: 'Aktif', value: activeBookingsCount, accent: '#0284c7', bg: 'rgba(2,132,199,0.08)', text: '#0c4a6e' },
                { label: 'Kembali', value: returningBookingsCount, accent: '#d97706', bg: 'rgba(217,119,6,0.08)', text: '#92400e' },
                { label: 'Lunas', value: totalRevenue ? 'OK' : '0', accent: '#059669', bg: 'rgba(5,150,105,0.08)', text: '#064e3b' },
              ].map((item) => (
                <div key={item.label} style={{
                  borderRadius: 14,
                  border: '1px solid var(--color-outline-variant)',
                  borderLeft: `4.5px solid ${item.accent}`,
                  background: 'var(--color-surface-container-lowest)',
                  padding: '16px 18px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: item.bg,
                    color: item.text,
                  }}>
                    {item.label}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 20, fontWeight: 700, color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgraded Interactive Revenue Chart */}
          <RevenueChart totalRevenue={totalRevenue} monthlyData={monthlyData} />
        </div>

        {/* Right column: Operational Queue */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h2 className="font-title-sm text-title-sm font-semibold text-on-background mb-4">Antrian Operasional</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Tinjau Draft AI', value: pendingDraftsCount, note: 'Butuh persetujuan admin sebelum menjadi booking resmi.', icon: Sparkles, accent: '#f97316', bg: 'rgba(249,115,22,0.08)', text: '#9a3412' },
              { label: 'Invoice Belum Lunas', value: unpaidInvoicesCount, note: 'Bisa tetap ditagih secara manual bila diperlukan.', icon: AlertCircle, accent: 'var(--color-error)', bg: 'var(--color-error-container)', text: 'var(--color-error)' },
              { label: 'Pengembalian Aktif', value: returningBookingsCount, note: 'Membutuhkan check-in dan evaluasi fisik unit.', icon: Calendar, accent: '#0284c7', bg: 'rgba(2,132,199,0.08)', text: '#0c4a6e' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} style={{
                  borderRadius: 14,
                  border: '1px solid var(--color-outline-variant)',
                  borderLeft: `4.5px solid ${item.accent}`,
                  background: 'var(--color-surface-container-lowest)',
                  padding: 16,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: item.bg,
                      color: item.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--color-on-surface-variant)', opacity: 0.7, marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.note}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    borderRadius: 8,
                    background: 'var(--color-surface-container-low)',
                    padding: '4px 10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                    flexShrink: 0,
                  }}>
                    {item.value}
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
