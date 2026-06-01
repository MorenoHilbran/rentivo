export default function SectionPage({ title, description, children, actions, emptyState, highlights = [] }) {
  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(0,106,99,0.12),transparent_58%),radial-gradient(circle_at_top_right,rgba(127,64,37,0.1),transparent_42%)]" />
      <div className="relative mx-auto max-w-7xl px-lg py-lg md:px-xl md:py-xl">
        <div className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-lg p-lg md:p-xl lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-display-lg text-display-lg text-on-background">{title}</h1>
              <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </div>

        {highlights.length > 0 ? (
          <div className="mt-lg grid gap-md md:grid-cols-2 xl:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg shadow-[var(--shadow-sm)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant">{item.kicker}</p>
                    <h2 className="mt-2 font-title-sm text-title-sm text-on-background">{item.title}</h2>
                  </div>
                  {item.badge ? (
                    <span className="rounded-full bg-surface-container-lowest px-3 py-1 font-label-caps text-label-caps text-on-surface-variant">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{item.description}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-lg space-y-lg">
          {children}
        </div>

        {emptyState ? (
          <div className="mt-lg rounded-2xl border border-outline-variant bg-surface-container-lowest p-xl text-center shadow-[var(--shadow-sm)]">
            {emptyState}
          </div>
        ) : null}
      </div>
    </div>
  )
}