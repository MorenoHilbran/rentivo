/**
 * Rentivo WhatsApp Bridge — Baileys Microservice
 * =================================================
 * Layanan Node.js terpisah yang menjembatani WhatsApp ↔ Rentivo CRM.
 *
 * Cara kerja:
 * 1. Baileys membuka koneksi WebSocket ke WhatsApp
 * 2. Pesan masuk → dikirim ke Next.js via POST /api/inngest (event: chat.received)
 * 3. Pesan keluar dari admin → diterima via POST /api/send-message → dikirim ke WA
 * 4. QR Code tersedia di GET /api/qr untuk pairing nomor WhatsApp
 *
 * Environment Variables (buat file .env di folder ini):
 * - PORT                     = Port server (default: 3001)
 * - TENANT_ID                = UUID tenant yang menggunakan nomor WA ini
 * - RENTIVO_WEBHOOK_URL      = URL endpoint Next.js (contoh: http://localhost:3000/api/inngest)
 * - BAILEYS_WEBHOOK_SECRET   = Secret key untuk autentikasi webhook (sama dengan di Next.js .env)
 * - SUPABASE_URL             = URL Supabase untuk upload gambar bukti bayar
 * - SUPABASE_SERVICE_ROLE_KEY= Service role key Supabase
 */

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import * as crypto from 'node:crypto'
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto.webcrypto || crypto
}
import dotenv from 'dotenv'
import qrcode from 'qrcode'
import pino from 'pino'

// ─── Init ─────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const PORT = Number(process.env.PORT ?? 3001)
const TENANT_ID = process.env.TENANT_ID ?? ''
const RENTIVO_WEBHOOK_URL = process.env.RENTIVO_WEBHOOK_URL ?? 'http://localhost:3000/api/inngest'
const BAILEYS_WEBHOOK_SECRET = process.env.BAILEYS_WEBHOOK_SECRET ?? ''
const SESSION_DIR = join(__dirname, 'sessions')
if (!existsSync(SESSION_DIR)) mkdirSync(SESSION_DIR, { recursive: true })

// ─── Baileys dynamic import (CommonJS) ───────────────────────────────────────
// Baileys menggunakan CJS; kita gunakan createRequire agar kompatibel dengan ESM
const require = createRequire(import.meta.url)
let makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, fetchLatestBaileysVersion

try {
  const baileys = require('@whiskeysockets/baileys')
  makeWASocket = baileys.default ?? baileys.makeWASocket ?? baileys.makeInMemoryStore
  useMultiFileAuthState = baileys.useMultiFileAuthState
  DisconnectReason = baileys.DisconnectReason
  downloadMediaMessage = baileys.downloadMediaMessage
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion
} catch (e) {
  console.error('[Baileys] Gagal import @whiskeysockets/baileys:', e.message)
  console.error('Jalankan: npm install di folder services/whatsapp-bridge/')
  process.exit(1)
}

// ─── State ────────────────────────────────────────────────────────────────────
let sock = null
let latestQR = null
let connectionStatus = 'disconnected' // 'disconnected' | 'connecting' | 'connected'

// ─── Logger ringan ───────────────────────────────────────────────────────────
function log(level, ...args) {
  const ts = new Date().toISOString()
  console[level === 'error' ? 'error' : 'log'](`[${ts}] [${level.toUpperCase()}]`, ...args)
}

// ─── Kirim event ke Rentivo (Next.js) ─────────────────────────────────────────
async function sendToRentivo(event, payload) {
  const body = JSON.stringify({ event, payload })
  const signature = BAILEYS_WEBHOOK_SECRET
    ? 'sha256=' + crypto.createHmac('sha256', BAILEYS_WEBHOOK_SECRET).update(body).digest('hex')
    : ''

  try {
    const resp = await fetch(RENTIVO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(signature ? { 'x-inngest-signature': signature } : {}),
      },
      body,
      signal: AbortSignal.timeout(10000),
    })

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '')
      log('error', `Webhook gagal (${resp.status}): ${txt}`)
    } else {
      const data = await resp.json().catch(() => ({}))
      log('info', `Webhook terkirim → event=${event}`, data)
    }
  } catch (err) {
    log('error', 'Webhook error:', err?.message ?? err, 'Cause:', err?.cause?.message ?? err?.cause)
  }
}

