'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RentivoLampBackdrop from '@/components/landing/RentivoLampBackdrop'

gsap.registerPlugin(ScrollTrigger)

interface StorySceneData {
  num: string
  headline: string
  copyParts: Array<{
    text: string
    highlight?: boolean
  }>
  accentWords: string[]
}

const STORY_SCENES: StorySceneData[] = [
  {
    num: '01',
    headline: 'Customers come from everywhere.',
    copyParts: [
      { text: 'But every inquiry arrives with ' },
      { text: 'missing context', highlight: true },
      { text: '.' },
    ],
    accentWords: ['everywhere.'],
  },
  {
    num: '02',
    headline: 'Operations get messy fast.',
    copyParts: [
      { text: 'Bookings ' },
      { text: 'overlap', highlight: true },
      { text: '. Inventory slips. Payments become ' },
      { text: 'harder to track', highlight: true },
      { text: '.' },
    ],
    accentWords: ['messy', 'fast.'],
  },
  {
    num: '03',
    headline: 'Rentivo brings the flow together.',
    copyParts: [
      { text: 'One ' },
      { text: 'connected system', highlight: true },
      { text: ' from first inquiry to final return.' },
    ],
    accentWords: ['flow', 'together.'],
  },
]

function AnimatedWords({ accentWords = [], text }: { accentWords?: string[]; text: string }) {
  const words = text.split(' ')

  return (
    <>
      {words.map((word, index) => (
        <span
          className={`story-word${accentWords.includes(word) ? ' story-word-accent story-highlight' : ''}`}
          key={`${word}-${index}`}
        >
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </>
  )
}

function StoryCopy({ parts }: { parts: StorySceneData['copyParts'] }) {
  return (
    <>
      {parts.map((part, index) => (
        <span className={part.highlight ? 'story-copy-highlight story-highlight' : undefined} key={`${part.text}-${index}`}>
          {part.text}
        </span>
      ))}
    </>
  )
}

export default function StoryIntro({ preloaderDone }: { preloaderDone: boolean }) {
  const [activeScene, setActiveScene] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const bg1Ref = useRef<HTMLDivElement>(null)
  const bg2Ref = useRef<HTMLDivElement>(null)
  const bg3Ref = useRef<HTMLDivElement>(null)

  const scene1Ref = useRef<HTMLElement>(null)
  const scene2Ref = useRef<HTMLElement>(null)
  const scene3Ref = useRef<HTMLElement>(null)
  const activeSceneRef = useRef(1)
  const hasRevealedFirstSceneRef = useRef(false)

  useGSAP(
    () => {
      const s1Label = scene1Ref.current?.querySelector('.story-label')
      const s1Words = scene1Ref.current?.querySelectorAll('.story-word')
      const s1Copy = scene1Ref.current?.querySelector('.story-copy')
      const s1Highlights = scene1Ref.current?.querySelectorAll('.story-highlight')

      gsap.set(stageRef.current, { opacity: 1 })
      gsap.set(scene1Ref.current, { opacity: 1, y: 34, scale: 0.988 })
      gsap.set(s1Label, { opacity: 0, y: 16 })
      gsap.set(s1Words, { opacity: 0, y: 28 })
      gsap.set(s1Copy, { opacity: 0, y: 18 })
      gsap.set(s1Highlights, { textShadow: '0 0 0 rgba(18, 203, 190, 0)' })

      const mm = gsap.matchMedia()

      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const s2Label = scene2Ref.current?.querySelector('.story-label')
        const s2Words = scene2Ref.current?.querySelectorAll('.story-word')
        const s2Copy = scene2Ref.current?.querySelector('.story-copy')
        const s2Highlights = scene2Ref.current?.querySelectorAll('.story-highlight')
        const s3Label = scene3Ref.current?.querySelector('.story-label')
        const s3Words = scene3Ref.current?.querySelectorAll('.story-word')
        const s3Copy = scene3Ref.current?.querySelector('.story-copy')
        const s3Highlights = scene3Ref.current?.querySelectorAll('.story-highlight')

        const heroSection = document.querySelector('.landing-hero')
        const heroBadge = heroSection?.querySelector('.landing-hero-badge')
        const heroTitle = heroSection?.querySelector('.landing-hero-title')
        const heroHighlight = heroSection?.querySelector('.landing-hero-highlight')
        const heroSubtitle = heroSection?.querySelector('.landing-hero-subtitle')
        const heroActions = heroSection?.querySelector('.landing-hero-actions')
        const heroFlowLine = heroSection?.querySelector('.landing-hero-flowline')
        const heroPanel = heroSection?.querySelector('.landing-hero-panel')
        const heroPanelItems = heroSection?.querySelectorAll('.landing-hero-panel-item')
        const heroPills = heroSection?.querySelectorAll('.landing-hero-pill')
        const lamp = containerRef.current?.querySelector('.rentivo-lamp')

        gsap.set([scene2Ref.current, scene3Ref.current], { opacity: 0, y: 52, scale: 0.982 })
        gsap.set(bg1Ref.current, { opacity: 1 })
        gsap.set([bg2Ref.current, bg3Ref.current], { opacity: 0 })
        gsap.set([s2Label, s3Label], { opacity: 0.68, y: 0 })
        gsap.set([s2Words, s3Words], { opacity: 1, y: 0 })
        gsap.set([s2Copy, s3Copy], { opacity: 0.72, y: 0 })
        gsap.set([s2Highlights, s3Highlights], { textShadow: '0 0 18px rgba(18, 203, 190, 0.22)' })

        gsap.set(heroSection, { opacity: 0, y: 44, scale: 0.985 })
        gsap.set([heroBadge, heroTitle, heroHighlight, heroSubtitle, heroActions, heroFlowLine, heroPanel], { opacity: 0, y: 24 })
        gsap.set(heroPanelItems, { opacity: 0, y: 14, scale: 0.98 })
        gsap.set(heroPills, { opacity: 0, y: 15, scale: 0.98 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            pin: stageRef.current,
            pinSpacing: false,
            scrub: 1.15,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const nextScene = self.progress < 0.18 ? 1 : self.progress < 0.44 ? 2 : 3
              if (activeSceneRef.current === nextScene) return
              activeSceneRef.current = nextScene
              setActiveScene(nextScene)
            },
          },
        })

        tl.to({}, { duration: 0.35 })
          .to(scene1Ref.current, { opacity: 0, y: -54, scale: 1.018, duration: 0.72, ease: 'none' })
          .to(bg1Ref.current, { opacity: 0, duration: 0.8, ease: 'none' }, '<')
          .to(lamp, { opacity: 0.28, duration: 0.36, ease: 'power1.out' }, '<')
          .fromTo(
            scene2Ref.current,
            { opacity: 0, y: 52, scale: 0.982 },
            { opacity: 1, y: 0, scale: 1, duration: 0.86, ease: 'none' },
            '<0.3'
          )
          .to(bg2Ref.current, { opacity: 1, duration: 0.86, ease: 'none' }, '<')
          .to(lamp, { opacity: 1, duration: 0.4, ease: 'power1.in' }, '<0.4')
          .to({}, { duration: 0.46 })
          .to(scene2Ref.current, { opacity: 0, y: -54, scale: 1.018, duration: 0.72, ease: 'none' })
          .to(bg2Ref.current, { opacity: 0, duration: 0.8, ease: 'none' }, '<')
          .to(lamp, { opacity: 0.28, duration: 0.36, ease: 'power1.out' }, '<')
          .fromTo(
            scene3Ref.current,
            { opacity: 0, y: 52, scale: 0.982 },
            { opacity: 1, y: 0, scale: 1, duration: 0.86, ease: 'none' },
            '<0.3'
          )
          .to(bg3Ref.current, { opacity: 1, duration: 0.86, ease: 'none' }, '<')
          .to(lamp, { opacity: 1, duration: 0.4, ease: 'power1.in' }, '<0.4')
          .to({}, { duration: 0.90 })
          .to(scene3Ref.current, {
            opacity: 0,
            y: -44,
            scale: 1.012,
            duration: 0.80,
            ease: 'power2.inOut',
          })
          .to(lamp, { opacity: 0, duration: 0.80, ease: 'power2.inOut' }, '<')
          .to(heroSection, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: 'power2.out',
          }, '-=0.70')
          .to(heroBadge, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power3.out',
          }, '-=0.60')
          .to(heroTitle, {
            opacity: 1,
            y: 0,
            duration: 0.72,
            ease: 'power3.out',
          }, '-=0.50')
          .to(heroHighlight, {
            opacity: 0.92,
            y: 0,
            duration: 0.50,
            ease: 'power3.out',
          }, '-=0.20')
          .to(heroSubtitle, {
            opacity: 0.72,
            y: 0,
            duration: 0.50,
            ease: 'power3.out',
          }, '<0.05')
          .to(heroActions, {
            opacity: 1,
            y: 0,
            duration: 0.50,
            ease: 'power3.out',
          }, '<0.05')
          .to(heroFlowLine, {
            opacity: 1,
            y: 0,
            duration: 0.50,
            ease: 'power3.out',
          }, '<0.05')
          .to(heroPanel, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power3.out',
          }, '<0.05')
          .to(heroPanelItems, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            duration: 0.50,
            ease: 'power3.out',
          }, '<0.05')
          .to(heroPills, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.05,
            duration: 0.50,
            ease: 'power3.out',
          }, '<0.05')

        return () => tl.kill()
      })

      return () => mm.revert()
    },
    { scope: containerRef }
  )

  useGSAP(
    () => {
      if (!preloaderDone || hasRevealedFirstSceneRef.current) return

      hasRevealedFirstSceneRef.current = true

      const s1Label = scene1Ref.current?.querySelector('.story-label')
      const s1Words = scene1Ref.current?.querySelectorAll('.story-word')
      const s1Copy = scene1Ref.current?.querySelector('.story-copy')
      const s1Highlights = scene1Ref.current?.querySelectorAll('.story-highlight')

      gsap
        .timeline({
          delay: 0.12,
          onComplete: () => ScrollTrigger.refresh(),
        })
        .to(scene1Ref.current, { y: 0, scale: 1, duration: 0.9, ease: 'power4.out' })
        .to(s1Label, { opacity: 0.72, y: 0, duration: 0.58, ease: 'power3.out' }, '<0.02')
        .to(s1Words, { opacity: 1, y: 0, stagger: 0.052, duration: 0.82, ease: 'power4.out' }, '<0.08')
        .to(s1Copy, { opacity: 0.74, y: 0, duration: 0.58, ease: 'power3.out' }, '<0.2')
        .to(
          s1Highlights,
          { textShadow: '0 0 24px rgba(18, 203, 190, 0.30)', duration: 0.5, stagger: 0.05, ease: 'power2.out' },
          '<0.08'
        )
    },
    { scope: containerRef, dependencies: [preloaderDone] }
  )

  return (
    <section ref={containerRef} className="story-intro" aria-label="Rentivo story intro">
      <div ref={stageRef} className="story-stage">
        <div ref={bg1Ref} className="story-bg story-bg-1" aria-hidden="true" />
        <div ref={bg2Ref} className="story-bg story-bg-2" aria-hidden="true" />
        <div ref={bg3Ref} className="story-bg story-bg-3" aria-hidden="true" />
        <RentivoLampBackdrop activeScene={activeScene} />
        <div className="story-bg-vignette" aria-hidden="true" />

        <article ref={scene1Ref} className="story-scene story-scene--active">
          <div className="story-scene-inner">
            <span className="story-label">{STORY_SCENES[0].num}</span>
            <h2 className="story-title">
              <AnimatedWords accentWords={STORY_SCENES[0].accentWords} text={STORY_SCENES[0].headline} />
            </h2>
            <p className="story-copy">
              <StoryCopy parts={STORY_SCENES[0].copyParts} />
            </p>
          </div>
        </article>

        <article ref={scene2Ref} className="story-scene">
          <div className="story-scene-inner">
            <span className="story-label">{STORY_SCENES[1].num}</span>
            <h2 className="story-title">
              <AnimatedWords accentWords={STORY_SCENES[1].accentWords} text={STORY_SCENES[1].headline} />
            </h2>
            <p className="story-copy">
              <StoryCopy parts={STORY_SCENES[1].copyParts} />
            </p>
          </div>
        </article>

        <article ref={scene3Ref} className="story-scene">
          <div className="story-scene-inner">
            <span className="story-label">{STORY_SCENES[2].num}</span>
            <h2 className="story-title">
              <AnimatedWords accentWords={STORY_SCENES[2].accentWords} text={STORY_SCENES[2].headline} />
            </h2>
            <p className="story-copy">
              <StoryCopy parts={STORY_SCENES[2].copyParts} />
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}
