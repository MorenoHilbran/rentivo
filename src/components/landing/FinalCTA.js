'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="landing-section landing-final-section">
      <motion.div
        className="landing-final-card"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="landing-final-glow" aria-hidden="true" />
        <span className="landing-eyebrow">Mulai sekarang</span>
        <h2>Bangun operasional rental yang lebih rapi bersama Rentivo.</h2>
        <p>
          Mulai dari chat customer, lanjut ke booking, invoice, pembayaran, hingga return,
          semuanya dalam satu sistem.
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