// ─── Upload gambar ke Supabase Storage (bukti bayar) ─────────────────────────
async function uploadMediaToSupabase(buffer, mimeType, fileName) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    log('warn', 'SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak diset — skip upload gambar')
    return null
  }

  try {
    const uploadUrl = `${supabaseUrl}/storage/v1/object/payment-proofs/${fileName}`
    const resp = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: buffer,
    })

    if (!resp.ok) {
      const txt = await resp.text()
      log('error', 'Supabase upload gagal:', txt)
      return null
    }

    // Kembalikan public URL
    return `${supabaseUrl}/storage/v1/object/public/payment-proofs/${fileName}`
  } catch (err) {
    log('error', 'Upload error:', err?.message ?? err)
    return null
  }
}

// ─── Handler pesan masuk dari WhatsApp ───────────────────────────────────────
async function handleIncomingMessage(msg) {
  if (!msg.message) return // Bukan pesan konten
  if (msg.key.fromMe) return // Abaikan pesan dari bot sendiri

  const from = msg.key.remoteJid?.replace('@s.whatsapp.net', '').replace('@g.us', '') ?? ''
  const waMessageId = msg.key.id ?? null
  const sentAt = new Date(Number(msg.messageTimestamp ?? Date.now()) * 1000).toISOString()

  // Ekstrak nama dari notifikasi push
  const pushName = msg.pushName ?? from

  let content = ''
  let mediaUrl = null
  let mediaType = null

  const msgType = Object.keys(msg.message)[0]

  if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
    content = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? ''
  } else if (msgType === 'imageMessage') {
    content = msg.message?.imageMessage?.caption ?? ''
    mediaType = 'image'
    try {
      const buffer = await downloadMediaMessage(msg, 'buffer', {})
      const fileName = `${from}-${waMessageId}.jpg`
      mediaUrl = await uploadMediaToSupabase(buffer, 'image/jpeg', fileName)
    } catch (dlErr) {
      log('error', 'Download media error:', dlErr?.message)
    }
  } else if (msgType === 'documentMessage') {
    content = msg.message?.documentMessage?.caption ?? msg.message?.documentMessage?.fileName ?? ''
    mediaType = 'document'
  } else {
    // Tipe pesan lain (sticker, audio, dll) — catat tipe saja
    content = `[${msgType}]`
  }

  log('info', `Pesan masuk dari ${from} (${pushName}): "${content?.substring(0, 60)}"`)

  await sendToRentivo('chat.received', {
    tenantId: TENANT_ID,
    from,
    name: pushName,
    content,
    waMessageId,
    mediaUrl,
    mediaType,
    sentAt,
  })
}

// ─── Mulai Baileys Socket ─────────────────────────────────────────────────────
async function startSocket() {
  if (!makeWASocket || !useMultiFileAuthState) {
    log('error', 'Baileys functions tidak tersedia')
    return
  }

  connectionStatus = 'connecting'
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)

  // Fetch WA Web Version dynamically to avoid 405 Connection Failure
  let waVersion = [2, 3000, 1017578296]
  if (fetchLatestBaileysVersion) {
    try {
      const { version, isLatest } = await fetchLatestBaileysVersion()
      waVersion = version
      log('info', `Menggunakan WA Web versi ${version.join('.')}, isLatest: ${isLatest}`)
    } catch (err) {
      log('warn', `Gagal fetch versi terbaru, menggunakan fallback: ${waVersion.join('.')}`)
    }
  }

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    version: waVersion,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      latestQR = await qrcode.toDataURL(qr).catch(() => null)
      log('info', 'QR Code baru tersedia di GET /api/qr')
    }

    if (connection === 'open') {
      connectionStatus = 'connected'
      latestQR = null
      log('info', '✅ WhatsApp terhubung!')
    }

    if (connection === 'close') {
      connectionStatus = 'disconnected'
      const code = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = code !== DisconnectReason?.loggedOut
      log('warn', `Koneksi terputus (code=${code}). Reconnect: ${shouldReconnect}. Detail: ${lastDisconnect?.error?.message ?? lastDisconnect?.error}`)

      if (shouldReconnect) {
        setTimeout(startSocket, 5000) // Reconnect setelah 5 detik
      } else {
        log('error', 'Session expired / logged out. Hapus folder sessions/ dan scan QR ulang.')
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
    if (type !== 'notify') return
    for (const msg of msgs) {
      await handleIncomingMessage(msg).catch((err) =>
        log('error', 'handleIncomingMessage error:', err?.message)
      )
    }
  })
}

// ─── HTTP Server (Express-lite tanpa dependency tambahan) ────────────────────
// Menggunakan Node.js built-in http untuk menghindari dependency bloat
function parseBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(data))
      } catch {
        resolve({})
      }
    })
  })
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret',
  })
  res.end(body)
}

