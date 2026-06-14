'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Globe, LogOut, LifeBuoy, BarChart3 } from 'lucide-react'

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
          <Globe size={18} strokeWidth={1.8} className="nav-item-icon" />
          <span>Semua Tenant</span>
        </Link>
        <Link
          href="/superadmin/tickets"
          className={`nav-item${pathname === '/superadmin/tickets' ? ' active' : ''}`}
        >
          <LifeBuoy size={18} strokeWidth={1.8} className="nav-item-icon" />
          <span>Tiket Bantuan</span>
        </Link>
        <Link
          href="/superadmin/master"
          className={`nav-item${pathname === '/superadmin/master' ? ' active' : ''}`}
        >
          <BarChart3 size={18} strokeWidth={1.8} className="nav-item-icon" />
          <span>Statistik & Master</span>
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
          <LogOut size={14} strokeWidth={1.8} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
