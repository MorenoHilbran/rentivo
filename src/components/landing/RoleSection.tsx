'use client'

import { motion } from 'framer-motion'
import { BriefcaseBusiness, ShieldCheck, Truck, Headset, LucideIcon } from 'lucide-react'

interface RoleItem {
  icon: LucideIcon
  title: string
  text: string
}

const roles: RoleItem[] = [
  {
    icon: BriefcaseBusiness,
    title: 'Owner',
    text: 'Pantau omset, performa operasional, ketersediaan unit, dan performa tim secara realtime.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin',
    text: 'Verifikasi booking, kelola invoice, status pembayaran, dan rekap denda return.',
  },
  {
    icon: Truck,
    title: 'Tim Lapangan',
    text: 'Atur pengiriman, pickup, serta inspeksi detail kondisi fisik unit pasca-sewa.',
  },
  {
    icon: Headset,
    title: 'Customer Service',
    text: 'Balas chat customer, cek ketersediaan stok, dan siapkan draft booking instan.',
  },
]

export default function RoleSection() {
  return (
    <section className="landing-section landing-role-section">
      <div className="landing-section-inner">
        <motion.div
          className="landing-section-heading landing-section-heading-left"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px', amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="landing-eyebrow">Untuk Tim Rental</span>
          <h2>Setiap role punya ruang kerja yang jelas.</h2>
        </motion.div>

        <div className="landing-role-grid">
          {roles.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              className="landing-role-card"
              key={title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-80px', amount: 0.22 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="landing-role-badge">{title}</span>
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
