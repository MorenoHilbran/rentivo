'use client'

import { CheckCircle2, AlertCircle, Info, AlertTriangle, ChevronDown } from 'lucide-react'

/* ─── Notice / Alert Banner ─── */
export function Notice({ tone = 'success', title, message }) {
  const configs = {
    success: {
      card: 'border-emerald-500/20 bg-emerald-50 text-emerald-900',
      icon: <CheckCircle2 size={15} strokeWidth={2} className="text-emerald-600" style={{ flexShrink: 0, marginTop: 1 }} />,
      kicker: '#065f46',
    },
    error: {
      card: 'border-rose-500/20 bg-rose-50 text-rose-900',
      icon: <AlertCircle size={15} strokeWidth={2} className="text-rose-600" style={{ flexShrink: 0, marginTop: 1 }} />,
      kicker: '#9f1239',
    },
    info: {
      card: 'border-sky-500/20 bg-sky-50 text-sky-900',
      icon: <Info size={15} strokeWidth={2} className="text-sky-600" style={{ flexShrink: 0, marginTop: 1 }} />,
      kicker: '#0c4a6e',
    },
    warning: {
      card: 'border-amber-500/20 bg-amber-50 text-amber-900',
      icon: <AlertTriangle size={15} strokeWidth={2} className="text-amber-600" style={{ flexShrink: 0, marginTop: 1 }} />,
      kicker: '#78350f',
    },
  }

  const current = configs[tone] || configs.success

  return (
    <div
      style={{
        display: 'flex', gap: 12, borderRadius: 10,
        border: '1px solid', padding: '12px 16px',
        boxShadow: 'var(--shadow-sm)',
      }}
      className={current.card}
    >
      {current.icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.4, color: current.kicker }}>{title}</p>
        {message && <p style={{ marginTop: 4, fontSize: 12.5, opacity: 0.8, lineHeight: 1.5 }}>{message}</p>}
      </div>
    </div>
  )
}

/* ─── Form Card (section wrapper) ─── */
export function FormCard({ title, description, children, action }) {
  return (
    <section style={{
      borderRadius: 16, border: '1px solid var(--color-outline-variant)',
      background: 'var(--color-surface-container-lowest)',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
      transition: 'box-shadow 200ms ease',
    }}>
      {/* Header with left accent */}
      <div style={{
        borderLeft: '4px solid var(--color-primary-container)',
        borderBottom: '1px solid var(--color-outline-variant)',
        background: 'var(--color-surface-container-low)',
        padding: '18px 24px',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--color-on-surface)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{title}</h2>
            {description && (
              <p style={{ marginTop: 5, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.55, maxWidth: 480, opacity: 0.85 }}>{description}</p>
            )}
          </div>
          {action && <div style={{ flexShrink: 0, marginTop: 2 }}>{action}</div>}
        </div>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </section>
  )
}

/* ─── Input Field ─── */
export function Field({ label, name, type = 'text', placeholder, defaultValue, required = true, hint, step, min }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: '#e11d48' }}>*</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="form-input"
        style={{ height: 42 }}
      />
      {hint && <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.45, opacity: 0.8 }}>{hint}</span>}
    </div>
  )
}

/* ─── Textarea Field ─── */
export function TextareaField({ label, name, placeholder, defaultValue, required = true, hint, rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: '#e11d48' }}>*</span>}
      </label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="form-input"
        style={{ height: 'auto', padding: '10px 14px', resize: 'vertical', lineHeight: 1.55 }}
      />
      {hint && <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.45, opacity: 0.8 }}>{hint}</span>}
    </div>
  )
}

/* ─── Select Field ─── */
export function SelectField({ label, name, children, required = true, hint, defaultValue }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: '#e11d48' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          name={name}
          defaultValue={defaultValue}
          required={required}
          className="form-input"
          style={{ height: 42, appearance: 'none', paddingRight: 40 }}
        >
          {children}
        </select>
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12 }}>
          <ChevronDown size={15} strokeWidth={2} style={{ color: 'var(--color-on-surface-variant)' }} />
        </div>
      </div>
      {hint && <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.45, opacity: 0.8 }}>{hint}</span>}
    </div>
  )
}

/* ─── 2-col Grid Form ─── */
export function GridForm({ children }) {
  return <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(2, 1fr)' }}>{children}</div>
}

/* ─── Table Card wrapper ─── */
export function TableCard({ title, description, children }) {
  return (
    <section style={{
      borderRadius: 16, border: '1px solid var(--color-outline-variant)',
      background: 'var(--color-surface-container-lowest)',
      padding: 0, boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '18px 24px 16px',
        borderBottom: '1px solid var(--color-outline-variant)',
        background: 'var(--color-surface-container-low)',
      }}>
        <h2 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}>{title}</h2>
        {description && <p style={{ marginTop: 5, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.55, opacity: 0.85 }}>{description}</p>}
      </div>
      <div style={{ padding: '20px 24px 24px' }}>{children}</div>
    </section>
  )
}

/* ─── Status Pill ─── */
export function StatusPill({ children, tone = 'neutral' }) {
  const toneMap = {
    neutral: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    success: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    warning: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    error:   { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
    info:    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    primary: { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' },
  }

  const { bg, color, border } = toneMap[tone] || toneMap.neutral

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: 9999, border: `1px solid ${border}`,
      padding: '3px 10px', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      background: bg, color,
      lineHeight: 1.5, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
