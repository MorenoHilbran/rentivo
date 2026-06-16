'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface StorySceneData {
  num: string
  headline: string
  copy: string
}

const STORY_SCENES: StorySceneData[] = [
  {
    num: '01',
    headline: 'Customers come from everywhere.',
    copy: 'But every inquiry arrives with missing context.',
  },
  {
    num: '02',
    headline: 'Operations get messy fast.',
    copy: 'Bookings overlap. Inventory slips. Payments become harder to track.',
  },
  {
    num: '03',
    headline: 'Rentivo brings the flow together.',
    copy: 'One connected system from first inquiry to final return.',
  },
]

function AnimatedWords({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, index) => (
        <span className="story-word" key={`${word}-${index}`}>
          {word}{' '}
        </span>
      ))}
    </>
  )
}

export default function StoryIntro() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const bg1Ref = useRef<HTMLDivElement>(null)
  const bg2Ref = useRef<HTMLDivElement>(null)
  const bg3Ref = useRef<HTMLDivElement>(null)

  const scene1Ref = useRef<HTMLElement>(null)
  const scene2Ref = useRef<HTMLElement>(null)
  const scene3Ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        // ── Scene 1 is immediately visible at scroll = 0 ───────────
        // No entrance fromTo for scene 1 — it's already shown via CSS (.story-scene--active)
        // GSAP confirms the visible state so inline styles don't fight CSS
        gsap.set(scene1Ref.current, { opacity: 1, y: 0, scale: 1 })
        gsap.set([scene2Ref.current, scene3Ref.current], { opacity: 0, y: 40, scale: 0.98 })
        gsap.set([bg2Ref.current, bg3Ref.current], { opacity: 0 })
        gsap.set(bg1Ref.current, { opacity: 1 })

        // Scene 1 inner elements: immediately visible
        const s1Label = scene1Ref.current?.querySelector('.story-label')
        const s1Words = scene1Ref.current?.querySelectorAll('.story-word')
        const s1Copy  = scene1Ref.current?.querySelector('.story-copy')
        gsap.set(s1Label, { opacity: 0.6, y: 0 })
        gsap.set(s1Words, { opacity: 1, y: 0 })
        gsap.set(s1Copy,  { opacity: 0.68, y: 0 })

        // Scene 2 & 3 element refs
        const s2Label = scene2Ref.current?.querySelector('.story-label')
        const s2Words = scene2Ref.current?.querySelectorAll('.story-word')
        const s2Copy  = scene2Ref.current?.querySelector('.story-copy')
        const s3Label = scene3Ref.current?.querySelector('.story-label')
        const s3Words = scene3Ref.current?.querySelectorAll('.story-word')
        const s3Copy  = scene3Ref.current?.querySelector('.story-copy')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=300%',
            pin: true,
            scrub: 0.8,
          },
        })

        // Brief hold at start (scene 1 is already visible)
        tl.to({}, { duration: 0.6 })

        // Scene 1 → exit
        tl.to(scene1Ref.current, { opacity: 0, y: -40, scale: 1.02, duration: 0.8 })
          .to(bg1Ref.current, { opacity: 0, duration: 0.8 }, '<')

        // Scene 2 → enter
        tl.fromTo(scene2Ref.current, { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, '<0.35')
          .to(bg2Ref.current, { opacity: 1, duration: 0.8 }, '<')
          .fromTo(s2Label, { opacity: 0, y: 10 }, { opacity: 0.6, y: 0, duration: 0.4 }, '<0.1')
          .fromTo(s2Words, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.6 }, '<0.15')
          .fromTo(s2Copy,  { opacity: 0, y: 15 }, { opacity: 0.68, y: 0, duration: 0.5 }, '<0.3')
          .to({}, { duration: 0.6 })

        // Scene 2 → exit
        tl.to(scene2Ref.current, { opacity: 0, y: -40, scale: 1.02, duration: 0.8 })
          .to(bg2Ref.current, { opacity: 0, duration: 0.8 }, '<')

        // Scene 3 → enter
        tl.fromTo(scene3Ref.current, { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, '<0.35')
          .to(bg3Ref.current, { opacity: 1, duration: 0.8 }, '<')
          .fromTo(s3Label, { opacity: 0, y: 10 }, { opacity: 0.6, y: 0, duration: 0.4 }, '<0.1')
          .fromTo(s3Words, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.6 }, '<0.15')
          .fromTo(s3Copy,  { opacity: 0, y: 15 }, { opacity: 0.68, y: 0, duration: 0.5 }, '<0.3')
          .to({}, { duration: 1.0 })
      })

      return () => {
        mm.revert()
      }
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="story-intro" aria-label="Rentivo story intro">
      <div ref={stageRef} className="story-stage">
        {/* Background Layers for smooth crossfades */}
        <div ref={bg1Ref} className="story-bg story-bg-1" aria-hidden="true" />
        <div ref={bg2Ref} className="story-bg story-bg-2" aria-hidden="true" />
        <div ref={bg3Ref} className="story-bg story-bg-3" aria-hidden="true" />

        {/* Global vignette overlay for cinematic dark border look */}
        <div className="story-bg-vignette" aria-hidden="true" />

        {/* Scene 1 — active by default, visible at scroll=0 */}
        <article ref={scene1Ref} className="story-scene story-scene--active">
          <div className="story-scene-inner">
            <span className="story-label">{STORY_SCENES[0].num}</span>
            <h2 className="story-title">
              <AnimatedWords text={STORY_SCENES[0].headline} />
            </h2>
            <p className="story-copy">{STORY_SCENES[0].copy}</p>
          </div>
        </article>

        {/* Scene 2 */}
        <article ref={scene2Ref} className="story-scene">
          <div className="story-scene-inner">
            <span className="story-label">{STORY_SCENES[1].num}</span>
            <h2 className="story-title">
              <AnimatedWords text={STORY_SCENES[1].headline} />
            </h2>
            <p className="story-copy">{STORY_SCENES[1].copy}</p>
          </div>
        </article>

        {/* Scene 3 */}
        <article ref={scene3Ref} className="story-scene">
          <div className="story-scene-inner">
            <span className="story-label">{STORY_SCENES[2].num}</span>
            <h2 className="story-title">
              <AnimatedWords text={STORY_SCENES[2].headline} />
            </h2>
            <p className="story-copy">{STORY_SCENES[2].copy}</p>
          </div>
        </article>
      </div>
    </section>
  )
}
