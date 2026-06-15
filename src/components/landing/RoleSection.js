'use client'

import { motion } from 'framer-motion'
import { BriefcaseBusiness, Headset, Truck } from 'lucide-react'

const roles = [
  {
    icon: BriefcaseBusiness,
    title: 'Owner',
    text: 'Pantau pendapatan, booking aktif, inventory, customer, dan performa operasional.',
  },
  {
    icon: Headset,
    title: 'Admin',
    text: 'Kelola chat, booking, invoice, verifikasi pembayaran, dan request cancel.',
  },
  {
    icon: Truck,
    title: 'Staff',
    text: 'Tangani pengiriman, pengambilan, return, dan pengecekan kondisi barang.',
  },
]

export default function RoleSection() {
  return (
    <section className="landing-section landing-role-section">
      <div className="landing-section-inner">
        <div className="landing-section-heading landing-section-heading-left">
          <span className="landing-eyebrow">Untuk tim rental</span>
          <h2>Setiap role punya ruang kerja yang jelas.</h2>
        </div>

        <div className="landing-role-grid">
          {roles.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              className="landing-role-card"
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
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
