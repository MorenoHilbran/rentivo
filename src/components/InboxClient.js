'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { StatusPill } from '@/components/ManagementUI'
import { approveDraftFromInboxAction, rejectDraftFromInboxAction } from '@/app/(dashboard)/actions'
import { 
  Search, 
  Send, 
  Sparkles, 
  Phone, 
  User, 
  Calendar, 
  Layers, 
  HelpCircle, 
  MessageSquareCode,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

export default function InboxClient({ 
  conversations, 
  activeConvId, 
  messages, 
  pendingDraft,
  tenantId,
  tenantPhone
}) {
  const router = useRouter()
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [simulateName, setSimulateName] = useState('Budi Utomo')
  const [simulatePhone, setSimulatePhone] = useState('08123456789')
  const [replyText, setReplyText] = useState('')
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  // Filter conversations by search
  const filteredConvs = conversations.filter((c) => {
    const term = searchQuery.toLowerCase()
    return (
      c.customerName.toLowerCase().includes(term) ||
      c.customerPhone.includes(term)
    )
  })

  // Format IDR Currency
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(val || 0))
  }

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    })
  }

  // Trigger webhook simulation
  async function triggerSimulation(type) {
    let text = ''
    if (type === 'greet') {
      text = 'Halo Rentivo! Saya ingin menanyakan ketersediaan alat sewa kamera.'
    } else {
      text = `Nama Penyewa: ${simulateName}
Produk: DJI Mini 3 Pro
Jumlah Unit: 1
Waktu Sewa: 2 hari
Tanggal Mulai: 2026-06-15
Catatan: Butuh filter ND jika ada`
    }

    try {
      addToast({
        title: 'Mengirim simulasi...',
        message: 'Mengirim webhook chat.received ke Rentivo',
        tone: 'info',
      })

      const resp = await fetch('/api/inngest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'chat.received',
          payload: {
            tenantId,
            from: simulatePhone,
            name: simulateName,
            content: text,
            waMessageId: 'sim-' + Math.random().toString(36).slice(-8),
            sentAt: new Date().toISOString(),
          }
        })
      })

      const data = await resp.json()
      if (data.ok) {
        addToast({
          title: 'Simulasi Terkirim!',
          message: type === 'greet' ? 'Auto-reply template berhasil terkirim.' : 'AI Draft berhasil disusun secara instan!',
          tone: 'success',
        })
        router.push(`/inbox?conversationId=${data.conversationId}`)
        router.refresh()
      } else {
        addToast({
          title: 'Gagal',
          message: 'Error: ' + data.error,
          tone: 'error',
        })
      }
    } catch (err) {
      console.error(err)
      addToast({
        title: 'Error',
        message: 'Koneksi gagal',
        tone: 'error',
      })
    }
  }

  // Approve AI Draft Action
  async function handleApproveDraft() {
    if (!pendingDraft) return
    setApproving(true)
    try {
      const res = await approveDraftFromInboxAction(pendingDraft.id)
      if (res.ok) {
        addToast({
          title: 'Booking Disetujui!',
          message: 'Booking & Invoice berhasil dibuat sekaligus.',
          tone: 'success',
        })
        router.refresh()
      }
    } catch (err) {
      addToast({
        title: 'Gagal menyetujui',
        message: String(err),
        tone: 'error',
      })
    } finally {
      setApproving(false)
    }
  }

  // Reject AI Draft Action
  async function handleRejectDraft() {
    if (!pendingDraft) return
    setRejecting(true)
    try {
      const res = await rejectDraftFromInboxAction(pendingDraft.id)
      if (res.ok) {
        addToast({
          title: 'Draft Ditolak',
          message: 'Draft AI berhasil diarsipkan.',
          tone: 'info',
        })
        router.refresh()
      }
    } catch (err) {
      addToast({
        title: 'Gagal menolak',
        message: String(err),
        tone: 'error',
      })
    } finally {
      setRejecting(false)
    }
  }

  const activeConv = conversations.find(c => c.id === activeConvId)

  return (
    <div className="grid gap-md lg:grid-cols-[280px_1fr] h-[calc(100vh-210px)] min-h-[500px]">
      
      {/* 1. Conversations List Side Panel */}
      <div className="flex flex-col border border-outline-variant bg-surface-container-lowest rounded-2xl overflow-hidden h-full shadow-sm">
        <div className="p-4 border-b border-outline-variant">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-on-surface-variant" />
            </span>
            <input
              type="text"
              placeholder="Cari chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low pl-9 pr-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/60">
          {filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant leading-relaxed">
              Belum ada pesan. Gunakan tools simulasi di bawah untuk mencoba.
            </div>
          ) : (
            filteredConvs.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/inbox?conversationId=${c.id}`)}
                className={`w-full text-left p-4 flex flex-col gap-1 transition-colors hover:bg-surface-container-low/40 ${
                  activeConvId === c.id ? 'bg-teal-50/60 border-l-2 border-primary' : ''
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-semibold text-body-sm text-on-surface leading-tight truncate max-w-[120px]">{c.customerName}</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">{formatDate(c.lastMessageAt)}</span>
                </div>
                <div className="text-[11px] text-on-surface-variant leading-tight truncate w-full">
                  {c.lastMessagePreview || 'Kirim pesan pertama...'}
                </div>
                {c.unreadCount > 0 && activeConvId !== c.id && (
                  <span className="self-end inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-on-primary">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Simulasi Tools Widget */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low/40 space-y-3">
          <div className="flex items-center gap-1.5">
            <MessageSquareCode className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Simulasi Chat</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nama Penyewa"
              value={simulateName}
              onChange={(e) => setSimulateName(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-2 py-1 text-[11px] outline-none"
            />
            <input
              type="text"
              placeholder="No HP Penyewa"
              value={simulatePhone}
              onChange={(e) => setSimulatePhone(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-2 py-1 text-[11px] outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => triggerSimulation('greet')}
              className="btn btn-secondary btn-sm text-[10px] py-1 h-auto"
            >
              Simulasi Halo
            </button>
            <button
              onClick={() => triggerSimulation('template')}
              className="btn btn-primary btn-sm text-[10px] py-1 h-auto"
            >
              Simulasi Template
            </button>
          </div>
        </div>
      </div>

      {/* 2. Chat Thread & AI Draft Panel Container */}
      <div className="grid gap-md lg:grid-cols-[1.6fr_1fr] h-full overflow-hidden">
        
        {/* Chat Window Thread */}
        <div className="flex flex-col border border-outline-variant bg-surface-container-lowest rounded-2xl overflow-hidden h-full shadow-sm">
          {activeConv ? (
            <>
              {/* Active Header */}
              <div className="flex justify-between items-center px-6 py-3 border-b border-outline-variant bg-surface-container-low/20">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm">
                    {activeConv.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-body-sm font-semibold text-on-background leading-tight">{activeConv.customerName}</h3>
                    <span className="text-[11px] font-mono text-on-surface-variant">{activeConv.customerPhone}</span>
                  </div>
                </div>
                {tenantPhone && (
                  <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg">
                    Toko: {tenantPhone}
                  </span>
                )}
              </div>

              {/* Chat Bubbles Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-low/10">
                {messages.map((m) => {
                  const isInbound = m.direction === 'inbound'
                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm border text-body-sm leading-relaxed whitespace-pre-wrap ${
                        isInbound 
                          ? 'bg-surface-container-lowest text-on-surface border-outline-variant/60 rounded-tl-sm' 
                          : 'bg-primary-container text-on-primary border-primary/20 rounded-tr-sm'
                      }`}>
                        {m.content}
                        <span className="block text-[9px] mt-1 opacity-70 text-right font-mono">
                          {formatDate(m.sentAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Input Form */}
              <form 
                action="/api/inbox/send" 
                method="POST"
                onSubmit={() => {
                  // Standard submit but clear client input first
                  setTimeout(() => setReplyText(''), 10)
                }}
                className="p-4 border-t border-outline-variant bg-surface-container-low/20 flex gap-2 items-center"
              >
                <input type="hidden" name="conversationId" value={activeConvId} />
                <input
                  type="text"
                  name="content"
                  placeholder="Ketik balasan pesan..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  autoComplete="off"
                  className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-sm text-on-surface outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  className="btn btn-primary h-[38px] w-[38px] p-0 rounded-xl"
                  title="Kirim"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-container-low/20">
              <MessageSquareCode className="h-10 w-10 text-on-surface-variant/40 mb-3" />
              <h3 className="text-body-md font-semibold text-on-background">Kotak Masuk Anda</h3>
              <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
                Pilih salah satu percakapan di kolom kiri untuk melihat pesan masuk dan me-review draft booking otomatis yang disusun oleh AI.
              </p>
            </div>
          )}
        </div>

        {/* AI Copilot Panel */}
        <div className="flex flex-col border border-outline-variant bg-surface-container-lowest rounded-2xl overflow-hidden h-full shadow-sm">
          <div className="px-6 py-3.5 border-b border-outline-variant bg-surface-bright flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
            <h3 className="font-title-sm text-body-sm font-semibold text-on-background uppercase tracking-wider">AI Copilot Draft</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {pendingDraft ? (
              <div className="space-y-5">
                {/* Draft Header */}
                <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Status Draft</span>
                    <h4 className="text-body-sm font-bold text-on-background mt-0.5">Menunggu Tinjauan</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Keyakinan AI</span>
                    <span className="text-body-sm font-bold text-teal-700 font-mono">
                      {pendingDraft.confidence ? `${Math.round(Number(pendingDraft.confidence) * 100)}%` : '-'}
                    </span>
                  </div>
                </div>

                {/* Extracted details */}
                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex gap-2">
                    <User className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Penyewa</span>
                      <span className="text-body-sm text-on-surface font-semibold">
                        {pendingDraft.extractedData?.customerName || activeConv?.customerName}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex gap-2">
                    <Layers className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Aset / Produk Sewa</span>
                      <div className="mt-1 space-y-1">
                        {pendingDraft.extractedData?.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between rounded-lg bg-surface-container p-2 border border-outline-variant/50 text-body-sm">
                            <span className="font-medium text-on-surface">{it.productName}</span>
                            <span className="font-bold text-primary font-mono">{it.quantity} {it.unit || 'unit'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex gap-2">
                    <Calendar className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Mulai</span>
                      <span className="text-body-sm text-on-surface font-medium">
                        {pendingDraft.extractedData?.startDate 
                          ? new Date(pendingDraft.extractedData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex gap-2">
                    <Calendar className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tanggal Selesai</span>
                      <span className="text-body-sm text-on-surface font-medium">
                        {pendingDraft.extractedData?.endDate
                          ? new Date(pendingDraft.extractedData.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                {pendingDraft.extractedData?.notes && (
                  <div className="border-t border-outline-variant pt-3">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Catatan Keterangan</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container p-3 rounded-lg border border-outline-variant/60">
                      {pendingDraft.extractedData.notes}
                    </p>
                  </div>
                )}

                {/* Approve/Reject Buttons */}
                <div className="pt-4 border-t border-outline-variant grid grid-cols-2 gap-2">
                  <button
                    onClick={handleRejectDraft}
                    disabled={rejecting || approving}
                    className="btn btn-secondary text-xs h-9 disabled:opacity-75 cursor-pointer"
                  >
                    {rejecting ? 'Menolak...' : 'Tolak'}
                  </button>
                  <button
                    onClick={handleApproveDraft}
                    disabled={approving || rejecting}
                    className="btn btn-primary text-xs h-9 disabled:opacity-75 cursor-pointer"
                  >
                    {approving ? 'Menyetujui...' : 'Setujui Booking'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <Sparkles className="h-8 w-8 text-on-surface-variant/30 mb-2" />
                <h4 className="text-body-sm font-semibold text-on-background">Tidak Ada Draft Aktif</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Tidak ada draf AI yang terdeteksi untuk obrolan ini saat ini. Kirim format template menggunakan tombol simulasi di kiri untuk membuat draf secara otomatis.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
