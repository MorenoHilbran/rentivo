# Rentivo Local Setup

Dokumen ini ditujukan untuk siapa pun yang baru clone repository ini dan ingin menjalankan proyek di lokal.

## Prasyarat

- Node.js versi LTS yang masih didukung oleh Next.js.
- npm.
- Akses ke Supabase project yang dipakai aplikasi ini.
- Akses ke database Supabase untuk menjalankan migration.

## 1. Clone repository

```bash
git clone <url-repository>
cd rentivo
```

## 2. Install dependency

Repository ini memakai npm, jadi install dengan:

```bash
npm install
```

## 3. Siapkan file environment

Buat file `.env.local` di root project dan isi minimal variabel berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
```

Variabel tambahan yang dipakai saat fitur tertentu aktif:

```env
INNGEST_SIGNING_KEY=
GEMINI_API_URL=
GEMINI_API_KEY=
AI_AUTO_APPROVE=false
AI_AUTO_APPROVE_CONFIDENCE=0.6
INNGEST_POLL_INTERVAL_MS=3000
INNGEST_POLL_BATCH=5
```

Catatan singkat:

- `SUPABASE_DB_URL` harus memakai connection string database Supabase yang bisa dipakai Drizzle.
- `SUPABASE_SERVICE_ROLE_KEY` dipakai untuk operasi admin dan seeding data.
- `GEMINI_API_URL` dan `GEMINI_API_KEY` bersifat opsional. Jika belum diisi, aplikasi tetap bisa jalan dengan mock extractor untuk development.
- `INNGEST_SIGNING_KEY` juga opsional untuk local development; kalau kosong, verifikasi signature dilewati.

## 4. Jalankan migration database

Setelah env terisi, sinkronkan schema ke database:

```bash
npm run db:push
```

Kalau perlu generate migration baru dari perubahan schema, gunakan:

```bash
npm run db:generate
```

## 5. Seed data demo

Untuk mengisi data contoh dan akun demo, jalankan:

```bash
npm run db:seed
```

Script ini akan membuat atau memperbarui data demo menggunakan credential contoh berikut:

- `owner@rentivo.demo` / `DemoOwner123!`
- `superadmin@rentivo.demo` / `DemoAdmin123!`

## 6. Jalankan aplikasi


```bash
npm run dev
```

Buka browser ke alamat yang ditampilkan Next.js, biasanya `http://localhost:3000`.

## 7. Jalankan worker background untuk draft AI

Jika ingin memproses draft AI secara lokal, jalankan worker ini di terminal terpisah:

```bash
npm run inngest:worker
```

## 8. Validasi cepat

Kalau ingin memastikan project siap dipakai, jalankan:

```bash
npm run lint
npm run build
```

## Urutan setup yang disarankan

1. `npm install`
2. Isi `.env.local`
3. `npm run db:push`
4. `npm run db:seed`
5. `npm run dev`
6. Jalankan `npm run inngest:worker` jika dibutuhkan
7. Jalankan WhatsApp Bridge jika memerlukan integrasi WA nyata (lihat bagian di bawah)

## Troubleshooting singkat

- Jika login atau session Supabase gagal, cek ulang `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY`.
- Jika koneksi database error, cek `SUPABASE_DB_URL` dan pastikan database Supabase bisa diakses dari mesin lokal.
- Jika analisis AI tidak jalan, aplikasi tetap bisa dipakai dengan mode mock selama `GEMINI_API_KEY` belum diisi.

---

## 9. Setup WhatsApp Bridge (Baileys Microservice)

Layanan ini opsional untuk development, wajib untuk production.

### 9.1. Install dependencies Baileys

```bash
npm run wa:install
```

### 9.2. Konfigurasi environment Baileys

```bash
cp services/whatsapp-bridge/.env.example services/whatsapp-bridge/.env
```

Edit `services/whatsapp-bridge/.env` dan isi:
- `TENANT_ID` — UUID tenant dari tabel `tenants` di Supabase
- `RENTIVO_WEBHOOK_URL` — `http://localhost:3000/api/inngest` untuk development
- `BAILEYS_WEBHOOK_SECRET` — Harus sama dengan `BAILEYS_WEBHOOK_SECRET` di `.env.local`
- `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` — Sama dengan yang ada di `.env.local`

### 9.3. Jalankan WhatsApp Bridge

Di terminal terpisah:

```bash
npm run wa:dev
```

### 9.4. Pairing QR Code

Buka browser ke `http://localhost:3001/api/qr` dan scan QR dengan nomor WhatsApp bisnis Anda menggunakan fitur "Perangkat Tertaut" di WhatsApp.

### 9.5. Verifikasi koneksi

```
GET http://localhost:3001/api/status
```

Jika response `"status": "connected"`, WhatsApp Bridge sudah aktif dan siap menerima chat masuk.