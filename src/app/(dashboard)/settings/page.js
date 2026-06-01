import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Pengaturan | Rentivo' }

export default function SettingsPage() {
  return (
    <SectionPage
      title="Pengaturan"
      description="Kelola profil workspace, integrasi WhatsApp, dan preferensi aplikasi."
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Pengaturan siap diisi</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Halaman ini menjadi tempat konfigurasi tenant dan integrasi lanjutan.</p>
        </>
      }
    />
  )
}