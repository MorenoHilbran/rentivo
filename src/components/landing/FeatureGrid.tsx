'use client'

import { motion } from 'framer-motion'
import {
  Bot,
  CalendarClock,
  ClipboardX,
  Inbox,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  UsersRound,
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
    text: 'Kelola chat customer dalam satu antrean kerja yang mudah dipantau tim.',
  },
  {
    icon: Bot,
    title: 'AI Draft Booking',
    label: 'Copilot',
    text: 'AI menyusun draft booking dari chat untuk direview admin.',
  },
  {
    icon: CalendarClock,
    title: 'Booking Calendar',
    label: 'Schedule',
    text: 'Lihat jadwal sewa per tanggal agar tim lebih cepat membaca slot kosong.',
  },
  {
    icon: PackageSearch,
    title: 'Inventory Availability',
    label: 'Stock',
    text: 'Cek ketersediaan barang sebelum membuat booking dan invoice.',
  },
  {
    icon: ReceiptText,
    title: 'Invoice & Payment Verification',
    label: 'Finance',
    text: 'Pantau invoice, bukti transfer, dan verifikasi manual.',
  },
  {
    icon: RotateCcw,
    title: 'Return Management',
    label: 'Return',
    text: 'Catat barang kembali, denda, dan kondisi akhir rental.',
  },
  {
    icon: UsersRound,
    title: 'Customer CRM',
    label: 'CRM',
    text: 'Simpan profil pelanggan, riwayat booking, dan konteks chat secara rapi.',
  },
  {
    icon: ClipboardX,
    title: 'Cancellation & Manual Refund Tracking',
    label: 'Control',
    text: 'Dokumentasikan cancel, refund manual, dan tindak lanjut.',
  },
]

export default function FeatureGrid() {
  return (
    <section id="fitur" className="landing-section landing-feature-section">
      <div className="landing-section-inner">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">Fitur utama</span>
          <h2>Modul bisnis rental, disusun dalam satu <span className="landing-heading-accent">sistem.</span></h2>
          <p>Setiap fitur mengikuti alur kerja rental Indonesia: chat, jadwal, barang, invoice, payment proof, dan return.</p>
        </div>

        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, label, text }, index) => (
            <motion.article
              className="landing-feature-card"
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: index * 0.035, ease: [0.23, 1, 0.32, 1] }}
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
