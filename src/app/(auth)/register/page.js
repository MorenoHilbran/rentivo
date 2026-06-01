import Link from 'next/link'
import RegisterForm from './RegisterForm'

export const metadata = {
  title: 'Daftar Workspace — Rentivo',
  description: 'Buat workspace Rentivo baru untuk bisnis sewa Anda.',
}

export default async function RegisterPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error ?? null

  return (
    <div suppressHydrationWarning className="card" style={{ padding: 'var(--space-xl)' }}>
      {/* Progress Indicator */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Steps */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginBottom: 'var(--space-md)',
          }}
        >
          {[
            { num: 1, label: 'Profil Bisnis' },
            { num: 2, label: 'Verifikasi' },
            { num: 3, label: 'Selesai' },
          ].map((step, idx, arr) => (
            <div
              key={step.num}
              style={{ display: 'flex', alignItems: 'center', flex: idx < arr.length - 1 ? 1 : 'none' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <div
                  aria-current={step.num === 1 ? 'step' : undefined}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: step.num === 1
                      ? 'var(--color-primary-container)'
                      : 'var(--color-surface-container)',
                    color: step.num === 1
                      ? 'var(--color-on-primary)'
                      : 'var(--color-on-surface-variant)',
                    transition: 'background var(--transition-normal)',
                  }}
                >
                  {step.num}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: step.num === 1 ? 700 : 400,
                    color: step.num === 1
                      ? 'var(--color-primary-container)'
                      : 'var(--color-on-surface-variant)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.02em',
                  }}
                >
                  {step.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: '2px',
                    background: 'var(--color-surface-container-high)',
                    margin: '0 var(--space-xs)',
                    marginBottom: '20px',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div>
          <p
            className="text-label-caps"
            style={{ color: 'var(--color-primary-container)', marginBottom: '4px' }}
          >
            Langkah 1 dari 3
          </p>
          <h1
            style={{
              fontSize: 'var(--text-headline-md)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              lineHeight: 'var(--leading-headline)',
              letterSpacing: '-0.01em',
            }}
          >
            Profil Bisnis
          </h1>
          <p
            style={{
              marginTop: 'var(--space-xs)',
              fontSize: 'var(--text-body-md)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Ceritakan sedikit tentang bisnis sewa Anda.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            marginBottom: 'var(--space-lg)',
            background: 'var(--color-error-container)',
            border: '1px solid rgba(186, 26, 26, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-on-error-container)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: '1px' }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{decodeURIComponent(error)}</span>
        </div>
      )}

      {/* Form */}
      <RegisterForm />

      {/* Footer */}
      <div
        style={{
          marginTop: 'var(--space-xl)',
          paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--color-outline-variant)',
          textAlign: 'center',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-on-surface-variant)',
        }}
      >
        Sudah punya akun?{' '}
        <Link
          href="/login"
          style={{
            color: 'var(--color-primary-container)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Masuk ke akun Anda
        </Link>
      </div>
    </div>
  )
}
