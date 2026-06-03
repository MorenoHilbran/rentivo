import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, SelectField, Notice } from '@/components/ManagementUI'
import { recordInvoicePaymentAction } from '../actions'
import { db } from '@/lib/db'
import { bookings, invoices } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'
import InvoiceListClient from '@/components/InvoiceListClient'

export const metadata = { title: 'Invoice | Rentivo' }

export default async function InvoicesPage({ searchParams: searchParamsPromise }) {
  const { tenantId } = await requireTenantAuth()

  const invoiceRows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      rentalAmount: invoices.rentalAmount,
      depositAmount: invoices.depositAmount,
      damageFee: invoices.damageFee,
      totalAmount: invoices.totalAmount,
      paidAmount: invoices.paidAmount,
      notes: invoices.notes,
      bookingNumber: bookings.bookingNumber,
    })
    .from(invoices)
    .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
    .where(eq(invoices.tenantId, tenantId))
    .orderBy(desc(invoices.createdAt))
    .limit(30) // increased invoice limit from 12 to 30 for better usability

  const searchParams = await searchParamsPromise
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
              {invoiceRows.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} - {invoice.bookingNumber ?? '-'}
                </option>
              ))}
            </SelectField>
            <Field label="Nominal pembayaran" name="amount" type="number" min="0" step="1000" />
            <Field label="Nama bank" name="bankName" required={false} />
            <Field label="Nama akun" name="accountName" required={false} />
            <label className="flex items-center gap-2 cursor-pointer pt-3 md:col-span-2">
              <input type="checkbox" name="isVerified" defaultChecked className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer" />
              <span className="font-label-caps text-label-caps text-on-surface-variant font-bold uppercase tracking-wider select-none">Verifikasi manual</span>
            </label>
          </GridForm>
          <TextareaField label="Catatan transfer" name="transferNote" required={false} placeholder="Contoh: pembayaran DP via transfer" />
          <button type="submit" className="btn btn-primary">Simpan pembayaran</button>
        </form>
      </FormCard>

      <TableCard title="Daftar Invoice & Tagihan" description="Klik 'Rincian' untuk melihat detail lengkap tagihan, jaminan deposit, dan sisa pembayaran.">
        <InvoiceListClient invoices={invoiceRows} />
      </TableCard>
    </SectionPage>
  )
}