'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/ManagementUI'
import Modal from '@/components/Modal'
import { Search, Eye, Phone, Mail, MapPin, User, FileText, ShoppingBag, DollarSign } from 'lucide-react'

export default function CustomerListClient({ customers }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phoneNumber && c.phoneNumber.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-on-surface-variant" />
        </span>
        <input
          type="text"
          placeholder="Cari nama, nomor telepon, atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2 text-body-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-outline"
        />
      </div>

      {/* Table */}
      <table className="table min-w-full divide-y divide-outline-variant">
        <thead>
          <tr>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nama</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kontak</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
            <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-body-sm text-on-surface-variant">
                Tidak ada data pelanggan yang cocok.
              </td>
            </tr>
          ) : (
            filteredCustomers.map((c) => (
              <tr 
                key={c.id}
                className="hover:bg-surface-container-low/40 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-body-md text-on-surface font-semibold">
                  {c.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-sm text-on-surface">
                  <div>{c.phoneNumber}</div>
                  {c.email ? <div className="text-xs text-on-surface-variant mt-0.5">{c.email}</div> : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusPill tone="primary">
                    Manual Ready
                  </StatusPill>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-body-sm font-medium">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Eye className="h-4 w-4" /> Profil
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Profile Detail Modal */}
      <Modal
        isOpen={selectedCustomer !== null}
        onClose={() => setSelectedCustomer(null)}
        title="Profil Pelanggan (CRM)"
        size="md"
        footer={
          <button
            onClick={() => setSelectedCustomer(null)}
            className="btn btn-secondary btn-sm"
          >
            Tutup
          </button>
        }
      >
        {selectedCustomer && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-800 text-lg font-bold border border-teal-200/50">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-on-background">{selectedCustomer.name}</h3>
                <span className="text-xs text-on-surface-variant">{selectedCustomer.phoneNumber}</span>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-2">
                <Phone className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Telepon</span>
                  <span className="text-body-sm text-on-surface font-medium">{selectedCustomer.phoneNumber}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Mail className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Email</span>
                  <span className="text-body-sm text-on-surface font-medium">{selectedCustomer.email || '-'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <ShoppingBag className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Transaksi</span>
                  <span className="text-body-sm text-on-surface font-semibold">{selectedCustomer.totalBookings || 0} order</span>
                </div>
              </div>

              <div className="flex gap-2">
                <DollarSign className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Belanja</span>
                  <span className="text-body-sm text-primary font-bold">{formatRupiah(selectedCustomer.totalSpent)}</span>
                </div>
              </div>

              <div className="flex gap-2 sm:col-span-2">
                <MapPin className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Alamat</span>
                  <span className="text-body-sm text-on-surface leading-relaxed">{selectedCustomer.address || 'Alamat belum diisi.'}</span>
                </div>
              </div>
            </div>

            {/* Note details */}
            <div className="border-t border-outline-variant pt-4">
              <div className="flex gap-2">
                <FileText className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Internal CRM</span>
                  <p className="text-body-sm text-on-surface-variant mt-1.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/60 leading-relaxed break-words whitespace-pre-wrap">
                    {selectedCustomer.notes || 'Tidak ada catatan internal untuk pelanggan ini.'}
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
