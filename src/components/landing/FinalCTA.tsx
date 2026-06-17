'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="landing-section landing-final-section">
      <motion.div
        className="landing-final-card"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px', amount: 0.24 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="landing-final-glow" aria-hidden="true" />
        <span className="landing-eyebrow">Mulai Sekarang</span>
        <h2>Siapkan bisnis rental kamu untuk alur kerja yang lebih rapi.</h2>
        <p>
          Mulai kelola chat, booking, invoice, dan return dalam satu command center.
        </p>
        <div className="landing-final-actions">
          <Link href="/register" className="landing-primary-button">
            Daftarkan Bisnis
            <ArrowRight size={17} />
          </Link>
          <Link href="/login" className="landing-secondary-button landing-secondary-button-light">
            Masuk
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
