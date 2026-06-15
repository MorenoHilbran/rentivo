import SectionPage from '@/components/SectionPage'
import { FormCard, Field, TextareaField, SelectField, GridForm, Notice, TableCard, StatusPill } from '@/components/ManagementUI'
import { createTicketAction } from '../actions'
import { db } from '@/lib/db'
import { supportTickets } from '@/lib/db/schema'
import { requireTenantAuth } from '@/lib/session'
import { eq, desc } from 'drizzle-orm'
import { HelpCircle } from 'lucide-react'

export const metadata = { title: 'Tiket Bantuan' }

export default async function TicketsPage({ searchParams: searchParamsPromise }) {
  const { tenantId } = await requireTenantAuth(['owner', 'admin'])

  // Fetch tickets for this tenant
  let tickets = []
  try {
    tickets = await db.query.supportTickets.findMany({
      where: eq(supportTickets.tenantId, tenantId),
      orderBy: [desc(supportTickets.createdAt)],
    })
  } catch (e) {
    console.error('Tickets DB fetch error:', e)
  }

  const searchParams = await searchParamsPromise
  const feedbackKey = searchParams?.error ? 'error' : searchParams?.success ? 'success' : null
  const feedbackMessage = searchParams?.error ?? searchParams?.success ?? null

  const getPriorityTone = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'neutral'
      default: return 'neutral'
    }
  }

  const getStatusTone = (status) => {
    switch (status) {
      case 'resolved': return 'success'
      case 'in_progress': return 'info'
      case 'open': return 'primary'
      default: return 'neutral'
    }
  }

  return (
    <SectionPage
      title="Tiket Bantuan"
      description="Hubungi tim SuperAdmin Rentivo untuk bantuan teknis, kendala langganan, atau permintaan fitur baru."
      highlights={[
        { kicker: 'Support', title: 'Hubungi Admin', description: 'Ajukan kendala teknis dan tanyakan hal seputar sistem.' },
        { kicker: 'SLA Respon', title: 'Respons Cepat', description: 'Tim SuperAdmin akan meninjau dan merespon dalam 24 jam.' },
      ]}
    >
      {feedbackMessage ? (
        <Notice
          tone={feedbackKey === 'error' ? 'error' : 'success'}
          title={feedbackKey === 'error' ? 'Gagal mengirim tiket' : 'Terkirim'}
          message={feedbackMessage}
        />
      ) : null}

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1.2fr 1.8fr' }}>
        {/* Form to submit ticket */}
        <FormCard title="Buat Tiket Baru" description="Deskripsikan masalah atau pertanyaan yang Anda alami secara detail.">
          <form action={createTicketAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field
              label="Judul Laporan / Pertanyaan"
              name="title"
              placeholder="Contoh: Gagal mengunduh invoice booking"
              required={true}
            />

            <SelectField
              label="Prioritas Kendala"
              name="priority"
              defaultValue="medium"
              required={true}
            >
              <option value="low">Rendah (Pertanyaan Umum / Saran)</option>
              <option value="medium">Sedang (Ada kendala di fitur minor)</option>
              <option value="high">Tinggi (Sistem macet / tidak bisa digunakan)</option>
            </SelectField>

            <TextareaField
              label="Detail Deskripsi Kendala"
              name="description"
              placeholder="Deskripsikan secara detail langkah-langkah terjadinya kendala atau pertanyaan yang ingin Anda ajukan."
              required={true}
              rows={5}
            />

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Kirim Tiket Bantuan
            </button>
          </form>
        </FormCard>

        {/* History of tickets */}
        <TableCard title="Riwayat Tiket Bantuan" description="Berikut adalah daftar tiket bantuan yang pernah Anda ajukan ke SuperAdmin.">
          <div className="overflow-x-auto">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Judul Tiket</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Prioritas</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Tgl Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{ticket.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                        {ticket.description}
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <StatusPill tone={getPriorityTone(ticket.priority)}>
                        {ticket.priority === 'high' ? 'Tinggi' : ticket.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </StatusPill>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <StatusPill tone={getStatusTone(ticket.status)}>
                        {ticket.status === 'open' ? 'Terbuka' : ticket.status === 'in_progress' ? 'Diproses' : 'Selesai'}
                      </StatusPill>
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)' }}>
                      <HelpCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p>Belum ada tiket bantuan yang diajukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TableCard>
      </div>
    </SectionPage>
  )
}
