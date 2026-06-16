'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

type LandingPreloaderProps = {
  onComplete: () => void
}

export default function LandingPreloader({ onComplete }: LandingPreloaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const rootRef = useRef<HTMLElement>(null)
  const hasPlayedRef = useRef(false)
  const completedRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root || hasPlayedRef.current) return

    hasPlayedRef.current = true

    const complete = () => {
      if (completedRef.current) return
      completedRef.current = true
      root.classList.add('is-complete')
      onComplete()
      setIsVisible(false)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const stage = root.querySelector('.landing-preloader__stage')
      const markWrap = root.querySelector('.landing-preloader__mark-wrap')
      const glow = root.querySelector('.landing-preloader__mark-glow')
      const rim = root.querySelector('.landing-preloader__mark-rim')
      const iconGlow = root.querySelector('.landing-preloader__icon-glow')
      const iconCore = root.querySelector('.landing-preloader__icon-core')
      const logo = root.querySelector('.landing-preloader__logo')
      const trace = root.querySelector('.landing-preloader__trace')
      const markShine = root.querySelector('.landing-preloader__mark-shine')
      const logoShine = root.querySelector('.landing-preloader__logo-shine')
      const progress = root.querySelector('.landing-preloader__progress')
      const caption = root.querySelector('.landing-preloader__caption')

      gsap.set(root, { opacity: 0 })
      gsap.set(stage, { opacity: 1, y: 0 })
      gsap.set([glow, rim, iconGlow, iconCore, logo, progress, caption], { opacity: 0 })
      gsap.set(markWrap, { scale: 0.94, y: 12 })
      gsap.set([iconGlow, iconCore], { scale: 0.86, y: 16, clipPath: 'inset(34% 18% 28% 18% round 22px)' })
      gsap.set(logo, { x: 64, scale: 0.98 })
      gsap.set(trace, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
      gsap.set(markShine, { xPercent: -150, opacity: 0 })
      gsap.set(logoShine, { xPercent: -130, opacity: 0 })
      gsap.set(progress, { scaleX: 0, transformOrigin: 'center center' })

      if (reduceMotion) {
        gsap
          .timeline({ onComplete: complete })
          .to(root, { opacity: 1, duration: 0.12, ease: 'power2.out' })
          .to([iconCore, logo, progress, caption], { opacity: 1, y: 0, x: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.2 })
          .to(root, { opacity: 0, duration: 0.25, ease: 'power2.out' }, '+=0.35')
        return
      }

      gsap
        .timeline({ onComplete: complete })
        .to(root, { opacity: 1, duration: 0.28, ease: 'power2.out' })
        .to(glow, { opacity: 1, scale: 1, duration: 0.46, ease: 'power3.out' }, '<0.04')
        .to(rim, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }, '<0.08')
        .to(trace, { opacity: 1, scaleX: 1, duration: 0.72, ease: 'power3.out' }, '<0.1')
        .to(
          [iconGlow, iconCore],
          {
            opacity: 1,
            scale: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            duration: 0.68,
            ease: 'power4.out',
            stagger: 0.035,
          },
          '<0.24'
        )
        .to(markWrap, { scale: 1, y: 0, duration: 0.58, ease: 'power4.out' }, '<')
        .to(markShine, { opacity: 1, xPercent: 145, duration: 0.62, ease: 'power3.inOut' }, '<0.08')
        .to(logo, { opacity: 1, x: 0, scale: 1, duration: 0.72, ease: 'power4.out' }, '<0.3')
        .to(logoShine, { opacity: 1, xPercent: 145, duration: 0.62, ease: 'power3.inOut' }, '<0.1')
        .to(progress, { opacity: 1, scaleX: 1, duration: 0.58, ease: 'power3.out' }, '<0.16')
        .to(caption, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' }, '<0.08')
        .to([stage, glow], { opacity: 0, y: -18, scale: 1.04, duration: 0.56, ease: 'power3.inOut' }, '+=0.34')
        .to(root, { opacity: 0, duration: 0.48, ease: 'power3.inOut' }, '<0.12')
    }, root)

    return () => ctx.revert()
  }, [onComplete])

  if (!isVisible) return null

  return (
    <section ref={rootRef} className="landing-preloader" role="presentation" aria-hidden="true">
      <div className="landing-preloader__bg" />
      <div className="landing-preloader__beam" />
      <div className="landing-preloader__vignette" />
      <div className="landing-preloader__grid" />

      <div className="landing-preloader__stage">
        <div className="landing-preloader__brand">
          <div className="landing-preloader__mark-wrap">
            <div className="landing-preloader__mark-glow" />
            <div className="landing-preloader__mark-rim" />
            <span className="landing-preloader__trace" />
            <div className="landing-preloader__icon-reveal">
              <div className="landing-preloader__icon-glow" aria-hidden="true">
                <Image src="/brand/rentivo-icon.png" alt="" width={188} height={188} priority />
              </div>
              <div className="landing-preloader__icon-core">
                <Image src="/brand/rentivo-icon.png" alt="" width={188} height={188} priority />
              </div>
              <span className="landing-preloader__mark-shine" />
            </div>
          </div>

          <div className="landing-preloader__logo">
            <Image src="/brand/rentivo-logo.png" alt="Rentivo" width={430} height={242} priority />
            <span className="landing-preloader__logo-shine" />
          </div>
        </div>

        <div className="landing-preloader__progress" />
        <p className="landing-preloader__caption">Rental operations, connected.</p>
      </div>
    </section>
  )
}
