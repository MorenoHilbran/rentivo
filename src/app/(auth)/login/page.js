import Link from 'next/link'
import { loginAction } from '@/app/(auth)/login/actions'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Masuk — Rentivo',
  description: 'Masuk ke akun Rentivo Operations Suite Anda.',
}

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error ?? null

  return (
    <div className="card" style={{ padding: 'var(--space-xl)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1
          style={{
            fontSize: 'var(--text-headline-md)',
            fontWeight: 700,
            color: 'var(--color-on-surface)',
            lineHeight: 'var(--leading-headline)',
            letterSpacing: '-0.01em',
          }}
        >
          Masuk ke Rentivo
        </h1>
        <p
          style={{
            marginTop: 'var(--space-xs)',
            fontSize: 'var(--text-body-md)',
            color: 'var(--color-on-surface-variant)',
          }}
        >
          Kelola operasional bisnis sewa Anda dengan mudah.
        </p>
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
      <LoginForm action={loginAction} />

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
        Belum punya akun?{' '}
        <Link
          href="/register"
          style={{
            color: 'var(--color-primary-container)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Daftar workspace baru
        </Link>
      </div>
    </div>
  )
}
