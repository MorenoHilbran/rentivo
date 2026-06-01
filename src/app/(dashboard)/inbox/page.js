import SectionPage from '@/components/SectionPage'

export const metadata = { title: 'Kotak Masuk | Rentivo' }

export default function InboxPage() {
  return (
    <SectionPage
      title="Kotak Masuk"
      description="Kelola percakapan WhatsApp sebagai salah satu sumber input, sementara data lain tetap bisa dimasukkan manual di menu terkait."
      highlights={[
        { kicker: 'WhatsApp', title: 'Intake otomatis', description: 'Pesan masuk menjadi sumber draft yang bisa direview admin.' },
        { kicker: 'Manual', title: 'Input tetap tersedia', description: 'Booking, invoice, pelanggan, dan retur tetap bisa dibuat langsung dari menu masing-masing.' },
        { kicker: 'AI', title: 'Susun draft cepat', description: 'AI membantu mengekstrak isi pesan ke struktur yang lebih rapi.' },
      ]}
      emptyState={
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Belum ada percakapan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Saat webhook WhatsApp aktif, pesan masuk akan muncul di sini dan dibuatkan draft AI secara otomatis. Input manual tetap tersedia di menu lain.</p>
        </>
      }
    />
  )
}