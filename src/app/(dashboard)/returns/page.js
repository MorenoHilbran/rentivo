import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, SelectField, Notice } from '@/components/ManagementUI'
import { recordReturnAction } from '../actions'
import { db } from '@/lib/db'
import { bookings, customers, returns } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'
import ReturnListClient from '@/components/ReturnListClient'

export const metadata = { title: 'Pengembalian' }

export default async function ReturnsPage({ searchParams: searchParamsPromise }) {
  const { tenantId } = await requireTenantAuth()

  const bookingRows = await db
    .select({ id: bookings.id, bookingNumber: bookings.bookingNumber, status: bookings.status, customerName: customers.name })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.tenantId, tenantId))
    .orderBy(desc(bookings.createdAt))
    .limit(30) // increased booking rows for dropdown selection to 30

  const returnRows = await db
    .select({ 
      id: returns.id, 
      returnedAt: returns.returnedAt, 
      condition: returns.condition, 
      conditionNotes: returns.conditionNotes, // added conditionNotes field
      damageFee: returns.damageFee, 
      bookingNumber: bookings.bookingNumber 
    })
    .from(returns)
    .leftJoin(bookings, eq(returns.bookingId, bookings.id))
    .where(eq(returns.tenantId, tenantId))
    .orderBy(desc(returns.createdAt))
    .limit(30) // increased list limit to 30 for richer data display

  const searchParams = await searchParamsPromise
  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  return (
    <SectionPage
      title="Pengembalian"
      description="Proses check-in barang, catatan kondisi, dan biaya kerusakan bila ada. Alurnya tetap bisa dicatat manual."
      highlights={[
        { kicker: 'Manual', title: 'Check-in langsung', description: 'Staff bisa mencatat kondisi barang saat unit kembali ke gudang.' },
        { kicker: 'Workflow', title: 'Denda dan kondisi', description: 'Kerusakan ringan, berat, atau kehilangan tetap dicatat di tahap ini.', badge: 'Audit' },
        { kicker: 'AI', title: 'Tidak wajib dipakai', description: 'AI tidak perlu berada di jalur retur jika proses manual sudah cukup.' },
      ]}
    >
      {feedbackMessage ? (
        <Notice tone={feedbackKey === 'error' ? 'error' : 'success'} title={feedbackKey === 'error' ? 'Gagal menyimpan' : 'Berhasil'} message={feedbackMessage} />
      ) : null}
      
      <FormCard title="Catat pengembalian" description="Proses check-in dan kondisi barang disimpan di sini.">
        <form action={recordReturnAction} className="space-y-4">
          <GridForm>
            <SelectField label="Booking" name="bookingId">
              <option value="">Pilih booking</option>
              {bookingRows.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.bookingNumber} - {booking.customerName ?? '-'}
                </option>
              ))}
            </SelectField>
            <Field label="Waktu kembali" name="returnedAt" type="datetime-local" />
            <SelectField label="Kondisi" name="condition" defaultValue="good">
              <option value="good">Good</option>
              <option value="minor_damage">Minor damage</option>
              <option value="major_damage">Major damage</option>
              <option value="lost">Lost</option>
            </SelectField>
            <Field label="Biaya kerusakan" name="damageFee" type="number" min="0" step="1000" defaultValue="0" />
          </GridForm>
          <TextareaField label="Catatan kondisi" name="conditionNotes" required={false} placeholder="Contoh: body mulus, lensa sedikit baret" />
          <button type="submit" className="btn btn-primary">Simpan pengembalian</button>
        </form>
      </FormCard>

      <TableCard title="Daftar Pengembalian Unit" description="Klik 'Detail' untuk melihat jam pengembalian, kondisi lengkap, dan biaya denda kerusakan.">
        <ReturnListClient returns={returnRows} />
      </TableCard>
    </SectionPage>
  )
}