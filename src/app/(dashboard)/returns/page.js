import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Pengembalian | Rentivo' }

export default function ReturnsPage() {
  return (
    <SectionPage
      title="Pengembalian"
      description="Proses check-in barang, catatan kondisi, dan biaya kerusakan bila ada."
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Belum ada pengembalian</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pengembalian aktif akan ditampilkan di sini ketika booking masuk ke tahap returning.</p>
        </>
      }
    />
  )
}