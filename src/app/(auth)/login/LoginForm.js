'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-full btn-lg"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              animation: 'spin 0.8s linear infinite',
            }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Sedang masuk…
        </>
      ) : (
        'Masuk'
      )}
    </button>
  )
}

export default function LoginForm({ action }) {
  return (
    <form action={action} noValidate>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">
            Email
          </label>
          <input
            id="login-email"
            className="form-input"
            type="email"
            name="email"
            placeholder="nama@perusahaan.com"
            autoComplete="email"
            required
            aria-required="true"
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <input
            id="login-password"
            className="form-input"
            type="password"
            name="password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            required
            aria-required="true"
          />
        </div>

        {/* Submit */}
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
