'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-full btn-lg"
      aria-busy={pending}
      style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}
    >
      {pending ? (
        <>
          <Loader2
            size={16}
            strokeWidth={2.5}
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
          />
          Sedang masuk…
        </>
      ) : (
        <>
          Masuk ke Rentivo
          <ArrowRight size={16} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
        </>
      )}
    </button>
  )
}

export default function LoginForm({ action }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} noValidate>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Email */}
        <div className="form-group">
          <label
            htmlFor="login-email"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', letterSpacing: '0.03em', display: 'block', marginBottom: '6px' }}
          >
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
              color: 'var(--color-on-surface-variant)', opacity: 0.5, display: 'flex',
            }}>
              <Mail size={16} strokeWidth={2} />
            </span>
            <input
              id="login-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="nama@perusahaan.com"
              autoComplete="email"
              required
              aria-required="true"
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label
            htmlFor="login-password"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', letterSpacing: '0.03em', display: 'block', marginBottom: '6px' }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
              color: 'var(--color-on-surface-variant)', opacity: 0.5, display: 'flex',
            }}>
              <Lock size={16} strokeWidth={2} />
            </span>
            <input
              id="login-password"
              className="form-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
              aria-required="true"
              style={{ paddingLeft: '40px', paddingRight: '42px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-on-surface-variant)', opacity: 0.6, padding: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? (
                <EyeOff size={15} strokeWidth={2} />
              ) : (
                <Eye size={15} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '4px' }}>
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
