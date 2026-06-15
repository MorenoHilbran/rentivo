'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, Info, Calendar, FileText, DollarSign, Trash2 } from 'lucide-react'
import { deleteReturnAction } from '@/app/(dashboard)/actions'

/* ─── Filter Tab Bar ─── */
function FilterTabs({ tabs, active, counts, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 3,
      background: 'var(--color-surface-container)',
      padding: 4, borderRadius: 10,
      border: '1px solid var(--color-outline-variant)',
      flexWrap: 'wrap',
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
            background: isActive ? 'var(--color-surface-container-lowest)' : 'transparent',
            color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
          }}>
            {tab.label}
            {counts[tab.id] > 0 && (
              <span style={{
                borderRadius: 99, padding: '1px 6px', fontSize: 10.5, fontWeight: 700,
                fontFamily: 'var(--font-mono)', lineHeight: 1.5,
                background: isActive ? 'rgba(0,92,85,0.1)' : 'var(--color-surface-container-high)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              }}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

const CONDITION_TABS = [
  { id: 'all',          label: 'Semua' },
  { id: 'good',         label: 'Bagus' },
  { id: 'minor_damage', label: 'Rusak Ringan' },
  { id: 'major_damage', label: 'Rusak Berat' },
  { id: 'lost',         label: 'Hilang' },
]

const CONDITION_MAP = {
  good:         { label: 'Bagus',       tone: 'success' },
  minor_damage: { label: 'Rusak Ringan', tone: 'warning' },
  major_damage: { label: 'Rusak Berat', tone: 'error'   },
  lost:         { label: 'Hilang',      tone: 'error'   },
}

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
}).format(Number(val || 0))

const formatDate = (d) => d
  ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

export default function ReturnListClient({ returns }) {
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pengembalian ini? Status penyewaan terkait akan dikembalikan menjadi AKTIF, dan unit fisik terkait akan diubah statusnya menjadi DISEWA kembali.')) return
    setDeleting(true)
    try {
      const res = await deleteReturnAction(id)
      if (res.ok) {
        setSelectedReturn(null)
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
  const [conditionFilter, setConditionFilter] = useState('all')

  const filtered = returns.filter((r) => {
    const term = searchQuery.toLowerCase()
    const matchSearch = r.bookingNumber && r.bookingNumber.toLowerCase().includes(term)
    const matchCondition = conditionFilter === 'all' || r.condition === conditionFilter
    return matchSearch && matchCondition
  })

  const counts = CONDITION_TABS.reduce((acc, t) => {
    acc[t.id] = t.id === 'all' ? returns.length : returns.filter(r => r.condition === t.id).length
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: 300, flex: 1 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--color-on-surface-variant)', opacity: 0.5,
          }} />
          <input
            type="text"
            placeholder="Cari nomor booking…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 13 }}
          />
        </div>
        <FilterTabs tabs={CONDITION_TABS} active={conditionFilter} counts={counts} onChange={setConditionFilter} />
      </div>

      {/* ── Table ── */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Kode Booking</th>
              <th>Waktu Pengembalian</th>
              <th>Kondisi</th>
              <th>Denda</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-on-surface-variant)' }}>
                  {searchQuery || conditionFilter !== 'all' ? 'Tidak ada pengembalian yang cocok.' : 'Belum ada data pengembalian.'}
                </td>
              </tr>
            ) : filtered.map((item) => {
              const cm = CONDITION_MAP[item.condition] || { label: item.condition, tone: 'neutral' }
              return (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13.5 }}>
                      {item.bookingNumber ?? '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-on-surface)' }}>{formatDate(item.returnedAt)}</td>
                  <td><StatusPill tone={cm.tone}>{cm.label}</StatusPill></td>
                  <td>
                    {Number(item.damageFee) > 0 ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
                        {formatRupiah(item.damageFee)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', opacity: 0.4 }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setSelectedReturn(item)} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                      <Info size={14} /> Detail
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Return Detail Modal ── */}
      <Modal
        isOpen={selectedReturn !== null}
        onClose={() => setSelectedReturn(null)}
        title="Detail Pengembalian"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              onClick={() => handleDelete(selectedReturn.id)}
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
              <Trash2 size={13.5} /> {deleting ? 'Hapus...' : 'Hapus Return'}
            </button>
            <button onClick={() => setSelectedReturn(null)} className="btn btn-secondary btn-sm">Tutup</button>
          </div>
        }
      >
        {selectedReturn && (() => {
          const cm = CONDITION_MAP[selectedReturn.condition] || { label: selectedReturn.condition, tone: 'neutral' }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--color-outline-variant)',
                margin: '-24px -24px 0', padding: '18px 24px 18px',
                background: 'var(--color-surface-container-low)',
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>Kode Booking</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 800, color: 'var(--color-on-surface)', marginTop: 3 }}>{selectedReturn.bookingNumber || '—'}</div>
                </div>
                <StatusPill tone={cm.tone}>{cm.label}</StatusPill>
              </div>

              {/* Detail grid */}
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div style={{
                  display: 'flex', gap: 12, borderRadius: 11,
                  border: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)', padding: '14px 16px',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,132,199,0.08)', color: '#0284c7' }}>
                    <Calendar size={16} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Waktu Kembali</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)' }}>{formatDate(selectedReturn.returnedAt)}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex', gap: 12, borderRadius: 11,
                  border: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)', padding: '14px 16px',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: Number(selectedReturn.damageFee) > 0 ? 'rgba(220,38,38,0.08)' : 'rgba(5,150,105,0.08)', color: Number(selectedReturn.damageFee) > 0 ? '#dc2626' : '#059669' }}>
                    <DollarSign size={16} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Biaya Kerusakan</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: Number(selectedReturn.damageFee) > 0 ? '#dc2626' : 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
                      {Number(selectedReturn.damageFee) > 0 ? formatRupiah(selectedReturn.damageFee) : 'Tidak ada'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Condition notes */}
              <div style={{
                display: 'flex', gap: 12, borderRadius: 11,
                border: '1px solid var(--color-outline-variant)',
                background: 'var(--color-surface-container-low)', padding: '14px 16px',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>
                  <FileText size={16} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Catatan Kondisi</div>
                  <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedReturn.conditionNotes || 'Tidak ada catatan kondisi khusus.'}
                  </p>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
