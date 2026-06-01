import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Kotak Masuk | Rentivo' }

export default function InboxPage() {
  return (
    <SectionPage
      title="Kotak Masuk"
      description="Kelola percakapan WhatsApp dan status tindak lanjut dari satu tempat."
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Belum ada percakapan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Saat webhook WhatsApp aktif, pesan masuk akan muncul di sini dan dibuatkan draft AI secara otomatis.</p>
        </>
      }
    />
  )
}