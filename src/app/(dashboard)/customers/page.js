import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, StatusPill, Notice } from '@/components/ManagementUI'
import { upsertCustomerAction } from '../actions'
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'

export const metadata = { title: 'Pelanggan | Rentivo' }

export default async function CustomersPage({ searchParams }) {
  const { tenantId } = await requireTenantAuth()

  const recentCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, tenantId))
    .orderBy(desc(customers.createdAt))
    .limit(6)

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

      <TableCard title="Pelanggan terbaru" description="Data yang baru ditambahkan atau diperbarui.">
        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kontak</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {recentCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>
                  <div>{customer.phoneNumber}</div>
                  {customer.email ? <div className="text-muted">{customer.email}</div> : null}
                </td>
                <td><StatusPill tone="primary">Manual ready</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </SectionPage>
  )
}
