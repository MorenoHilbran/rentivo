'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const [mounted, setMounted] = useState(false)
  const [animationClass, setAnimationClass] = useState('opacity-0 scale-95')

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Trigger entrance animation
      const timer = setTimeout(() => {
        setAnimationClass('opacity-100 scale-100')
      }, 10)
      return () => {
        clearTimeout(timer)
      }
    } else {
      const timer = setTimeout(() => {
        setAnimationClass('opacity-0 scale-95')
        document.body.style.overflow = 'unset'
      }, 0)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = 'unset'
      }
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] || 'max-w-lg'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-200 ease-out" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-lg transition-all duration-200 ease-out ${sizeClasses} ${animationClass}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="font-title-sm text-title-sm font-semibold text-on-background">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6 font-body-md text-body-md text-on-surface-variant">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-outline-variant px-6 py-4 bg-surface-container-low rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
