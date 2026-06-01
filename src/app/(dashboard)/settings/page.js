import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Pengaturan | Rentivo' }

export default function SettingsPage() {
  return (
    <SectionPage
      title="Pengaturan"
      description="Kelola profil workspace, integrasi WhatsApp, dan preferensi otomasi AI tanpa menghilangkan alur manual."
      highlights={[
        { kicker: 'Workspace', title: 'Konfigurasi dasar tenant', description: 'Profil bisnis, kontak, dan preferensi workspace diatur dari sini.' },
        { kicker: 'Integrasi', title: 'WhatsApp dan AI', description: 'Aktifkan hanya jika dibutuhkan, bukan sebagai syarat memakai sistem.' },
        { kicker: 'Kontrol', title: 'Manual-first tetap aman', description: 'Semua otomasi harus tetap memberi ruang review dan input manual.' },
      ]}
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Pengaturan siap diisi</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Halaman ini menjadi tempat konfigurasi tenant, integrasi WhatsApp, dan preferensi otomasi lanjutan.</p>
        </>
      }
    />
  )
}