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
    <div
      style={{
        background: 'var(--color-surface-container-lowest)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 8px 40px rgba(24,28,28,0.08), 0 1px 2px rgba(24,28,28,0.04)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--color-on-surface)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Selamat Datang Kembali
        </h1>
        <p
          style={{
            marginTop: '6px',
            fontSize: '14px',
            color: 'var(--color-on-surface-variant)',
            lineHeight: 1.5,
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
            gap: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            background: 'var(--color-error-container)',
            border: '1px solid rgba(186, 26, 26, 0.2)',
            borderRadius: '10px',
            fontSize: '13px',
            color: 'var(--color-on-error-container)',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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

      {/* Divider */}
      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-outline-variant)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
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

      {/* Trust indicator */}
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--color-on-surface-variant)',
          opacity: 0.65,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Dilindungi enkripsi end-to-end
      </div>
    </div>
  )
}
