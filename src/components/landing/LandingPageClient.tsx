'use client'

import { useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LandingPreloader from '@/components/landing/LandingPreloader'
import StoryIntro from '@/components/landing/StoryIntro'
import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import FeatureGrid from '@/components/landing/FeatureGrid'
import WorkflowSection from '@/components/landing/WorkflowSection'
import DashboardPreview from '@/components/landing/DashboardPreview'
import RoleSection from '@/components/landing/RoleSection'
import PricingSection from '@/components/landing/PricingSection'
import FinalCTA from '@/components/landing/FinalCTA'
import LandingFooter from '@/components/landing/LandingFooter'

gsap.registerPlugin(ScrollTrigger)

export default function LandingPageClient() {
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [heroActive, setHeroActive] = useState(false)

  const handlePreloaderComplete = () => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setPreloaderDone(true)
  }

  const handleHeroEnter = () => {
    setHeroActive(true)
  }

  const handleHeroLeaveBack = () => {
    setHeroActive(false)
  }

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    if (!preloaderDone) {
      // Force scroll to top instantly to prevent layout jump or showing later sections
      window.scrollTo(0, 0)
      // Prevent body scrolling
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      // Restore normal scrolling once preloader finishes
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      window.scrollTo(0, 0)

      let active = true
      let lenisInstance: any = null
      let updatePhysics: any = null

      // Initialize Lenis dynamically to avoid SSR issues
      import('lenis').then(({ default: Lenis }) => {
        if (!active) return

        // Force scroll behavior auto to prevent CSS smooth scroll collision
        document.documentElement.style.scrollBehavior = 'auto'
        document.documentElement.setAttribute('data-scroll-behavior', 'auto')

        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.5,
        })

        // Sync scroll events with ScrollTrigger
        lenisInstance.on('scroll', ScrollTrigger.update)

        // Sync with GSAP ticker loop
        updatePhysics = (time: number) => {
          if (lenisInstance) {
            lenisInstance.raf(time * 1000)
          }
        }
        gsap.ticker.add(updatePhysics)
        gsap.ticker.lagSmoothing(0)

        // Make sure ScrollTrigger settles correctly
        ScrollTrigger.refresh()
      })

      // Refresh ScrollTrigger after scrollbar is restored and layout settles
      const t1 = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 100)
      const t2 = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 1000) // Call again after preloader completes exit animation

      return () => {
        active = false
        window.history.scrollRestoration = previousScrollRestoration
        clearTimeout(t1)
        clearTimeout(t2)
        if (lenisInstance) {
          lenisInstance.destroy()
        }
        if (updatePhysics) {
          gsap.ticker.remove(updatePhysics)
        }
        document.documentElement.style.scrollBehavior = ''
        document.documentElement.removeAttribute('data-scroll-behavior')
      }
    }

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [preloaderDone])

  return (
    <main
      className={`landing-page ${preloaderDone ? 'is-loaded' : 'is-preloading'}${
        heroActive ? ' is-hero-active' : ''
      }`}
    >
      {!preloaderDone && <LandingPreloader onComplete={handlePreloaderComplete} />}

      <StoryIntro preloaderDone={preloaderDone} />
      <LandingNavbar visible={heroActive} />
      <HeroSection onHeroEnter={handleHeroEnter} onHeroLeaveBack={handleHeroLeaveBack} />
      <ProblemSection />
      <SolutionSection />
      <FeatureGrid />
      <WorkflowSection />
      <DashboardPreview />
      <RoleSection />
      <PricingSection />
      <FinalCTA />
      <LandingFooter />
    </main>
  )
}
