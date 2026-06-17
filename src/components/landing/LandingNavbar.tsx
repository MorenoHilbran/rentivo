'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import gsap from 'gsap'

interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#solusi', label: 'Solusi' },
  { href: '#dashboard', label: 'Dashboard' },
]

function LandingLogo() {
  return (
    <Link href="/" className="landing-logo" aria-label="Rentivo">
      <Image 
        src="/brand/rentivo-logo.png" 
        alt="Rentivo"
        width={140}
        height={32}
        className="landing-logo-full"
        priority
      />
      <Image 
        src="/brand/rentivo-icon.png" 
        alt="Rentivo"
        width={36}
        height={36}
        className="landing-logo-compact"
        priority
      />
    </Link>
  )
}

export default function LandingNavbar({ visible }: { visible: boolean }) {
  const headerRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.killTweensOf(header)

    if (!visible) {
      const closeMenuTimer = window.setTimeout(() => setOpen(false), 0)
      gsap.set(header, { opacity: 0, y: -24, pointerEvents: 'none' })
      return () => window.clearTimeout(closeMenuTimer)
    }

    gsap.to(header, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: prefersReducedMotion ? 0 : 0.65,
      ease: 'power3.out',
    })
  }, [visible])

  return (
    <header
      ref={headerRef}
      className={`landing-navbar${scrolled ? ' landing-navbar-scrolled' : ''}${
        visible ? ' landing-navbar-visible' : ''
      }`}
    >
      <div className="landing-navbar-inner">
        <LandingLogo />

        <nav className="landing-nav-links" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          <Link href="/login" className="landing-link-button">
            Masuk
          </Link>
          <Link href="/register" className="landing-primary-button landing-primary-button-sm">
            Daftarkan Bisnis
          </Link>
        </div>

        <button
          type="button"
          className="landing-menu-button"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {visible && open && (
          <motion.div
            className="landing-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="landing-mobile-actions">
              <Link href="/login" onClick={() => setOpen(false)}>
                Masuk
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                Daftarkan Bisnis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
