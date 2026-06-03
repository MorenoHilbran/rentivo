'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Eye, Calendar, User, FileText, DollarSign, Search } from 'lucide-react'

export default function BookingListClient({ bookings }) {
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBookings = bookings.filter((b) => {
    const term = searchQuery.toLowerCase()
    return (
      b.bookingNumber.toLowerCase().includes(term) ||
      (b.customerName && b.customerName.toLowerCase().includes(term))
    );
  })

  // Format IDR currency
  const formatRupiah = (val) => {
    if (!val) return 'Rp 0'
    return `Rp ${Number(val).toLocaleString('id-ID')}`
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

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-on-surface-variant" />
        </span>
        <input
          type="text"
          placeholder="Cari kode booking atau nama pelanggan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2 text-body-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
        />
      </div>

      {/* Booking Table */}
      <table className="table min-w-full divide-y divide-outline-variant">
        <thead>
          <tr>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kode Booking</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Pelanggan</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nilai Tagihan</th>
            <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
          {filteredBookings.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-body-sm text-on-surface-variant">
                Tidak ada data booking yang cocok.
              </td>
            </tr>
          ) : (
            filteredBookings.map((b) => (
              <tr 
                key={b.id}
                className="hover:bg-surface-container-low/40 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-body-md text-on-surface">{b.bookingNumber}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{formatDate(b.startDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-md text-on-surface font-medium">
                  {b.customerName ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusPill tone={b.status === 'confirmed' ? 'primary' : b.status === 'active' ? 'success' : b.status === 'completed' ? 'info' : 'neutral'}>
                    {b.status}
                  </StatusPill>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-body-md text-on-surface font-semibold">
                  {formatRupiah(b.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-body-sm font-medium">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Eye className="h-4 w-4" /> Detail
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        title="Detail Booking"
        size="md"
        footer={
          <button
            onClick={() => setSelectedBooking(null)}
            className="btn btn-secondary btn-sm"
          >
            Tutup
          </button>
        }
      >
        {selectedBooking && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Booking ID</span>
                <h3 className="font-mono text-lg font-bold text-on-background">{selectedBooking.bookingNumber}</h3>
              </div>
              <StatusPill tone={selectedBooking.status === 'confirmed' ? 'primary' : selectedBooking.status === 'active' ? 'success' : selectedBooking.status === 'completed' ? 'info' : 'neutral'}>
                {selectedBooking.status}
              </StatusPill>
            </div>

            {/* Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <User className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Pelanggan</span>
                  <span className="text-body-md text-on-surface font-semibold">{selectedBooking.customerName || '-'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <DollarSign className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Nilai Tagihan</span>
                  <span className="text-body-md text-primary font-bold">{formatRupiah(selectedBooking.totalAmount)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Mulai</span>
                  <span className="text-body-sm text-on-surface font-medium">{formatDate(selectedBooking.startDate)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Selesai</span>
                  <span className="text-body-sm text-on-surface font-medium">{formatDate(selectedBooking.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="border-t border-outline-variant pt-4">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Khusus</span>
                  <p className="text-body-sm text-on-surface-variant mt-1 bg-surface-container-low p-3 rounded-xl border border-outline-variant/50 leading-relaxed break-words whitespace-pre-wrap">
                    {selectedBooking.notes || 'Tidak ada catatan khusus.'}
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
