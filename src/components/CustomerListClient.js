'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, Eye, Phone, Mail, MapPin, FileText, ShoppingBag, DollarSign } from 'lucide-react'

/* ─── Reusable detail row component ─── */
function DetailRow({ Icon, label, value, bg, color, mono, accent, fullWidth }) {
  return (
    <div style={{
      display: 'flex', gap: 12, borderRadius: 11,
      border: '1px solid var(--color-outline-variant)',
      background: 'var(--color-surface-container-low)',
      padding: '14px 16px',
      ...(fullWidth ? { gridColumn: '1 / -1' } : {}),
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, color,
      }}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>{label}</div>
        <div style={{
          marginTop: 4, fontSize: 13.5, fontWeight: 600,
          color: accent ? 'var(--color-primary)' : 'var(--color-on-surface)',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          wordBreak: 'break-word',
        }}>{value}</div>
      </div>
    </div>
  )
}

export default function CustomerListClient({ customers }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pelanggan ini? Semua data percakapan, booking, invoice, dan return terkait dengan pelanggan ini akan dihapus secara permanen!')) return
    setDeleting(true)
    try {
      const res = await deleteCustomerAction(id)
      if (res.ok) {
        setSelectedCustomer(null)
        window.location.reload()
      } else {
        alert(res.error || 'Gagal menghapus data')
      }
    } catch (err) {
      alert(String(err))
    } finally {
      setDeleting(false)
    }
  }

  const filtered = customers.filter((c) => {
    const term = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(term) ||
      (c.phoneNumber && c.phoneNumber.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
  })

  const formatDisplayPhone = (phone) => {
    if (!phone) return '—'
    return phone.split('@')[0]
  }

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(val || 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Search ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: 380, flex: 1 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--color-on-surface-variant)', opacity: 0.5,
          }} />
          <input
            type="text"
            placeholder="Cari nama, telepon, atau email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 13 }}
          />
        </div>
        {filtered.length > 0 && (
          <span style={{ fontSize: 12.5, color: 'var(--color-on-surface-variant)', whiteSpace: 'nowrap' }}>
            <strong>{filtered.length}</strong> pelanggan{searchQuery && ` untuk "${searchQuery}"`}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nama Pelanggan</th>
              <th>Kontak</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-on-surface-variant)' }}>
                  {searchQuery ? `Tidak ada pelanggan untuk "${searchQuery}"` : 'Belum ada data pelanggan.'}
                </td>
              </tr>
            ) : filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-primary))',
                      color: 'var(--color-on-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-on-surface)' }}>{c.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 13.5 }}>{formatDisplayPhone(c.phoneNumber)}</div>
                  {c.email && <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 3 }}>{c.email}</div>}
                </td>
                <td><StatusPill tone="primary">Aktif</StatusPill></td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => setSelectedCustomer(c)} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                    <Eye size={14} /> Profil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Customer Profile Modal ── */}
      <Modal
        isOpen={selectedCustomer !== null}
        onClose={() => setSelectedCustomer(null)}
        title="Profil Pelanggan"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              onClick={() => handleDelete(selectedCustomer.id)}
              disabled={deleting}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', transition: 'all 150ms ease',
                background: 'transparent', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.25)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={13.5} /> {deleting ? 'Hapus...' : 'Hapus Pelanggan'}
            </button>
            <button onClick={() => setSelectedCustomer(null)} className="btn btn-secondary btn-sm">Tutup</button>
          </div>
        }
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              borderBottom: '1px solid var(--color-outline-variant)',
              margin: '-24px -24px 0', padding: '18px 24px 18px',
              background: 'var(--color-surface-container-low)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-primary))',
                color: 'var(--color-on-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 700,
              }}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>{formatDisplayPhone(selectedCustomer.phoneNumber)}</div>
              </div>
            </div>

            {/* Detail grid */}
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <DetailRow Icon={Phone}      label="Telepon"         value={formatDisplayPhone(selectedCustomer.phoneNumber)}       bg="rgba(15,118,110,0.08)"  color="#0f766e" />
              <DetailRow Icon={Mail}       label="Email"           value={selectedCustomer.email || '—'}             bg="rgba(2,132,199,0.08)"   color="#0284c7" />
              <DetailRow Icon={ShoppingBag} label="Total Transaksi" value={`${selectedCustomer.totalBookings || 0} order`} bg="rgba(217,119,6,0.08)" color="#d97706" />
              <DetailRow Icon={DollarSign} label="Total Belanja"   value={formatRupiah(selectedCustomer.totalSpent)} bg="rgba(5,150,105,0.08)"   color="#059669" mono accent />
              <DetailRow Icon={MapPin}     label="Alamat"          value={selectedCustomer.address || 'Belum diisi.'} bg="rgba(100,116,139,0.08)" color="#64748b" fullWidth />
            </div>

            {/* Notes */}
            <div style={{
              display: 'flex', gap: 12, borderRadius: 11,
              border: '1px solid var(--color-outline-variant)',
              background: 'var(--color-surface-container-low)', padding: '14px 16px',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>
                <FileText size={16} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Catatan Internal CRM</div>
                <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedCustomer.notes || 'Tidak ada catatan internal.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
