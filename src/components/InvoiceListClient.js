'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, FileText, CheckCircle2 } from 'lucide-react'

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

const STATUS_TABS = [
  { id: 'all',       label: 'Semua' },
  { id: 'unpaid',    label: 'Belum Lunas' },
  { id: 'partial',   label: 'Sebagian' },
  { id: 'paid',      label: 'Lunas' },
  { id: 'refunded',  label: 'Refund' },
]

const STATUS_MAP = {
  paid:     { label: 'Lunas',       tone: 'success' },
  partial:  { label: 'Sebagian',    tone: 'warning' },
  unpaid:   { label: 'Belum Lunas', tone: 'error'   },
  refunded: { label: 'Dikembalikan', tone: 'neutral' },
}

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
}).format(Number(val || 0))

export default function InvoiceListClient({ invoices }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = invoices.filter((inv) => {
    const term = searchQuery.toLowerCase()
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(term) ||
      (inv.bookingNumber && inv.bookingNumber.toLowerCase().includes(term))
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.id] = t.id === 'all' ? invoices.length : invoices.filter(i => i.status === t.id).length
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
            placeholder="Cari nomor invoice atau booking…"
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
              <th>Nomor Invoice</th>
              <th>Kode Booking</th>
              <th>Status</th>
              <th>Terbayar / Total</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-on-surface-variant)' }}>
                  {searchQuery || statusFilter !== 'all' ? 'Tidak ada invoice yang cocok.' : 'Belum ada data invoice.'}
                </td>
              </tr>
            ) : filtered.map((inv) => {
              const sm = STATUS_MAP[inv.status] || { label: inv.status, tone: 'neutral' }
              const remaining = Math.max(0, Number(inv.totalAmount) - Number(inv.paidAmount))
              return (
                <tr key={inv.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{inv.invoiceNumber}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{inv.bookingNumber ?? '—'}</span>
                  </td>
                  <td><StatusPill tone={sm.tone}>{sm.label}</StatusPill></td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatRupiah(inv.paidAmount)}</span>
                      <span style={{ color: 'var(--color-on-surface-variant)', margin: '0 5px' }}>/</span>
                      <span style={{ color: 'var(--color-on-surface)' }}>{formatRupiah(inv.totalAmount)}</span>
                    </div>
                    {remaining > 0 && (
                      <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                        Sisa: {formatRupiah(remaining)}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setSelectedInvoice(inv)} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                      <FileText size={14} /> Rincian
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Invoice Detail Modal ── */}
      <Modal
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        title="Rincian Invoice"
        size="md"
        footer={<button onClick={() => setSelectedInvoice(null)} className="btn btn-secondary btn-sm">Tutup</button>}
      >
        {selectedInvoice && (() => {
          const sm = STATUS_MAP[selectedInvoice.status] || { label: selectedInvoice.status, tone: 'neutral' }
          const remaining = Math.max(0, Number(selectedInvoice.totalAmount) - Number(selectedInvoice.paidAmount))
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
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>Nomor Invoice</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 800, color: 'var(--color-on-surface)', marginTop: 3 }}>{selectedInvoice.invoiceNumber}</div>
                </div>
                <StatusPill tone={sm.tone}>{sm.label}</StatusPill>
              </div>

              {/* Booking ref */}
              {selectedInvoice.bookingNumber && (
                <div style={{
                  display: 'flex', gap: 12, borderRadius: 11,
                  border: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)', padding: '14px 16px',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,118,110,0.08)', color: '#0f766e' }}>
                    <FileText size={16} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Kode Booking</div>
                    <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}>{selectedInvoice.bookingNumber}</div>
                  </div>
                </div>
              )}

              {/* Breakdown table */}
              <div style={{ borderRadius: 12, border: '1px solid var(--color-outline-variant)', overflow: 'hidden' }}>
                <div style={{
                  padding: '11px 18px', borderBottom: '1px solid var(--color-outline-variant)',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)',
                  background: 'var(--color-surface-container-low)',
                }}>
                  Rincian Tagihan
                </div>
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Biaya Sewa', value: formatRupiah(selectedInvoice.rentalAmount) },
                    { label: 'Uang Jaminan', value: formatRupiah(selectedInvoice.depositAmount) },
                    ...(Number(selectedInvoice.damageFee) > 0 ? [{ label: 'Denda Kerusakan', value: formatRupiah(selectedInvoice.damageFee), red: true }] : []),
                  ].map(({ label, value, red }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13.5, color: red ? '#dc2626' : 'var(--color-on-surface-variant)' }}>{label}</span>
                      <span style={{ fontSize: 13.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: red ? '#dc2626' : 'var(--color-on-surface)' }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-on-surface)' }}>Total Tagihan</span>
                    <span style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-primary)' }}>{formatRupiah(selectedInvoice.totalAmount)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#059669' }}>Terbayar</span>
                    <span style={{ fontSize: 13.5, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>{formatRupiah(selectedInvoice.paidAmount)}</span>
                  </div>

                  {remaining > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--color-outline-variant)', paddingTop: 12 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626' }}>Sisa Tagihan</span>
                      <span style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#dc2626' }}>{formatRupiah(remaining)}</span>
                    </div>
                  )}

                  {selectedInvoice.status === 'paid' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                      padding: '10px 16px', borderRadius: 9, marginTop: 4,
                      background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)',
                    }}>
                      <CheckCircle2 size={15} style={{ color: '#059669', flexShrink: 0 }} strokeWidth={2} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Invoice telah Lunas</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div style={{
                  display: 'flex', gap: 12, borderRadius: 11,
                  border: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)', padding: '14px 16px',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>
                    <FileText size={16} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Catatan</div>
                    <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedInvoice.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
