export default function SectionPage({ title, description, children, actions, emptyState, highlights = [] }) {
  return (
    <div className="page-content">
      {/* Subtle decorative gradient */}
      <div className="page-bg-accent" />

      {/* Page Header */}
      <div className="page-header-section">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {actions}
          </div>
        ) : null}
      </div>

      {/* Optional highlights grid */}
      {highlights.length > 0 ? (
        <div className="highlights-grid">
          {highlights.map((item) => (
            <div key={item.title} className="highlight-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <p className="highlight-card-kicker">{item.kicker}</p>
                {item.badge ? (
                  <span className="highlight-card-badge">{item.badge}</span>
                ) : null}
              </div>
              <h2 className="highlight-card-title">{item.title}</h2>
              <p className="highlight-card-description">{item.description}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Main content */}
      <div className="page-body-section">
        {children}
      </div>

      {/* Empty state */}
      {emptyState ? (
        <div className="page-empty-state">
          {emptyState}
        </div>
      ) : null}
    </div>
  )
}