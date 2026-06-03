import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, Notice } from '@/components/ManagementUI'
import { updateTenantSettingsAction } from '../actions'
import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { eq } from 'drizzle-orm'
import { Settings, Phone, MessageSquare, ShieldAlert } from 'lucide-react'

export const metadata = { title: 'Pengaturan | Rentivo' }

export default async function SettingsPage({ searchParams: searchParamsPromise }) {
  const { tenantId } = await requireTenantAuth()

  // Fetch current tenant details
  let tenant = null
  try {
    tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    })
  } catch (e) {
    console.error('Settings page DB fetch error:', e)
  }

  const searchParams = await searchParamsPromise
  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  const defaultTemplate = `Halo! Selamat datang di Rentivo. Silakan isi format berikut untuk melakukan pemesanan:

Nama Penyewa: [Nama Anda]
Produk: [Nama Produk, cth: Sony A7 III]
Jumlah Unit: [Jumlah, cth: 1]
Waktu Sewa: [Hari/Jam, cth: 3 hari]
Tanggal Mulai: [Format YYYY-MM-DD, cth: 2026-06-10]
Catatan: [Catatan Anda]`

  return (
    <SectionPage
      title="Pengaturan"
      description="Kelola profil workspace, integrasi nomor WhatsApp bisnis, dan preferensi template auto-reply AI Rentivo."
      highlights={[
        { kicker: 'Workspace', title: 'Konfigurasi dasar tenant', description: 'Profil bisnis, alamat, kota, dan nama workspace Anda.' },
        { kicker: 'WhatsApp', title: 'Setup Nomor WA', description: 'Koneksikan nomor telepon Anda agar AI Copilot dapat beroperasi.', badge: 'WhatsApp' },
        { kicker: 'AI Template', title: 'Format Otomatis', description: 'Template format booking yang dikirim saat penyewa melakukan chat.' },
      ]}
    >
      {feedbackMessage ? (
        <Notice tone={feedbackKey === 'error' ? 'error' : 'success'} title={feedbackKey === 'error' ? 'Gagal menyimpan' : 'Berhasil'} message={feedbackMessage} />
      ) : null}

      <div className="grid gap-lg lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-lg">
          {/* Workspace Settings */}
          <FormCard title="Profil Workspace & Bisnis" description="Atur nama usaha penyewaan Anda, alamat, dan kota operasional.">
            <form action={updateTenantSettingsAction} className="space-y-4">
              <GridForm>
                <Field 
                  label="Nama Bisnis / Workspace" 
                  name="name" 
                  defaultValue={tenant?.name ?? ''} 
                  placeholder="Contoh: Moreno Rental Kamera" 
                />
                <Field 
                  label="Kota Operasional" 
                  name="city" 
                  defaultValue={tenant?.city ?? ''} 
                  placeholder="Contoh: Bandung" 
                  required={false}
                />
                <div className="md:col-span-2">
                  <Field 
                    label="Nomor WhatsApp Bisnis" 
                    name="phoneNumber" 
                    defaultValue={tenant?.phoneNumber ?? ''} 
                    placeholder="Contoh: +628123456789" 
                    hint="Penyewa akan menghubungi nomor ini untuk melakukan pemesanan via AI."
                  />
                </div>
                <div className="md:col-span-2">
                  <TextareaField 
                    label="Alamat Bisnis" 
                    name="address" 
                    defaultValue={tenant?.address ?? ''} 
                    placeholder="Alamat lengkap toko / kantor" 
                    required={false}
                    rows={3}
                  />
                </div>
              </GridForm>
              <button type="submit" className="btn btn-primary">Simpan Pengaturan</button>
            </form>
          </FormCard>
        </div>

        {/* WhatsApp Template & Status Preview */}
        <div className="space-y-md">
          {/* Connection Status Widget */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex gap-3 items-start">
              <div className="rounded-xl p-2 bg-emerald-50 text-emerald-700">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-body-md font-semibold text-on-background">Status WhatsApp AI</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {tenant?.phoneNumber 
                    ? `Aktif & Mengintegrasikan nomor ${tenant.phoneNumber}`
                    : 'Belum terhubung. Masukkan nomor WhatsApp di form samping.'}
                </p>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    tenant?.phoneNumber ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {tenant?.phoneNumber ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Auto-Reply Template Preview */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex gap-3 items-start mb-4">
              <div className="rounded-xl p-2 bg-teal-50 text-teal-700">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-body-md font-semibold text-on-background">Template Auto-Reply AI</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Format pesan pembuka yang dikirimkan oleh AI Rentivo.</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4 border border-outline-variant/60 font-mono text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {defaultTemplate}
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-3 flex gap-1.5 items-start">
              <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
              <span>Format di atas wajib diisi penyewa agar AI dapat mengekstrak data order secara instan ke dashboard.</span>
            </p>
          </div>
        </div>
      </div>
    </SectionPage>
  )
}