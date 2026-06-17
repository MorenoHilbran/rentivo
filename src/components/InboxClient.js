'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { StatusPill } from '@/components/ManagementUI'
import { approveDraftFromInboxAction, rejectDraftFromInboxAction } from '@/app/(dashboard)/actions'
import { createClient } from '@/lib/supabase/client'
import { 
  Search, 
  SendHorizontal, 
  Sparkles, 
  User, 
  Calendar, 
  Layers, 
  MessageSquareCode,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'

/**
 * Indikator status koneksi Supabase Realtime.
 * Didefinisikan di luar komponen agar tidak menyebabkan reset state saat re-render.
 */
function RealtimeIndicator({ status }) {
  const isConnected = status === 'connected'
  const isError = status === 'error'
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
        isConnected
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : isError
          ? 'bg-rose-50 text-rose-700 border border-rose-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
      title={
        isConnected
          ? 'Terhubung realtime — pesan baru muncul otomatis'
          : isError
          ? 'Koneksi realtime terputus'
          : 'Menghubungkan...'
      }
    >
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isConnected ? 'Live' : isError ? 'Offline' : '...'}
    </span>
  )
}

export default function InboxClient({ 
  conversations: initialConversations, 
  activeConvId: initialActiveConvId, 
  messages: initialMessages, 
  pendingDraft: initialPendingDraft,
  tenantId,
  tenantPhone,
  productsWithStock = [],
}) {
  const router = useRouter()
  const { addToast } = useToast()

  // ─── State ───────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [simulateName, setSimulateName] = useState('Budi Utomo')
  const [simulatePhone, setSimulatePhone] = useState('08123456789')
  const [replyText, setReplyText] = useState('')
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [activeConvId, setActiveConvId] = useState(initialActiveConvId)
  const [conversations, setConversations] = useState(initialConversations)
  const [messages, setMessages] = useState(initialMessages)
  const [pendingDraft, setPendingDraft] = useState(initialPendingDraft)
  const [realtimeStatus, setRealtimeStatus] = useState('connecting') // 'connecting' | 'connected' | 'error'
  const [showAiPanel, setShowAiPanel] = useState(true)

  const messagesEndRef = useRef(null)
  const supabaseRef = useRef(null)

  // ─── Auto Scroll ke bawah saat ada pesan baru ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── Supabase Realtime Subscriptions ────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return

    const supabase = createClient()
    supabaseRef.current = supabase

    // Subscribe ke perubahan tabel `messages` untuk tenant ini
    const messagesChannel = supabase
      .channel(`inbox-messages-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const newMsg = payload.new
          // Tambah pesan baru ke list jika percakapannya aktif
          setMessages((prev) => {
            if (newMsg.conversation_id !== activeConvId) return prev
            // Hindari duplikasi
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [
              ...prev,
              {
                id: newMsg.id,
                tenantId: newMsg.tenant_id,
                conversationId: newMsg.conversation_id,
                direction: newMsg.direction,
                content: newMsg.content,
                mediaUrl: newMsg.media_url,
                aiAnalysis: newMsg.ai_analysis,
                isRead: newMsg.is_read,
                sentAt: newMsg.sent_at,
                createdAt: newMsg.created_at,
              },
            ]
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('error')
      })

    // Subscribe ke perubahan tabel `conversations` untuk update preview & unread count
    const convsChannel = supabase
      .channel(`inbox-convs-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Conversation baru — reload untuk mendapatkan join data (customerName, dll)
            router.refresh()
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new
            setConversations((prev) =>
              prev.map((c) =>
                c.id === updated.id
                  ? {
                      ...c,
                      lastMessageAt: updated.last_message_at,
                      lastMessagePreview: updated.last_message_preview,
                      unreadCount: updated.unread_count,
                    }
                  : c
              )
            )
          }
        }
      )
      .subscribe()

    // Subscribe ke perubahan tabel `ai_drafts`
    const draftsChannel = supabase
      .channel(`inbox-drafts-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_drafts',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const d = payload.new
            if (d.conversation_id === activeConvId && d.status === 'pending') {
              setPendingDraft({
                id: d.id,
                tenantId: d.tenant_id,
                conversationId: d.conversation_id,
                customerId: d.customer_id,
                status: d.status,
                extractedData: d.extracted_data,
                confidence: d.confidence,
              })
              addToast({
                title: 'Draft AI Baru!',
                message: 'AI telah menyusun draft booking. Silakan tinjau dan setujui.',
                tone: 'info',
              })
            } else if (d.status !== 'pending' && pendingDraft?.id === d.id) {
              setPendingDraft(null)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(convsChannel)
      supabase.removeChannel(draftsChannel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, activeConvId])

  // ─── Saat konversasi berganti, update active messages ───────────────────────
   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(initialMessages)
     
    setPendingDraft(initialPendingDraft)
  }, [initialMessages, initialPendingDraft])

  // ─── Saat conversations prop berubah dari server ─────────────────────────────
   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversations(initialConversations)
  }, [initialConversations])


  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const filteredConvs = conversations.filter((c) => {
    const term = searchQuery.toLowerCase()
    return (
      (c.customerName ?? '').toLowerCase().includes(term) ||
      (c.customerPhone ?? '').includes(term)
    )
  })

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(val || 0))

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    })
  }

  // ─── Navigasi ke conversation lain ──────────────────────────────────────────
  async function selectConversation(convId) {
    if (convId === activeConvId) return // sudah aktif
    setActiveConvId(convId)
    setMessages([])          // clear pesan lama langsung
    setPendingDraft(null)    // clear draft lama

    // Update URL tanpa full page navigation
    window.history.pushState(null, '', `/inbox?conversationId=${convId}`)

    // Fetch messages via API (instant, no server component re-render needed)
    try {
      const resp = await fetch(`/api/inbox/messages?conversationId=${convId}`)
      const data = await resp.json()
      if (data.ok) {
        setMessages(data.messages || [])
        setPendingDraft(data.pendingDraft || null)
      }
    } catch (err) {
      console.error('Failed to fetch conversation messages:', err)
    }
  }

  // ─── Simulasi chat masuk via webhook ─────────────────────────────────────────
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
          },
        }),
      })

      const data = await resp.json()
      if (data.ok) {
        addToast({
          title: 'Simulasi Terkirim!',
          message:
            type === 'greet'
              ? 'Auto-reply template berhasil terkirim.'
              : 'AI Draft berhasil disusun secara instan!',
          tone: 'success',
        })
        selectConversation(data.conversationId)
        router.refresh() // refresh sidebar conversations list
      } else {
        addToast({ title: 'Gagal', message: 'Error: ' + data.error, tone: 'error' })
      }
    } catch (err) {
      console.error(err)
      addToast({ title: 'Error', message: 'Koneksi gagal', tone: 'error' })
    }
  }

  // ─── Setujui Draft AI ─────────────────────────────────────────────────────────
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
        setPendingDraft(null)
        router.refresh()
      } else {
        addToast({
          title: 'Gagal menyetujui',
          message: res.error || 'Terjadi kesalahan saat membuat booking.',
          tone: 'error',
        })
      }
    } catch (err) {
      addToast({ title: 'Gagal menyetujui', message: String(err), tone: 'error' })
    } finally {
      setApproving(false)
    }
  }

  // ─── Tolak Draft AI ──────────────────────────────────────────────────────────
  async function handleRejectDraft() {
    if (!pendingDraft) return
    setRejecting(true)
    try {
      const res = await rejectDraftFromInboxAction(pendingDraft.id)
      if (res.ok) {
        addToast({ title: 'Draft Ditolak', message: 'Draft AI berhasil diarsipkan.', tone: 'info' })
        setPendingDraft(null)
        router.refresh()
      }
    } catch (err) {
      addToast({ title: 'Gagal menolak', message: String(err), tone: 'error' })
    } finally {
      setRejecting(false)
    }
  }

  // ─── Kirim Reply via async fetch ──────────────────────────────────────────────
  async function handleReplySubmit(e) {
    e.preventDefault()
    const textToSend = replyText.trim()
    if (!textToSend || !activeConvId) return

    setReplyText('') // Clear input immediately for responsiveness

    try {
      const formData = new FormData()
      formData.append('conversationId', activeConvId)
      formData.append('content', textToSend)

      const response = await fetch('/api/inbox/send', {
        method: 'POST',
        body: formData,
        redirect: 'manual', // prevent auto-redirect
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.ok) {
        addToast({ title: 'Gagal mengirim', message: data?.error || 'Gagal mengirim pesan', tone: 'error' })
        setReplyText(textToSend) // Restore text on failure
      } else if (data.baileysError) {
        // Pesan tersimpan di DB tapi gagal kirim ke WA
        addToast({
          title: 'Pesan tersimpan',
          message: `Tersimpan di sistem, tapi gagal kirim ke WhatsApp: ${data.baileysError}`,
          tone: 'warning',
        })
      }
    } catch (err) {
      console.error('Send error:', err)
      addToast({ title: 'Gagal mengirim', message: String(err), tone: 'error' })
      setReplyText(textToSend) // Restore text on failure
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  return (
    <div className="inbox-container">

      {/* 1. Conversations List Side Panel */}
      <div className="flex flex-col border border-outline-variant bg-surface-container-lowest rounded-2xl overflow-hidden h-full shadow-sm">
        <div style={{
          borderLeft: '4px solid var(--color-outline)',
          borderBottom: '1px solid var(--color-outline-variant)',
          background: 'var(--color-surface-container-low)',
          padding: '14px 18px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daftar Chat</span>
            <RealtimeIndicator status={realtimeStatus} />
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', color: 'var(--color-on-surface-variant)', opacity: 0.5,
            }} />
            <input
              type="text"
              placeholder="Cari chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, fontSize: 12.5, height: 34 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/60">
          {filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant leading-relaxed">
              Belum ada pesan. Gunakan tools simulasi di bawah untuk mencoba.
            </div>
          ) : (
            filteredConvs.map((c) => {
              const isActive = activeConvId === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    position: 'relative',
                    border: 'none',
                    background: isActive ? 'rgba(0, 92, 85, 0.07)' : 'transparent',
                    transition: 'all 150ms ease',
                    borderLeft: isActive ? '3.5px solid var(--color-primary)' : '3.5px solid transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--color-surface-container-low)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: 8 }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '130px',
                    }}>
                      {c.customerName}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', opacity: 0.75, fontFamily: 'var(--font-mono)' }}>
                      {formatDate(c.lastMessageAt)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11.5,
                    color: isActive ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    fontWeight: isActive ? 500 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    opacity: isActive ? 0.95 : 0.75,
                  }}>
                    {c.lastMessagePreview || 'Kirim pesan pertama...'}
                  </div>
                  {c.unreadCount > 0 && !isActive && (
                    <span style={{
                      position: 'absolute',
                      right: 18,
                      bottom: 14,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 16,
                      height: 16,
                      borderRadius: 9999,
                      background: 'var(--color-primary)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--color-on-primary)',
                      padding: '0 4px',
                    }}>
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Simulasi Tools Widget - Collapsible */}
        <details
          style={{
            borderTop: '1px solid var(--color-outline-variant)',
            background: 'var(--color-surface-container-low)',
            flexShrink: 0,
          }}
        >
          <summary style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--color-on-surface-variant)',
            userSelect: 'none',
          }}>
            <MessageSquareCode size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            Simulasi Chat
          </summary>
          <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              placeholder="Nama Penyewa"
              value={simulateName}
              onChange={(e) => setSimulateName(e.target.value)}
              className="form-input"
              style={{ height: 32, fontSize: 11, padding: '0 10px' }}
            />
            <input
              type="text"
              placeholder="No HP Penyewa"
              value={simulatePhone}
              onChange={(e) => setSimulatePhone(e.target.value)}
              className="form-input"
              style={{ height: 32, fontSize: 11, padding: '0 10px', fontFamily: 'var(--font-mono)' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                onClick={() => triggerSimulation('greet')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11, height: 30 }}
              >
                Simulasi Halo
              </button>
              <button
                onClick={() => triggerSimulation('template')}
                className="btn btn-primary btn-sm"
                style={{ fontSize: 11, height: 30 }}
              >
                Template
              </button>
            </div>
          </div>
        </details>
      </div>

      {/* 2. Chat Thread & AI Draft Panel Container */}
      <div className="inbox-chat-pane" style={showAiPanel ? {} : { gridTemplateColumns: '1fr' }}>

        {/* Chat Window Thread */}
        <div className="flex flex-col border border-outline-variant bg-surface-container-lowest rounded-2xl overflow-hidden h-full shadow-sm">
          {activeConv ? (
            <>
              {/* Active Header */}
              <div style={{
                borderLeft: '4px solid var(--color-primary)',
                borderBottom: '1px solid var(--color-outline-variant)',
                background: 'var(--color-surface-container-low)',
                padding: '12px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-50 text-teal-850 flex items-center justify-center font-bold text-sm border border-teal-200">
                    {(activeConv.customerName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-on-surface)', letterSpacing: '-0.01em', margin: 0 }}>
                      {activeConv.customerName}
                    </h3>
                    <span className="text-[11px] font-mono text-on-surface-variant" style={{ opacity: 0.85 }}>{activeConv.customerPhone?.split('@')[0]}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {tenantPhone && (
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--color-surface-container)', padding: '3px 8px', borderRadius: 8, color: 'var(--color-on-surface-variant)' }}>
                      Toko: {tenantPhone}
                    </span>
                  )}
                  <button
                    onClick={() => setShowAiPanel(!showAiPanel)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '4px 8px', height: 'auto', border: '1px solid var(--color-outline-variant)' }}
                    type="button"
                  >
                    {showAiPanel ? 'Sembunyikan AI' : 'Tampilkan AI'}
                  </button>
                  <RealtimeIndicator status={realtimeStatus} />
                </div>
              </div>

              {/* Chat Bubbles Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-low/10">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquareCode size={32} style={{ color: 'var(--color-on-surface-variant)', opacity: 0.3, marginBottom: 8 }} />
                    <p className="text-xs text-on-surface-variant">Belum ada pesan di percakapan ini.</p>
                  </div>
                )}
                {messages.map((m, index) => {
                  const isInbound = m.direction === 'inbound'
                  const prevMsg = index > 0 ? messages[index - 1] : null
                  const isSameSender = prevMsg && prevMsg.direction === m.direction

                  return (
                    <div
                      key={m.id}
                      className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                      style={{ 
                        animation: 'fadeInUp 0.2s ease-out',
                        marginTop: isSameSender ? 3 : 16,
                      }}
                    >
                      <div
                        style={isInbound ? {
                          background: 'var(--color-surface-container-lowest)',
                          color: 'var(--color-on-surface)',
                          border: '1px solid var(--color-outline-variant)',
                          borderRadius: 16,
                          borderTopLeftRadius: isSameSender ? 16 : 4,
                          padding: '10px 14px',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          maxWidth: '70%',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          fontSize: 13.5,
                          lineHeight: 1.45,
                        } : {
                          background: 'var(--color-primary-container)',
                          color: 'var(--color-on-primary)',
                          borderRadius: 16,
                          borderTopRightRadius: isSameSender ? 16 : 4,
                          padding: '10px 14px',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          maxWidth: '70%',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          fontSize: 13.5,
                          lineHeight: 1.45,
                        }}
                      >
                        {m.mediaType === 'image' && m.mediaUrl && (
                          <div style={{ marginBottom: m.content ? 8 : 0, borderRadius: 8, overflow: 'hidden' }}>
                            <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer">
                              <img src={m.mediaUrl} alt="Bukti Pembayaran" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6 }} />
                            </a>
                          </div>
                        )}
                        {m.content}
                        <span style={isInbound ? {
                          fontSize: 9.5,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-on-surface-variant)',
                          opacity: 0.65,
                          display: 'block',
                          marginTop: 6,
                          textAlign: 'right',
                        } : {
                          fontSize: 9.5,
                          fontFamily: 'var(--font-mono)',
                          color: 'rgba(255,255,255,0.75)',
                          display: 'block',
                          marginTop: 6,
                          textAlign: 'right',
                        }}>
                          {formatDate(m.sentAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {/* Sentinel div untuk auto-scroll */}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Form */}
              <form
                onSubmit={handleReplySubmit}
                style={{
                  padding: 16,
                  borderTop: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-low)',
                }}
              >
                <input type="hidden" name="conversationId" value={activeConvId} />
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <input
                    type="text"
                    name="content"
                    placeholder="Ketik balasan pesan..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    autoComplete="off"
                    className="form-input"
                    style={{ fontSize: 13, height: 38 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ height: 38, width: 38, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    title="Kirim (Enter)"
                  >
                    <SendHorizontal size={15} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '48px 24px', textAlign: 'center', position: 'relative' }}>
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="btn btn-ghost btn-sm"
                style={{ position: 'absolute', right: 24, top: 12, fontSize: 11, border: '1px solid var(--color-outline-variant)' }}
                type="button"
              >
                {showAiPanel ? 'Sembunyikan AI' : 'Tampilkan AI'}
              </button>
              <MessageSquareCode size={40} style={{ color: 'var(--color-on-surface-variant)', opacity: 0.35, marginBottom: 16 }} />
              <h3 className="text-body-lg font-bold text-on-background" style={{ margin: 0, fontSize: '16px' }}>
                {conversations.length === 0 ? 'Belum Ada Pesan Masuk' : 'Pilih Percakapan'}
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed mx-auto" style={{ margin: '8px auto 0', opacity: 0.85, fontSize: '13px' }}>
                {conversations.length === 0 
                  ? 'Menunggu pesan WhatsApp masuk dari pelanggan Anda...' 
                  : 'Pilih salah satu obrolan di samping untuk mulai membalas.'}
              </p>
            </div>
          )}
        </div>

        {/* AI Copilot Panel */}
        {showAiPanel && (
          <div className="flex flex-col border border-outline-variant bg-surface-container-lowest rounded-2xl overflow-hidden h-full shadow-sm">
            <div style={{
              borderLeft: '4px solid var(--color-primary-container)',
              borderBottom: '1px solid var(--color-outline-variant)',
              background: 'var(--color-surface-container-low)',
              padding: '16px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={16} className="text-orange-600 shrink-0" />
                <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                  AI Copilot Draft
                </h3>
              </div>
              <button
                onClick={() => setShowAiPanel(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-on-surface-variant)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                  borderRadius: 4,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                title="Sembunyikan Panel AI"
                type="button"
              >
                <X size={15} />
              </button>
            </div>

          <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--color-surface-container-low)' }}>
            {pendingDraft ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Keyakinan AI */}
                <div style={{
                  borderRadius: 12,
                  border: '1px solid var(--color-outline-variant)',
                  background: 'var(--color-surface-container-lowest)',
                  padding: 14,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Keyakinan AI</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                      {pendingDraft.confidence ? `${Math.round(Number(pendingDraft.confidence) * 100)}%` : '-'}
                    </span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--color-surface-container)', height: 6, borderRadius: 9999, overflow: 'hidden' }}>
                    <div 
                      style={{
                        background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-fixed) 100%)',
                        height: '100%',
                        borderRadius: 9999,
                        transition: 'all 500ms ease',
                        width: pendingDraft.confidence ? `${Math.round(Number(pendingDraft.confidence) * 100)}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Extracted Details Grid */}
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                  {/* Nama Penyewa */}
                  <div style={{
                    display: 'flex', gap: 12, borderRadius: 11,
                    border: '1px solid var(--color-outline-variant)',
                    background: 'var(--color-surface-container-lowest)', padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                    gridColumn: '1 / -1',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(15,118,110,0.08)', color: '#0f766e',
                    }}>
                      <User size={16} strokeWidth={1.8} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Penyewa</div>
                      <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)' }}>
                        {pendingDraft.extractedData?.customerName || activeConv?.customerName}
                      </div>
                    </div>
                  </div>

                  {/* Tanggal Mulai */}
                  <div style={{
                    display: 'flex', gap: 12, borderRadius: 11,
                    border: '1px solid var(--color-outline-variant)',
                    background: 'var(--color-surface-container-lowest)', padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(2,132,199,0.08)', color: '#0284c7',
                    }}>
                      <Calendar size={16} strokeWidth={1.8} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Mulai</div>
                      <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)' }}>
                        {pendingDraft.extractedData?.startDate
                          ? new Date(pendingDraft.extractedData.startDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Tanggal Selesai */}
                  <div style={{
                    display: 'flex', gap: 12, borderRadius: 11,
                    border: '1px solid var(--color-outline-variant)',
                    background: 'var(--color-surface-container-lowest)', padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(217,119,6,0.08)', color: '#d97706',
                    }}>
                      <Calendar size={16} strokeWidth={1.8} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Selesai</div>
                      <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)' }}>
                        {pendingDraft.extractedData?.endDate
                          ? new Date(pendingDraft.extractedData.endDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {pendingDraft.extractedData?.items?.length > 0 && (() => {
                  // Precompute stock availability for warning validations
                  let isApproveDisabled = false
                  const stockDetails = []

                  for (const it of pendingDraft.extractedData.items) {
                    const matchedProd = productsWithStock?.find(p => 
                      p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === it.productName.toLowerCase().replace(/[^a-z0-9]/g, '')
                    ) || productsWithStock?.find(p => 
                      p.name.toLowerCase().includes(it.productName.toLowerCase()) || 
                      it.productName.toLowerCase().includes(p.name.toLowerCase())
                    )

                    const available = matchedProd ? matchedProd.availableStock : 0
                    const sufficient = matchedProd && available >= it.quantity

                    stockDetails.push({ sufficient, available })
                    if (!sufficient) isApproveDisabled = true
                  }

                  return (
                    <div style={{
                      borderRadius: 12,
                      border: '1px solid var(--color-outline-variant)',
                      background: 'var(--color-surface-container-lowest)',
                      padding: 16,
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 10 }}>
                        Aset / Produk Sewa
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {pendingDraft.extractedData.items.map((it, idx) => {
                          const stockInfo = stockDetails[idx]
                          const isSufficient = stockInfo ? stockInfo.sufficient : false
                          const availableCount = stockInfo ? stockInfo.available : 0

                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                borderRadius: 8,
                                background: 'var(--color-surface-container-low)',
                                padding: '10px 12px',
                                border: isSufficient ? '1px solid var(--color-outline-variant)' : '1px solid rgba(239, 68, 68, 0.4)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.productName}</span>
                                <span style={{
                                  borderRadius: 99,
                                  padding: '2px 8px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-mono)',
                                  background: isSufficient ? 'rgba(0,92,85,0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: isSufficient ? 'var(--color-primary)' : '#dc2626',
                                  flexShrink: 0,
                                }}>
                                  {it.quantity} {it.unit || 'unit'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginTop: 2 }}>
                                <span style={{ color: 'var(--color-on-surface-variant)', opacity: 0.8 }}>Stok Tersedia:</span>
                                <span style={{ 
                                  fontWeight: 700, 
                                  color: isSufficient ? 'var(--color-primary)' : '#dc2626',
                                  fontFamily: 'var(--font-mono)' 
                                }}>
                                  {availableCount} unit
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* Catatan */}
                {pendingDraft.extractedData?.notes && (
                  <div style={{
                    display: 'flex', gap: 12, borderRadius: 11,
                    border: '1px solid var(--color-outline-variant)',
                    background: 'var(--color-surface-container-lowest)', padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>
                      <Layers size={16} strokeWidth={1.8} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Catatan Keterangan</div>
                      <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {pendingDraft.extractedData.notes}
                      </p>
                    </div>
                  </div>
                )}

                {(() => {
                  let isApproveDisabled = false
                  if (pendingDraft?.extractedData?.items) {
                    for (const it of pendingDraft.extractedData.items) {
                      const matchedProd = productsWithStock?.find(p => 
                        p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === it.productName.toLowerCase().replace(/[^a-z0-9]/g, '')
                      ) || productsWithStock?.find(p => 
                        p.name.toLowerCase().includes(it.productName.toLowerCase()) || 
                        it.productName.toLowerCase().includes(p.name.toLowerCase())
                      )
                      const available = matchedProd ? matchedProd.availableStock : 0
                      if (!matchedProd || available < it.quantity) {
                        isApproveDisabled = true
                        break
                      }
                    }
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {isApproveDisabled && (
                        <div style={{
                          background: 'rgba(220, 38, 38, 0.08)',
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          color: '#dc2626',
                          padding: '10px 12px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 600,
                          lineHeight: 1.4,
                          marginTop: 4
                        }}>
                          ⚠️ Stok unit inventaris tidak mencukupi untuk menyetujui pemesanan ini.
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                        <button
                          onClick={handleRejectDraft}
                          disabled={rejecting || approving}
                          className="btn btn-secondary"
                          style={{ fontSize: 12, height: 38, borderRadius: 8, fontWeight: 700, width: '100%' }}
                        >
                          {rejecting ? 'Menolak...' : 'Tolak Draft'}
                        </button>
                        <button
                          onClick={handleApproveDraft}
                          disabled={approving || rejecting || isApproveDisabled}
                          className="btn btn-primary"
                          style={{ fontSize: 12, height: 38, borderRadius: 8, fontWeight: 700, width: '100%' }}
                        >
                          {approving ? 'Menyetujui...' : 'Setujui Booking'}
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center', height: '100%' }}>
                <Sparkles size={24} style={{ color: 'var(--color-on-surface-variant)', opacity: 0.3, marginBottom: 10 }} />
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-on-surface)' }}>Tidak Ada Draft Aktif</h4>
                <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', opacity: 0.7, marginTop: 6, lineHeight: 1.6, maxWidth: 220 }}>
                  Tidak ada draf AI yang terdeteksi untuk obrolan ini saat ini. Kirim format template untuk mencoba.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
