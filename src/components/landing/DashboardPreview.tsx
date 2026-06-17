'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, MessageSquareText, PackageCheck, ReceiptText, RotateCcw, TrendingUp, LucideIcon } from 'lucide-react'

interface StatItem {
  label: string
  value: string
  icon: LucideIcon
  tone: string
}

type BookingItem = [string, string, string, string]

const stats: StatItem[] = [
  { label: 'Revenue bulan ini', value: 'Rp 84,7 jt', icon: TrendingUp, tone: 'blue' },
  { label: 'Rental aktif', value: '36', icon: CalendarDays, tone: 'cyan' },
  { label: 'Pending payment', value: '12', icon: ReceiptText, tone: 'sky' },
  { label: 'Return hari ini', value: '8', icon: RotateCcw, tone: 'navy' },
]

const bookings: BookingItem[] = [
  ['BR-1048', 'Bali Camera Rental', 'Rp 1.850.000', 'Review bayar'],
  ['BR-1049', 'Event Sound System', 'Rp 4.200.000', 'Rental aktif'],
  ['BR-1050', 'Outdoor Gear', 'Rp 950.000', 'Return hari ini'],
]

const previewTabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    kicker: 'Owner dashboard summary',
    title: 'Rental Kamera Nusantara',
    inventory: '76% unit siap disewa. 14 unit sedang berjalan, 5 unit perlu pengecekan.',
    chat: 'Draft AI: cek stok, buat booking, kirim invoice DP.',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    kicker: 'Live customer queue',
    title: '12 chat butuh follow-up',
    inventory: 'Customer request otomatis ditautkan ke stok, jadwal, dan histori booking.',
    chat: 'Draft AI: balas stok tersedia, tawarkan paket, minta tanggal sewa.',
  },
  {
    id: 'booking',
    label: 'Booking',
    kicker: 'Booking control panel',
    title: '36 rental aktif terpantau',
    inventory: 'Setiap booking punya status, jadwal pickup, invoice, dan return checkpoint.',
    chat: 'Draft AI: ubah percakapan menjadi draft booking siap review admin.',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    kicker: 'Inventory availability',
    title: 'Stok aman sebelum deal',
    inventory: 'Unit tersedia, disewa, maintenance, dan rusak dibaca dalam satu tampilan.',
    chat: 'Draft AI: rekomendasikan unit pengganti saat stok utama tidak tersedia.',
  },
  {
    id: 'invoice',
    label: 'Invoice',
    kicker: 'Payment verification',
    title: '12 pembayaran menunggu review',
    inventory: 'Invoice, bukti transfer, DP, pelunasan, dan refund manual tetap satu konteks.',
    chat: 'Draft AI: ingatkan customer untuk upload bukti transfer sebelum deadline.',
  },
]

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState(previewTabs[0])

  return (
    <section id="dashboard" className="landing-section landing-dashboard-section">
      <div className="landing-section-inner">
        <motion.div
          className="landing-section-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px', amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="landing-eyebrow">Dashboard Owner</span>
          <h2>Dashboard owner yang terasa seperti pusat <span className="landing-heading-accent">kendali.</span></h2>
          <p>Pendapatan, booking aktif, payment review, inventory, and chat terbaru tersaji tanpa membuat tim tenggelam dalam tabel.</p>
        </motion.div>

        <motion.div
          className="landing-preview-shell"
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px', amount: 0.22 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <aside className="landing-preview-sidebar">
            <b>Rentivo</b>
            {previewTabs.map((tab) => (
              <button
                className={`landing-preview-sidebar-button${activeTab.id === tab.id ? ' is-active' : ''}`}
                key={tab.id}
                type="button"
                aria-pressed={activeTab.id === tab.id}
                onClick={() => setActiveTab(tab)}
              >
                {tab.label}
              </button>
            ))}
          </aside>

          <main className="landing-preview-main">
            <div className="landing-preview-header">
              <div>
                <span>{activeTab.kicker}</span>
                <h3>{activeTab.title}</h3>
              </div>
              <button type="button">Unduh laporan</button>
            </div>

            <div className="landing-preview-stats">
              {stats.map(({ label, value, icon: Icon, tone }) => (
                <div className={`landing-preview-stat landing-stat-${tone}`} key={label}>
                  <Icon size={18} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="landing-preview-grid">
              <section className="landing-preview-table">
                <div className="landing-preview-card-header">
                  <strong>Booking terbaru</strong>
                  <span>Hari ini</span>
                </div>
                {bookings.map(([code, name, amount, status]) => {
                  let statusClass = 'status-info'
                  if (status === 'Review bayar') statusClass = 'status-warning'
                  if (status === 'Rental aktif') statusClass = 'status-success'
                  return (
                    <div className="landing-preview-row" key={code}>
                      <span className="code-font">{code}</span>
                      <b>{name}</b>
                      <strong>{amount}</strong>
                      <span className={`status-badge ${statusClass}`}>{status}</span>
                    </div>
                  )
                })}
              </section>

              <section className="landing-preview-inventory">
                <div className="landing-preview-card-header">
                  <strong>Inventory tersedia</strong>
                  <PackageCheck size={18} />
                </div>
                <div className="landing-progress-line">
                  <span style={{ width: '76%' }} />
                </div>
                <p>{activeTab.inventory}</p>
              </section>

              <section className="landing-preview-chat">
                <div className="landing-preview-card-header">
                  <strong>Preview chat</strong>
                  <MessageSquareText size={18} />
                </div>
                <p>Kak, Sony A7 III tersedia tanggal 12 Juli?</p>
                <span>{activeTab.chat}</span>
              </section>
            </div>
          </main>
        </motion.div>
      </div>
    </section>
  )
}
