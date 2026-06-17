'use client'

import { motion } from 'framer-motion'
import { Bot, CheckCircle2, Gauge, Inbox, Repeat2, LucideIcon } from 'lucide-react'

interface Pillar {
  icon: LucideIcon
  label: string
  title: string
  text: string
}

const pillars: Pillar[] = [
  {
    icon: Inbox,
    label: 'Capture',
    title: 'Chat masuk ke inbox',
    text: 'Semua percakapan customer masuk ke antrean kerja yang jelas.',
  },
  {
    icon: Bot,
    label: 'Convert',
    title: 'Chat menjadi draft booking',
    text: 'AI menyusun draft, admin meninjau item, tanggal, harga, dan DP.',
  },
  {
    icon: Gauge,
    label: 'Control',
    title: 'Inventory dan payment terkendali',
    text: 'Jadwal, stok, invoice, dan verifikasi pembayaran berada dalam satu konteks.',
  },
  {
    icon: CheckCircle2,
    label: 'Complete',
    title: 'Return tercatat sampai selesai',
    text: 'Kondisi barang, denda, damage fee, dan status completed terdokumentasi.',
  },
]

export default function SolutionSection() {
  return (
    <section id="solusi" className="landing-section landing-solution-section">
      <div className="landing-section-inner landing-solution-grid">
        <motion.div
          className="landing-solution-copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px', amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="landing-eyebrow">FlowTech Workspace</span>
          <h2>Satu workspace untuk seluruh <span className="landing-heading-accent">siklus rental.</span></h2>
          <p>
            Dari chat pertama sampai barang kembali, Rentivo menjaga setiap proses tetap
            tercatat, terhubung, dan mudah dipantau.
          </p>
          <div className="landing-solution-note">
            <Repeat2 size={16} />
            <span>Flow terhubung, keputusan tetap di tangan tim rental.</span>
          </div>
        </motion.div>

        <div className="landing-solution-panel">
          <div className="landing-solution-flow">
            {pillars.map(({ icon: Icon, label, title, text }, index) => (
              <motion.div
                className="landing-solution-pillar"
                key={label}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-80px', amount: 0.22 }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="landing-pillar-index">0{index + 1}</span>
                <div className="landing-pillar-icon">
                  <Icon size={20} />
                </div>
                <b>{label}</b>
                <strong>{title}</strong>
                <p>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
