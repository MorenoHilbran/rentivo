'use client'

import { motion } from 'framer-motion'

const steps: string[] = [
  'Chat Masuk',
  'AI Draft',
  'Booking',
  'Invoice',
  'Verifikasi Pembayaran',
  'Rental Berjalan',
  'Return',
  'Completed',
]

export default function WorkflowSection() {
  return (
    <section id="workflow" className="landing-section landing-workflow-section">
      <div className="landing-section-inner">
        <div className="landing-section-heading landing-section-heading-left">
          <span className="landing-eyebrow">Workflow rental</span>
          <h2>Dari chat pertama sampai transaksi selesai, semua punya <span className="landing-heading-accent">status.</span></h2>
          <p>Rentivo tidak menggantikan admin. Rentivo membantu admin bekerja lebih cepat dengan draft, reminder, dan status yang jelas.</p>
        </div>

        <div className="landing-workflow">
          {steps.map((step, index) => (
            <motion.div
              className="landing-workflow-step"
              key={step}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.36, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <span className="landing-workflow-index">{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              <small>{index < 2 ? 'Copilot' : index < 6 ? 'Operasional' : 'Closing'}</small>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
