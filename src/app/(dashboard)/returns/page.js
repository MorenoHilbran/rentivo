import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, SelectField, StatusPill, Notice } from '@/components/ManagementUI'
import { recordReturnAction } from '../actions'
import { db } from '@/lib/db'
import { bookings, customers, returns } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'

export const metadata = { title: 'Pengembalian | Rentivo' }

export default async function ReturnsPage({ searchParams }) {
  const { tenantId } = await requireTenantAuth()

  const bookingRows = await db
    .select({ id: bookings.id, bookingNumber: bookings.bookingNumber, status: bookings.status, customerName: customers.name })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.tenantId, tenantId))
    .orderBy(desc(bookings.createdAt))
    .limit(20)

  const returnRows = await db
    .select({ id: returns.id, returnedAt: returns.returnedAt, condition: returns.condition, damageFee: returns.damageFee, bookingNumber: bookings.bookingNumber })
    .from(returns)
    .leftJoin(bookings, eq(returns.bookingId, bookings.id))
    .where(eq(returns.tenantId, tenantId))
    .orderBy(desc(returns.createdAt))
    .limit(10)

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
              {bookingRows.map((booking) => <option key={booking.id} value={booking.id}>{booking.bookingNumber} - {booking.customerName ?? '-'}</option>)}
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

      <TableCard title="Pengembalian terbaru" description="Data return yang sudah dicatat.">
        <table className="table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Waktu</th>
              <th>Kondisi</th>
              <th>Biaya</th>
            </tr>
          </thead>
          <tbody>
            {returnRows.map((item) => (
              <tr key={item.id}>
                <td>{item.bookingNumber ?? '-'}</td>
                <td>{item.returnedAt ? new Date(item.returnedAt).toLocaleString('id-ID') : '-'}</td>
                <td><StatusPill tone={item.condition === 'good' ? 'success' : item.condition === 'minor_damage' ? 'warning' : 'error'}>{item.condition}</StatusPill></td>
                <td>{`Rp ${Number(item.damageFee ?? 0).toLocaleString('id-ID')}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </SectionPage>
  )
}