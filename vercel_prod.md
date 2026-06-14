# Panduan Setup Production Rentivo

Panduan ini membantu Anda melakukan deployment aplikasi **Next.js (ke Vercel)** dan **WhatsApp Bridge (ke Railway/Fly.io/VPS)** untuk lingkungan produksi nyata dengan nomor WhatsApp asli.

---

## BAGIAN 1: Next.js App (Vercel Deployment)

### Langkah 1: Hubungkan Git Repository
1. Push kode repository Rentivo Anda ke GitHub, GitLab, atau Bitbucket.
2. Masuk ke [Vercel Dashboard](https://vercel.com/) dan buat project baru dari repository tersebut.

### Langkah 2: Copy-Paste Environment Variables
Pada bagian **Settings > Environment Variables** di Vercel, masukkan variabel berikut dengan mencentang pilihan `Production`, `Preview`, dan `Development`.

Anda dapat menyalin teks di bawah ini dan mengisinya dengan nilai asli Anda:

```env
# Database & Supabase URL (Pastikan port menggunakan Transaction Pooler port 6543)
SUPABASE_DB_URL=postgres://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# API Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API Key (Untuk ekstraksi data sewa)
GEMINI_API_KEY=AIzaSy...

# Inngest Signing Key (Didapatkan dari dashboard Inngest Anda)
INNGEST_SIGNING_KEY=sign_key_...

# Koneksi WhatsApp Bridge (Railway/VPS URL)
NEXT_PUBLIC_BAILEYS_SERVICE_URL=https://whatsapp-bridge-production.up.railway.app
BAILEYS_WEBHOOK_SECRET=rahasia_jembatan_wa_123!
```

### Langkah 3: Deploy
Klik **Deploy**. Setelah selesai, Vercel akan memberikan URL publik untuk aplikasi Anda (contoh: `https://rentivo-app.vercel.app`).

---

## BAGIAN 2: WhatsApp Bridge (Railway Deployment)

Layanan WhatsApp Bridge terletak di subfolder `services/whatsapp-bridge`. Karena ia merupakan aplikasi Node.js yang berjalan terus-menerus (*persistent connection*), ia tidak dapat dideploy ke Vercel dan harus menggunakan platform seperti **Railway** atau **VPS**.

### Langkah-langkah Deployment di Railway:
1. Masuk ke [Railway Dashboard](https://railway.app/).
2. Buat proyek baru (*New Project*) dan pilih **Deploy from GitHub repo**.
3. Pilih repository Rentivo Anda, lalu masuk ke pengaturan **Variables**.
4. Set **Root Directory** ke `services/whatsapp-bridge` agar Railway tahu aplikasi mana yang harus dijalankan.
5. Masukkan variabel environment di bawah ini:

```env
# Port aplikasi (Railway otomatis mengisi ini, biarkan default)
PORT=3001

# ID Tenant utama Anda (Ambil dari tabel public.tenants kolom id di Supabase)
TENANT_ID=550e8400-e29b-41d4-a716-446655440000

# URL Webhook Next.js Vercel Anda (Sangat penting untuk menerima pesan masuk)
RENTIVO_WEBHOOK_URL=https://rentivo-app.vercel.app/api/inngest

# Kunci rahasia pengaman (Harus sama dengan yang di-input di Vercel)
BAILEYS_WEBHOOK_SECRET=rahasia_jembatan_wa_123!

# Supabase Credentials untuk upload media
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

6. Setelah dideploy, Railway akan memberikan URL publik untuk WhatsApp Bridge Anda (contoh: `https://whatsapp-bridge-production.up.railway.app`).
7. **PENTING:** Pastikan URL Railway tersebut dimasukkan ke variabel `NEXT_PUBLIC_BAILEYS_SERVICE_URL` di konfigurasi **Vercel** Anda.

---

## BAGIAN 3: Aktivasi & Scan QR Code

Setelah Next.js di Vercel dan WhatsApp Bridge di Railway aktif dan saling terhubung:

1. Buka URL publik jembatan WhatsApp Anda di browser pada path `/api/qr`:
   ```
   https://[URL_BRIDGE_RAILWAY_ANDA]/api/qr
   ```
2. Scan QR Code yang muncul di halaman tersebut menggunakan HP yang ingin digunakan sebagai bot AI (Menu **Linked Devices / Perangkat Tertaut** di WhatsApp).
3. Selesai! Sistem AI Rentivo Anda sekarang sudah aktif secara penuh di lingkungan produksi menggunakan nomor WhatsApp asli Anda.
