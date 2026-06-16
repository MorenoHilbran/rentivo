'use client'

import { motion } from 'framer-motion'

type RentivoLampBackdropProps = {
  activeScene?: number
  className?: string
}

const beamReveal = {
  delay: 0.2,
  duration: 1.1,
  ease: [0.16, 1, 0.3, 1] as const,
}

const lineReveal = {
  delay: 0.35,
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1] as const,
}

const glowReveal = {
  delay: 0.4,
  duration: 1.0,
  ease: [0.16, 1, 0.3, 1] as const,
}

export default function RentivoLampBackdrop({
  activeScene = 1,
  className = '',
}: RentivoLampBackdropProps) {
  return (
    <div
      className={`rentivo-lamp rentivo-lamp--scene-${activeScene} ${className}`.trim()}
      data-active-scene={activeScene}
      aria-hidden="true"
    >
      <div className="rentivo-lamp__container">
        {/* ── Left beam (from 70deg, right-1/2) ─────────────────── */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          animate={{ opacity: 1, width: '32rem' }}
          transition={beamReveal}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, var(--lamp-beam-1), transparent 40%)`,
          }}
          className="rentivo-lamp__beam-new rentivo-lamp__beam-new--left"
        />

        {/* ── Right beam (from 290deg, left-1/2) ────────────────── */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          animate={{ opacity: 1, width: '32rem' }}
          transition={beamReveal}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent 60%, var(--lamp-beam-1))`,
          }}
          className="rentivo-lamp__beam-new rentivo-lamp__beam-new--right"
        />

        {/* ── Glow blobs ───────────────────────────────────────── */}
        <div className="rentivo-lamp__glow-soft" />

        <motion.div
          initial={{ width: '8rem' }}
          animate={{ width: '16rem' }}
          transition={glowReveal}
          className="rentivo-lamp__glow-bright"
        />

        {/* ── Thin filament line ───────────────────────────────── */}
        <motion.div
          initial={{ width: '15rem' }}
          animate={{ width: '32rem' }}
          transition={lineReveal}
          className="rentivo-lamp__filament"
        />
      </div>

      {/* ── Ambient background aura (retained) ────────────────── */}
      <div className="rentivo-lamp__aura" />

      {/* ── Static horizon line (retained) ────────────────────── */}
      <div className="rentivo-lamp__horizon" />
    </div>
  )
}

