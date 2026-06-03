'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, Eye, Filter, Info } from 'lucide-react'

export default function InventoryListClient({ units }) {
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUnits = units.filter((u) => {
    const term = searchQuery.toLowerCase()
    const matchesSearch = 
      u.unitCode.toLowerCase().includes(term) ||
      (u.serialNumber && u.serialNumber.toLowerCase().includes(term)) ||
      (u.productName && u.productName.toLowerCase().includes(term))

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusTone = (status) => {
    switch (status) {
      case 'available': return 'success'
      case 'rented': return 'warning'
      case 'checking': return 'info'
      case 'maintenance': return 'error'
      default: return 'neutral'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Tersedia (Available)'
      case 'rented': return 'Disewa (Rented)'
      case 'checking': return 'Pengecekan (Checking)'
      case 'maintenance': return 'Perbaikan (Maintenance)'
      default: return status
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Tabs bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-on-surface-variant" />
          </span>
          <input
            type="text"
            placeholder="Cari kode, SN, atau produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2 text-body-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/60">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'available', label: 'Tersedia' },
            { id: 'rented', label: 'Disewa' },
            { id: 'checking', label: 'Dicek' },
            { id: 'maintenance', label: 'Servis' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === tab.id
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
      <table className="table min-w-full divide-y divide-outline-variant">
        <thead>
          <tr>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kode Unit</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Produk</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
            <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kondisi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
          {filteredUnits.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-body-sm text-on-surface-variant">
                Tidak ada unit inventaris yang cocok.
              </td>
            </tr>
          ) : (
            filteredUnits.map((u) => (
              <tr 
                key={u.id}
                className="hover:bg-surface-container-low/40 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-body-md text-on-surface">{u.unitCode}</div>
                  {u.serialNumber ? (
                    <div className="text-xs text-on-surface-variant mt-0.5 font-mono">SN: {u.serialNumber}</div>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-md text-on-surface font-medium">
                  {u.productName ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusPill tone={getStatusTone(u.status)}>
                    {u.status}
                  </StatusPill>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-body-sm font-medium">
                  <button
                    onClick={() => setSelectedUnit(u)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Info className="h-4 w-4" /> Kondisi
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Condition detail modal */}
      <Modal
        isOpen={selectedUnit !== null}
        onClose={() => setSelectedUnit(null)}
        title="Catatan Kondisi Unit"
        size="sm"
        footer={
          <button
            onClick={() => setSelectedUnit(null)}
            className="btn btn-secondary btn-sm"
          >
            Tutup
          </button>
        }
      >
        {selectedUnit && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Kode Unit</span>
              <h3 className="font-mono text-base font-bold text-on-background">{selectedUnit.unitCode}</h3>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Produk</span>
              <p className="text-body-md text-on-surface font-semibold">{selectedUnit.productName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status Aset</span>
              <div className="mt-1">
                <StatusPill tone={getStatusTone(selectedUnit.status)}>
                  {getStatusLabel(selectedUnit.status)}
                </StatusPill>
              </div>
            </div>
            <div className="border-t border-outline-variant pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Detail Kondisi Fisik</span>
              <p className="text-body-sm text-on-surface-variant mt-1.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/60 leading-relaxed break-words whitespace-pre-wrap">
                {selectedUnit.condition || 'Kondisi bagus, tidak ada cacat atau kerusakan yang dilaporkan.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
