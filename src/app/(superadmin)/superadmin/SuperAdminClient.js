'use client'

import { useState } from 'react'
import Modal from '@/components/Modal'
import { FormCard, Field, TextareaField, SelectField, GridForm, StatusPill } from '@/components/ManagementUI'
import { createTenantWorkspaceAction, updateSubscriptionAction, toggleTenantStatus } from './actions'
import { Plus, Search, Settings, ShieldAlert } from 'lucide-react'

export default function SuperAdminClient({ tenants = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubOpen, setIsSubOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)

  const filteredTenants = tenants.filter((tenant) => {
    const term = searchQuery.toLowerCase()
    return (
      tenant.name.toLowerCase().includes(term) ||
      tenant.slug.toLowerCase().includes(term) ||
      (tenant.phoneNumber && tenant.phoneNumber.includes(term))
    )
  })

  const openSubscriptionModal = (tenant) => {
    setSelectedTenant(tenant)
    setIsSubOpen(true)
  }

  const getPlanTone = (plan) => {
    switch (plan) {
      case 'enterprise': return 'error'
      case 'pro': return 'info'
      case 'basic': return 'primary'
      default: return 'neutral'
    }
  }

  const getStatusTone = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'trial': return 'warning'
      case 'expired': return 'error'
      case 'unpaid': return 'error'
      default: return 'neutral'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search & Actions toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '320px', flex: 1 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--color-on-surface-variant)', opacity: 0.5,
          }} />
          <input
            type="text"
            placeholder="Cari nama workspace atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 13 }}
          />
        </div>

        {/* Add Workspace Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          Tambah Workspace
        </button>
      </div>

      {/* Workspace List Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Workspace</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Plan / Paket</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Status Langganan</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Masa Berlaku</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Status Akses</th>
                <th style={{ textAlign: 'right', padding: '16px 20px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{tenant.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                      Slug: <span style={{ fontFamily: 'monospace', background: 'var(--color-surface-container-low)', padding: '2px 4px', borderRadius: '4px' }}>{tenant.slug}</span>
                    </div>
                    {tenant.phoneNumber && (
                      <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                        WA: {tenant.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <StatusPill tone={getPlanTone(tenant.planType)}>
                      {tenant.planType.toUpperCase()}
                    </StatusPill>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <StatusPill tone={getStatusTone(tenant.subscriptionStatus)}>
                      {tenant.subscriptionStatus.toUpperCase()}
                    </StatusPill>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                    {tenant.subscriptionExpiresAt ? (
                      new Date(tenant.subscriptionExpiresAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    ) : (
                      <span style={{ color: 'var(--color-on-surface-variant)', opacity: 0.5 }}>Selamanya</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge ${
                      tenant.status === 'active' ? 'badge-success' : 'badge-error'
                    }`}>
                      {tenant.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {/* Subscription update btn */}
                      <button
                        onClick={() => openSubscriptionModal(tenant)}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Settings size={14} />
                        Langganan
                      </button>

                      {/* Toggle status btn */}
                      <form action={toggleTenantStatus}>
                        <input type="hidden" name="tenantId" value={tenant.id} />
                        <input type="hidden" name="currentStatus" value={tenant.status} />
                        <button
                          type="submit"
                          className={`btn btn-sm ${tenant.status === 'suspended' ? 'btn-primary' : 'btn-danger'}`}
                        >
                          {tenant.status === 'suspended' ? 'Aktifkan' : 'Suspend'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-on-surface-variant)' }}>
                    Belum ada workspace yang cocok atau terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Workspace */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Workspace & Owner Baru"
        size="lg"
      >
        <form action={createTenantWorkspaceAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '12px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '6px' }}>
              Informasi Bisnis / Tenant
            </h3>
            <GridForm>
              <Field
                label="Nama Bisnis / Workspace"
                name="businessName"
                placeholder="Contoh: Java Rental Bandung"
                required={true}
              />
              <Field
                label="WhatsApp Bisnis"
                name="phoneNumber"
                placeholder="Contoh: +628123456789"
                required={false}
              />
              <Field
                label="Kota"
                name="city"
                placeholder="Contoh: Bandung"
                required={false}
              />
              <div style={{ gridColumn: 'span 2' }}>
                <TextareaField
                  label="Alamat Lengkap"
                  name="address"
                  placeholder="Alamat toko atau kantor operasional..."
                  required={false}
                  rows={2}
                />
              </div>
            </GridForm>
          </div>

          <div style={{ marginTop: '10px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '12px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '6px' }}>
              Akun Owner / Pemilik
            </h3>
            <GridForm>
              <Field
                label="Nama Lengkap Owner"
                name="ownerName"
                placeholder="Contoh: Budi Santoso"
                required={true}
              />
              <Field
                label="Email Login"
                name="email"
                type="email"
                placeholder="Contoh: budi@gmail.com"
                required={true}
              />
              <div style={{ gridColumn: 'span 2' }}>
                <Field
                  label="Password Default"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  required={true}
                />
              </div>
            </GridForm>
          </div>

          <div style={{ marginTop: '10px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '12px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '6px' }}>
              Konfigurasi Langganan Awal
            </h3>
            <GridForm>
              <SelectField
                label="Paket Layanan"
                name="planType"
                defaultValue="basic"
                required={true}
              >
                <option value="basic">Basic Plan</option>
                <option value="pro">Pro Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </SelectField>

              <SelectField
                label="Status Billing"
                name="subscriptionStatus"
                defaultValue="trial"
                required={true}
              >
                <option value="trial">Trial (Uji Coba)</option>
                <option value="active">Active (Aktif Berbayar)</option>
                <option value="unpaid">Unpaid (Belum Dibayar)</option>
                <option value="expired">Expired (Kedaluwarsa)</option>
              </SelectField>

              <div style={{ gridColumn: 'span 2' }}>
                <Field
                  label="Tanggal Kedaluwarsa Langganan"
                  name="subscriptionExpiresAt"
                  type="date"
                  required={false}
                  hint="Kosongkan jika ingin masa aktif tanpa batas waktu (selamanya)."
                />
              </div>
            </GridForm>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Buat Workspace
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Subscription */}
      <Modal
        isOpen={isSubOpen}
        onClose={() => setIsSubOpen(false)}
        title={selectedTenant ? `Kelola Langganan: ${selectedTenant.name}` : 'Kelola Langganan'}
        size="md"
      >
        {selectedTenant && (
          <form action={updateSubscriptionAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="hidden" name="tenantId" value={selectedTenant.id} />

            <GridForm>
              <SelectField
                label="Paket Layanan"
                name="planType"
                defaultValue={selectedTenant.planType}
                required={true}
              >
                <option value="basic">Basic Plan</option>
                <option value="pro">Pro Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </SelectField>

              <SelectField
                label="Status Billing"
                name="subscriptionStatus"
                defaultValue={selectedTenant.subscriptionStatus}
                required={true}
              >
                <option value="trial">Trial (Uji Coba)</option>
                <option value="active">Active (Aktif Berbayar)</option>
                <option value="unpaid">Unpaid (Belum Dibayar)</option>
                <option value="expired">Expired (Kedaluwarsa)</option>
              </SelectField>

              <div style={{ gridColumn: 'span 2' }}>
                <Field
                  label="Masa Berlaku Hingga"
                  name="subscriptionExpiresAt"
                  type="date"
                  defaultValue={selectedTenant.subscriptionExpiresAt ? new Date(selectedTenant.subscriptionExpiresAt).toISOString().split('T')[0] : ''}
                  required={false}
                  hint="Kosongkan jika ingin masa aktif tanpa batas waktu (selamanya)."
                />
              </div>
            </GridForm>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsSubOpen(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
