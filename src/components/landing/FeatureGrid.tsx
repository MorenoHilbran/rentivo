'use client'

import { motion } from 'framer-motion'
import {
  Bot,
  CalendarClock,
  Inbox,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  LucideIcon
} from 'lucide-react'

interface FeatureItem {
  icon: LucideIcon
  title: string
  label: string
  text: string
}

const features: FeatureItem[] = [
  {
    icon: Inbox,
    title: 'Omnichannel Inbox',
    label: 'Capture',
    text: 'Kelola chat customer dari WhatsApp dan channel lain dalam satu inbox terpadu.',
  },
  {
    icon: CalendarClock,
    title: 'Smart Booking Flow',
    label: 'Booking',
    text: 'Ubah chat customer menjadi draf pesanan, atur tanggal sewa, dan siapkan unit secara instan.',
  },
  {
    icon: PackageSearch,
    title: 'Inventory Availability',
    label: 'Stock',
    text: 'Pantau status stok unit secara realtime untuk mencegah risiko double booking.',
  },
  {
    icon: ReceiptText,
    title: 'Invoice & Payment Verification',
    label: 'Finance',
    text: 'Kirim tagihan otomatis dan verifikasi bukti transfer pembayaran dari satu layar.',
  },
  {
    icon: RotateCcw,
    title: 'Return Management',
    label: 'Return',
    text: 'Catat pengembalian barang, cek kelengkapan unit, dan kalkulasi denda keterlambatan.',
  },
  {
    icon: Bot,
    title: 'AI Copilot',
    label: 'AI Assistant',
    text: 'Biarkan AI menyusun draf booking otomatis berdasarkan riwayat chat dengan customer.',
  },
]

export default function FeatureGrid() {
  return (
    <section id="fitur" className="landing-section landing-feature-section">
      <div className="landing-section-inner">
        <motion.div
          className="landing-section-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px', amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="landing-eyebrow">Fitur Utama</span>
          <h2>Modul bisnis rental, disusun dalam satu <span className="landing-heading-accent">sistem.</span></h2>
          <p>Setiap fitur mengikuti alur kerja rental Indonesia: chat, jadwal, barang, invoice, payment proof, dan return.</p>
        </motion.div>

        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, label, text }, index) => (
            <motion.article
              className="landing-feature-card"
              key={title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-80px', amount: 0.22 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="landing-feature-topline">
                <span className="landing-feature-icon">
                  <Icon size={20} />
                </span>
                <small>{label}</small>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
