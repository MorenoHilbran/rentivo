'use client'

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

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="landing-section landing-dashboard-section">
      <div className="landing-section-inner">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">Dashboard owner</span>
          <h2>Dashboard owner yang terasa seperti pusat <span className="landing-heading-accent">kendali.</span></h2>
          <p>Pendapatan, booking aktif, payment review, inventory, and chat terbaru tersaji tanpa membuat tim tenggelam dalam tabel.</p>
        </div>

        <motion.div
          className="landing-preview-shell"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.52, ease: [0.23, 1, 0.32, 1] }}
        >
          <aside className="landing-preview-sidebar">
            <b>Rentivo</b>
            <span>Dashboard</span>
            <span>Inbox</span>
            <span>Booking</span>
            <span>Inventory</span>
            <span>Invoice</span>
          </aside>

          <main className="landing-preview-main">
            <div className="landing-preview-header">
              <div>
                <span>Owner dashboard summary</span>
                <h3>Rental Kamera Nusantara</h3>
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
                {bookings.map(([code, name, amount, status]) => (
                  <div className="landing-preview-row" key={code}>
                    <span>{code}</span>
                    <b>{name}</b>
                    <strong>{amount}</strong>
                    <em>{status}</em>
                  </div>
                ))}
              </section>

              <section className="landing-preview-inventory">
                <div className="landing-preview-card-header">
                  <strong>Inventory tersedia</strong>
                  <PackageCheck size={18} />
                </div>
                <div className="landing-progress-line">
                  <span style={{ width: '76%' }} />
                </div>
                <p>76% unit siap disewa. 14 unit sedang berjalan, 5 unit perlu pengecekan.</p>
              </section>

              <section className="landing-preview-chat">
                <div className="landing-preview-card-header">
                  <strong>Preview chat</strong>
                  <MessageSquareText size={18} />
                </div>
                <p>Kak, Sony A7 III tersedia tanggal 12 Juli?</p>
                <span>Draft AI: cek stok, buat booking, kirim invoice DP.</span>
              </section>
            </div>
          </main>
        </motion.div>
      </div>
    </section>
  )
}
