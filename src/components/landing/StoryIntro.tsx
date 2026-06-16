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
      gsap.set(scene1Ref.current, { opacity: 1, y: 42, scale: 0.985 })
      gsap.set([s1Label, s1Words, s1Copy], { opacity: 0, y: 32 })
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

        gsap.set([scene2Ref.current, scene3Ref.current], { opacity: 0, y: 40, scale: 0.98 })
        gsap.set(bg1Ref.current, { opacity: 1 })
        gsap.set([bg2Ref.current, bg3Ref.current], { opacity: 0 })
        gsap.set([s2Label, s3Label], { opacity: 0, y: 14 })
        gsap.set([s2Words, s3Words], { opacity: 0, y: 24 })
        gsap.set([s2Copy, s3Copy], { opacity: 0, y: 18 })
        gsap.set([s2Highlights, s3Highlights], { textShadow: '0 0 0 rgba(18, 203, 190, 0)' })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const nextScene = self.progress < 0.34 ? 1 : self.progress < 0.68 ? 2 : 3
              if (activeSceneRef.current === nextScene) return
              activeSceneRef.current = nextScene
              setActiveScene(nextScene)
            },
          },
        })

        tl.to({}, { duration: 0.2 })
          .to(scene1Ref.current, { opacity: 0, y: -40, scale: 1.02, duration: 0.55, ease: 'none' })
          .to(bg1Ref.current, { opacity: 0, duration: 0.55, ease: 'none' }, '<')
          .fromTo(
            scene2Ref.current,
            { opacity: 0, y: 40, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'none' },
            '<0.22'
          )
          .to(bg2Ref.current, { opacity: 1, duration: 0.55, ease: 'none' }, '<')
          .to(s2Label, { opacity: 0.66, y: 0, duration: 0.24, ease: 'none' }, '<0.08')
          .to(s2Words, { opacity: 1, y: 0, stagger: 0.045, duration: 0.48, ease: 'none' }, '<0.08')
          .to(s2Copy, { opacity: 0.72, y: 0, duration: 0.28, ease: 'none' }, '<0.16')
          .to(s2Highlights, { textShadow: '0 0 24px rgba(18, 203, 190, 0.28)', duration: 0.28, ease: 'none' }, '<0.05')
          .to({}, { duration: 0.25 })
          .to(scene2Ref.current, { opacity: 0, y: -40, scale: 1.02, duration: 0.55, ease: 'none' })
          .to(bg2Ref.current, { opacity: 0, duration: 0.55, ease: 'none' }, '<')
          .fromTo(
            scene3Ref.current,
            { opacity: 0, y: 40, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'none' },
            '<0.22'
          )
          .to(bg3Ref.current, { opacity: 1, duration: 0.55, ease: 'none' }, '<')
          .to(s3Label, { opacity: 0.66, y: 0, duration: 0.24, ease: 'none' }, '<0.08')
          .to(s3Words, { opacity: 1, y: 0, stagger: 0.045, duration: 0.48, ease: 'none' }, '<0.08')
          .to(s3Copy, { opacity: 0.72, y: 0, duration: 0.28, ease: 'none' }, '<0.16')
          .to(s3Highlights, { textShadow: '0 0 24px rgba(18, 203, 190, 0.28)', duration: 0.28, ease: 'none' }, '<0.05')
          .to({}, { duration: 0.25 })
          .to(scene3Ref.current, {
            opacity: 0,
            y: -48,
            scale: 1.03,
            duration: 0.5,
            ease: 'none',
          })

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
          onComplete: () => ScrollTrigger.refresh(),
        })
        .to(scene1Ref.current, { y: 0, scale: 1, duration: 0.78, ease: 'power4.out' })
        .to(s1Label, { opacity: 0.66, y: 0, duration: 0.52, ease: 'power3.out' }, '<0.04')
        .to(s1Words, { opacity: 1, y: 0, stagger: 0.058, duration: 0.72, ease: 'power4.out' }, '<0.08')
        .to(s1Copy, { opacity: 0.72, y: 0, duration: 0.52, ease: 'power3.out' }, '<0.18')
        .to(
          s1Highlights,
          { textShadow: '0 0 26px rgba(18, 203, 190, 0.34)', duration: 0.42, stagger: 0.05, ease: 'power2.out' },
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
