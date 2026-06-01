import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, SelectField, StatusPill, Notice } from '@/components/ManagementUI'
import { recordInvoicePaymentAction } from '../actions'
import { db } from '@/lib/db'
import { bookings, invoices } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'

export const metadata = { title: 'Invoice | Rentivo' }

export default async function InvoicesPage({ searchParams }) {
  const { tenantId } = await requireTenantAuth()

  const invoiceRows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      totalAmount: invoices.totalAmount,
      paidAmount: invoices.paidAmount,
      bookingNumber: bookings.bookingNumber,
    })
    .from(invoices)
    .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
    .where(eq(invoices.tenantId, tenantId))
    .orderBy(desc(invoices.createdAt))
    .limit(12)

  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  return (
    <SectionPage
      title="Invoice"
      description="Lihat status tagihan, pembayaran masuk, dan invoice yang bisa diterbitkan manual atau otomatis."
      highlights={[
        { kicker: 'Manual', title: 'Tagih kapan saja', description: 'Invoice tetap bisa diterbitkan tanpa harus menunggu otomatisasi booking.' },
        { kicker: 'Workflow', title: 'Pembayaran dan verifikasi', description: 'Status unpaid, partial, paid, dan refunded harus mudah dipantau.' },
        { kicker: 'AI', title: 'Meringankan input', description: 'AI hanya membantu menyiapkan data, bukan menggantikan pengecekan pembayaran.' },
      ]}
    >
      {feedbackMessage ? (
        <Notice tone={feedbackKey === 'error' ? 'error' : 'success'} title={feedbackKey === 'error' ? 'Gagal menyimpan' : 'Berhasil'} message={feedbackMessage} />
      ) : null}
      <FormCard title="Catat pembayaran invoice" description="Gunakan ini untuk menambah pembayaran masuk dan memperbarui status invoice.">
        <form action={recordInvoicePaymentAction} className="space-y-4">
          <GridForm>
            <SelectField label="Invoice" name="invoiceId">
              <option value="">Pilih invoice</option>
              {invoiceRows.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} - {invoice.bookingNumber ?? '-'}</option>)}
            </SelectField>
            <Field label="Nominal pembayaran" name="amount" type="number" min="0" step="1000" />
            <Field label="Nama bank" name="bankName" required={false} />
            <Field label="Nama akun" name="accountName" required={false} />
            <label className="block space-y-2 md:col-span-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">Verifikasi manual</span>
              <input type="checkbox" name="isVerified" defaultChecked className="h-5 w-5 rounded border-outline-variant" />
            </label>
          </GridForm>
          <TextareaField label="Catatan transfer" name="transferNote" required={false} placeholder="Contoh: pembayaran DP via transfer" />
          <button type="submit" className="btn btn-primary">Simpan pembayaran</button>
        </form>
      </FormCard>

      <TableCard title="Invoice terbaru" description="Status tagihan dan nominal yang sudah masuk.">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Booking</th>
              <th>Status</th>
              <th>Bayar / Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceRows.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.bookingNumber ?? '-'}</td>
                <td><StatusPill tone={invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'neutral'}>{invoice.status}</StatusPill></td>
                <td>{`Rp ${Number(invoice.paidAmount ?? 0).toLocaleString('id-ID')} / Rp ${Number(invoice.totalAmount ?? 0).toLocaleString('id-ID')}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </SectionPage>
  )
}