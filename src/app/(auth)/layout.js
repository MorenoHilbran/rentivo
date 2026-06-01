export default function AuthLayout({ children }) {
  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-md)',
        background: 'var(--color-background)',
      }}
    >
      <div suppressHydrationWarning style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--color-primary-container)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-on-primary)',
                fontWeight: 700,
                fontSize: '18px',
              }}
            >
              R
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-on-surface)',
                letterSpacing: '-0.02em',
              }}
            >
              Rentivo
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--text-label-caps)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-on-surface-variant)',
              marginTop: 'var(--space-xs)',
            }}
          >
            Operations Suite
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
