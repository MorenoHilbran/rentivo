'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* ─── SVG Icons (Heroicons-style, 18×18) ─── */

function IconGrid() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="6" height="6" rx="1"/>
      <rect x="10" y="2" width="6" height="6" rx="1"/>
      <rect x="2" y="10" width="6" height="6" rx="1"/>
      <rect x="10" y="10" width="6" height="6" rx="1"/>
    </svg>
  )
}

function IconInbox() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11l2.5-6.5A1 1 0 015.4 4h7.2a1 1 0 01.9.5L16 11"/>
      <path d="M2 11h4l1 2h4l1-2h4"/>
      <rect x="2" y="11" width="14" height="3" rx="1"/>
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="13" rx="1.5"/>
      <path d="M2 7h14"/>
      <path d="M6 2v2M12 2v2"/>
      <path d="M5 10h2M8 10h2M11 10h2M5 13h2M8 13h2"/>
    </svg>
  )
}

function IconPackage() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5L16 5.25v7.5L9 16.5 2 12.75V5.25L9 1.5z"/>
      <path d="M9 1.5v15M2 5.25l7 3.75 7-3.75"/>
      <path d="M5.5 3.4L12.5 7"/>
    </svg>
  )
}

function IconReceipt() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2h12v14l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L3 16V2z"/>
      <path d="M6 6h6M6 9h6M6 12h4"/>
    </svg>
  )
}

function IconReturn() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8L2 10l2 2"/>
      <path d="M2 10h9a5 5 0 000-10"/>
      <path d="M7 0a5 5 0 015 5"/>
    </svg>
  )
}

function IconPeople() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="5" r="2.5"/>
      <path d="M1 16c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
      <circle cx="13" cy="5" r="2"/>
      <path d="M17 16c0-2.5-1.8-4.3-4-4.8"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="nav-item-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5"/>
      <path d="M14.5 9a5.5 5.5 0 01-.3 1.8l1.7 1.3-1.5 2.6-2-.7a5.5 5.5 0 01-3.4 1V17H6.5v-2a5.5 5.5 0 01-1.8-.9l-2 .7-1.5-2.6L2.8 11A5.5 5.5 0 012.5 9a5.5 5.5 0 01.3-1.8L1.1 5.9l1.5-2.6 2 .7A5.5 5.5 0 016.5 3V1h3v2a5.5 5.5 0 011.8.9l2-.7 1.5 2.6-1.6 1.4a5.5 5.5 0 01.3 1.8z"/>
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

/* ─── Role-based nav item visibility config ─── */

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: IconGrid,
    roles: ['owner', 'admin'],
  },
  {
    href: '/inbox',
    label: 'Kotak Masuk',
    icon: IconInbox,
    roles: ['owner', 'admin'],
    badge: true, // shows unread count
  },
  {
    href: '/bookings',
    label: 'Pemesanan',
    icon: IconCalendar,
    roles: ['owner', 'admin'],
  },
  {
    href: '/inventory',
    label: 'Inventaris',
    icon: IconPackage,
    roles: ['owner', 'admin'],
  },
  {
    href: '/invoices',
    label: 'Invoice',
    icon: IconReceipt,
    roles: ['owner', 'admin'],
  },
  {
    href: '/returns',
    label: 'Pengembalian',
    icon: IconReturn,
    roles: ['owner', 'admin', 'staff'],
  },
  {
    href: '/customers',
    label: 'Pelanggan',
    icon: IconPeople,
    roles: ['owner', 'admin'],
  },
]

const SETTINGS_ITEMS = [
  {
    href: '/settings',
    label: 'Pengaturan',
    icon: IconSettings,
    roles: ['owner', 'admin'],
  },
]

/* ─── Unread badge (static for now) ─── */
const UNREAD_COUNT = 0

/* ─── Main Component ─── */
export default function Sidebar({ user, role, tenantName }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const canSee = (roles) => roles.includes(role)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  /* User initials for avatar */
  const initials = (user?.name ?? user?.email ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">R</div>
        <span className="sidebar-logo-text">
          {tenantName && tenantName !== 'Workspace' ? tenantName : 'Rentivo'}
        </span>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.filter((item) => canSee(item.roles)).map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <Icon />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && UNREAD_COUNT > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9999,
                    background: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary)',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  {UNREAD_COUNT > 99 ? '99+' : UNREAD_COUNT}
                </span>
              )}
            </Link>
          )
        })}

        {/* ── Settings Section ── */}
        {SETTINGS_ITEMS.some((item) => canSee(item.roles)) && (
          <>
            <div className="sidebar-section-label">Pengaturan</div>
            {SETTINGS_ITEMS.filter((item) => canSee(item.roles)).map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${active ? ' active' : ''}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* ── Footer: User Info + Logout ── */}
      <div className="sidebar-footer">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          <div className="avatar">{initials}</div>
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
            <span className="badge badge-primary" style={{ marginTop: 2 }}>
              {role === 'owner' ? 'Pemilik' : role === 'admin' ? 'Admin' : 'Staff'}
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
