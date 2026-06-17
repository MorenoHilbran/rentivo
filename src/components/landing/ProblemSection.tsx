'use client'

import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  CalendarX2, 
  ClipboardList, 
  MessageCircleOff, 
  PackageX, 
  RotateCcw,
  LucideIcon
} from 'lucide-react'

interface ProblemItem {
  icon: LucideIcon
  title: string
  text: string
}

const problems: ProblemItem[] = [
  { icon: MessageCircleOff, title: 'Chat customer tercecer', text: 'Pertanyaan masuk dari banyak kanal sulit dilacak saat admin berganti shift.' },
  { icon: ClipboardList, title: 'Booking masih manual', text: 'Catatan tersebar di spreadsheet, chat, dan buku operasional.' },
  { icon: CalendarX2, title: 'Risiko double booking tinggi', text: 'Barang yang sama bisa terjadwal di slot yang bertabrakan.' },
  { icon: PackageX, title: 'Inventory tidak sinkron', text: 'Status tersedia, disewa, rusak, dan hilang sering tidak real-time.' },
  { icon: AlertTriangle, title: 'Pembayaran sulit dipantau', text: 'Invoice, bukti transfer, dan verifikasi manual butuh konteks yang rapi.' },
  { icon: RotateCcw, title: 'Return tidak terdokumentasi', text: 'Denda, kondisi barang, dan kerusakan mudah luput setelah rental selesai.' },
]

export default function ProblemSection() {
  return (
    <section className="landing-section landing-problem-section">
      <div className="landing-section-inner">
        <motion.div
          className="landing-section-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px', amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="landing-eyebrow">Operasional Tercecer</span>
          <h2>Operasional rental sering kacau bukan karena bisnisnya kecil, tapi karena sistemnya <span className="landing-heading-accent">tercecer.</span></h2>
          <p>Setiap channel punya konteks sendiri. Setiap admin punya catatan sendiri. Saat pesanan ramai, celah kecil berubah jadi double booking, invoice telat, atau return tanpa bukti.</p>
        </motion.div>

        <div className="landing-scattered-board" aria-hidden="true">
          <motion.span
            className="landing-scatter-card landing-scatter-chat"
            initial={{ opacity: 0, scale: 0.9, x: -10, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Chat WA: tanya stok
          </motion.span>
          <motion.span
            className="landing-scatter-card landing-scatter-sheet"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Sheet booking manual
          </motion.span>
          <motion.span
            className="landing-scatter-card landing-scatter-proof"
            initial={{ opacity: 0, scale: 0.9, x: 10, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Bukti transfer di galeri
          </motion.span>
          <motion.span
            className="landing-scatter-card landing-scatter-return"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Return belum dicek
          </motion.span>
        </div>

        <div className="landing-problem-grid">
          {problems.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              className={`landing-problem-card landing-problem-card-${index % 3}`}
              key={title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px', amount: 0.22 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Icon size={20} />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
