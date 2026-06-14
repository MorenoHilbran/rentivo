import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, SelectField, Notice } from '@/components/ManagementUI'
import { createManualBookingAction } from '../actions'
import { db } from '@/lib/db'
import { bookings, customers, invoices, products } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'
import BookingKanbanClient from '@/components/BookingKanbanClient'

export const metadata = { title: 'Pemesanan | Rentivo' }

export default async function BookingsPage({ searchParams: searchParamsPromise }) {
  const { tenantId } = await requireTenantAuth(['owner', 'admin'])

  const customerRows = await db.select().from(customers).where(eq(customers.tenantId, tenantId)).orderBy(desc(customers.createdAt)).limit(20)
  const productRows = await db.select().from(products).where(eq(products.tenantId, tenantId)).orderBy(desc(products.createdAt)).limit(20)
  
  const recentBookings = await db
    .select({ 
      id: bookings.id, 
      bookingNumber: bookings.bookingNumber, 
      status: bookings.status, 
      customerName: customers.name, 
      totalAmount: invoices.totalAmount, 
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      notes: bookings.notes,
    })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .leftJoin(invoices, eq(invoices.bookingId, bookings.id))
    .where(eq(bookings.tenantId, tenantId))
    .orderBy(desc(bookings.createdAt))
    .limit(50) // increased list limit to 50 for fuller Kanban board display

  const searchParams = await searchParamsPromise
  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  return (
    <SectionPage
      title="Pemesanan"
      description="Pantau booking aktif, draft, dan riwayat pemesanan. Gunakan Kanban Board untuk memantau siklus rental secara visual."
      highlights={[
        { kicker: 'Manual', title: 'Buat booking langsung', description: 'Input booking dari admin tetap jadi jalur utama saat data sudah lengkap.', badge: 'Utama' },
        { kicker: 'WhatsApp', title: 'Draft dari percakapan', description: 'Pesan masuk dapat diubah menjadi draft agar admin hanya perlu review.', badge: 'Opsional' },
        { kicker: 'AI', title: 'Percepat penyusunan item', description: 'AI membantu mengekstrak tanggal, item, dan catatan sebelum booking final.' },
      ]}
    >
      {feedbackMessage ? (
        <Notice tone={feedbackKey === 'error' ? 'error' : 'success'} title={feedbackKey === 'error' ? 'Gagal menyimpan' : 'Berhasil'} message={feedbackMessage} />
      ) : null}
      
      <FormCard title="Buat booking manual" description="Booking, invoice, dan alokasi unit dibuat sekaligus dari form ini.">
        <form action={createManualBookingAction} className="space-y-4">
          <GridForm>
            <SelectField label="Pelanggan" name="customerId">
              <option value="">Pilih pelanggan</option>
              {customerRows.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phoneNumber?.split('@')[0]}
                </option>
              ))}
            </SelectField>
            <SelectField label="Produk" name="productId">
              <option value="">Pilih produk</option>
              {productRows.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </SelectField>
            <Field label="Jumlah unit" name="quantity" type="number" min="1" defaultValue="1" />
            <SelectField label="Pricing unit" name="pricingUnit" defaultValue="daily">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </SelectField>
            <Field label="Tanggal mulai" name="startDate" type="datetime-local" />
            <Field label="Tanggal selesai" name="endDate" type="datetime-local" />
          </GridForm>
          <TextareaField label="Catatan booking" name="notes" placeholder="Contoh: pengiriman jam 10 pagi" required={false} />
          <button type="submit" className="btn btn-primary">Simpan booking manual</button>
        </form>
      </FormCard>

      <TableCard title="Jadwal & Antrian Pemesanan (Kanban)" description="Klik toggle 'Tabel' atau 'Kanban' di sebelah kanan untuk mengubah format tampilan list.">
        <BookingKanbanClient bookings={recentBookings} />
      </TableCard>
    </SectionPage>
  )
}