import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Pemesanan | Rentivo' }

export default function BookingsPage() {
  return (
    <SectionPage
      title="Pemesanan"
      description="Pantau booking aktif, draft, dan riwayat pemesanan yang dibuat dari AI atau manual."
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Belum ada booking</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Booking akan muncul setelah draft disetujui dan inventory berhasil dialokasikan.</p>
        </>
      }
    />
  )
}