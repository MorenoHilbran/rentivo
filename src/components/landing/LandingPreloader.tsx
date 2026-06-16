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

    const notifyComplete = () => {
      if (completedRef.current) return
      completedRef.current = true
      root.classList.add('is-complete')
      onComplete()
    }

    const hideOverlay = () => {
      setIsVisible(false)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const stage = root.querySelector('.landing-preloader__stage')
      const bg = root.querySelector('.landing-preloader__bg')
      const aurora = root.querySelector('.landing-preloader__aurora')
      const beam = root.querySelector('.landing-preloader__beam')
      const grid = root.querySelector('.landing-preloader__grid')
      const spotlight = root.querySelector('.landing-preloader__spotlight')
      const noise = root.querySelector('.landing-preloader__noise')
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
      gsap.set([bg, aurora, beam, grid, spotlight, noise], { opacity: 0 })
      gsap.set(stage, { opacity: 1, y: 0, scale: 1 })
      gsap.set([glow, rim, iconGlow, iconCore, logo, progress, caption], { opacity: 0 })
      gsap.set(markWrap, { opacity: 1, scale: 0.86, y: 16, rotation: -1.2 })
      gsap.set([iconGlow, iconCore], { scale: 0.94, y: 8, clipPath: 'inset(0% 0% 0% 0% round 0px)' })
      gsap.set(logo, { x: 56, scale: 0.97 })
      gsap.set(aurora, { scale: 0.9, y: 12 })
      gsap.set(spotlight, { scaleX: 0.86, y: 18 })
      gsap.set(trace, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
      gsap.set(markShine, { xPercent: -150, opacity: 0 })
      gsap.set(logoShine, { xPercent: -130, opacity: 0 })
      gsap.set(progress, { scaleX: 0, transformOrigin: 'center center' })

      if (reduceMotion) {
        gsap
          .timeline({
            onComplete: () => {
              notifyComplete()
              hideOverlay()
            },
          })
          .to(root, { opacity: 1, duration: 0.12, ease: 'power2.out' })
          .to(bg, { opacity: 1, duration: 0.1 }, '<')
          .to([aurora, beam, spotlight], { opacity: 0.9, duration: 0.1 }, '<')
          .to([grid, noise], { opacity: 0.08, duration: 0.1 }, '<')
          .to([iconCore, logo, progress, caption], { opacity: 1, y: 0, x: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.2 })
          .to(root, { opacity: 0, duration: 0.32, ease: 'power2.out' }, '+=0.45')
        return
      }

      gsap
        .timeline({ defaults: { ease: 'power3.out' }, onComplete: hideOverlay })
        .to(root, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
        .to(bg, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
        .to(aurora, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.03)
        .to(beam, { opacity: 0.74, duration: 0.52, ease: 'power2.out' }, 0.08)
        .to(spotlight, { opacity: 0.62, scaleX: 1, y: 0, duration: 0.62, ease: 'power2.out' }, 0.1)
        .to(grid, { opacity: 0.06, duration: 0.44, ease: 'power2.out' }, 0.16)
        .to(noise, { opacity: 0.1, duration: 0.44, ease: 'power2.out' }, 0.16)
        .addLabel('icon', 0.24)
        .to(glow, { opacity: 0.58, scale: 1, duration: 0.82, ease: 'power2.out' }, 'icon')
        .to(rim, { opacity: 0.62, scale: 1, duration: 0.78, ease: 'power2.out' }, 'icon+=0.08')
        .to(trace, { opacity: 0.7, scaleX: 1, duration: 0.88, ease: 'power3.out' }, 'icon+=0.16')
        .to(iconGlow, { opacity: 0.26, scale: 1.04, y: 0, duration: 0.9, ease: 'power4.out' }, 'icon+=0.08')
        .to(iconCore, { opacity: 1, scale: 1, y: 0, duration: 0.95, ease: 'power4.out' }, 'icon+=0.14')
        .to(markWrap, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.96, ease: 'power4.out' }, 'icon')
        .to(markShine, { opacity: 0.72, xPercent: 145, duration: 0.82, ease: 'power3.inOut' }, 'icon+=0.45')
        .to(markWrap, { scale: 1.006, duration: 0.34, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 'icon+=1')
        .to(glow, { opacity: 0.72, scale: 1.035, duration: 0.34, ease: 'sine.out' }, 'icon+=0.98')
        .to(glow, { opacity: 0.54, scale: 1, duration: 0.38, ease: 'sine.in' }, 'icon+=1.32')
        .addLabel('crossfade', 1.58)
        .to(markWrap, { opacity: 0, scale: 0.965, y: -2, duration: 0.44, ease: 'power2.inOut' }, 'crossfade')
        .to(glow, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 'crossfade')
        .addLabel('logo', 1.76)
        .to(logo, { opacity: 1, x: 0, scale: 1, duration: 0.92, ease: 'power3.out' }, 'logo')
        .to(logoShine, { opacity: 0.78, xPercent: 145, duration: 0.7, ease: 'power3.inOut' }, 'logo+=0.24')
        .to(progress, { opacity: 1, scaleX: 1, duration: 0.62, ease: 'power2.out' }, 'logo+=0.58')
        .to(caption, { opacity: 1, y: 0, duration: 0.48, ease: 'power2.out' }, 'logo+=0.76')
        .to({}, { duration: 0.58 })
        .addLabel('exit')
        .call(notifyComplete, [], 'exit+=0.08')
        .to([logo, progress, caption], { opacity: 0, y: -12, scale: 1.018, duration: 0.64, ease: 'power2.inOut' }, 'exit')
        .to(stage, { opacity: 0, scale: 1.028, y: -16, duration: 0.92, ease: 'power3.inOut' }, 'exit+=0.04')
        .to([aurora, beam, spotlight], { opacity: 0, scale: 1.06, duration: 0.9, ease: 'power3.inOut' }, 'exit+=0.12')
        .to(root, { opacity: 0, duration: 0.82, ease: 'power3.inOut' }, 'exit+=0.2')
    }, root)

    return () => ctx.revert()
  }, [onComplete])

  if (!isVisible) return null

  return (
    <section ref={rootRef} className="landing-preloader" role="presentation" aria-hidden="true">
      <div className="landing-preloader__bg" />
      <div className="landing-preloader__aurora" />
      <div className="landing-preloader__beam" />
      <div className="landing-preloader__spotlight" />
      <div className="landing-preloader__vignette" />
      <div className="landing-preloader__grid" />
      <div className="landing-preloader__noise" />

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
