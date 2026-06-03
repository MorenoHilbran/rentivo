'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timeoutsRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback((toast) => {
    const id = crypto.randomUUID()
    const nextToast = {
      id,
      title: toast.title ?? 'Notifikasi',
      message: toast.message ?? '',
      tone: toast.tone ?? 'info', // success, error, info, warning
      duration: toast.duration ?? 4000,
    }

    setToasts((items) => [nextToast, ...items].slice(0, 5))

    const timeoutId = setTimeout(() => {
      dismiss(id)
    }, nextToast.duration)
    timeoutsRef.current.set(id, timeoutId)

    return id
  }, [dismiss])

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      for (const timeoutId of timeouts.values()) {
        clearTimeout(timeoutId)
      }
      timeouts.clear()
    }
  }, [])

  const value = useMemo(() => ({
    addToast,
    dismiss,
  }), [addToast, dismiss])

  const getIcon = (tone) => {
    switch (tone) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-sky-600 shrink-0" />
    }
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.tone} flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-surface-container-lowest transition-all duration-300 transform translate-y-0`}
            style={{
              borderColor: toast.tone === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
                           toast.tone === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
                           toast.tone === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 
                           'rgba(59, 130, 246, 0.2)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {getIcon(toast.tone)}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-body-sm text-on-surface leading-5">{toast.title}</div>
              {toast.message ? <div className="mt-1 text-xs text-on-surface-variant leading-4">{toast.message}</div> : null}
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              onClick={() => dismiss(toast.id)}
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
