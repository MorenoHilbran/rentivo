'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, Info, Package, Tag } from 'lucide-react'

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

function DetailRow({ Icon, label, value, bg, color, mono, fullWidth }) {
  return (
    <div style={{
      display: 'flex', gap: 12, borderRadius: 11,
      border: '1px solid var(--color-outline-variant)',
      background: 'var(--color-surface-container-low)',
      padding: '14px 16px',
      ...(fullWidth ? { gridColumn: '1 / -1' } : {}),
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color }}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>{label}</div>
        <div style={{ marginTop: 4, fontSize: 13.5, fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  )
}

const STATUS_TABS = [
  { id: 'all',         label: 'Semua' },
  { id: 'available',   label: 'Tersedia' },
  { id: 'rented',      label: 'Disewa' },
  { id: 'checking',    label: 'Dicek' },
  { id: 'maintenance', label: 'Servis' },
]

const STATUS_MAP = {
  available:   { label: 'Tersedia', tone: 'success' },
  rented:      { label: 'Disewa',   tone: 'warning' },
  checking:    { label: 'Dicek',    tone: 'info' },
  maintenance: { label: 'Servis',  tone: 'error' },
}

export default function InventoryListClient({ units }) {
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = units.filter((u) => {
    const term = searchQuery.toLowerCase()
    const matchSearch = u.unitCode.toLowerCase().includes(term) ||
      (u.serialNumber && u.serialNumber.toLowerCase().includes(term)) ||
      (u.productName && u.productName.toLowerCase().includes(term))
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.id] = t.id === 'all' ? units.length : units.filter(u => u.status === t.id).length
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--color-on-surface-variant)', opacity: 0.5,
          }} />
          <input
            type="text"
            placeholder="Cari kode, SN, atau produk…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 13 }}
          />
        </div>
        <FilterTabs tabs={STATUS_TABS} active={statusFilter} counts={counts} onChange={setStatusFilter} />
      </div>

      {/* ── Table ── */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Kode Unit</th>
              <th>Produk</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Kondisi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-on-surface-variant)' }}>
                  {searchQuery || statusFilter !== 'all' ? 'Tidak ada unit yang cocok.' : 'Belum ada data inventaris.'}
                </td>
              </tr>
            ) : filtered.map((u) => {
              const sm = STATUS_MAP[u.status] || { label: u.status, tone: 'neutral' }
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.unitCode}</div>
                    {u.serialNumber && <div style={{ fontSize: 11.5, color: 'var(--color-on-surface-variant)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>SN: {u.serialNumber}</div>}
                  </td>
                  <td style={{ fontWeight: 500 }}>{u.productName ?? '—'}</td>
                  <td><StatusPill tone={sm.tone}>{sm.label}</StatusPill></td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setSelectedUnit(u)} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                      <Info size={14} /> Detail
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Unit Detail Modal ── */}
      <Modal
        isOpen={selectedUnit !== null}
        onClose={() => setSelectedUnit(null)}
        title="Detail Unit"
        size="sm"
        footer={<button onClick={() => setSelectedUnit(null)} className="btn btn-secondary btn-sm">Tutup</button>}
      >
        {selectedUnit && (() => {
          const sm = STATUS_MAP[selectedUnit.status] || { label: selectedUnit.status, tone: 'neutral' }
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
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>Kode Unit</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 800, color: 'var(--color-on-surface)', marginTop: 3 }}>{selectedUnit.unitCode}</div>
                </div>
                <StatusPill tone={sm.tone}>{sm.label}</StatusPill>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <DetailRow Icon={Package} label="Produk" value={selectedUnit.productName || '—'} bg="rgba(15,118,110,0.08)" color="#0f766e" fullWidth />
                {selectedUnit.serialNumber && (
                  <DetailRow Icon={Tag} label="Serial Number" value={selectedUnit.serialNumber} bg="rgba(2,132,199,0.08)" color="#0284c7" mono fullWidth />
                )}
              </div>

              {/* Condition notes */}
              <div style={{
                display: 'flex', gap: 12, borderRadius: 11,
                border: '1px solid var(--color-outline-variant)',
                background: 'var(--color-surface-container-low)', padding: '14px 16px',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>
                  <Info size={16} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Kondisi Fisik</div>
                  <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedUnit.condition || 'Kondisi baik, tidak ada kerusakan.'}
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