function verifySecret(req) {
  if (!BAILEYS_WEBHOOK_SECRET) return true
  const provided = req.headers['x-webhook-secret']
  return provided === BAILEYS_WEBHOOK_SECRET
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret',
    })
    res.end()
    return
  }

  // ── GET /api/status ─────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/status') {
    sendJson(res, 200, {
      status: connectionStatus,
      tenantId: TENANT_ID,
      hasQR: !!latestQR,
      webhookUrl: RENTIVO_WEBHOOK_URL,
    })
    return
  }

  // ── GET /api/qr ─────────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/qr') {
    if (!latestQR) {
      sendJson(res, 200, {
        ok: false,
        status: connectionStatus,
        message: connectionStatus === 'connected'
          ? 'WhatsApp sudah terhubung. QR tidak diperlukan.'
          : 'QR belum tersedia. Tunggu beberapa detik lalu refresh.',
      })
      return
    }

    // Kembalikan QR sebagai halaman HTML dengan gambar base64
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rentivo WA Pairing</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f7faf8; color: #1a1a2e; }
    h1 { font-size: 1.25rem; margin-bottom: 8px; color: #0F766E; }
    p { font-size: 0.875rem; color: #666; margin-bottom: 24px; text-align: center; max-width: 320px; }
    img { border: 4px solid #0F766E; border-radius: 12px; width: 280px; height: 280px; }
    .status { margin-top: 16px; font-size: 0.75rem; color: #888; font-family: monospace; }
  </style>
</head>
<body>
  <h1>Scan QR Code WhatsApp</h1>
  <p>Buka WhatsApp di HP Anda → Perangkat tertaut → Tautkan perangkat → Scan QR ini</p>
  <img src="${latestQR}" alt="QR Code WhatsApp Rentivo" />
  <p class="status">Tenant: ${TENANT_ID || 'not set'} &mdash; Status: ${connectionStatus}</p>
  <p class="status">Halaman ini akan auto-refresh setiap 30 detik</p>
  <script>setTimeout(() => location.reload(), 30000)</script>
</body>
</html>`

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  // ── POST /api/send-message ──────────────────────────────────────────────────
  // Endpoint ini dipanggil oleh Next.js ketika admin mengirim balasan dari inbox
  if (req.method === 'POST' && pathname === '/api/send-message') {
    if (!verifySecret(req)) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized — invalid x-webhook-secret' })
      return
    }

    const body = await parseBody(req)
    const { to, text } = body

    if (!to || !text) {
      sendJson(res, 400, { ok: false, error: 'Field "to" dan "text" wajib diisi' })
      return
    }

    if (connectionStatus !== 'connected' || !sock) {
      sendJson(res, 503, { ok: false, error: 'WhatsApp tidak terhubung. Scan QR terlebih dahulu.' })
      return
    }

    try {
      let jid
      if (to.includes('@lid')) {
        const clean = to.replace(/[^0-9]/g, '')
        jid = `${clean}@lid`
      } else if (to.includes('@s.whatsapp.net')) {
        jid = to
      } else {
        const normalised = to.replace(/[^0-9]/g, '').replace(/^0/, '62')
        jid = `${normalised}@s.whatsapp.net`
      }

      await sock.sendMessage(jid, { text })
      log('info', `Pesan terkirim ke ${jid}: "${text?.substring(0, 60)}"`)
      sendJson(res, 200, { ok: true, to: jid })
    } catch (err) {
      log('error', 'sendMessage error:', err?.message)
      sendJson(res, 500, { ok: false, error: err?.message ?? 'Internal error' })
    }
    return
  }

  // ── Fallback 404 ─────────────────────────────────────────────────────────────
  sendJson(res, 404, { ok: false, error: 'Not found' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  log('info', `🚀 Rentivo WhatsApp Bridge berjalan di http://localhost:${PORT}`)
  log('info', `   QR Code   : http://localhost:${PORT}/api/qr`)
  log('info', `   Status    : http://localhost:${PORT}/api/status`)
  log('info', `   Send Msg  : POST http://localhost:${PORT}/api/send-message`)
  log('info', `   Tenant    : ${TENANT_ID || '⚠️  TENANT_ID belum diset!'}`)
  log('info', `   Webhook → : ${RENTIVO_WEBHOOK_URL}`)
})

startSocket().catch((err) => {
  log('error', 'startSocket error:', err?.message ?? err)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', () => {
  log('info', 'Shutting down...')
  sock?.end?.()
  server.close()
  process.exit(0)
})
