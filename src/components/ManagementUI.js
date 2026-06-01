export function Notice({ tone = 'success', title, message }) {
  const styleMap = {
    success: 'border-success/25 bg-success-container/45 text-on-surface',
    error: 'border-error/25 bg-error-container/45 text-on-surface',
    info: 'border-info/25 bg-info-container/45 text-on-surface',
  }

  return (
    <div className={`rounded-2xl border p-lg shadow-[var(--shadow-sm)] ${styleMap[tone] ?? styleMap.success}`}>
      <p className="font-label-caps text-label-caps">{title}</p>
      <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">{message}</p>
    </div>
  )
}

export function FormCard({ title, description, children, action }) {
  return (
    <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-2 border-b border-outline-variant pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-title-sm text-title-sm text-on-background">{title}</h2>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function Field({ label, name, type = 'text', placeholder, defaultValue, required = true, hint, step, min }) {
  return (
    <label className="block space-y-2">
      <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition focus:border-primary"
      />
      {hint ? <span className="font-body-sm text-body-sm text-on-surface-variant">{hint}</span> : null}
    </label>
  )
}

export function TextareaField({ label, name, placeholder, defaultValue, required = true, hint, rows = 4 }) {
  return (
    <label className="block space-y-2">
      <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition focus:border-primary"
      />
      {hint ? <span className="font-body-sm text-body-sm text-on-surface-variant">{hint}</span> : null}
    </label>
  )
}

export function SelectField({ label, name, children, required = true, hint, defaultValue }) {
  return (
    <label className="block space-y-2">
      <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition focus:border-primary"
      >
        {children}
      </select>
      {hint ? <span className="font-body-sm text-body-sm text-on-surface-variant">{hint}</span> : null}
    </label>
  )
}

export function GridForm({ children }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

export function TableCard({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[var(--shadow-sm)]">
      <div className="border-b border-outline-variant pb-4">
        <h2 className="font-title-sm text-title-sm text-on-background">{title}</h2>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      </div>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  )
}

export function StatusPill({ children, tone = 'neutral' }) {
  const toneClass = {
    neutral: 'bg-surface-container text-on-surface',
    success: 'bg-success-container text-on-surface',
    warning: 'bg-warning-container text-on-surface',
    error: 'bg-error-container text-on-surface',
    info: 'bg-info-container text-on-surface',
    primary: 'bg-primary-fixed text-primary',
  }[tone] ?? 'bg-surface-container text-on-surface'

  return <span className={`inline-flex rounded-full px-3 py-1 font-label-caps text-label-caps ${toneClass}`}>{children}</span>
}
