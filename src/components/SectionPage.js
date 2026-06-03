export default function SectionPage({ title, description, children, actions, emptyState, highlights = [] }) {
  return (
    <div className="page-content">
      {/* Subtle decorative gradient */}
      <div className="page-bg-accent" />

      {/* Page Header — simple, clean, no outer card wrapper */}
      <div className="page-header-section">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {actions}
          </div>
        ) : null}
      </div>

      {/* Optional highlights grid — compact */}
      {highlights.length > 0 ? (
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
            padding: '20px 32px 0',
          }}
        >
          {highlights.map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: 12,
                border: '1px solid var(--color-outline-variant)',
                background: 'var(--color-surface-container-lowest)',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: 'var(--color-on-surface-variant)',
                    margin: 0,
                  }}
                >
                  {item.kicker}
                </p>
                {item.badge ? (
                  <span
                    style={{
                      borderRadius: 9999,
                      background: 'var(--color-surface-container)',
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'var(--color-on-surface-variant)',
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <h2
                style={{
                  marginTop: 6,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-on-surface)',
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </h2>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: 'var(--color-on-surface-variant)',
                  lineHeight: 1.4,
                }}
              >
                {item.description}
              </p>
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
        <div
          style={{
            margin: '0 32px 48px',
            borderRadius: 16,
            border: '1px solid var(--color-outline-variant)',
            background: 'var(--color-surface-container-lowest)',
            padding: 'var(--space-xl)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {emptyState}
        </div>
      ) : null}
    </div>
  )
}