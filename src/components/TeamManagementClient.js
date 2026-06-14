'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { 
  toggleTeamMemberStatusAction, 
  updateTeamMemberRoleAction, 
  deleteTeamMemberAction 
} from '@/app/(dashboard)/actions'
import { 
  UserPlus, 
  Trash2, 
  Power, 
  Shield, 
  User, 
  ShieldCheck, 
  Mail,
  Loader2
} from 'lucide-react'

export default function TeamManagementClient({ 
  members, 
  currentSupabaseUserId, 
  isOwner,
  addTeamMemberAction
}) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [actionMemberId, setActionMemberId] = useState(null) // tracks which member is being edited/deleted

  const handleToggleStatus = async (memberId, currentStatus, memberName) => {
    if (isPending) return
    setActionMemberId(memberId)
    startTransition(async () => {
      try {
        const res = await toggleTeamMemberStatusAction(memberId, currentStatus)
        if (res?.ok) {
          addToast({
            title: 'Status Diperbarui',
            message: `Status ${memberName} berhasil diubah.`,
            tone: 'success',
          })
          router.refresh()
        }
      } catch (err) {
        addToast({
          title: 'Gagal',
          message: err?.message ?? 'Gagal mengubah status anggota tim',
          tone: 'error',
        })
      } finally {
        setActionMemberId(null)
      }
    })
  }

  const handleRoleChange = async (memberId, targetRole, memberName) => {
    if (isPending) return
    setActionMemberId(memberId)
    startTransition(async () => {
      try {
        const res = await updateTeamMemberRoleAction(memberId, targetRole)
        if (res?.ok) {
          addToast({
            title: 'Peran Diperbarui',
            message: `Peran ${memberName} berhasil diubah menjadi ${targetRole.toUpperCase()}.`,
            tone: 'success',
          })
          router.refresh()
        }
      } catch (err) {
        addToast({
          title: 'Gagal',
          message: err?.message ?? 'Gagal mengubah peran anggota tim',
          tone: 'error',
        })
      } finally {
        setActionMemberId(null)
      }
    })
  }

  const handleDeleteMember = async (memberId, memberName) => {
    if (isPending) return
    if (!confirm(`Apakah Anda yakin ingin menghapus ${memberName} dari workspace ini? Akses login mereka juga akan dihapus permanen.`)) {
      return
    }
    
    setActionMemberId(memberId)
    startTransition(async () => {
      try {
        const res = await deleteTeamMemberAction(memberId)
        if (res?.ok) {
          addToast({
            title: 'Anggota Dihapus',
            message: `${memberName} berhasil dihapus dari tim.`,
            tone: 'success',
          })
          router.refresh()
        }
      } catch (err) {
        addToast({
          title: 'Gagal',
          message: err?.message ?? 'Gagal menghapus anggota tim',
          tone: 'error',
        })
      } finally {
        setActionMemberId(null)
      }
    })
  }

  const getRoleIcon = (role) => {
    if (role === 'owner') return <ShieldCheck size={14} className="text-teal-600" />
    if (role === 'admin') return <Shield size={14} className="text-blue-600" />
    return <User size={14} className="text-orange-600" />
  }

  const getRoleLabel = (role) => {
    if (role === 'owner') return 'Pemilik (Owner)'
    if (role === 'admin') return 'Admin'
    return 'Staff Operasional'
  }

  const getRoleBadgeStyle = (role) => {
    if (role === 'owner') return { background: 'rgba(15,118,110,0.08)', color: '#0f766e', border: '1px solid rgba(15,118,110,0.15)' }
    if (role === 'admin') return { background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.15)' }
    return { background: 'rgba(234,88,12,0.08)', color: '#ea580c', border: '1px solid rgba(234,88,12,0.15)' }
  }

  return (
    <div className="grid gap-lg lg:grid-cols-[1.5fr_1fr]" style={{ marginTop: '24px' }}>
      {/* List Tim */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>Daftar Anggota Tim</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', opacity: 0.8, marginTop: 4, marginBottom: 20 }}>
          Semua anggota tim yang memiliki akses masuk ke workspace ini.
        </p>

        <div className="overflow-x-auto">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-outline-variant)' }}>
                <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Anggota</th>
                <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Peran</th>
                <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Status</th>
                {isOwner && <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', textAlign: 'right' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {members.map((m) => {
                const isSelf = m.supabaseUserId === currentSupabaseUserId
                const isBusy = isPending && actionMemberId === m.id
                
                return (
                  <tr key={m.id} style={{ transition: 'background 0.2s' }}>
                    {/* User profile */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'var(--color-primary-container)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 13,
                          border: '1px solid var(--color-outline-variant)'
                        }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-on-surface)' }}>
                            {m.name} {isSelf && <span style={{ fontSize: 11, fontStyle: 'italic', opacity: 0.65, fontWeight: 400 }}>(Anda)</span>}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--color-on-surface-variant)', opacity: 0.75, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Mail size={11} />
                            {m.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge & Dropdown */}
                    <td style={{ padding: '14px 16px' }}>
                      {isOwner && !isSelf && m.role !== 'owner' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {getRoleIcon(m.role)}
                          <select
                            value={m.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(m.id, e.target.value, m.name)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 8,
                              fontSize: 12,
                              border: '1px solid var(--color-outline-variant)',
                              background: 'var(--color-surface-container-lowest)',
                              color: 'var(--color-on-surface)',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                          </select>
                        </div>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          ...getRoleBadgeStyle(m.role)
                        }}>
                          {getRoleIcon(m.role)}
                          {getRoleLabel(m.role)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background: m.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        color: m.isActive ? '#10b981' : '#ef4444',
                        border: m.isActive ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(239,68,68,0.15)'
                      }}>
                        {m.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    {/* Actions */}
                    {isOwner && (
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {!isSelf && m.role !== 'owner' ? (
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            {/* Toggle status */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(m.id, m.isActive, m.name)}
                              disabled={isBusy}
                              style={{
                                border: '1px solid var(--color-outline-variant)',
                                background: m.isActive ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
                                color: m.isActive ? '#ef4444' : '#10b981',
                                cursor: 'pointer',
                                padding: 6,
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={m.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                            </button>

                            {/* Delete member */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m.id, m.name)}
                              disabled={isBusy}
                              style={{
                                border: '1px solid var(--color-outline-variant)',
                                background: 'rgba(239,68,68,0.05)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: 6,
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Hapus Anggota"
                            >
                              {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', opacity: 0.5, fontStyle: 'italic' }}>
                            Terkunci
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tambah Tim Form */}
      {isOwner ? (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <UserPlus size={18} className="text-primary" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>Tambah Anggota Tim</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', opacity: 0.8, marginBottom: 20 }}>
            Daarkan staff atau admin baru untuk ikut mengelola operasional sewa.
          </p>

          <form action={addTeamMemberAction} className="space-y-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nama Lengkap</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Contoh: Ahmad Hidayat" 
                required 
                className="form-input"
                style={{ fontSize: 12.5, height: 36 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alamat Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Contoh: ahmad@rental.com" 
                required 
                className="form-input"
                style={{ fontSize: 12.5, height: 36, fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password Akses</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Minimal 8 karakter" 
                required 
                className="form-input"
                style={{ fontSize: 12.5, height: 36 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Peran Akses (Role)</label>
              <select 
                name="role" 
                className="form-input"
                style={{ fontSize: 12.5, height: 36, padding: '0 10px', fontWeight: 600 }}
              >
                <option value="staff">Staff (Hanya Pengembalian)</option>
                <option value="admin">Admin (Akses Dashboard Penuh)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: 38, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}
            >
              <UserPlus size={15} />
              Daftarkan Anggota Baru
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '180px' }}>
          <Shield size={24} style={{ color: 'var(--color-on-surface-variant)', opacity: 0.35, marginBottom: 8 }} />
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>Akses Tambah Tim Terkunci</h4>
          <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', opacity: 0.7, marginTop: 4, maxWidth: 220, lineHeight: 1.5 }}>
            Hanya pemilik utama workspace (Owner) yang dapat mendaftarkan staff/admin baru.
          </p>
        </div>
      )}
    </div>
  )
}
