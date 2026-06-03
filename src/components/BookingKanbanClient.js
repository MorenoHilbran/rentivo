'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { updateBookingStatusAction } from '@/app/(dashboard)/actions'
import { 
  LayoutGrid, 
  Table, 
  Search, 
  Eye, 
  Calendar, 
  User, 
  FileText, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Truck,
  RotateCcw
} from 'lucide-react'

export default function BookingKanbanClient({ bookings }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'table'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((b) => {
    const term = searchQuery.toLowerCase()
    return (
      b.bookingNumber.toLowerCase().includes(term) ||
      (b.customerName && b.customerName.toLowerCase().includes(term))
    )
  })

  // Format currency
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

  // Handle columns transition
  async function transitionStatus(bookingId, nextStatus, label) {
    setUpdatingId(bookingId)
    try {
      const res = await updateBookingStatusAction(bookingId, nextStatus)
      if (res.ok) {
        addToast({
          title: 'Status Diperbarui',
          message: `Booking berhasil dipindahkan ke status ${label}`,
          tone: 'success',
        })
        router.refresh()
      }
    } catch (err) {
      addToast({
        title: 'Gagal memperbarui',
        message: String(err),
        tone: 'error',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Columns definition for Kanban Board
  const columns = [
    { id: 'draft', label: 'Draft', color: 'border-t-orange-400 bg-orange-50/10', text: 'text-orange-800' },
    { id: 'confirmed', label: 'Dikonfirmasi', color: 'border-t-teal-400 bg-teal-50/10', text: 'text-teal-800' },
    { id: 'active', label: 'Aktif (Disewa)', color: 'border-t-sky-400 bg-sky-50/10', text: 'text-sky-800' },
    { id: 'returning', label: 'Pengembalian', color: 'border-t-amber-400 bg-amber-50/10', text: 'text-amber-800' },
    { id: 'completed', label: 'Selesai', color: 'border-t-emerald-400 bg-emerald-50/10', text: 'text-emerald-800' },
  ]

  return (
    <div className="space-y-4">
      {/* Search & Toggle Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-on-surface-variant" />
          </span>
          <input
            type="text"
            placeholder="Cari kode booking / nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2 text-body-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/60">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'kanban'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'table'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Table className="h-3.5 w-3.5" /> Tabel
          </button>
        </div>
      </div>

      {/* Render Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colBookings = filteredBookings.filter((b) => b.status === col.id)
            return (
              <div 
                key={col.id}
                className={`rounded-2xl border-t-2 border border-outline-variant/60 p-3 min-h-[400px] flex flex-col gap-3 ${col.color}`}
              >
                {/* Column Title */}
                <div className="flex justify-between items-center px-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.text}`}>{col.label}</span>
                  <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-bold">
                    {colBookings.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {colBookings.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-on-surface-variant/75 border border-dashed border-outline-variant/50 rounded-xl">
                      Kosong
                    </div>
                  ) : (
                    colBookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-xs font-bold text-on-background">{b.bookingNumber}</span>
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition"
                            title="Detail"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-2 text-body-sm font-semibold text-on-surface truncate">
                          {b.customerName ?? '-'}
                        </div>

                        <div className="mt-1 text-[10px] text-on-surface-variant">
                          Mulai: {new Date(b.startDate).toLocaleDateString('id-ID')}
                        </div>

                        <div className="mt-2 flex justify-between items-center border-t border-outline-variant/40 pt-2">
                          <span className="font-mono text-xs font-bold text-primary">{formatRupiah(b.totalAmount)}</span>
                          
                          {/* Column Action buttons */}
                          {col.id === 'confirmed' && (
                            <button
                              onClick={() => transitionStatus(b.id, 'active', 'Aktif')}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-teal-200 hover:bg-teal-100 transition flex items-center gap-0.5"
                            >
                              Sewa <Truck className="h-3 w-3" />
                            </button>
                          )}
                          {col.id === 'active' && (
                            <button
                              onClick={() => transitionStatus(b.id, 'returning', 'Pengembalian')}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 bg-sky-50 text-sky-800 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-sky-200 hover:bg-sky-100 transition flex items-center gap-0.5"
                            >
                              Kembali <RotateCcw className="h-3 w-3" />
                            </button>
                          )}
                          {col.id === 'returning' && (
                            <button
                              onClick={() => router.push('/returns')}
                              className="px-2 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-200 hover:bg-amber-100 transition flex items-center gap-0.5"
                            >
                              Catat <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Render Table View */
        <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
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
        </div>
      )}

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
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 bg-surface-container-low/20 -mx-6 -mt-6 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Booking ID</span>
                <h3 className="font-mono text-xl font-bold text-on-background tracking-tight">{selectedBooking.bookingNumber}</h3>
              </div>
              <StatusPill tone={selectedBooking.status === 'confirmed' ? 'primary' : selectedBooking.status === 'active' ? 'success' : selectedBooking.status === 'completed' ? 'info' : 'neutral'}>
                {selectedBooking.status}
              </StatusPill>
            </div>

            {/* Details Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4 transition hover:bg-surface-container-low/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200/50">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pelanggan</span>
                  <span className="mt-1 block text-body-md text-on-surface font-semibold">{selectedBooking.customerName || '-'}</span>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4 transition hover:bg-surface-container-low/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nilai Tagihan</span>
                  <span className="mt-1 block text-body-md text-primary font-bold">{formatRupiah(selectedBooking.totalAmount)}</span>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4 transition hover:bg-surface-container-low/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-200/50">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Mulai</span>
                  <span className="mt-1 block text-body-sm text-on-surface font-medium">{formatDate(selectedBooking.startDate)}</span>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4 transition hover:bg-surface-container-low/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/50">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Selesai</span>
                  <span className="mt-1 block text-body-sm text-on-surface font-medium">{formatDate(selectedBooking.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low/30 p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 border border-slate-200/50">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Khusus</span>
                  <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed break-words whitespace-pre-wrap">
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
