export default function SectionPage({ title, description, children, actions, emptyState }) {
  return (
    <div className="p-lg md:p-xl bg-background min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between mb-xl">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-background">{title}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">{description}</p>
          </div>
          {actions ? <div className="flex gap-2">{actions}</div> : null}
        </div>

        {children}

        {emptyState ? (
          <div className="mt-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
            {emptyState}
          </div>
        ) : null}
      </div>
    </div>
  )
}