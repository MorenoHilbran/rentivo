'use client'

import { useFormStatus } from 'react-dom'
import { registerAction } from '@/app/(auth)/register/actions'

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
            style={{ animation: 'spin 0.8s linear infinite' }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Membuat workspace…
        </>
      ) : (
        <>
          Lanjutkan
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
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  )
}

export default function RegisterForm() {
  return (
    <form action={registerAction} noValidate>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* Nama Bisnis */}
        <div className="form-group">
          <label htmlFor="reg-businessName" className="form-label">
            Nama Bisnis
            <span style={{ color: 'var(--color-error)', marginLeft: '2px' }} aria-hidden="true">*</span>
          </label>
          <input
            id="reg-businessName"
            className="form-input"
            type="text"
            name="businessName"
            placeholder="cth. Bali Bike Rental"
            autoComplete="organization"
            required
            aria-required="true"
          />
          <span className="form-error" style={{ display: 'none' }} aria-live="polite" />
        </div>

        {/* Nama Pemilik */}
        <div className="form-group">
          <label htmlFor="reg-ownerName" className="form-label">
            Nama Pemilik
            <span style={{ color: 'var(--color-error)', marginLeft: '2px' }} aria-hidden="true">*</span>
          </label>
          <input
            id="reg-ownerName"
            className="form-input"
            type="text"
            name="ownerName"
            placeholder="Nama lengkap Anda"
            autoComplete="name"
            required
            aria-required="true"
          />
        </div>

        {/* 2 kolom: Email + Kota */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-md)',
          }}
        >
          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Email
              <span style={{ color: 'var(--color-error)', marginLeft: '2px' }} aria-hidden="true">*</span>
            </label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="email@bisnis.com"
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>

          {/* Kota */}
          <div className="form-group">
            <label htmlFor="reg-city" className="form-label">
              Kota
            </label>
            <input
              id="reg-city"
              className="form-input"
              type="text"
              name="city"
              placeholder="cth. Denpasar"
              autoComplete="address-level2"
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">
            Password
            <span style={{ color: 'var(--color-error)', marginLeft: '2px' }} aria-hidden="true">*</span>
          </label>
          <input
            id="reg-password"
            className="form-input"
            type="password"
            name="password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            minLength={8}
            required
            aria-required="true"
            aria-describedby="reg-password-hint"
          />
          <p
            id="reg-password-hint"
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Minimal 8 karakter. Gunakan kombinasi huruf dan angka.
          </p>
        </div>

        {/* Nomor WhatsApp */}
        <div className="form-group">
          <label htmlFor="reg-phone" className="form-label">
            Nomor WhatsApp Bisnis
          </label>
          <div style={{ position: 'relative' }}>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 'var(--space-sm)',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 'var(--text-body-md)',
                color: 'var(--color-on-surface-variant)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              +62
            </span>
            <input
              id="reg-phone"
              className="form-input"
              type="tel"
              name="phone"
              placeholder="81234567890"
              autoComplete="tel-national"
              inputMode="numeric"
              aria-label="Nomor WhatsApp bisnis (tanpa kode negara)"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <p
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Digunakan untuk notifikasi pemesanan via WhatsApp.
          </p>
        </div>

        {/* Syarat & Ketentuan */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <input
            id="reg-terms"
            type="checkbox"
            name="acceptTerms"
            required
            aria-required="true"
            style={{
              marginTop: '2px',
              width: '16px',
              height: '16px',
              flexShrink: 0,
              accentColor: 'var(--color-primary-container)',
              cursor: 'pointer',
            }}
          />
          <label
            htmlFor="reg-terms"
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-on-surface-variant)',
              cursor: 'pointer',
              lineHeight: 'var(--leading-body-sm)',
            }}
          >
            Dengan mendaftar, saya menyetujui{' '}
            <a
              href="/terms"
              style={{
                color: 'var(--color-primary-container)',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Syarat & Ketentuan
            </a>{' '}
            dan{' '}
            <a
              href="/privacy"
              style={{
                color: 'var(--color-primary-container)',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Kebijakan Privasi
            </a>{' '}
            Rentivo.
          </label>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
