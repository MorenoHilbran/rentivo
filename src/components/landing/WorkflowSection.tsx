'use client'

import { motion } from 'framer-motion'

interface StepItem {
  title: string
  category: string
  desc: string
}

const steps: StepItem[] = [
  { title: 'Inquiry', category: 'Copilot', desc: 'Chat masuk dari calon penyewa' },
  { title: 'Availability Check', category: 'Copilot', desc: 'AI/Admin mengecek stok unit' },
  { title: 'Booking', category: 'Operasional', desc: 'Jadwalkan unit & buat draf sewa' },
  { title: 'Invoice', category: 'Operasional', desc: 'Terbitkan invoice pembayaran' },
  { title: 'Payment Verification', category: 'Operasional', desc: 'Verifikasi bukti transfer DP/lunas' },
  { title: 'Delivery / Pickup', category: 'Operasional', desc: 'Handover unit sewa ke customer' },
  { title: 'Return', category: 'Closing', desc: 'Cek kondisi fisik barang kembali' },
  { title: 'Report', category: 'Closing', desc: 'Analisis pendapatan & stok otomatis' },
]

export default function WorkflowSection() {
  return (
    <section id="workflow" className="landing-section landing-workflow-section">
      <div className="landing-section-inner">
        <motion.div
          className="landing-section-heading landing-section-heading-left"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px', amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="landing-eyebrow">Workflow Rental</span>
          <h2>Dari chat pertama sampai transaksi selesai, semua punya <span className="landing-heading-accent">status.</span></h2>
          <p>Rentivo tidak menggantikan admin. Rentivo membantu admin bekerja lebih cepat dengan draft, reminder, dan status yang jelas.</p>
        </motion.div>

        <div className="landing-workflow">
          {steps.map((step, index) => (
            <motion.div
              className="landing-workflow-step"
              key={step.title}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-80px', amount: 0.22 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="landing-workflow-top">
                <span className="landing-workflow-index">{String(index + 1).padStart(2, '0')}</span>
                <small className={`landing-workflow-tag tag-${step.category.toLowerCase()}`}>{step.category}</small>
              </div>
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
