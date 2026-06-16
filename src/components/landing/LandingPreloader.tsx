'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import rentivoLogo from '@/app/logo.png'

export default function LandingPreloader({
  onComplete,
}: {
  onComplete: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const logoWrapRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const finish = () => {
      onComplete()
    }

    // Respect reduced motion — brief fade out and exit
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: finish,
      })
      return
    }

    const ctx = gsap.context(() => {
      // ── Initial hidden states ───────────────────────────────
      gsap.set(glowRef.current, { scale: 0.6, opacity: 0 })
      gsap.set(logoRef.current, { opacity: 0, scale: 0.85, y: 24 })
      gsap.set(shineRef.current, { xPercent: -135, rotation: 8 })
      gsap.set(taglineRef.current, { opacity: 0, y: 16 })
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' })

      const tl = gsap.timeline({ onComplete: finish })

      // Phase 1 — Ambient glow expansion
      tl.to(glowRef.current, {
        scale: 1.2,
        opacity: 0.45,
        duration: 1.8,
        ease: 'power2.out',
      })

      // Non-blocking ambient glow breathing loop
      gsap.to(glowRef.current, {
        scale: 1.05,
        opacity: 0.35,
        duration: 4.0,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      })

      // Phase 2 — Logo Reveal
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.4,
        ease: 'power4.out',
      }, '>-1.4') // start as the glow is expanding

      // Phase 3 — Premium shine sweep across the logo
      tl.to(shineRef.current, {
        xPercent: 135,
        duration: 1.8,
        ease: 'power2.inOut',
      }, '>-0.9')

      // Phase 4 — Tagline slide up
      tl.to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '>-1.3')

      // Phase 5 — Progress bar draws
      tl.to(lineRef.current, {
        scaleX: 1,
        duration: 1.8,
        ease: 'power3.inOut',
      }, '>-0.6')

      // Phase 6 — Brief hold for cinematic focus
      tl.to({}, { duration: 0.5 })

      // Phase 7 — Exit: content lifts/dissolves, overlay fades out
      tl.to(
        [logoRef.current, taglineRef.current, lineRef.current],
        {
          opacity: 0,
          y: -24,
          duration: 0.7,
          ease: 'power3.in',
          stagger: 0.08,
        }
      )
      tl.to(
        glowRef.current,
        {
          scale: 1.5,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.in',
        },
        '<'
      )
      tl.to(
        overlay,
        {
          opacity: 0,
          duration: 0.85,
          ease: 'power3.inOut',
        },
        '-=0.45'
      )
    }, overlay)

    return () => ctx.revert()
  }, [onComplete])


  return (
    <div
      ref={overlayRef}
      className="landing-preloader"
      role="presentation"
      aria-hidden="true"
    >
      {/* Background layer */}
      <div className="landing-preloader__bg" />

      {/* Glow / Ambient orb */}
      <div ref={glowRef} className="landing-preloader__glow" />

      {/* Vignette */}
      <div className="landing-preloader__vignette" />

      {/* Retro-cinematic CRT Scanline Grid */}
      <div className="landing-preloader__scanlines" />

      {/* Center content container */}
      <div ref={centerRef} className="landing-preloader__center">
        {/* Logo wrapper */}
        <div ref={logoWrapRef} className="landing-preloader__logo-wrap">
          <div ref={logoRef} className="landing-preloader__logo">
            <Image
              src={rentivoLogo}
              alt="Rentivo"
              priority
              className="landing-preloader__logo-img"
              style={{ height: 'auto' }}
            />
          </div>
          {/* Logo shine sweeping overlay */}
          <div ref={shineRef} className="landing-preloader__shine" />
        </div>

        {/* Tagline */}
        <div ref={taglineRef} className="landing-preloader__tagline">
          Rental operations, <span style={{ color: '#12CBBE' }}>connected.</span>
        </div>

        {/* Progress bar line */}
        <div ref={lineRef} className="landing-preloader__line" />
      </div>
    </div>
  )
}
