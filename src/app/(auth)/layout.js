import RentivoBrand from '@/components/RentivoBrand'

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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <RentivoBrand eyebrow="CRM & Operations Suite" />
        </div>
        {children}
      </div>
    </div>
  )
}
