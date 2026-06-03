'use client'

import { CheckCircle2, AlertCircle, Info, AlertTriangle, ChevronDown } from 'lucide-react'

export function Notice({ tone = 'success', title, message }) {
  const configs = {
    success: {
      card: 'border-emerald-500/20 bg-emerald-50/50 text-emerald-900',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
      kicker: 'text-emerald-800'
    },
    error: {
      card: 'border-rose-500/20 bg-rose-50/50 text-rose-900',
      icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
      kicker: 'text-rose-800'
    },
    info: {
      card: 'border-sky-500/20 bg-sky-50/50 text-sky-900',
      icon: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
      kicker: 'text-sky-800'
    },
    warning: {
      card: 'border-amber-500/20 bg-amber-50/50 text-amber-900',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
      kicker: 'text-amber-800'
    }
  }

  const current = configs[tone] || configs.success

  return (
    <div className={`flex gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 ${current.card}`}>
      {current.icon}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-body-sm leading-5 ${current.kicker}`}>{title}</p>
        {message && <p className="mt-1 text-xs opacity-90 leading-4">{message}</p>}
      </div>
    </div>
  )
}

export function FormCard({ title, description, children, action }) {
  return (
    <section className="relative rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col gap-2 border-b border-outline-variant pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-title-sm text-title-sm font-semibold text-on-background">{title}</h2>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function Field({ label, name, type = 'text', placeholder, defaultValue, required = true, hint, step, min }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-label-caps text-label-caps font-bold text-on-surface-variant tracking-wider uppercase">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface outline-none transition duration-150 focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
      />
      {hint ? <span className="text-xs text-on-surface-variant leading-3">{hint}</span> : null}
    </div>
  )
}

export function TextareaField({ label, name, placeholder, defaultValue, required = true, hint, rows = 4 }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-label-caps text-label-caps font-bold text-on-surface-variant tracking-wider uppercase">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface outline-none transition duration-150 focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline resize-y"
      />
      {hint ? <span className="text-xs text-on-surface-variant leading-3">{hint}</span> : null}
    </div>
  )
}

export function SelectField({ label, name, children, required = true, hint, defaultValue }) {
  return (
    <div className="flex flex-col gap-2 relative">
      <label className="font-label-caps text-label-caps font-bold text-on-surface-variant tracking-wider uppercase">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          defaultValue={defaultValue}
          required={required}
          className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-4 pr-10 py-2.5 font-body-md text-body-md text-on-surface outline-none transition duration-150 focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        </div>
      </div>
      {hint ? <span className="text-xs text-on-surface-variant leading-3">{hint}</span> : null}
    </div>
  )
}

export function GridForm({ children }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>
}

export function TableCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="border-b border-outline-variant pb-4">
        <h2 className="font-title-sm text-title-sm font-semibold text-on-background">{title}</h2>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{description}</p>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-outline-variant/60">
        {children}
      </div>
    </section>
  )
}

export function StatusPill({ children, tone = 'neutral' }) {
  const toneConfigs = {
    neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200/50',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/50',
    error: 'bg-rose-50 text-rose-800 border-rose-200/50',
    info: 'bg-sky-50 text-sky-800 border-sky-200/50',
    primary: 'bg-teal-50 text-teal-800 border-teal-200/50',
  }

  const selected = toneConfigs[tone] || toneConfigs.neutral

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${selected}`}>
      {children}
    </span>
  )
}
