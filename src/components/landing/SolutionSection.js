'use client'

import { motion } from 'framer-motion'
import { Bot, CheckCircle2, Gauge, Inbox, Repeat2 } from 'lucide-react'

const pillars = [
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
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.46, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="landing-eyebrow">FlowTech workspace</span>
          <h2>Satu workspace untuk seluruh siklus rental.</h2>
          <p>
            Dari chat pertama sampai barang kembali, Rentivo menjaga setiap proses tetap
            tercatat, terhubung, dan mudah dipantau.
          </p>
          <div className="landing-solution-note">
            <Repeat2 size={16} />
            <span>Flow terhubung, keputusan tetap di tangan tim rental.</span>
          </div>
        </motion.div>

        <motion.div
          className="landing-solution-panel"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
        >
          <div className="landing-solution-flow">
            {pillars.map(({ icon: Icon, label, title, text }, index) => (
              <div className="landing-solution-pillar" key={label}>
                <span className="landing-pillar-index">0{index + 1}</span>
                <div className="landing-pillar-icon">
                  <Icon size={20} />
                </div>
                <b>{label}</b>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
