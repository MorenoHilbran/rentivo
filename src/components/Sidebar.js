'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastProvider'
import {
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  Package,
  ReceiptText,
  RotateCcw,
  Users,
  Settings2,
  LogOut,
  LifeBuoy,
} from 'lucide-react'

/* ─── Role-based nav item visibility config ─── */
const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',     Icon: LayoutDashboard, roles: ['owner', 'admin'] },
  { href: '/inbox',      label: 'Kotak Masuk',   Icon: MessageSquare,   roles: ['owner', 'admin'] },
  { href: '/bookings',   label: 'Pemesanan',      Icon: CalendarDays,    roles: ['owner', 'admin'] },
  { href: '/inventory',  label: 'Inventaris',     Icon: Package,         roles: ['owner', 'admin'] },
  { href: '/invoices',   label: 'Invoice',        Icon: ReceiptText,     roles: ['owner', 'admin'] },
  { href: '/returns',    label: 'Pengembalian',   Icon: RotateCcw,       roles: ['owner', 'admin', 'staff'] },
  { href: '/customers',  label: 'Pelanggan',      Icon: Users,           roles: ['owner', 'admin'] },
]

const SETTINGS_ITEMS = [
  { href: '/settings', label: 'Pengaturan', Icon: Settings2, roles: ['owner', 'admin'] },
  { href: '/tickets', label: 'Tiket Bantuan', Icon: LifeBuoy, roles: ['owner', 'admin'] },
]

/* ─── Main Component ─── */
export default function Sidebar({ user, role, tenantName, tenantId }) {
  const pathname = usePathname()
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    if (!tenantId) return

    const supabase = createClient()

    // 1. Subscribe to Bookings inserts
    const bookingsChannel = supabase
      .channel(`global-bookings-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const newBooking = payload.new
          addToast({
            title: 'Pemesanan Baru!',
            message: `Booking ${newBooking.booking_number} berhasil dibuat.`,
            tone: 'success',
          })
          router.refresh()
        }
      )
      .subscribe()

    // 2. Subscribe to Customers inserts
    const customersChannel = supabase
      .channel(`global-customers-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customers',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const newCustomer = payload.new
          addToast({
            title: 'Pelanggan Baru!',
            message: `Pelanggan ${newCustomer.name} berhasil ditambahkan.`,
            tone: 'success',
          })
          router.refresh()
        }
      )
      .subscribe()

    // 3. Subscribe to Invoices inserts
    const invoicesChannel = supabase
      .channel(`global-invoices-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invoices',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const newInvoice = payload.new
          addToast({
            title: 'Invoice Diterbitkan!',
            message: `Invoice ${newInvoice.invoice_number} berhasil dibuat.`,
            tone: 'info',
          })
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(customersChannel)
      supabase.removeChannel(invoicesChannel)
    }
  }, [tenantId, router, addToast])

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

  const displayName = user?.name ?? user?.email ?? 'User'
  const roleLabel = role === 'owner' ? 'Pemilik' : role === 'admin' ? 'Admin' : 'Staff'
  const tenantDisplay = tenantName && tenantName !== 'Workspace' ? tenantName : 'Rentivo'

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          {tenantDisplay.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="sidebar-logo-text">{tenantDisplay}</span>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--color-on-surface-variant)',
            opacity: 0.45,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginTop: 2,
            lineHeight: 1,
          }}>
            CRM Suite
          </div>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu Utama</div>

        {NAV_ITEMS.filter((item) => canSee(item.roles)).map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
                className="nav-item-icon"
                style={{ opacity: active ? 1 : undefined }}
              />
              <span style={{ flex: 1 }}>{label}</span>
            </Link>
          )
        })}

        {/* ── Settings Section ── */}
        {SETTINGS_ITEMS.some((item) => canSee(item.roles)) && (
          <>
            <div className="sidebar-section-separator" />
            <div className="sidebar-section-label">Konfigurasi</div>
            {SETTINGS_ITEMS.filter((item) => canSee(item.roles)).map(({ href, label, Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-item${active ? ' active' : ''}`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                    className="nav-item-icon"
                    style={{ opacity: active ? 1 : undefined }}
                  />
                  <span>{label}</span>
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
            gap: 10,
            padding: '8px 6px 10px',
          }}
        >
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--color-on-surface)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}>
              {displayName}
            </div>
            <div style={{
              fontSize: 11,
              color: 'var(--color-on-surface-variant)',
              opacity: 0.65,
              marginTop: 2,
              lineHeight: 1.3,
            }}>
              {roleLabel}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm btn-full"
          onClick={handleLogout}
          style={{ justifyContent: 'flex-start', gap: 7, opacity: 0.7, paddingLeft: 10 }}
        >
          <LogOut size={14} strokeWidth={1.8} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
