import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, Notice } from '@/components/ManagementUI'
import { upsertCustomerAction } from '../actions'
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'
import CustomerListClient from '@/components/CustomerListClient'

export const metadata = { title: 'Pelanggan | Rentivo' }

export default async function CustomersPage({ searchParams: searchParamsPromise }) {
  const { tenantId } = await requireTenantAuth()

  const recentCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, tenantId))
    .orderBy(desc(customers.createdAt))
    .limit(50) // increased list limit from 6 to 50 for a richer user experience

  const searchParams = await searchParamsPromise
  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  return (
    <SectionPage
      title="Pelanggan"
      description="Kartu pelanggan, riwayat transaksi, dan informasi kontak utama yang bisa diisi manual maupun dari WhatsApp."
      highlights={[
        { kicker: 'Manual', title: 'Tambah pelanggan langsung', description: 'Nama, nomor, email, dan alamat bisa dicatat tanpa menunggu WhatsApp.' },
        { kicker: 'WhatsApp', title: 'Auto-create dari chat', description: 'Kontak pelanggan dapat terbentuk dari percakapan masuk dan draft booking.', badge: 'Sync' },
        { kicker: 'Data', title: 'Riwayat transaksi lengkap', description: 'Setiap pelanggan harus mudah dilihat dari booking, invoice, dan retur.' },
      ]}
    >
      {feedbackMessage ? (
        <Notice tone={feedbackKey === 'error' ? 'error' : 'success'} title={feedbackKey === 'error' ? 'Gagal menyimpan' : 'Berhasil'} message={feedbackMessage} />
      ) : null}
      
      <FormCard
        title="Tambah / Perbarui pelanggan"
        description="Isi data pelanggan secara manual. Jika nomor telepon sama sudah ada, data akan diperbarui."
      >
        <form action={upsertCustomerAction} className="space-y-4">
          <GridForm>
            <Field label="Nama pelanggan" name="name" placeholder="Contoh: Nabila Rachma" />
            <Field label="Nomor telepon" name="phoneNumber" placeholder="0812xxxxxxx" />
            <Field label="Email" name="email" type="email" placeholder="nabila@example.com" required={false} />
            <Field label="Alamat" name="address" placeholder="Alamat lengkap" required={false} />
          </GridForm>
          <TextareaField label="Catatan" name="notes" placeholder="Preferensi pelanggan, catatan khusus, dll." required={false} />
          <button className="btn btn-primary" type="submit">Simpan pelanggan</button>
        </form>
      </FormCard>

      <TableCard title="Daftar Pelanggan (CRM)" description="Daftar lengkap pelanggan bisnis rental Anda. Klik 'Profil' untuk melihat catatan khusus dan total spending.">
        <CustomerListClient customers={recentCustomers} />
      </TableCard>
    </SectionPage>
  )
}
