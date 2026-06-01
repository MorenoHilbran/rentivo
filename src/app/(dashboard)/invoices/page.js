import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Invoice | Rentivo' }

export default function InvoicesPage() {
  return (
    <SectionPage
      title="Invoice"
      description="Lihat status tagihan, pembayaran masuk, dan invoice yang belum lunas."
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Belum ada invoice</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Invoice dibuat otomatis saat booking disetujui atau bisa ditagih manual.</p>
        </>
      }
    />
  )
}