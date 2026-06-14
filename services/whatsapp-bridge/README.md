# Rentivo WhatsApp Bridge

Layanan Node.js terpisah yang menjembatani WhatsApp ↔ Rentivo CRM menggunakan library [Baileys](https://github.com/WhiskeySockets/Baileys).

## Cara Kerja

```
Customer WA ─→ Baileys ─→ POST /api/inngest ─→ Rentivo Next.js
                               (chat.received event)
                               
Admin Inbox ─→ POST /api/inbox/send ─→ Next.js ─→ POST /api/send-message ─→ Baileys ─→ Customer WA
```

## Setup

### 1. Install dependencies

```bash
cd services/whatsapp-bridge
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Edit `.env` dan isi semua variabel yang diperlukan:

| Variabel | Keterangan |
|---|---|
| `PORT` | Port server (default: 3001) |
| `TENANT_ID` | UUID tenant dari database Supabase |
| `RENTIVO_WEBHOOK_URL` | URL Next.js endpoint `/api/inngest` |
| `BAILEYS_WEBHOOK_SECRET` | Secret key (sama dengan di Next.js `.env.local`) |
| `SUPABASE_URL` | URL Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key Supabase |

### 3. Jalankan service

```bash
npm start
```

Atau mode development dengan auto-restart:

```bash
npm run dev
```

### 4. Scan QR Code

Buka browser ke `http://localhost:3001/api/qr` dan scan QR dengan WhatsApp di HP.

## Endpoints

| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/api/status` | Status koneksi WA |
| `GET` | `/api/qr` | Halaman QR Code untuk pairing |
| `POST` | `/api/send-message` | Kirim pesan WA keluar (dipanggil oleh Next.js) |

### POST /api/send-message

Request body (JSON):
```json
{
  "to": "08123456789",
  "text": "Halo, pesanan Anda sudah dikonfirmasi!"
}
```

Header: `x-webhook-secret: <BAILEYS_WEBHOOK_SECRET>`

## Jalankan Bersama Next.js (Development)

Di terminal pertama:
```bash
# Di root project Rentivo
npm run dev
```

Di terminal kedua:
```bash
# Di folder services/whatsapp-bridge
npm start
```

## Deployment Production

Service ini harus dideploy terpisah dari Next.js (yang di-deploy ke Vercel). Pilihan hosting yang direkomendasikan:

- **Railway** — mudah, gratis tier tersedia
- **Fly.io** — performa tinggi, region Asia
- **Render** — free tier untuk service sederhana
- **VPS** (Hetzner/DigitalOcean) — paling fleksibel

> ⚠️ **Penting**: Pastikan `RENTIVO_WEBHOOK_URL` diupdate ke URL production Next.js setelah deployment.

## Satu Nomor per Tenant

Arsitektur saat ini: satu instance microservice = satu nomor WhatsApp = satu tenant.

Jika ada beberapa tenant, jalankan beberapa instance di port berbeda, masing-masing dengan `TENANT_ID` dan `PORT` yang berbeda.
