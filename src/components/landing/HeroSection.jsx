import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  const pills = ['Omnichannel Inbox', 'Anti Double Booking', 'Payment Verification', 'AI Copilot']

  return (
    <section className="landing-hero">
      <div className="landing-hero-content">
        <span className="landing-hero-badge">FlowTech CRM untuk Bisnis Rental Indonesia</span>

        <h1 className="landing-hero-title">
          Ubah Chat Customer Jadi <span>Booking Rental</span> yang Rapi
        </h1>

        <p className="landing-hero-highlight">
          Dalam satu sistem untuk chat, inventory, invoice, pembayaran, dan return.
        </p>

        <p className="landing-hero-subtitle">
          Rentivo membantu bisnis rental mengelola percakapan customer, mengecek ketersediaan barang,
          membuat invoice, memverifikasi pembayaran, hingga menyelesaikan return dalam alur kerja
          yang terhubung.
        </p>

        <div className="landing-hero-actions">
          <Link href="/register" className="landing-primary-button">
            Mulai Kelola Rental
            <ArrowRight size={17} />
          </Link>
          <Link href="/login" className="landing-secondary-button">
            Masuk ke Dashboard
          </Link>
        </div>

        <div className="landing-hero-pills" aria-label="Fitur ringkas">
          {pills.map((pill) => (
            <span className="landing-hero-pill" key={pill}>
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
