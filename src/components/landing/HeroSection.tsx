'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
      if (!sectionRef.current) return

      const heroVisibilityTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 12%',
        onEnter: () => onHeroEnter?.(),
        onEnterBack: () => onHeroEnter?.(),
        onLeaveBack: () => onHeroLeaveBack?.(),
      })

      return () => {
        heroVisibilityTrigger.kill()
      }
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} className="landing-hero" id="hero">
      {/* CSS-only background layers */}
      <div className="landing-hero-grid-pattern" aria-hidden="true" />
      <div className="landing-hero-light-beam" aria-hidden="true" />
      <div className="landing-hero-aura landing-hero-aura-left" aria-hidden="true" />
      <div className="landing-hero-aura landing-hero-aura-right" aria-hidden="true" />

      <div className="landing-hero-content">
        <div className="landing-hero-logo" aria-label="Rentivo">
          <Image
            src="/brand/rentivo-logo.png"
            alt="Rentivo"
            width={380}
            height={95}
            priority
          />
        </div>

        <h1 className="landing-hero-title">
          <span className="landing-hero-title-line">
            <HeroWords text="Ubah Chat Customer" />
          </span>{' '}
          <span className="landing-hero-title-line">
            <HeroWords text="Jadi" />{' '}
            <span className="hero-gradient-text">
              <HeroWords text="Rental Flow" />
            </span>{' '}
            <HeroWords text="yang" />{' '}
            <span className="hero-accent-word">rapi</span>
          </span>
        </h1>

        <p className="landing-hero-subtitle">
          Rentivo membantu bisnis rental mengubah percakapan customer menjadi alur operasional yang
          tersambung, terukur, dan siap dieksekusi oleh owner, admin, dan tim lapangan.
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
      </div>
    </section>
  )
}
