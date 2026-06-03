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
      // Trigger entrance animation
      const timer = setTimeout(() => {
        setAnimationClass('opacity-100 translate-y-0 scale-100')
      }, 30)
      return () => {
        clearTimeout(timer)
      }
    } else {
      setAnimationClass('opacity-0 translate-y-4 scale-95')
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  // Expanded widths to make sure content doesn't feel tight or cramped
  const sizeWidths = {
    sm: '512px',      // max-w-lg equivalent
    md: '672px',      // max-w-2xl equivalent
    lg: '896px',      // max-w-4xl equivalent
    xl: '1152px',     // max-w-6xl equivalent
  }[size] || '672px'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop — Premium darker glassmorphism */}
      <div 
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md transition-opacity duration-300 ease-out" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl transition-all duration-300 ease-out ${animationClass}`}
        role="dialog"
        aria-modal="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 80px)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: sizeWidths
        }}
      >
        {/* Header with left accent border matching FormCards */}
        <div 
          className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low/30 px-6 py-4 flex-shrink-0"
          style={{ borderLeft: '4px solid var(--color-primary)' }}
        >
          <h2 className="font-title-sm text-base font-bold text-on-background tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all duration-200 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content with smooth vertical scroll layout */}
        <div className="overflow-y-auto px-6 py-6 font-body-md text-body-md text-on-surface-variant flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-outline-variant px-6 py-4 bg-surface-container-low/60 rounded-b-2xl flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
