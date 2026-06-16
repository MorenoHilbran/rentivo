'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const pills = ['Omnichannel Inbox', 'Anti Double Booking', 'Payment Verification', 'AI Copilot']

function HeroWords({ text }: { text: string }) {
  const words = text.split(' ')

  return (
    <>
      {words.map((word, index) => (
        <span className="hero-word" key={`${word}-${index}`}>
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </>
  )
}

export default function HeroSection({
  onHeroEnter,
  onHeroLeaveBack,
}: {
  onHeroEnter?: () => void
  onHeroLeaveBack?: () => void
} = {}) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        // Set initial states for desktop entrance reveal
        gsap.set(
          [
            sectionRef.current?.querySelector('.landing-hero-badge'),
            sectionRef.current?.querySelector('.landing-hero-highlight'),
            sectionRef.current?.querySelector('.landing-hero-subtitle'),
            sectionRef.current?.querySelector('.landing-hero-actions'),
          ],
          { opacity: 0, y: 30 }
        )
        gsap.set(sectionRef.current?.querySelectorAll('.hero-word'), { opacity: 0, y: 20 })
        gsap.set(sectionRef.current?.querySelectorAll('.landing-hero-pill'), { opacity: 0, y: 15, scale: 0.98 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 76%',
            toggleActions: 'play none none none',
            onEnter: () => onHeroEnter?.(),
            onEnterBack: () => onHeroEnter?.(),
            onLeaveBack: () => onHeroLeaveBack?.(),
          },
        })

        const badge = sectionRef.current?.querySelector('.landing-hero-badge')
        const titleWords = sectionRef.current?.querySelectorAll('.hero-word')
        const highlight = sectionRef.current?.querySelector('.landing-hero-highlight')
        const subtitle = sectionRef.current?.querySelector('.landing-hero-subtitle')
        const actions = sectionRef.current?.querySelector('.landing-hero-actions')
        const pillsElements = sectionRef.current?.querySelectorAll('.landing-hero-pill')

        // Reveal timeline in order
        tl.to(badge, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
          .to(titleWords, { opacity: 1, y: 0, stagger: 0.04, duration: 0.6, ease: 'power3.out' }, '<0.1')
          .to(highlight, { opacity: 0.92, y: 0, duration: 0.6, ease: 'power3.out' }, '<0.15')
          .to(subtitle, { opacity: 0.72, y: 0, duration: 0.6, ease: 'power3.out' }, '<0.1')
          .to(actions, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '<0.1')
          .to(pillsElements, { opacity: 1, y: 0, scale: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' }, '<0.15')
      })
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} className="landing-hero" id="hero">
      {/* CSS-only background layers */}
      <div className="landing-hero-grid-pattern" aria-hidden="true" />
      <div className="landing-hero-light-beam" aria-hidden="true" />

      <div className="landing-hero-content">
        <span className="landing-hero-badge">
          <Sparkles size={13} className="hero-badge-sparkle" />
          FlowTech CRM untuk Bisnis Rental Indonesia
        </span>

        <h1 className="landing-hero-title">
          <HeroWords text="Ubah Chat Customer Jadi" />{' '}
          <span className="hero-gradient-text">
            <HeroWords text="Booking Rental" />
          </span>{' '}
          <HeroWords text="yang Rapi" />
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
          <Link href="/login" className="landing-secondary-button hero-btn-secondary">
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
