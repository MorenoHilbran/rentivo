import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Inventaris | Rentivo' }

export default function InventoryPage() {
  return (
    <SectionPage
      title="Inventaris"
      description="Daftar unit fisik, status ketersediaan, dan kondisi terkini aset rental."
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Belum ada unit inventaris</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Tambahkan produk dan unit fisik untuk mulai menerima booking.</p>
        </>
      }
    />
  )
}