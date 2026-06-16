import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-section-inner landing-footer-grid">
        <div>
          <Link href="/" className="landing-logo landing-footer-logo" aria-label="Rentivo">
            <span className="landing-logo-mark">R</span>
            <span className="landing-logo-text">Rentivo</span>
          </Link>
          <p>
            Platform AI-assisted omnichannel CRM dan rental operations untuk bisnis persewaan di Indonesia.
          </p>
        </div>

        <div>
          <strong>Product</strong>
          <a href="#fitur">Fitur</a>
          <a href="#solusi">Solusi</a>
          <a href="#workflow">Workflow</a>
          <a href="#dashboard">Dashboard</a>
        </div>

        <div>
          <strong>Auth</strong>
          <Link href="/login">Masuk</Link>
          <Link href="/register">Daftar workspace</Link>
        </div>
      </div>
      <div className="landing-footer-bottom">
        <span>Copyright 2026 Rentivo. Semua hak dilindungi.</span>
      </div>
    </footer>
  )
}
