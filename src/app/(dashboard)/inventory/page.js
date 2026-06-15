import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, GridForm, TableCard, SelectField, Notice } from '@/components/ManagementUI'
import { createInventoryUnitAction, createProductAction } from '../actions'
import { db } from '@/lib/db'
import { inventoryUnits, products } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { desc, eq } from 'drizzle-orm'
import InventoryListClient from '@/components/InventoryListClient'

export const metadata = { title: 'Inventaris' }

export default async function InventoryPage({ searchParams: searchParamsPromise }) {
  const { tenantId } = await requireTenantAuth(['owner', 'admin'])

  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.tenantId, tenantId))
    .orderBy(desc(products.createdAt))
    .limit(40) // increased product row limits for select dropdowns

  const unitRows = await db
    .select({
      id: inventoryUnits.id,
      unitCode: inventoryUnits.unitCode,
      serialNumber: inventoryUnits.serialNumber,
      status: inventoryUnits.status,
      condition: inventoryUnits.condition,
      productName: products.name,
    })
    .from(inventoryUnits)
    .leftJoin(products, eq(inventoryUnits.productId, products.id))
    .where(eq(inventoryUnits.tenantId, tenantId))
    .orderBy(desc(inventoryUnits.createdAt))
    .limit(50) // increased unit limit to 50 for a richer list view

  const searchParams = await searchParamsPromise
  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  return (
    <SectionPage
      title="Inventaris"
      description="Daftar unit fisik, status ketersediaan, dan kondisi terkini aset rental yang tetap bisa dikelola manual."
      highlights={[
        { kicker: 'Manual', title: 'Kelola unit per produk', description: 'Unit fisik, status, dan kondisi barang bisa diperbarui kapan saja.' },
        { kicker: 'Workflow', title: 'Siap untuk booking', description: 'Inventory harus selalu akurat supaya booking manual maupun otomatis tetap aman.', badge: 'Ready' },
        { kicker: 'AI', title: 'Hanya bantu klasifikasi', description: 'AI tidak menggantikan pencatatan aset, hanya membantu jika ada intake data.' },
      ]}
    >
      {feedbackMessage ? (
        <Notice tone={feedbackKey === 'error' ? 'error' : 'success'} title={feedbackKey === 'error' ? 'Gagal menyimpan' : 'Berhasil'} message={feedbackMessage} />
      ) : null}
      
      <div className="grid gap-lg xl:grid-cols-2">
        <FormCard title="Tambah produk" description="Daftarkan jenis barang yang akan disewakan.">
          <form action={createProductAction} className="space-y-4">
            <GridForm>
              <Field label="Nama produk" name="name" placeholder="Contoh: Sony A7 III" />
              <Field label="Kategori" name="category" placeholder="Contoh: Kamera" required={false} />
              <Field label="Deposit" name="depositAmount" type="number" min="0" step="1000" placeholder="0" />
              <label className="flex items-center gap-2 cursor-pointer pt-3">
                <input type="checkbox" name="isActive" defaultChecked className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer" />
                <span className="font-label-caps text-label-caps text-on-surface-variant font-bold uppercase tracking-wider select-none">Aktif</span>
              </label>
            </GridForm>
            <TextareaField label="Deskripsi" name="description" placeholder="Deskripsi singkat produk" required={false} />
            <button type="submit" className="btn btn-primary">Simpan produk</button>
          </form>
        </FormCard>

        <FormCard title="Tambah unit fisik" description="Satu unit = satu aset yang bisa dilacak status dan kondisinya.">
          <form action={createInventoryUnitAction} className="space-y-4">
            <GridForm>
              <SelectField label="Produk" name="productId">
                <option value="">Pilih produk</option>
                {productRows.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </SelectField>
              <Field label="Kode unit" name="unitCode" placeholder="KAM-A7III-01" />
              <Field label="Serial number" name="serialNumber" placeholder="SN-12345" required={false} />
              <SelectField label="Status" name="status" defaultValue="available">
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="checking">Checking</option>
                <option value="maintenance">Maintenance</option>
              </SelectField>
            </GridForm>
            <TextareaField label="Kondisi" name="condition" placeholder="Catatan kondisi barang" required={false} />
            <button type="submit" className="btn btn-primary">Simpan unit</button>
          </form>
        </FormCard>
      </div>

      <TableCard title="Daftar Unit Fisik" description="Filter unit berdasarkan status ketersediaan atau gunakan bar pencarian.">
        <InventoryListClient units={unitRows} />
      </TableCard>
    </SectionPage>
  )
}