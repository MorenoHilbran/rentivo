'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CalendarX2, ClipboardList, MessageCircleOff, PackageX, RotateCcw } from 'lucide-react'

const problems = [
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
        <div className="landing-section-heading">
          <span className="landing-eyebrow">Operasional tercecer</span>
          <h2>Operasional rental sering kacau bukan karena bisnisnya kecil, tapi karena sistemnya tercecer.</h2>
          <p>Setiap channel punya konteks sendiri. Setiap admin punya catatan sendiri. Saat pesanan ramai, celah kecil berubah jadi double booking, invoice telat, atau return tanpa bukti.</p>
        </div>

        <div className="landing-scattered-board" aria-hidden="true">
          <span className="landing-scatter-card landing-scatter-chat">Chat WA: tanya stok</span>
          <span className="landing-scatter-card landing-scatter-sheet">Sheet booking manual</span>
          <span className="landing-scatter-card landing-scatter-proof">Bukti transfer di galeri</span>
          <span className="landing-scatter-card landing-scatter-return">Return belum dicek</span>
        </div>

        <div className="landing-problem-grid">
          {problems.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              className={`landing-problem-card landing-problem-card-${index % 3}`}
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.42, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
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
