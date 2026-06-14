export default function AuthLayout({ children }) {
  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-lg)',
        background: 'linear-gradient(135deg, #f0faf8 0%, #f7faf8 40%, #f0f4ff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0,92,85,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-120px',
        right: '-80px',
        width: '480px',
        height: '480px',
        background: 'radial-gradient(circle, rgba(80,95,118,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(0,106,99,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div suppressHydrationWarning style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #005c55 0%, #0f766e 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(0,92,85,0.25)',
              }}
            >
              R
            </div>
            <span
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: 'var(--color-on-surface)',
                letterSpacing: '-0.03em',
              }}
            >
              Rentivo
            </span>
          </div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-on-surface-variant)',
              marginTop: '6px',
              opacity: 0.7,
            }}
          >
            CRM & Operations Suite
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
