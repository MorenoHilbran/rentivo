import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Pelanggan | Rentivo' }

export default function CustomersPage() {
  return (
    <SectionPage
      title="Pelanggan"
      description="Kartu pelanggan, riwayat transaksi, dan informasi kontak utama."
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Belum ada pelanggan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pelanggan akan muncul saat ada percakapan masuk atau booking pertama dibuat.</p>
        </>
      }
    />
  )
}