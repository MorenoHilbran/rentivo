'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { updateBookingStatusAction, deleteBookingAction } from '@/app/(dashboard)/actions'
import {
  LayoutGrid,
  Table2,
  Search,
  Eye,
  Calendar,
  User,
  FileText,
  DollarSign,
  ArrowRight,
  Truck,
  RotateCcw,
  Trash2,
  Layers,
} from 'lucide-react'

const STATUS_LABELS = {
  draft: 'Draft',
  confirmed: 'Dikonfirmasi',
  active: 'Aktif',
  returning: 'Pengembalian',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const COLUMNS = [
  { id: 'draft',     label: 'Draft',         accent: '#f97316', bg: 'rgba(249,115,22,0.05)',  text: '#9a3412' },
  { id: 'confirmed', label: 'Dikonfirmasi',  accent: '#0f766e', bg: 'rgba(15,118,110,0.05)', text: '#134e4a' },
  { id: 'active',    label: 'Aktif',         accent: '#0284c7', bg: 'rgba(2,132,199,0.05)',  text: '#0c4a6e' },
  { id: 'returning', label: 'Pengembalian',  accent: '#d97706', bg: 'rgba(217,119,6,0.05)',  text: '#92400e' },
  { id: 'completed', label: 'Selesai',       accent: '#059669', bg: 'rgba(5,150,105,0.05)',  text: '#064e3b' },
]

function formatRupiah(val) {
  if (!val) return 'Rp 0'
  return `Rp ${Number(val).toLocaleString('id-ID')}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getStatusTone(status) {
  return { confirmed: 'primary', active: 'success', completed: 'info', returning: 'warning', cancelled: 'error' }[status] || 'neutral'
}

/* ─── Filter / Toggle Pill ─── */
function TogglePill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
        border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
        background: active ? 'var(--color-surface-container-lowest)' : 'transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

export default function BookingKanbanClient({ bookings }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [viewMode, setViewMode] = useState('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data booking ini secara permanen? Semua data invoice dan returns terkait juga akan dihapus.')) return
    setDeleting(true)
    try {
      const res = await deleteBookingAction(id)
      if (res.ok) {
        setSelectedBooking(null)
        addToast({ title: 'Booking Dihapus', message: 'Data booking berhasil dibersihkan', tone: 'success' })
        router.refresh()
      } else {
        addToast({ title: 'Gagal Menghapus', message: res.error || 'Terjadi kesalahan', tone: 'error' })
      }
    } catch (err) {
      addToast({ title: 'Error', message: String(err), tone: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const filtered = bookings.filter((b) => {
    const term = searchQuery.toLowerCase()
    return b.bookingNumber.toLowerCase().includes(term) || (b.customerName && b.customerName.toLowerCase().includes(term))
  })

  async function transitionStatus(bookingId, nextStatus, label) {
    setUpdatingId(bookingId)
    try {
      const res = await updateBookingStatusAction(bookingId, nextStatus)
      if (res.ok) {
        addToast({ title: 'Status Diperbarui', message: `Dipindahkan ke ${label}`, tone: 'success' })
        router.refresh()
      }
    } catch (err) {
      addToast({ title: 'Gagal', message: String(err), tone: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--color-on-surface-variant)', opacity: 0.5,
          }} />
          <input
            type="text"
            placeholder="Cari kode booking atau nama pelanggan…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 13 }}
          />
        </div>

        {/* View toggle */}
        <div style={{
          display: 'flex', gap: 3, background: 'var(--color-surface-container)',
          padding: 4, borderRadius: 10, border: '1px solid var(--color-outline-variant)',
        }}>
          <TogglePill active={viewMode === 'kanban'} onClick={() => setViewMode('kanban')}>
            <LayoutGrid size={14} /> Kanban
          </TogglePill>
          <TogglePill active={viewMode === 'table'} onClick={() => setViewMode('table')}>
            <Table2 size={14} /> Tabel
          </TogglePill>
        </div>
      </div>

      {/* ── Status summary pills ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COLUMNS.map((col) => {
          const count = filtered.filter(b => b.status === col.id).length
          return (
            <div key={col.id} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 8, padding: '5px 12px',
              fontSize: 12, fontWeight: 500,
              color: count > 0 ? col.text : 'var(--color-on-surface-variant)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: 9999,
                background: count > 0 ? col.accent : 'var(--color-outline-variant)',
                flexShrink: 0,
              }} />
              {col.label}
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', opacity: count > 0 ? 1 : 0.4 }}>
                {count}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Kanban Board ── */}
      {viewMode === 'kanban' ? (
        <div style={{
          display: 'grid', gap: 18,
          gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))',
          overflowX: 'auto', paddingBottom: 8,
        }}>
          {COLUMNS.map((col) => {
            const colItems = filtered.filter(b => b.status === col.id)
            return (
              <div key={col.id} style={{
                borderRadius: 16, border: '1px solid var(--color-outline-variant)',
                borderTop: `3px solid ${col.accent}`, background: col.bg,
                padding: '18px 14px 18px', minHeight: 440,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {/* Column header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: col.text }}>
                    {col.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--color-on-surface-variant)', opacity: 0.7,
                    background: 'var(--color-surface-container)', padding: '1px 7px', borderRadius: 6, fontWeight: 700,
                  }}>
                    {colItems.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {colItems.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '28px 8px', fontSize: 11.5,
                      color: 'var(--color-on-surface-variant)', opacity: 0.45,
                      border: '1px dashed var(--color-outline-variant)',
                      borderRadius: 10, marginTop: 6,
                    }}>
                      Kosong
                    </div>
                  ) : colItems.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        borderRadius: 12, border: '1px solid var(--color-outline-variant)',
                        background: 'var(--color-surface-container-lowest)',
                        padding: '16px 16px', boxShadow: 'var(--shadow-sm)',
                        transition: 'box-shadow 150ms, transform 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: 'var(--color-on-surface)' }}>
                          {b.bookingNumber}
                        </span>
                        <button
                          onClick={() => setSelectedBooking(b)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: 7, border: 'none',
                            background: 'transparent', cursor: 'pointer',
                            color: 'var(--color-on-surface-variant)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Eye size={13} />
                        </button>
                      </div>

                      <div style={{ marginTop: 7, fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.customerName ?? '—'}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
                        {new Date(b.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>

                      <div style={{
                        marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8,
                        borderTop: '1px solid var(--color-surface-container)', paddingTop: 10,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Tagihan</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--color-primary)' }}>
                            {formatRupiah(b.totalAmount)}
                          </span>
                        </div>

                        {col.id === 'confirmed' && (
                          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                            <button onClick={() => transitionStatus(b.id, 'active', 'Aktif')} disabled={updatingId === b.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 12px',
                              fontSize: 11, fontWeight: 700, borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em',
                              border: '1px solid rgba(15,118,110,0.25)', background: 'rgba(15,118,110,0.08)', color: '#134e4a', cursor: 'pointer',
                              opacity: updatingId === b.id ? 0.5 : 1, flex: 1, transition: 'all 150ms ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,118,110,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,118,110,0.08)'}
                            >
                              Mulai Sewa
                            </button>
                            <button onClick={() => {
                              if (confirm('Apakah Anda yakin ingin membatalkan penyewaan ini?')) {
                                transitionStatus(b.id, 'cancelled', 'Dibatalkan')
                              }
                            }} disabled={updatingId === b.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 12px',
                              fontSize: 11, fontWeight: 700, borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em',
                              border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#b91c1c', cursor: 'pointer',
                              opacity: updatingId === b.id ? 0.5 : 1, flex: 1, transition: 'all 150ms ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                            >
                              Batal
                            </button>
                          </div>
                        )}
                        {col.id === 'active' && (
                          <button onClick={() => transitionStatus(b.id, 'returning', 'Pengembalian')} disabled={updatingId === b.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 12px',
                            fontSize: 11, fontWeight: 700, borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em',
                            border: '1px solid rgba(2,132,199,0.25)', background: 'rgba(2,132,199,0.08)', color: '#0c4a6e', cursor: 'pointer',
                            opacity: updatingId === b.id ? 0.5 : 1, width: '100%', transition: 'all 150ms ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(2,132,199,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(2,132,199,0.08)'}
                          >
                            Proses Kembali <RotateCcw size={13} strokeWidth={2.2} />
                          </button>
                        )}
                        {col.id === 'returning' && (
                          <button onClick={() => router.push('/returns')} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 12px',
                            fontSize: 11, fontWeight: 700, borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em',
                            border: '1px solid rgba(217,119,6,0.25)', background: 'rgba(217,119,6,0.08)', color: '#92400e', cursor: 'pointer',
                            width: '100%', transition: 'all 150ms ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,119,6,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,119,6,0.08)'}
                          >
                            Catat Kondisi <ArrowRight size={13} strokeWidth={2.2} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Table View ── */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Kode Booking</th>
                <th>Pelanggan</th>
                <th>Status</th>
                <th>Nilai Tagihan</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-on-surface-variant)' }}>
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              ) : filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{b.bookingNumber}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 3 }}>{formatDate(b.startDate)}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{b.customerName ?? '—'}</td>
                  <td><StatusPill tone={getStatusTone(b.status)}>{STATUS_LABELS[b.status] || b.status}</StatusPill></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatRupiah(b.totalAmount)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setSelectedBooking(b)} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                      <Eye size={14} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Booking Detail Modal ── */}
      <Modal
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        title="Detail Booking"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedBooking?.status === 'confirmed' && (
                <button
                  onClick={async () => {
                    if (confirm('Apakah Anda yakin ingin membatalkan penyewaan ini?')) {
                      const bId = selectedBooking.id
                      setSelectedBooking(null)
                      await transitionStatus(bId, 'cancelled', 'Dibatalkan')
                    }
                  }}
                  disabled={updatingId === selectedBooking.id}
                  className="btn btn-error btn-sm"
                >
                  Batal Sewa
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedBooking.id)}
                disabled={deleting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 150ms ease',
                  background: 'transparent', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.25)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Trash2 size={13.5} /> {deleting ? 'Hapus...' : 'Hapus'}
              </button>
            </div>
            <button onClick={() => setSelectedBooking(null)} className="btn btn-secondary btn-sm">Tutup</button>
          </div>
        }
      >
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Banner header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-outline-variant)',
              margin: '-24px -24px 0', padding: '18px 24px 18px',
              background: 'var(--color-surface-container-low)',
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>Booking ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.01em', marginTop: 3 }}>{selectedBooking.bookingNumber}</div>
              </div>
              <StatusPill tone={getStatusTone(selectedBooking.status)}>
                {STATUS_LABELS[selectedBooking.status] || selectedBooking.status}
              </StatusPill>
            </div>

            {/* Detail grid */}
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              {[
                { Icon: User,      label: 'Pelanggan',     value: selectedBooking.customerName || '—',   bg: 'rgba(15,118,110,0.08)',  color: '#0f766e' },
                { Icon: DollarSign, label: 'Nilai Tagihan', value: formatRupiah(selectedBooking.totalAmount), bg: 'rgba(5,150,105,0.08)', color: '#059669', mono: true, accent: true },
                { Icon: Calendar,  label: 'Tanggal Mulai', value: formatDate(selectedBooking.startDate), bg: 'rgba(2,132,199,0.08)',   color: '#0284c7' },
                { Icon: Calendar,  label: 'Tanggal Selesai', value: formatDate(selectedBooking.endDate), bg: 'rgba(217,119,6,0.08)',  color: '#d97706' },
              ].map(({ Icon, label, value, bg, color, mono, accent }) => (
                <div key={label} style={{
                  display: 'flex', gap: 12, borderRadius: 11,
                  border: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)', padding: '14px 16px',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: bg, color,
                  }}>
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>{label}</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: accent ? 'var(--color-primary)' : 'var(--color-on-surface)', fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rented Units Info */}
            {selectedBooking.items && selectedBooking.items.length > 0 && (
              <div style={{
                display: 'flex', gap: 12, borderRadius: 11,
                border: '1px solid var(--color-outline-variant)',
                background: 'var(--color-surface-container-low)', padding: '14px 16px',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(99, 102, 241, 0.08)', color: '#6366f1'
                }}>
                  <Layers size={16} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Unit yang Disewa</div>
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedBooking.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <span>{item.productName}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--color-surface-container)', padding: '2px 6px', borderRadius: 4, color: 'var(--color-on-surface-variant)', fontWeight: 700 }}>
                          {item.unitCode}
                        </span>
                        {item.serialNumber && (
                          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', opacity: 0.8 }}>
                            (S/N: {item.serialNumber})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Catatan Khusus</div>
                <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {selectedBooking.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
