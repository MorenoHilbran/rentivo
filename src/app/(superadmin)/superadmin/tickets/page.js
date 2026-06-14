import { db } from '@/lib/db'
import { supportTickets, tenants } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Notice, TableCard, StatusPill } from '@/components/ManagementUI'
import { updateTicketStatusAction } from '../actions'
import { HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'Kelola Tiket Bantuan | Rentivo Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminTicketsPage({ searchParams: searchParamsPromise }) {
  const allTickets = await db.select({
    id: supportTickets.id,
    tenantId: supportTickets.tenantId,
    title: supportTickets.title,
    description: supportTickets.description,
    status: supportTickets.status,
    priority: supportTickets.priority,
    createdAt: supportTickets.createdAt,
    updatedAt: supportTickets.updatedAt,
    tenantName: tenants.name,
    tenantSlug: tenants.slug,
  })
  .from(supportTickets)
  .innerJoin(tenants, eq(supportTickets.tenantId, tenants.id))
  .orderBy(desc(supportTickets.createdAt))

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
    <div className="p-xl max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Kelola Tiket Bantuan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Tinjau laporan kendala, pertanyaan teknis, dan keluhan pembayaran dari berbagai tenant.
        </p>
      </div>

      {feedbackMessage ? (
        <Notice
          tone={feedbackKey === 'error' ? 'error' : 'success'}
          title={feedbackKey === 'error' ? 'Gagal' : 'Berhasil'}
          message={feedbackMessage}
        />
      ) : null}

      <TableCard title="Daftar Tiket Dukungan" description="Gunakan menu update status untuk memproses atau menyelesaikan tiket bantuan.">
        <div className="overflow-x-auto">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Tenant / Workspace</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Detail Masalah</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Prioritas</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px 20px' }}>Tgl Laporan</th>
                <th style={{ textAlign: 'right', padding: '16px 20px' }}>Aksi Penanganan</th>
              </tr>
            </thead>
            <tbody>
              {allTickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{ticket.tenantName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                      Slug: <span style={{ fontFamily: 'monospace', background: 'var(--color-surface-container-low)', padding: '2px 4px', borderRadius: '4px' }}>{ticket.tenantSlug}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top', maxWidth: '400px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '14px' }}>{ticket.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginTop: '6px', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                      {ticket.description}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                    <StatusPill tone={getPriorityTone(ticket.priority)}>
                      {ticket.priority === 'high' ? 'Tinggi' : ticket.priority === 'medium' ? 'Sedang' : 'Rendah'}
                    </StatusPill>
                  </td>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                    <StatusPill tone={getStatusTone(ticket.status)}>
                      {ticket.status === 'open' ? 'Terbuka' : ticket.status === 'in_progress' ? 'Diproses' : 'Selesai'}
                    </StatusPill>
                  </td>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                    {new Date(ticket.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top', textAlign: 'right' }}>
                    <form action={updateTicketStatusAction} style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <select
                        name="status"
                        defaultValue={ticket.status}
                        className="form-input"
                        style={{ height: '32px', padding: '0 8px', fontSize: '12.5px', background: 'var(--color-surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }}
                      >
                        <option value="open">Terbuka (Open)</option>
                        <option value="in_progress">Diproses (In Progress)</option>
                        <option value="resolved">Selesai (Resolved)</option>
                      </select>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Simpan
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {allTickets.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-on-surface-variant)' }}>
                    <HelpCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p>Tidak ada tiket bantuan yang dilaporkan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  )
}
