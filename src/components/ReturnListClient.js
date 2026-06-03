'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, Info, Calendar, FileText, DollarSign } from 'lucide-react'

export default function ReturnListClient({ returns }) {
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [conditionFilter, setConditionFilter] = useState('all')

  const filteredReturns = returns.filter((r) => {
    const term = searchQuery.toLowerCase()
    const matchesSearch = 
      r.bookingNumber && r.bookingNumber.toLowerCase().includes(term)

    const matchesCondition = conditionFilter === 'all' || r.condition === conditionFilter

    return matchesSearch && matchesCondition
  })

  // Format currency
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(val || 0))
  }

  // Format date range nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getConditionTone = (cond) => {
    switch (cond) {
      case 'good': return 'success'
      case 'minor_damage': return 'warning'
      case 'major_damage': return 'error'
      case 'lost': return 'error'
      default: return 'neutral'
    }
  }

  const getConditionLabel = (cond) => {
    switch (cond) {
      case 'good': return 'Bagus (Good)'
      case 'minor_damage': return 'Rusak Ringan (Minor Damage)'
      case 'major_damage': return 'Rusak Berat (Major Damage)'
      case 'lost': return 'Hilang (Lost)'
      default: return cond
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-on-surface-variant" />
          </span>
          <input
            type="text"
            placeholder="Cari nomor booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2 text-body-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/60">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'good', label: 'Bagus' },
            { id: 'minor_damage', label: 'Rusak Ringan' },
            { id: 'major_damage', label: 'Rusak Berat' },
            { id: 'lost', label: 'Hilang' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setConditionFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                conditionFilter === tab.id
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
        <table className="table min-w-full divide-y divide-outline-variant">
          <thead>
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kode Booking</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Waktu Pengembalian</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kondisi</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Denda</th>
              <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
            {filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-body-sm text-on-surface-variant">
                  Tidak ada data pengembalian yang cocok.
                </td>
              </tr>
            ) : (
              filteredReturns.map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-surface-container-low/40 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold text-body-md text-on-surface">
                    {item.bookingNumber ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body-sm text-on-surface">
                    {formatDate(item.returnedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusPill tone={getConditionTone(item.condition)}>
                      {item.condition}
                    </StatusPill>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-body-sm text-rose-600 font-semibold">
                    {formatRupiah(item.damageFee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-body-sm font-medium">
                    <button
                      onClick={() => setSelectedReturn(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Info className="h-4 w-4" /> Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Return Modal */}
      <Modal
        isOpen={selectedReturn !== null}
        onClose={() => setSelectedReturn(null)}
        title="Detail Pengembalian"
        size="md"
        footer={
          <button
            onClick={() => setSelectedReturn(null)}
            className="btn btn-secondary btn-sm"
          >
            Tutup
          </button>
        }
      >
        {selectedReturn && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 bg-surface-container-low/20 -mx-6 -mt-6 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Kode Booking</span>
                <h3 className="font-mono text-xl font-bold text-on-background tracking-tight">{selectedReturn.bookingNumber || '-'}</h3>
              </div>
              <StatusPill tone={getConditionTone(selectedReturn.condition)}>
                {getConditionLabel(selectedReturn.condition)}
              </StatusPill>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4 transition hover:bg-surface-container-low/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-200/50">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Waktu Kembali</span>
                  <span className="mt-1 block text-body-sm text-on-surface font-semibold">{formatDate(selectedReturn.returnedAt)}</span>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4 transition hover:bg-surface-container-low/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-200/50">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Biaya Kerusakan (Denda)</span>
                  <span className="mt-1 block text-body-sm text-rose-600 font-bold">{formatRupiah(selectedReturn.damageFee)}</span>
                </div>
              </div>
            </div>

            {/* Condition Notes */}
            <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 border border-slate-200/50">
                  <Info className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Kondisi</span>
                  <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed break-words whitespace-pre-wrap">
                    {selectedReturn.conditionNotes || 'Tidak ada catatan kondisi khusus yang dilaporkan.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
