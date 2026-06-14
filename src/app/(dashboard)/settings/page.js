import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, Notice } from '@/components/ManagementUI'
import { updateTenantSettingsAction, addTeamMemberAction } from '../actions'
import { db } from '@/lib/db'
import { tenants, tenantMembers } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { eq } from 'drizzle-orm'
import { Settings, MessageCircle, Sparkles, ShieldAlert } from 'lucide-react'
import TeamManagementClient from '@/components/TeamManagementClient'

export const metadata = { title: 'Pengaturan | Rentivo' }

export default async function SettingsPage({ searchParams: searchParamsPromise }) {
  const { user, tenantId, role } = await requireTenantAuth(['owner', 'admin'])

  // Fetch current tenant details
  let tenant = null
  try {
    tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    })
  } catch (e) {
    console.error('Settings page DB fetch error:', e)
  }

  // Fetch tenant members
  let members = []
  try {
    members = await db.query.tenantMembers.findMany({
      where: eq(tenantMembers.tenantId, tenantId),
      orderBy: (m, { desc }) => desc(m.createdAt),
    })
  } catch (e) {
    console.error('Settings page DB members fetch error:', e)
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
      description="Kelola profil workspace, integrasi nomor WhatsApp bisnis, preferensi template auto-reply AI, dan anggota tim."
      highlights={[
        { kicker: 'Workspace', title: 'Konfigurasi dasar tenant', description: 'Profil bisnis, alamat, kota, dan nama workspace Anda.' },
        { kicker: 'WhatsApp', title: 'Setup Nomor WA', description: 'Koneksikan nomor telepon Anda agar AI Copilot dapat beroperasi.', badge: 'WhatsApp' },
        { kicker: 'AI Template', title: 'Format Otomatis', description: 'Template format booking yang dikirim saat penyewa melakukan chat.' },
        { kicker: 'Team', title: 'Kelola Tim / Staff', description: 'Atur peran Owner, Admin, dan Staff operasional workspace Anda.' },
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
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2" style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                  <h4 className="text-body-md font-bold text-on-background" style={{ marginBottom: '12.5px', fontSize: '13.5px', color: 'var(--color-primary)' }}>💳 Informasi Rekening Pembayaran</h4>
                </div>
                <Field 
                  label="Nama Bank" 
                  name="bankName" 
                  defaultValue={tenant?.bankName ?? ''} 
                  placeholder="Contoh: BCA, Mandiri, BRI" 
                  required={false}
                />
                <Field 
                  label="Nomor Rekening" 
                  name="bankAccountNumber" 
                  defaultValue={tenant?.bankAccountNumber ?? ''} 
                  placeholder="Contoh: 1234567890" 
                  required={false}
                />
                <div className="md:col-span-2">
                  <Field 
                    label="Nama Pemilik Rekening" 
                    name="bankAccountName" 
                    defaultValue={tenant?.bankAccountName ?? ''} 
                    placeholder="Contoh: Moreno Hilbran" 
                    required={false}
                  />
                </div>

                <div className="md:col-span-2" style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                  <h4 className="text-body-md font-bold text-on-background" style={{ marginBottom: '12.5px', fontSize: '13.5px', color: 'var(--color-primary)' }}>🤖 Kustomisasi Auto-Reply AI</h4>
                </div>
                <div className="md:col-span-2">
                  <TextareaField 
                    label="Template Format Pemesanan WhatsApp" 
                    name="bookingTemplate" 
                    defaultValue={tenant?.bookingTemplate ?? ''} 
                    placeholder={`Contoh:\nHalo! Selamat datang di Moreno Rental. Silakan lengkapi format ini:\n\nNama Penyewa:\nProduk:\nJumlah Unit:\nWaktu Sewa:\nTanggal Mulai:`} 
                    required={false}
                    rows={6}
                    hint="Kosongkan untuk menggunakan template bawaan sistem."
                  />
                </div>
              </GridForm>
              <button type="submit" className="btn btn-primary">Simpan Pengaturan</button>
            </form>
          </FormCard>
        </div>

        {/* WhatsApp Template & Status Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Connection Status Widget */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div className="rounded-xl p-3 flex items-center justify-center" style={{ background: tenant?.phoneNumber ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: tenant?.phoneNumber ? '#10b981' : '#ef4444' }}>
                <MessageCircle className="h-5 w-5" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="text-body-md font-bold text-on-background" style={{ margin: 0, fontSize: '14px' }}>Status WhatsApp AI</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mt-1 border ${
                  tenant?.phoneNumber 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tenant?.phoneNumber ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${tenant?.phoneNumber ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </span>
                  {tenant?.phoneNumber ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--color-on-surface-variant)', opacity: 0.75 }}>Nomor Integrasi</span>
                <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{tenant?.phoneNumber || 'Belum diatur'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--color-on-surface-variant)', opacity: 0.75 }}>Mode Auto-Reply</span>
                <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{tenant?.phoneNumber ? 'Aktif (AI Copilot)' : 'Nonaktif'}</span>
              </div>
            </div>
          </div>

          {/* AI Auto-Reply Template Preview */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="rounded-xl p-2 bg-teal-50 text-teal-700" style={{ display: 'flex', alignItems: 'center', justify: 'center' }}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-body-md font-bold text-on-background" style={{ margin: 0, fontSize: '14px' }}>Preview Pesan Pembuka AI</h3>
                <p className="text-xs text-on-surface-variant mt-0.5" style={{ margin: 0 }}>Pesan otomatis yang dikirimkan sistem ke WhatsApp penyewa.</p>
              </div>
            </div>

            {/* Mock WhatsApp Chat Screen */}
            <div style={{
              background: '#efeae2',
              backgroundImage: 'radial-gradient(#dfdcd6 1.2px, transparent 0)',
              backgroundSize: '12px 12px',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)',
            }}>
              {/* Chat Bubble */}
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                borderTopLeftRadius: '0px',
                padding: '12px',
                maxWidth: '90%',
                alignSelf: 'flex-start',
                position: 'relative',
                boxShadow: '0 1.5px 1px rgba(0,0,0,0.12)',
                fontSize: '12px',
                color: '#111b21',
                lineHeight: '1.5',
              }}>
                {/* Message bubble tail */}
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  top: '0px',
                  width: '0px',
                  height: '0px',
                  borderStyle: 'solid',
                  borderWidth: '0 8px 10px 0',
                  borderColor: 'transparent #ffffff transparent transparent',
                }} />

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'pre-wrap', color: '#111b21', letterSpacing: '-0.01em' }}>
                  {tenant?.bookingTemplate || `Halo! Selamat datang di ${tenant?.name || 'Rentivo'}. Silakan isi format berikut untuk melakukan pemesanan:

Nama Penyewa: [Nama Anda]
Produk: [Nama Produk, cth: Sony A7 III Body]
Jumlah Unit: [Jumlah, cth: 1]
Waktu Sewa: [Hari/Jam, cth: 3 hari]
Tanggal Mulai: [Format YYYY-MM-DD, cth: 2026-06-10]
Catatan: [Catatan Anda]`}
                </div>

                <div style={{
                  fontSize: '9px',
                  color: '#667781',
                  textAlign: 'right',
                  marginTop: '6px',
                  fontFamily: 'sans-serif',
                  fontWeight: 500
                }}>
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--color-surface-container-low)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-outline-variant)' }}>
              <ShieldAlert className="h-4 w-4 text-primary shrink-0" style={{ marginTop: '2.5px' }} />
              <p style={{ fontSize: '11.5px', color: 'var(--color-on-surface-variant)', lineHeight: '1.5', margin: 0, opacity: 0.9 }}>
                Penyewa wajib menyalin dan melengkapi format di atas agar asisten AI dapat mendeteksi, mengekstrak, dan membuat draft pemesanan secara otomatis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TeamManagementClient 
        members={members} 
        currentSupabaseUserId={user.id} 
        isOwner={role === 'owner'} 
        addTeamMemberAction={addTeamMemberAction}
      />
    </SectionPage>
  )
}