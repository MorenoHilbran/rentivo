/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const [mounted, setMounted] = useState(false)
  const [animationClass, setAnimationClass] = useState('opacity-0 translate-y-4 scale-95')

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => {
        setAnimationClass('opacity-100 translate-y-0 scale-100')
      }, 30)
      return () => clearTimeout(timer)
    } else {
      setAnimationClass('opacity-0 translate-y-4 scale-95')
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const maxWidths = { sm: '520px', md: '680px', lg: '900px', xl: '1160px' }
  const maxW = maxWidths[size] || '680px'

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,14,14,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative transition-all duration-300 ease-out ${animationClass}`}
        style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: maxW,
          maxHeight: 'calc(100vh - 60px)',
          borderRadius: 18,
          border: '1px solid var(--color-outline-variant)',
          background: 'var(--color-surface-container-lowest)',
          boxShadow: '0 24px 60px rgba(10,14,14,0.18), 0 4px 12px rgba(10,14,14,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-outline-variant)',
          background: 'var(--color-surface-container-low)',
          borderLeft: '4px solid var(--color-primary-container)',
          flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: 15.5, fontWeight: 700,
            color: 'var(--color-on-surface)',
            letterSpacing: '-0.01em', lineHeight: 1.3,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--color-on-surface-variant)',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            aria-label="Tutup modal"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          overflowY: 'auto', flex: 1,
          padding: '24px',
          fontSize: 14,
          color: 'var(--color-on-surface-variant)',
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
            padding: '14px 24px',
            borderTop: '1px solid var(--color-outline-variant)',
            background: 'var(--color-surface-container-low)',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
