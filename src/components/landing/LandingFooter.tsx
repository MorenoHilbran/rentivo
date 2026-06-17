import Link from 'next/link'
import Image from 'next/image'

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-section-inner landing-footer-grid">
        {/* Brand Column */}
        <div className="landing-footer-brand">
          <Link href="/" className="landing-footer-logo" aria-label="Rentivo">
            <Image 
              src="/brand/rentivo-logo.png" 
              alt="Rentivo"
              width={160}
              height={36}
              priority
            />
          </Link>
          <p className="landing-footer-tagline">
            CRM pintar untuk bisnis rental Indonesia.
          </p>
          <Link href="/register" className="landing-footer-cta">
            Mulai Kelola Rental
          </Link>
        </div>

        {/* Product Column */}
        <div className="landing-footer-column">
          <strong>Product</strong>
          <a href="#fitur">Fitur</a>
          <a href="#workflow">Workflow</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#pricing">Pricing</a>
        </div>

        {/* Company Column */}
        <div className="landing-footer-column">
          <strong>Company</strong>
          <a href="#tentang">Tentang Rentivo</a>
          <a href="#kontak">Kontak</a>
          <a href="#status">Status</a>
        </div>

        {/* Legal Column */}
        <div className="landing-footer-column">
          <strong>Legal</strong>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="landing-footer-bottom">
        <div className="landing-footer-bottom-inner">
          <span>© 2026 Rentivo. All rights reserved.</span>
          <span className="landing-footer-tagline-bottom">
            Built for modern rental operations.
          </span>
        </div>
      </div>
    </footer>
  )
}
