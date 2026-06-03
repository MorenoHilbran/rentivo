'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, Info, DollarSign, FileText, CheckCircle } from 'lucide-react'

export default function InvoiceListClient({ invoices }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchQuery.toLowerCase()
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(term) ||
      (inv.bookingNumber && inv.bookingNumber.toLowerCase().includes(term))

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter

    return matchesSearch && matchesStatus
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

  const getStatusTone = (status) => {
    switch (status) {
      case 'paid': return 'success'
      case 'partial': return 'warning'
      case 'unpaid': return 'error'
      case 'refunded': return 'neutral'
      default: return 'neutral'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Lunas (Paid)'
      case 'partial': return 'Sebagian (Partial)'
      case 'unpaid': return 'Belum Lunas (Unpaid)'
      case 'refunded': return 'Dikembalikan (Refunded)'
      default: return status
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
            placeholder="Cari nomor invoice / booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2 text-body-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/60">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'unpaid', label: 'Belum Lunas' },
            { id: 'partial', label: 'Sebagian' },
            { id: 'paid', label: 'Lunas' },
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
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nomor Invoice</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kode Booking</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Terbayar / Total</th>
            <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
          {filteredInvoices.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-body-sm text-on-surface-variant">
                Tidak ada data invoice yang cocok.
              </td>
            </tr>
          ) : (
            filteredInvoices.map((inv) => (
              <tr 
                key={inv.id}
                className="hover:bg-surface-container-low/40 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-body-md text-on-surface">
                  {inv.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-md font-mono text-on-surface">
                  {inv.bookingNumber ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusPill tone={getStatusTone(inv.status)}>
                    {inv.status}
                  </StatusPill>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-body-sm text-on-surface">
                  <span className="font-semibold text-primary">{formatRupiah(inv.paidAmount)}</span>
                  <span className="text-on-surface-variant"> / {formatRupiah(inv.totalAmount)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-body-sm font-medium">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Info className="h-4 w-4" /> Rincian
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        title="Rincian Invoice & Tagihan"
        size="md"
        footer={
          <button
            onClick={() => setSelectedInvoice(null)}
            className="btn btn-secondary btn-sm"
          >
            Tutup
          </button>
        }
      >
        {selectedInvoice && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nomor Invoice</span>
                <h3 className="font-mono text-lg font-bold text-on-background">{selectedInvoice.invoiceNumber}</h3>
              </div>
              <StatusPill tone={getStatusTone(selectedInvoice.status)}>
                {getStatusLabel(selectedInvoice.status)}
              </StatusPill>
            </div>

            {/* Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-2">
                <FileText className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nomor Booking</span>
                  <span className="text-body-md text-on-surface font-mono font-semibold">{selectedInvoice.bookingNumber || '-'}</span>
                </div>
              </div>
            </div>

            {/* Fees Breakdowns */}
            <div className="border-t border-b border-outline-variant py-4 my-2 space-y-2">
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Rincian Pembayaran</span>
              
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Biaya Sewa (Rental Fee)</span>
                <span className="font-mono">{formatRupiah(selectedInvoice.rentalAmount)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Uang Jaminan (Deposit)</span>
                <span className="font-mono">{formatRupiah(selectedInvoice.depositAmount)}</span>
              </div>
              {Number(selectedInvoice.damageFee) > 0 && (
                <div className="flex justify-between text-body-sm text-rose-600 font-medium">
                  <span>Denda Kerusakan (Damage Fee)</span>
                  <span className="font-mono">{formatRupiah(selectedInvoice.damageFee)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-outline-variant/60 pt-2 text-body-md font-bold text-on-background">
                <span>Total Tagihan</span>
                <span className="font-mono text-primary">{formatRupiah(selectedInvoice.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-body-sm font-semibold text-emerald-700 pt-1">
                <span>Jumlah Terbayar</span>
                <span className="font-mono">{formatRupiah(selectedInvoice.paidAmount)}</span>
              </div>

              <div className="flex justify-between text-body-sm font-bold text-rose-700 pt-1 border-t border-dashed border-outline-variant/40">
                <span>Sisa Tagihan</span>
                <span className="font-mono">
                  {formatRupiah(Math.max(0, Number(selectedInvoice.totalAmount) - Number(selectedInvoice.paidAmount)))}
                </span>
              </div>
            </div>

            {/* Note details */}
            {selectedInvoice.notes && (
              <div>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Tambahan</span>
                <p className="text-body-sm text-on-surface-variant mt-1.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/60 leading-relaxed break-words whitespace-pre-wrap">
                  {selectedInvoice.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
