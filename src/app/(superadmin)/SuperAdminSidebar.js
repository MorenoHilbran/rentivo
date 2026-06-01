'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function IconGlobe() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7"/>
      <path d="M2.5 9h13M9 2c-2.5 0-4.5 3-4.5 7s2 7 4.5 7 4.5-3 4.5-7-2-7-4.5-7z"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15, flexShrink: 0 }}>
      <path d="M7 3H3a1 1 0 00-1 1v10a1 1 0 001 1h4"/>
      <path d="M12 13l4-4-4-4M16 9H7"/>
    </svg>
  )
}

export default function SuperAdminSidebar({ user }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const initials = (user?.name ?? user?.email ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark" style={{ background: 'var(--color-error)' }}>S</div>
        <span className="sidebar-logo-text">
          Rentivo <span>Admin</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        <Link
          href="/superadmin"
          className={`nav-item${pathname === '/superadmin' ? ' active' : ''}`}
        >
          <IconGlobe />
          <span>Semua Tenant</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          <div className="avatar" style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name ?? user?.email}
            </div>
            <span className="badge badge-error" style={{ marginTop: 2 }}>
              SuperAdmin
            </span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm btn-full"
          onClick={handleLogout}
          style={{ justifyContent: 'flex-start', gap: 'var(--space-xs)' }}
        >
          <IconLogout />
          Keluar
        </button>
      </div>
    </aside>
  )
}
