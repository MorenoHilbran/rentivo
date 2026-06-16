# Rentivo Design System — FlowTech Theme

Version: 1.0
Scope: Frontend UI, Landing Page, Auth, Owner/Admin Dashboard, SuperAdmin Dashboard
Product: Rentivo — AI-Assisted Omnichannel CRM for Rental Business

---

## 1. Brand Foundation

### 1.1 Brand Essence

Rentivo adalah platform CRM dan operasional rental yang membantu bisnis persewaan mengelola chat customer, data pelanggan, booking, inventaris, invoice, pembayaran manual, return barang, dan workflow operasional dalam satu dashboard modern.

Rentivo bukan marketplace dan bukan aplikasi customer utama. Rentivo adalah alat kerja untuk owner, admin, dan staff bisnis rental agar proses dari chat sampai transaksi selesai menjadi lebih cepat, rapi, dan terukur.

### 1.2 Brand Personality

Rentivo harus terasa:

* Modern
* Profesional
* Cerdas
* Terstruktur
* Cepat
* Operasional
* Trustworthy
* Advanced, tapi tetap mudah dipahami

Rentivo tidak boleh terasa:

* Kuno
* Terlalu corporate lama
* Terlalu playful
* Seperti marketplace umum
* Seperti aplikasi kasir biasa
* Terlalu AI-generated
* Terlalu ramai atau dekoratif

### 1.3 Visual Theme Name

Tema visual utama Rentivo disebut:

**Rentivo FlowTech Theme**

Makna:

* **Flow**: menggambarkan alur chat customer menjadi booking, invoice, pembayaran, rental berjalan, return, dan completed.
* **Tech**: menggambarkan platform SaaS modern dengan AI assistant, realtime inbox, dan workflow automation.
* **RentalOps**: fokus pada operasional bisnis rental, bukan sekadar CRM umum.

---

## 2. Logo Direction

### 2.1 Logo Style

Logo Rentivo menggunakan karakter modern SaaS dengan kombinasi:

* Navy sebagai warna utama untuk trust dan profesionalitas
* Blue sebagai warna teknologi dan action
* Cyan/turquoise sebagai warna flow, AI, realtime, dan aksen modern

Logo dapat digunakan dalam dua format:

1. **Full Logo**
   Symbol + wordmark Rentivo

2. **Icon Only**
   Symbol Rentivo untuk favicon, app icon, sidebar collapsed, dan avatar workspace

### 2.2 Logo Usage

Gunakan full logo pada:

* Landing page navbar
* Auth page
* Register page
* Footer
* Proposal atau pitch deck

Gunakan icon-only pada:

* Favicon
* Sidebar compact state
* App loading state
* Empty state illustration
* Dashboard mini branding

### 2.3 Logo Clear Space

Berikan ruang kosong minimal sebesar tinggi huruf “R” di sekitar logo.

Jangan menempelkan logo terlalu dekat dengan tepi card, navbar, atau elemen lain.

### 2.4 Logo Do and Don't

Do:

* Pakai logo di atas background putih, soft blue, atau navy solid.
* Pastikan logo tetap tajam dan tidak blur.
* Gunakan versi transparent untuk implementasi web.
* Gunakan ukuran proporsional.

Don't:

* Jangan beri shadow berat pada logo.
* Jangan ubah warna logo sembarangan.
* Jangan stretch atau compress logo.
* Jangan taruh logo di background ramai.
* Jangan pakai logo versi low resolution.

---

## 3. Color System

### 3.1 Primary Brand Colors

Gunakan palette ini sebagai dasar semua UI.

```css
:root {
  --rentivo-navy: #061B5C;
  --rentivo-navy-900: #03113D;
  --rentivo-navy-800: #061B5C;
  --rentivo-navy-700: #0B2878;

  --rentivo-blue: #1557FF;
  --rentivo-blue-600: #1557FF;
  --rentivo-blue-500: #2563EB;
  --rentivo-blue-100: #DBEAFE;

  --rentivo-cyan: #12CBBE;
  --rentivo-cyan-600: #0EAFA4;
  --rentivo-cyan-500: #12CBBE;
  --rentivo-cyan-100: #CCFBF1;

  --rentivo-sky: #0EA5E9;
}
```

### 3.2 Neutral Colors

```css
:root {
  --rentivo-bg: #F7FAFF;
  --rentivo-bg-soft: #F8FAFC;
  --rentivo-surface: #FFFFFF;
  --rentivo-surface-muted: #F1F5F9;

  --rentivo-text: #07162F;
  --rentivo-text-soft: #334155;
  --rentivo-muted: #64748B;
  --rentivo-muted-light: #94A3B8;

  --rentivo-border: #E2E8F0;
  --rentivo-border-soft: #EDF2F7;
}
```

### 3.3 Semantic Colors

```css
:root {
  --rentivo-success: #16A34A;
  --rentivo-success-soft: #DCFCE7;

  --rentivo-warning: #F59E0B;
  --rentivo-warning-soft: #FEF3C7;

  --rentivo-danger: #EF4444;
  --rentivo-danger-soft: #FEE2E2;

  --rentivo-info: #0EA5E9;
  --rentivo-info-soft: #E0F2FE;
}
```

### 3.4 Gradient System

Primary CTA gradient:

```css
background: linear-gradient(135deg, #1557FF 0%, #12CBBE 100%);
```

Hero glow gradient:

```css
background:
  radial-gradient(circle at top left, rgba(21, 87, 255, 0.12), transparent 34%),
  radial-gradient(circle at top right, rgba(18, 203, 190, 0.14), transparent 32%),
  #F7FAFF;
```

Dark hero gradient:

```css
background:
  radial-gradient(circle at top left, rgba(18, 203, 190, 0.18), transparent 30%),
  radial-gradient(circle at bottom right, rgba(21, 87, 255, 0.22), transparent 34%),
  #061B5C;
```

### 3.5 Color Usage Rules

Primary blue digunakan untuk:

* Primary CTA
* Active nav item
* Main chart highlight
* Link penting
* Main action button

Cyan digunakan untuk:

* AI assistant highlight
* Flow indicator
* Realtime status
* Success-like operational signal
* Decorative accent di landing page

Navy digunakan untuk:

* Sidebar dashboard
* Heading kuat
* Footer
* Premium dark section
* Brand authority

Amber/warning digunakan untuk:

* Pending payment
* Waiting verification
* Manual refund required
* Due date warning

Red/danger digunakan untuk:

* Cancelled
* Rejected
* Overdue critical
* Delete/destructive action

---

## 4. Typography

### 4.1 Font Recommendation

Primary font:

* **Plus Jakarta Sans** for headings and marketing sections
* **Inter** for dashboard body, forms, tables, and operational UI
* **JetBrains Mono** or **Geist Mono** for IDs, invoice numbers, booking codes, and timestamps

If only one font is used, use **Inter** for everything.

### 4.2 Typography Scale

Landing page:

```css
--text-hero: 64px;
--text-hero-mobile: 42px;
--text-section-title: 44px;
--text-section-title-mobile: 32px;
--text-subtitle: 20px;
--text-body-lg: 18px;
--text-body: 16px;
```

Dashboard:

```css
--text-page-title: 28px;
--text-section-title: 20px;
--text-card-title: 16px;
--text-body: 14px;
--text-caption: 12px;
--text-micro: 11px;
```

### 4.3 Font Weight Rules

* Hero heading: 700–800
* Section heading: 700
* Page heading: 700
* Card title: 600
* Button: 600
* Body: 400–500
* Caption: 500
* Badge: 600

### 4.4 Copywriting Tone

Gunakan Bahasa Indonesia yang:

* Ringkas
* Jelas
* Profesional
* Natural
* Tidak terlalu formal
* Tidak terlalu marketing lebay

Contoh tone yang benar:

* “Kelola chat, booking, dan invoice rental dalam satu dashboard.”
* “Cek ketersediaan barang sebelum booking dikonfirmasi.”
* “Pembayaran menunggu verifikasi admin.”
* “Booking dibatalkan dan inventory sudah dilepas.”

Hindari tone seperti:

* “Revolusi bisnis rental Anda dengan teknologi paling mutakhir.”
* “Platform super canggih berbasis AI yang mengubah segalanya.”
* “Nikmati pengalaman digitalisasi tiada tara.”

---

## 5. Layout System

### 5.1 Spacing

Gunakan sistem 8px grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 5.2 Container Width

Landing page:

```css
max-width: 1180px;
padding-inline: 24px;
```

Dashboard:

```css
sidebar-width: 264px;
main-content-padding: 28px;
page-max-width: none;
```

Auth page:

```css
auth-card-width: 460px;
auth-wrapper-max-width: 1120px;
```

### 5.3 Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;
--radius-2xl: 32px;
--radius-full: 999px;
```

Usage:

* Button: 12px or full pill for landing CTA
* Card dashboard: 18px
* Modal: 24px
* Input: 12px
* Badge: full pill
* Landing hero mockup: 24px

### 5.4 Shadows

Gunakan shadow halus, bukan shadow tebal.

```css
--shadow-card: 0 12px 30px rgba(15, 23, 42, 0.06);
--shadow-card-hover: 0 18px 42px rgba(15, 23, 42, 0.10);
--shadow-floating: 0 24px 80px rgba(6, 27, 92, 0.14);
--shadow-modal: 0 32px 90px rgba(15, 23, 42, 0.22);
```

Do:

* Gunakan shadow untuk hierarchy.
* Landing page boleh punya floating shadow lebih dramatis.
* Dashboard cukup halus.

Don't:

* Jangan pakai shadow hitam terlalu tebal.
* Jangan pakai neumorphism.
* Jangan pakai glow berlebihan di dashboard.

---

## 6. Motion System

### 6.1 Motion Philosophy

Motion Rentivo harus memperkuat kesan:

* Cepat
* Flowing
* Modern
* Responsif
* Premium

Motion tidak boleh mengganggu proses kerja admin.

### 6.2 Landing Page Motion

Landing page boleh lebih ekspresif.

Gunakan:

* GSAP untuk scroll reveal, hero sequence, parallax ringan, floating dashboard mockup.
* ReactBits boleh dipakai sebagai inspirasi visual untuk animated background, spotlight, aurora, atau flow effect.
* CSS animation untuk gradient glow dan floating cards.
* Framer Motion boleh dipakai untuk component reveal jika lebih praktis.

Allowed landing animations:

* Hero headline reveal
* CTA fade-up
* Floating dashboard preview
* Chat bubble animation
* Flow line animation dari Chat → Booking → Invoice → Return
* Section scroll reveal
* Counter animation
* Feature cards stagger reveal
* Subtle background orb movement

Avoid:

* Scroll hijacking
* Animasi terlalu cepat
* Text scramble berlebihan
* Background bergerak terlalu ramai
* Cursor effect yang mengganggu
* Animasi yang membuat halaman berat

### 6.3 Dashboard Motion

Dashboard harus lebih tenang.

Gunakan Framer Motion untuk:

* Page fade-in ringan
* Card fade-up
* Modal scale + fade
* Dropdown open/close
* Toast slide-in
* Sidebar active indicator
* Table row hover
* Button loading state

Dashboard motion timing:

```js
const dashboardMotion = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1]
}
```

Landing motion timing:

```js
const landingMotion = {
  duration: 0.65,
  ease: [0.16, 1, 0.3, 1]
}
```

### 6.4 Reduced Motion

Selalu hormati `prefers-reduced-motion`.

Jika user mengaktifkan reduced motion:

* Matikan parallax.
* Matikan loop animation.
* Gunakan fade sederhana.
* Jangan animasikan angka terlalu agresif.

### 6.5 Cinematic Handoff (StoryIntro -> Hero)

Untuk menjaga transisi yang premium dan tanpa *blank space* (*no empty handoff phase*):
* **Overlap Reveal**: Animasi masuk *hero background* dan *content* boleh dimulai (*overlap*) sebelum animasi *exit* Story scene 3 selesai sepenuhnya, tetapi jangan membuat story text ghosting.
* **Navbar Entrance**: Navbar tidak boleh dianimasikan dari timeline `StoryIntro`. Navbar hanya boleh muncul dari state `heroActive` setelah `HeroSection` melewati threshold sendiri.
* **ScrollTrigger Start**: Untuk layout desktop yang memakai overlap `margin-top: -100vh`, trigger navbar harus telat, sekitar `start: "top 12%"`, agar navbar tidak terlihat saat Story scene 3 masih menjadi fokus utama.
* **Continuous Background**: Background Story dan Hero diselaraskan menggunakan base color `#03113D` untuk menghindari fase kontras kosong/hitam.

---

## 7. Landing Page Design

### 7.1 Purpose

Landing page bertujuan menjelaskan Rentivo kepada calon pengguna sebelum login atau register.

Sebelumnya aplikasi langsung masuk ke login. Setelah landing page dibuat, flow harus menjadi:

```txt
/              → Landing page publik
/login         → Login
/register      → Daftar workspace
/register/setup → Setup workspace owner
/dashboard     → Dashboard setelah login
/superadmin    → SuperAdmin dashboard
```

### 7.2 Landing Page Structure

Landing page wajib memiliki:

1. Navbar
2. Hero section
3. Problem section
4. Solution section
5. Feature grid
6. Workflow section
7. Dashboard preview
8. Role section
9. Final CTA
10. Footer

### 7.3 Navbar

Navbar style:

* Transparent atau white glass saat top.
* Sticky saat scroll.
* Logo kiri.
* Menu tengah atau kanan.
* CTA kanan.

Menu:

* Fitur
* Workflow
* Solusi
* Masuk
* Mulai Gratis / Daftarkan Bisnis

Navbar CTA:

* Secondary: “Masuk”
* Primary: “Mulai Kelola Rental”

### 7.4 Hero Section

Hero headline:

“Kelola Chat, Booking, Inventaris, dan Invoice Rental dalam Satu CRM Pintar”

Alternative headline:

“Ubah Chat Customer Menjadi Booking Rental yang Rapi dan Terukur”

Subheadline:

“Rentivo membantu bisnis rental mengelola percakapan customer, ketersediaan barang, booking, invoice, pembayaran manual, hingga return dalam satu dashboard modern.”

Hero CTA:

* Primary: “Mulai Kelola Rental”
* Secondary: “Lihat Demo”

Hero visual:

* Dashboard mockup
* Chat inbox panel
* AI draft booking card
* Calendar availability card
* Invoice/payment verification card
* Return status card

Hero visual should feel like a premium SaaS product preview, not a generic illustration.

### 7.5 Problem Section

Highlight problems:

* Chat customer tersebar
* Booking dicatat manual
* Risiko double booking
* Inventory dan jadwal tidak sinkron
* Invoice dan pembayaran sulit dipantau
* Return dan denda sering tidak terdokumentasi
* Cancellation dan refund manual sering berantakan

Visual style:

* Problem cards
* Subtle red/amber warning accent
* Use icons, not cartoon illustrations

### 7.6 Solution Section

Core message:

“Satu workspace untuk seluruh siklus rental.”

Solution pillars:

* Inbox terpusat
* Booking berbasis availability
* Inventory unit tracking
* Invoice dan verifikasi pembayaran
* Return dan damage fee
* AI assistant sebagai copilot

### 7.7 Feature Grid

Feature cards:

1. Omnichannel Inbox
2. AI Draft Booking
3. Booking Calendar
4. Inventory Availability
5. Invoice & Payment Verification
6. Return Management
7. Customer CRM
8. Cancellation & Manual Refund Tracking

Feature card style:

* White cards
* Soft border
* Icon in blue/cyan container
* Short description
* Hover lift on landing only

### 7.8 Workflow Section

Workflow:

```txt
Chat Masuk → AI Draft → Booking → Invoice → Verifikasi Pembayaran → Rental Berjalan → Return → Completed
```

Alternative shorter workflow:

```txt
Chat → Booking → Invoice → Payment → Return
```

Visual:

* Horizontal flow on desktop
* Vertical flow on mobile
* Blue/cyan connecting line
* Small status badges

### 7.9 Dashboard Preview Section

Show preview of owner dashboard:

* Revenue summary
* Active rentals
* Pending payment
* Return due today
* Inventory status
* Latest bookings
* Inbox preview

Dashboard preview should not be too detailed. It is a marketing visual.

### 7.10 Role Section

Roles:

* Owner: monitor revenue, booking, inventory, team
* Admin: handle chat, booking, invoice, payment verification
* Staff: handle delivery, pickup, return condition

Use simple role cards.

### 7.11 Final CTA

Final CTA copy:

“Bangun operasional rental yang lebih rapi bersama Rentivo.”

CTA:

* “Daftarkan Bisnis”
* “Masuk ke Dashboard”

### 7.12 Footer

Footer content:

* Logo
* Short product description
* Product links
* Legal placeholder
* Contact placeholder

---

## 8. Auth Page Design

### 8.1 Auth Visual Direction

Auth page harus terasa satu keluarga dengan landing page.

Layout:

* Left side: brand/benefit panel or soft dashboard illustration
* Right side: login/register card
* Background: soft blue gradient
* Card: white with subtle border and shadow

### 8.2 Login Page

Login page copy:

Title:

“Masuk ke Rentivo”

Subtitle:

“Kelola operasional rental, chat customer, booking, invoice, dan return dari satu dashboard.”

Fields:

* Email
* Password

CTA:

“Masuk ke Dashboard”

Secondary:

“Belum punya workspace? Daftarkan bisnis”

Error style:

* Red soft alert
* Clear human message
* No raw technical error

### 8.3 Register Page

Register page copy:

Title:

“Daftarkan Bisnis Rental Anda”

Subtitle:

“Buat workspace Rentivo untuk mulai mengelola chat, booking, inventory, dan invoice secara lebih rapi.”

Fields:

* Nama bisnis
* Nama pemilik
* Email
* Password

CTA:

“Buat Workspace”

Secondary:

“Sudah punya akun? Masuk”

### 8.4 Register Setup Page

Purpose:

Final onboarding for owner after workspace created.

Possible setup fields:

* Nama bisnis
* Jenis rental
* Nomor WhatsApp bisnis
* Alamat bisnis
* Jam operasional
* Bank/payment information

CTA:

“Simpan dan Masuk Dashboard”

Tone:

* Helpful
* Tidak terlalu panjang
* Clear progress

---

## 9. Dashboard Design

### 9.1 Dashboard Philosophy

Dashboard adalah alat kerja. Prioritasnya:

* Cepat dibaca
* Mudah dipakai
* Tidak terlalu ramai
* Tidak terlalu banyak animasi
* Data penting terlihat jelas
* Action utama mudah ditemukan

### 9.2 Dashboard Shell

Layout:

* Sidebar kiri
* Main content kanan
* Optional topbar per page
* Background soft blue/gray
* Cards white

Sidebar:

* Navy background
* Active item menggunakan blue/cyan highlight
* Logo/tenant name di atas
* User info di bawah
* Logout di footer

Main content:

* Padding 24–32px
* Max content width flexible
* Header page di atas
* Action button kanan atas
* Cards/list/table di bawah

### 9.3 Sidebar Navigation

Owner/Admin main nav:

* Dashboard
* Kotak Masuk
* Pemesanan
* Inventaris
* Invoice
* Pengembalian
* Pelanggan

Owner-only:

* Pengaturan
* Manajemen Tim

Support:

* Tiket Bantuan

Staff nav:

* Pengembalian
* Tugas Lapangan if implemented

SuperAdmin nav:

* Command Center
* Tenants
* Tickets
* Platform Analytics if implemented

### 9.4 Page Header Pattern

Each dashboard page should use:

* Title
* Short description
* Primary action button
* Optional filters/search

Example:

Title:

“Pemesanan”

Description:

“Kelola jadwal booking, status rental, dan pembatalan dalam satu tempat.”

Primary action:

“Buat Booking”

### 9.5 Dashboard Cards

Card style:

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}
```

Card rules:

* Use white background
* Use subtle border
* Use soft shadow
* Keep spacing generous
* Avoid dense content
* Use icon badge for category

### 9.6 KPI Cards

KPI card contains:

* Label
* Value
* Delta/status
* Icon
* Optional helper text

Examples:

* Total Pendapatan
* Booking Aktif
* Menunggu Verifikasi
* Return Hari Ini
* Customer Baru
* Inventory Tersedia

### 9.7 Tables and Lists

Tables should be:

* Clean
* Spacious
* Searchable when needed
* Filterable by status
* Row hover subtle
* Action menu on right

Avoid:

* Too many borders
* Small unreadable text
* Dense admin-panel look

### 9.8 Empty State

Empty state structure:

* Small icon/illustration
* Clear title
* Helpful explanation
* Primary action

Example:

Title:

“Belum ada booking”

Text:

“Booking yang dibuat dari chat atau manual akan muncul di sini.”

CTA:

“Buat Booking Pertama”

### 9.9 Loading State

Use:

* Skeleton cards
* Skeleton table rows
* Button loading spinner
* Avoid full-page spinner unless initial auth check

---

## 10. Component Guidelines

### 10.1 Buttons

Primary button:

* Blue/cyan gradient on landing
* Solid blue in dashboard
* White text
* Medium radius
* Clear hover and active state

Secondary button:

* White background
* Border
* Navy text

Ghost button:

* Transparent
* Muted text
* Hover soft background

Destructive button:

* Red
* Use only for destructive action
* Always confirm with modal

Button labels must use action verbs:

* “Buat Booking”
* “Verifikasi Pembayaran”
* “Simpan Perubahan”
* “Batalkan Booking”
* “Setujui Draft”
* “Tolak Pembayaran”

### 10.2 Forms

Form style:

* Label above input
* Helper text below if needed
* Error text below field
* Required fields clearly marked
* Avoid placeholder-only labels

Input style:

* Height 42–46px
* Border soft
* Focus ring blue/cyan
* Radius 12px

### 10.3 Badges

Badges indicate status.

Booking badges:

* Draft: gray
* Pending Payment: amber
* Confirmed: blue
* Active/Ongoing: cyan
* Returning: purple/sky
* Completed: green
* Cancelled: red/gray

Invoice badges:

* Draft: gray
* Sent: blue
* Unpaid: amber
* Pending Verification: amber
* Paid: green
* Overdue: red
* Cancelled: gray

Inventory badges:

* Available: green
* Rented: blue
* Checking: amber
* Maintenance: orange
* Damaged: red
* Lost: red/dark
* Retired: gray

Conversation badges:

* New: blue
* In Progress: cyan
* Waiting Customer: amber
* Waiting Payment: amber
* Booking Drafted: purple
* Cancellation Requested: red/amber
* Converted: green
* Closed: gray

### 10.4 Modals

Modal usage:

* Create/edit forms
* Confirmation
* Detail preview
* Payment proof review
* Cancel booking flow
* Return condition form

Modal rules:

* Clear title
* Short description
* Main content
* Primary action right
* Cancel action left/secondary
* Destructive action clearly separated

### 10.5 Toasts

Toast tone:

* Success: green
* Info: blue
* Warning: amber
* Error: red

Toast copy:

* Short
* Human-readable
* Action-oriented

Examples:

* “Booking berhasil dibuat.”
* “Pembayaran berhasil diverifikasi.”
* “Inventory sudah diperbarui.”
* “Gagal menyimpan perubahan. Coba lagi.”

---

## 11. Page-Specific Guidelines

### 11.1 Dashboard Home

Owner dashboard should include:

* Revenue summary
* Active bookings
* Pending payment verification
* Return due today
* Inventory availability
* Recent bookings
* Recent conversations
* Manual refund required if implemented
* Cancellation summary if implemented

Admin dashboard should include:

* New chat
* Pending booking
* Pending payment verification
* Today delivery/return
* Cancellation requested

### 11.2 Inbox

Inbox layout:

* Conversation list left
* Message thread center
* Customer/AI panel right

Important UI elements:

* Conversation status
* Customer name and phone
* Message history
* Internal note
* AI suggested reply
* AI draft booking
* Approve/reject draft action

AI must be visually positioned as assistant, not autonomous decision maker.

Use labels:

* “Saran AI”
* “Draft Booking”
* “Butuh Persetujuan Admin”
* “Informasi yang Belum Lengkap”

### 11.3 Booking

Booking UI should support:

* List/calendar view
* Status filter
* Customer info
* Rental date range
* Item/unit info
* Invoice/payment link
* Cancellation action based on status

Cancellation UI must clearly show:

* Booking status
* Invoice/payment status
* Required reason
* Payment resolution if paid
* Warning that refund is manual

### 11.4 Inventory

Inventory UI should distinguish:

* Product type
* Inventory unit

Product example:

* Kamera Canon EOS M50

Unit example:

* Canon EOS M50 Unit A
* Canon EOS M50 Unit B

Inventory table should show:

* Product name
* Category
* Pricing
* Unit count
* Available count
* Rented count
* Maintenance/damaged count

### 11.5 Invoice

Invoice UI should show:

* Invoice number
* Customer
* Booking
* Amount
* Deposit if implemented
* Payment status
* Proof image
* Verification action

Payment proof review:

* Show uploaded image
* Accept payment
* Reject payment with reason
* Update booking to confirmed if accepted

### 11.6 Return

Return UI should show:

* Booking info
* Customer info
* Item/unit returned
* Return date
* Condition notes
* Damage fee
* Late fee
* Photo if implemented
* Complete return action

MVP uses full return only. Avoid complex partial return UI unless backend already supports it.

### 11.7 Customer CRM

Customer page should show:

* Customer name
* WhatsApp number
* Tags
* Conversation history
* Booking history
* Cancellation history
* Manual refund history if available
* Notes

Tags should help admin make decisions, not judge customer too aggressively.

### 11.8 Settings

Settings page should be owner-focused.

Sections:

* Workspace profile
* Business information
* Team management
* Role assignment
* Payment information
* Notification preferences if implemented

Admin should not see sensitive workspace/team settings unless explicitly allowed.

### 11.9 SuperAdmin

SuperAdmin style should still follow Rentivo theme but feel more platform-level.

SuperAdmin pages:

* Tenant list
* Tenant status active/suspended
* Owner info
* Platform tickets
* Basic analytics
* Impersonate if implemented

Use stronger caution styling for suspend/impersonate actions.

---

## 12. Responsive Design

### 12.1 Breakpoints

Use common breakpoints:

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 12.2 Landing Responsive

Desktop:

* Two-column hero
* Horizontal workflow
* Feature grid 3–4 columns

Tablet:

* Hero still two-column if enough space
* Feature grid 2 columns

Mobile:

* Single-column hero
* CTA stacked
* Workflow vertical
* Navbar collapses
* Dashboard mockup simplified

### 12.3 Dashboard Responsive

Desktop:

* Fixed sidebar
* Main content full width

Tablet:

* Sidebar can collapse or become drawer
* Cards become 2 columns

Mobile:

* Sidebar becomes bottom nav or drawer
* Tables become cards
* Important actions remain sticky/top visible
* Staff return flow must be mobile-friendly

---

## 13. Accessibility

Minimum requirements:

* Text contrast must be readable
* All buttons must have visible focus state
* Inputs must have labels
* Icon-only buttons must have aria-label
* Do not rely on color only for status
* Use semantic HTML where possible
* Modals must be keyboard accessible
* Loading states must not trap user
* Respect reduced motion

Focus ring:

```css
outline: 2px solid rgba(21, 87, 255, 0.45);
outline-offset: 2px;
```

---

## 14. Data Formatting

### 14.1 Currency

Use Indonesian Rupiah formatting.

Example:

```js
new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(value)
```

Display:

```txt
Rp150.000
Rp1.250.000
```

### 14.2 Dates

Use Indonesian readable format.

Examples:

```txt
14 Jun 2026
14 Jun 2026, 18.30
```

### 14.3 IDs

Booking number, invoice number, and internal IDs should use mono font when displayed as codes.

Examples:

```txt
BKG-2026-0012
INV-2026-0048
```

---

## 15. Implementation Rules

### 15.1 Frontend Stack

Use:

* Next.js App Router
* JavaScript
* Tailwind CSS v4
* Supabase client/server utilities already in project
* Framer Motion for dashboard microinteraction
* GSAP for landing page scroll/hero animation only if needed

### 15.2 Component Organization

Recommended structure:

```txt
src/components/landing/
  LandingNavbar.js
  HeroSection.js
  ProblemSection.js
  SolutionSection.js
  FeatureGrid.js
  WorkflowSection.js
  DashboardPreview.js
  RoleSection.js
  FinalCTA.js
  LandingFooter.js

src/components/motion/
  FadeIn.js
  StaggerContainer.js
  MotionCard.js
  PageTransition.js

src/components/ui/
  Button.js
  Card.js
  Badge.js
  Input.js
  Modal.js
  EmptyState.js
  Skeleton.js
```

If the project already has components, improve existing components before adding too many new abstractions.

### 15.3 CSS Strategy

Use CSS variables for global design tokens.

Use utility classes for layout and simple styling.

Use component classes for repeated components such as:

* button
* card
* badge
* input
* sidebar
* page header
* table
* modal

Avoid inline style for large repeated design patterns. Inline style is allowed only for small dynamic values.

### 15.4 Motion Implementation Rules

Landing:

* GSAP allowed
* ScrollTrigger allowed if installed and performance is stable
* Keep animation modular
* Avoid global side effects

Dashboard:

* Prefer Framer Motion
* Keep duration below 0.25s
* Avoid looping animation
* Avoid heavy animation on tables

### 15.5 Performance Rules

* Avoid large animation libraries in dashboard pages unless needed.
* Lazy load heavy landing visuals.
* Do not load GSAP on dashboard if only landing needs it.
* Optimize images and logo assets.
* Avoid autoplay videos unless highly compressed.
* Keep initial landing page fast.

---

## 16. UI Copy Dictionary

Use these labels consistently.

Navigation:

```txt
Dashboard
Kotak Masuk
Pemesanan
Inventaris
Invoice
Pengembalian
Pelanggan
Pengaturan
Tiket Bantuan
```

Actions:

```txt
Buat Booking
Buat Invoice
Verifikasi Pembayaran
Setujui Draft
Tolak Draft
Batalkan Booking
Simpan Perubahan
Tambah Barang
Tambah Customer
Lihat Detail
Upload Bukti
Tandai Selesai
```

Status:

```txt
Draft
Menunggu Pembayaran
Terkonfirmasi
Sedang Berjalan
Menunggu Return
Selesai
Dibatalkan
Menunggu Verifikasi
Dibayar
Terlambat
Ditolak
Tersedia
Disewa
Maintenance
Rusak
Hilang
```

AI labels:

```txt
Saran AI
Draft Booking
Ringkasan Percakapan
Intent Terdeteksi
Butuh Persetujuan Admin
Informasi Belum Lengkap
```

Empty states:

```txt
Belum ada data
Belum ada booking
Belum ada customer
Belum ada invoice
Belum ada percakapan
Belum ada barang
```

---

## 17. Do and Don't

### Do

* Gunakan navy, blue, dan cyan secara konsisten.
* Buat landing page lebih menarik daripada dashboard.
* Gunakan motion untuk memperjelas flow.
* Buat dashboard tetap cepat dan profesional.
* Pakai bahasa Indonesia yang ringkas.
* Gunakan status badge yang konsisten.
* Jaga whitespace.
* Buat empty state yang membantu.
* Selalu pikirkan role dan tenant context.
* Tampilkan AI sebagai copilot, bukan autopilot.

### Don't

* Jangan membuat dashboard terlalu ramai.
* Jangan memakai animasi berat di halaman operasional.
* Jangan membuat UI terasa seperti marketplace customer.
* Jangan membuat AI terlihat mengambil keputusan final.
* Jangan memakai warna di luar palette tanpa alasan.
* Jangan membuat status dengan istilah yang berubah-ubah.
* Jangan menggabungkan destructive action dengan primary action biasa.
* Jangan membuat halaman CRUD polos tanpa hierarchy.
* Jangan mengorbankan readability demi efek visual.

---

## 18. Execution Priority

Frontend execution order:

1. Finalize logo asset and place it in project
2. Define global CSS variables
3. Build public landing page at `/`
4. Polish auth pages to match landing theme
5. Polish dashboard shell and sidebar
6. Polish owner dashboard
7. Polish settings/team management
8. Polish inbox
9. Polish booking and invoice
10. Polish inventory and return
11. Add motion layer carefully
12. Validate responsive behavior
13. Run lint/build
14. Commit to `feat/frontend`

---

## 19. Quality Checklist

Before merging FE changes:

* Landing page exists at `/`
* `/login` still works
* `/register` still works
* Auth redirect still works
* Owner dashboard still works
* Sidebar nav works by role
* UI uses Rentivo palette
* Logo appears clean
* Motion is not excessive
* Mobile layout is not broken
* Empty states are present
* Buttons and badges are consistent
* No raw technical error shown to users
* `npm run lint` passes
* `npm run build` passes

---

## Brand Typography System

Rentivo landing uses a premium editorial-tech type system:

```txt
Primary sans: Geist
Accent serif soft: Instrument Serif Italic
Accent serif dramatic: Bodoni Moda Italic
```

Implementation:

```txt
src/app/layout.js
src/styles/landing.css
```

### Font Roles

* Geist is the primary font for UI, body copy, navbar, buttons, badges, cards, dashboard-like modules, and most headings.
* Instrument Serif Italic is used for softer editorial emphasis in StoryIntro and selected landing section words.
* Bodoni Moda Italic is used sparingly for dramatic hero emphasis, usually one phrase only.

### Usage Examples

* Hero headline: Geist bold for the main sentence, Bodoni Moda Italic for `booking rental`.
* StoryIntro: Geist for the scene headline, Instrument Serif Italic for one accent word per scene.
* Section headings: Geist for structure, Instrument Serif Italic for one final keyword such as `tercecer`, `status`, or `kendali`.
* Badges, CTA, labels, product cards: Geist only.
* Body copy: Geist only, never serif.

### Do

* Use serif italic as a precise accent, not as the whole voice.
* Keep body and UI text clean, readable, and operational.
* Use strong weight contrast and tight but readable display spacing.

### Don't

* Do not make every heading serif italic.
* Do not use serif italic inside buttons, navigation, badges, tables, or dense operational UI.
* Do not use decorative font treatments if they reduce clarity.

---

## Landing Visual Direction

The new landing direction is dark-luxury FlowTech: premium SaaS, cinematic depth, editorial accents, and operational clarity.

### Visual Principles

* Dark navy is the brand stage for preloader, story, navbar, and hero.
* Blue and cyan act as controlled light, not decoration everywhere.
* Backgrounds use layered radial bloom, subtle grid, vignette, and ambient beam.
* Cards use restrained translucent or white surfaces with precise borders and soft shadows.
* Spacing should feel composed and deliberate, with wider hero/story breathing room and tighter product modules.
* The page should feel high-end and product-led, not generic startup marketing.

### Contrast Rules

* Light text on dark backgrounds uses softer white and more line-height.
* Section body text stays muted but readable.
* Cyan is for flow, realtime, and AI-adjacent signals.
* Electric blue is for primary action and strong operational state.

### Background Treatment

Allowed:

* radial bloom
* faint grid
* ambient beam
* soft vignette
* restrained translucent panels

Avoid:

* noisy particle fields
* heavy canvas or WebGL
* large animated blur loops
* purple/blue generic SaaS gradients
* plain flat navy with no depth

---

## Loading Preloader

The preloader is a premium brand reveal, not a spinner.

### Visual Direction

* Use the original Rentivo PNG icon and full logo from `public/brand`.
* Keep the preloader as a fixed overlay above StoryIntro.
* Use deep navy, blue/cyan glow, light beam, soft grid, and vignette for atmosphere.
* Use PNG icon reveal, duplicate glow layer, rim light, diagonal shine, and full logo slide-in.

### Motion Sequence

1. Cinematic stage fades in.
2. Original PNG icon reveals with opacity, scale, y, and lightweight clipPath.
3. Glow, rim, shine, and trace pass over the icon.
4. Full logo slides in from the right.
5. Progress line and microcopy support the brand reveal.
6. Overlay fades away directly to StoryIntro.

### Guardrails

* Do not use SVG stroke drawings as the main logo form.
* Do not replace the original PNG icon with handmade shapes.
* Do not use ScrollTrigger in the preloader.
* Do not make the preloader a document-flow section.
* Respect `prefers-reduced-motion` with a short logo fade.

---

## StoryIntro

StoryIntro is full-screen, text-centered, dark, and editorial.

### Typography Direction

* Scene headline uses Geist with strong weight and tight display spacing.
* One word per scene may use Instrument Serif Italic.
* Scene number remains small, precise, and cyan-tinted.
* Copy stays quiet and readable under the headline.

### Motion Rules

* Keep the existing loading -> story visibility behavior.
* Keep StoryIntro mounted behind the fixed preloader.
* Desktop pin behavior can remain, but do not add blank spacer sections.
* Mobile should remain readable and not require heavy pinned scroll.

---

## HeroSection

HeroSection is the main product promise and must feel cinematic, memorable, and product-led.

### New Hierarchy

* Badge introduces the FlowTech CRM context.
* Hero H1 uses Geist for the main statement and Bodoni Moda Italic for the key phrase.
* Supporting copy is shorter, calmer, and operational.
* CTA buttons use pill shapes, precise glow, and restrained shine.
* Product signal panel previews chat -> inventory -> invoice flow without adding a heavy screenshot.

### Layout Principles

* Centered hero remains acceptable because this is a single-purpose cinematic landing opener.
* The product signal panel gives the first viewport a concrete operational artifact.
* Visual depth comes from light, grid, and panel hierarchy rather than decorative clutter.

---

## Landing Motion System Update

The current macro-flow remains:

```txt
LandingPreloader -> StoryIntro -> LandingNavbar -> HeroSection
```

This flow must remain stable. The redesign improves visual depth and typography while preserving render order and transition behavior.

### Motion Rules

* Use GSAP only where it already supports the preloader, StoryIntro, and hero reveal.
* Prefer opacity, transform, scale, x, y, and lightweight clipPath.
* Do not animate layout properties.
* Do not add heavy infinite motion.
* Keep reduced motion paths simple and immediate.

### Do

* Keep loading once.
* Reveal StoryIntro immediately after loading.
* Show navbar only once HeroSection enters.
* Keep hero and section entrance motion subtle.

### Don't

* Do not add ScrollTrigger to the preloader.
* Do not add blank pages or transition spacers.
* Do not introduce canvas, WebGL, particle systems, or heavy blur animation.

---

## Brand Asset / Favicon

The active favicon/app icon uses the latest Rentivo icon asset.

Active files:

```txt
src/app/icon.png
src/app/apple-icon.png
public/favicon.png
public/brand/rentivo-icon.png
public/brand/rentivo-logo.png
```

Next.js metadata points to `/icon.png` and `/apple-icon.png`, backed by `src/app/icon.png` and `src/app/apple-icon.png`.

## Do Not Break

* Do not use SVG stroke random art that does not match the Rentivo icon.
* Do not replace the original PNG icon with a handmade logo-like shape.
* Do not change the current loading -> story -> hero flow.
* Do not render the preloader as a normal document-flow section.
* Do not conditional render the page as `{isLoading ? <LandingPreloader /> : <StoryIntro />}`.
* StoryIntro must stay mounted behind the fixed preloader overlay.
* Do not show loading twice.
* Do not show the navbar during StoryIntro.
* Do not add blank spacer sections, manual 100vh gaps, or transition spacer divs.
* Do not use LightPillar or 21st.dev cinematic hero effects for the preloader.
* Do not move landing preloader CSS into `globals.css`.
* Do not make the landing basic, flat, or template-like again.
* Do not overuse serif italic or make all text decorative.
* Do not add heavy motion that hurts mobile performance.

## Current File Map

```txt
src/app/page.tsx
src/app/layout.js
src/components/landing/LandingPreloader.tsx
src/components/landing/RentivoLampBackdrop.tsx
src/components/landing/StoryIntro.tsx
src/components/landing/LandingNavbar.tsx
src/components/landing/HeroSection.tsx
src/components/landing/ProblemSection.tsx
src/components/landing/SolutionSection.tsx
src/components/landing/FeatureGrid.tsx
src/components/landing/WorkflowSection.tsx
src/components/landing/DashboardPreview.tsx
src/components/landing/RoleSection.tsx
src/components/landing/FinalCTA.tsx
src/components/landing/LandingFooter.tsx
src/components/ui/lamp.jsx
src/lib/utils.ts
src/styles/landing.css
public/brand/rentivo-icon.png
public/brand/rentivo-logo.png
src/app/icon.png
src/app/apple-icon.png
public/favicon.png
DESIGN.md
```

---

## Design Audit Findings

The active homepage path is confirmed:

```txt
src/app/page.tsx -> src/components/landing/LandingPageClient.tsx -> TSX landing components
```

The redesign previously felt too small because the active HeroSection still used the old centered stack composition. CSS had newer premium overrides appended below legacy landing rules, so colors and fonts changed, but the visual silhouette remained similar. The active CSS file is `src/styles/landing.css`, imported through `src/app/globals.css`; landing CSS must continue to live there rather than being moved into globals.

There are legacy deleted JS landing components in git status and active TSX landing components in `src/components/landing`. Edit the TSX files used by `LandingPageClient.tsx`; do not edit old JS artifacts or assume README is the source of truth for landing design.

Typography spacing broke because animated headings split text into individual word spans and relied on JSX trailing spaces. With tight display tracking and nested accent spans, those spaces can visually collapse and make headings read like glued words. Animated word renderers now emit explicit non-breaking spaces between words. Keep `.hero-word` and `.story-word` inline and avoid overly aggressive negative tracking.

For landing page design decisions, `DESIGN.md` overrides README design notes.

---

## Landing Visual Direction v2

The landing page must look materially redesigned, not font-swapped. The hero now uses a split editorial/product-cockpit composition: strong headline copy on one side and a Rentivo command-view motif on the other. This is the preferred first-viewport silhouette.

### Composition Rules

* Hero should not return to a generic centered title/subtitle/button stack.
* Product context must appear in the first viewport through a cockpit, pipeline, signal panel, or real product artifact.
* Lower sections should vary rhythm through staggered cards, feature spans, workflow rails, and dashboard preview depth.
* Background depth should use navy light, cyan bloom, subtle grid, and restrained vignette.
* Keep the visual language premium SaaS and operational, not gaming, crypto, or generic AI.

### Typography Rules

* Geist is the primary sans for UI, body, buttons, labels, and most headings.
* Instrument Serif Italic is the softer editorial accent.
* Bodoni Moda Italic is reserved for the strongest hero-level accent.
* Serif italic accents should be 1 to 3 words, never full paragraphs or dense UI.
* Animated word spacing must be preserved with explicit `\u00A0` or a tested spacing rule.
* Avoid display letter spacing tighter than `-0.06em` unless manually verified on desktop and mobile.

---

## Do Not Break v2

* Do not make landing redesign a font swap only.
* Do not reintroduce word splitting that makes words stick together.
* Do not follow README design notes over `DESIGN.md`.
* Do not change the stable `LandingPreloader -> StoryIntro -> LandingNavbar -> HeroSection` flow.
* Do not render the preloader as a normal section.
* Do not conditional-render StoryIntro after loading.
* Do not show navbar during StoryIntro.
* Do not add blank spacer sections between loading, story, and hero.
* Do not move large landing CSS into `globals.css`.
* Do not remove the product-led hero motif without replacing it with an equally strong first-viewport artifact.

---

## Landing Flow Fix

The active landing flow must always resolve to:

```txt
LandingPreloader -> StoryIntro -> LandingNavbar -> HeroSection
```

After `LandingPreloader` completes, the page must reset to the top of the landing document while the preloader overlay is still covering the viewport. This prevents browser scroll restoration, previous session position, or early ScrollTrigger refresh from revealing HeroSection first. `StoryIntro` must already be mounted behind the preloader and Scene 1 must reveal immediately after `preloaderDone`.

### Flow Rules

* Set `history.scrollRestoration = "manual"` while the landing page is active.
* Reset `window.scrollTo(0, 0)`, `document.documentElement.scrollTop`, and `document.body.scrollTop` before setting `preloaderDone`.
* Refresh ScrollTrigger after the scroll reset and layout unlock.
* Do not reset scroll again after the user can interact with the page.
* Do not use hash/autofocus behavior that lands directly on HeroSection.
* Hero ScrollTrigger must not use `start: "top bottom"`, `top 100%`, or other early thresholds for navbar reveal because that can fire while Hero is merely touching the viewport bottom below StoryIntro. With the current desktop overlap layout, use a late threshold such as `top 12%`.

---

## StoryIntro Highlight System

StoryIntro uses restrained luminous highlights to make the cinematic text less flat without becoming decorative noise.

### Highlight Words

```txt
Scene 1: everywhere, missing context
Scene 2: messy fast, overlap, harder to track
Scene 3: flow together, connected system
```

### Highlight Rules

* Use `#DFFDFC`, `#12CBBE`, and cyan text shadow for emphasis.
* Use subtle underline light on headline accents.
* Do not use heavy gradient text, large blur, or animated glow loops.
* Highlight only the operational turning points in the sentence.
* Highlight markup must preserve animated word spacing with `\u00A0` or tested margin rules.

---

## StoryIntro Motion System

StoryIntro motion should feel cinematic, but still light.

### Sequence

1. Scene enters with opacity, y, and scale.
2. Label fades in first.
3. Headline words reveal with a short stagger.
4. Highlight words receive a short luminous pass.
5. Copy fades up after the headline.
6. Desktop scroll crossfades Scene 1 -> Scene 2 -> Scene 3.
7. Scene 3 exits upward into HeroSection without blank spacer.

### Performance Rules

* Animate opacity, transform, scale, and small text-shadow only on a few highlighted words.
* Do not animate layout properties.
* Do not add particles, canvas, WebGL, or heavy blur.
* Respect reduced motion by removing glow intensity and keeping text readable.

---

## Hero Motion System

HeroSection entrance is tied to the hero entering the viewport, not to preloader completion.

### Sequence

1. Background grid and light beam reveal.
2. Badge fades up.
3. Headline words stagger in.
4. Highlight line, paragraph, CTA, and pills fade up.
5. Product cockpit panel enters with y, scale, and a subtle rotateX correction.
6. Ticket, signal cards, flow steps, and flowline stagger in.
7. Navbar fades down only when HeroSection crosses the hero threshold.

### Rules

* Use GSAP ScrollTrigger for navbar visibility with a late threshold. Current overlap layout uses `start: "top 12%"`.
* Keep the entrance once-only for hero content, but navbar visibility can respond to enter/leave back.
* Do not show navbar during StoryIntro.
* Do not use Hero motion to scroll the page.
* Keep durations around `0.38s` to `0.9s`, with `power3.out` or `power4.out`.

---

## Do Not Break v3

* Do not let loading finish directly on HeroSection.
* Do not make the user scroll upward to see StoryIntro.
* Do not reveal navbar during StoryIntro.
* Do not use Hero ScrollTrigger `top bottom` for navbar reveal.
* Do not lose spaces in animated word spans.
* Do not add blank spacers or manual 100vh transition gaps.
* Do not reset scroll after the user can start interacting.
* Do not move large landing styles into `globals.css`.

---

## StoryIntro Lamp Backdrop

StoryIntro uses the Aceternity / 21st.dev Lamp as the ambient cinematic backdrop. The installed `src/components/ui/lamp.jsx` is a reference artifact only. `LampDemo` is never imported into the landing page. `LampContainer` is not used directly because it carries `min-h-screen`, demo children, default slate/cyan treatment, and heavy blur layers that would fight StoryIntro pinning.

### Implementation

```txt
src/components/ui/lamp.jsx           — reference artifact (not imported by landing)
src/components/landing/RentivoLampBackdrop.tsx  — active lamp backdrop
src/components/landing/StoryIntro.tsx            — renders one RentivoLampBackdrop
src/styles/landing.css                           — lamp CSS + conic beam classes
```

Rentivo uses one custom backdrop: `RentivoLampBackdrop`. It renders a single Aceternity-inspired lamp instance behind all StoryIntro scenes. The backdrop uses the signature conic gradient beam structure from 21st.dev, adapted with Rentivo colors and performance constraints.

### Lamp Structure (Aceternity-Inspired)

The backdrop renders these layers directly inside `.rentivo-lamp`:

1. **Two conic beams (V shape)** — two separate beams creating the signature Aceternity "V" shape:
   - Left beam: `conic-gradient(from 70deg at center top)` positioned at `right: 50%`
   - Right beam: `conic-gradient(from 290deg at center top)` positioned at `left: 50%`
   - Both beams use CSS `mask-image: linear-gradient(to bottom, ...)` to fade edges softly
   - This matches the exact structure of the Aceternity demo
2. **Top horizontal accent line** — a bright 2px cyan line at `top: 18%` with glow box-shadow, mimicking the Aceternity lamp aperture.
3. **Center glow** — a large radial gradient behind the headline area (`top: 34%`), providing cinematic depth.
4. **Spotlight** — a secondary radial glow above center (`top: 26%`) for additional depth.
5. **Ambient aura** — a wide background radial glow (existing layer, retained).
6. **Static horizon line** — a subtle 1px transition light (existing layer, retained).

The light source is positioned ABOVE the text (top 15-18%), with beams spreading DOWNWARD in a V shape. This matches the Aceternity demo where two beams originate from the center top and fan outward.

### Conic Gradient Fallback

The original Aceternity `lamp.jsx` uses `bg-gradient-conic` which is a custom Tailwind utility not present in the Rentivo Tailwind config. The `RentivoLampBackdrop` uses CSS classes with `conic-gradient()` and CSS custom properties instead:

```css
.rentivo-lamp__beam--left {
  background: conic-gradient(
    from 70deg at center top,
    var(--lamp-beam-1, rgba(18, 203, 190, 0.42)),
    transparent 40%
  );
  mask-image: linear-gradient(
    to bottom, white 0%, rgba(255,255,255,0.5) 50%, transparent 85%
  );
}

.rentivo-lamp__beam--right {
  background: conic-gradient(
    from 290deg at center top,
    var(--lamp-beam-1, rgba(18, 203, 190, 0.42)),
    transparent 40%
  );
  mask-image: linear-gradient(
    to bottom, white 0%, rgba(255,255,255,0.5) 50%, transparent 85%
  );
}
```

CSS variables `--lamp-beam-1`, `--lamp-beam-2`, `--lamp-glow`, and `--lamp-line` are set per scene modifier class and transition smoothly when the active scene changes.

### Color Adaptation

All Aceternity default colors are replaced with Rentivo palette:

| Aceternity Default | Rentivo Replacement |
|---|---|
| `bg-slate-950` | `#03113D` (deep navy) |
| `cyan-500` | `rgba(18, 203, 190, 0.26)` — `0.30` per scene |
| `cyan-400` | `rgba(21, 87, 255, 0.16)` — `0.20` per scene |
| Scene 1 accent | Cyan-dominant |
| Scene 2 accent | Blue-dominant |
| Scene 3 accent | Cyan + Blue + Sky mix |

### Motion

Framer Motion handles the one-time beam reveal on mount:
- Beams (left + right): `opacity 0 → 0.95`, `scaleX 0.6 → 1` over 1.1s
- Top line: `opacity 0 → 1`, `scaleX 0.5 → 1` over 0.9s
- Glow: `opacity 0 → 0.7` over 1.0s
- Spotlight: `opacity 0 → 1`, `scaleX 0.6 → 1` over 1.0s

Since the component mounts behind the preloader, the beam reveal completes before StoryIntro is visible. No `whileInView` is used because StoryIntro is GSAP-pinned. Scene changes only shift CSS variables (color), not re-trigger motion.

### Z-Index Contract

```txt
story-bg:            z-index: 0
rentivo-lamp:        z-index: 1
story-bg-vignette:   z-index: 2
story-scene text:    z-index: 3
```

The lamp sits above the background but below the vignette and text. The vignette's transparent center (`transparent 46%`) allows the lamp beams to show through while the vignette edges darken corners for depth.

### Performance Guardrails

* One lamp instance per StoryIntro.
* 2 conic beams (left + right, creating V shape).
* 1 top line, 1 center glow, 1 spotlight, 1 aura, 1 horizon = 5 additional layers.
* Total: 7 layers, all lightweight.
* No particle, canvas, or WebGL.
* No animated blur/filter. Blur values are static CSS.
* Framer Motion fires once on mount (no `whileInView`, no infinite loops).
* Animate only `opacity` and `transform` (scaleX) for beam reveal.
* CSS transitions handle scene color shifts (background, background-image).
* Mobile reduces beam width, glow size, and filter blur.
* Reduced motion sets beams to static final state at lower opacity.

### Background Preservation

The existing story background (`.story-bg`, `.story-bg-1/2/3`) is never removed or overwritten by the lamp. The lamp sits as an additional layer on top of the background but below the vignette and text. The layering order is:

```txt
story-bg (z-index: 0) → rentivo-lamp (z-index: 1) → vignette (z-index: 2) → text (z-index: 3+)
```

### Tailwind Conic Fallback

If `bg-gradient-conic` is needed in the future, either:
1. Add it to `tailwind.config.js` as a custom utility.
2. Use inline `style={{ backgroundImage: "conic-gradient(...)" }}`.
3. Use CSS classes with `conic-gradient()` and CSS custom properties (current approach).

---

## StoryIntro Visual System

StoryIntro remains full-screen, text-centered, dark, and editorial. The lamp backdrop sits inside `.story-stage` above `.story-bg` and below `.story-scene`.

### Z-Index Contract

```txt
story-bg: z-index 0
rentivo-lamp: z-index 1
story-bg-vignette: z-index 2
story-scene text: z-index 3
```

This keeps the lamp visible without covering copy. Do not move the lamp outside StoryIntro into global page background. Do not put it inside each scene.

### Highlight Rules

Use `.story-highlight` for:

```txt
everywhere
missing context
messy fast
overlap
harder to track
flow together
connected system
```

Highlights should be cyan/blue luminous accents with readable contrast. Do not use heavy animated gradient text or large blur stacks.

---

## Do Not Break v4

* Do not render multiple `LampContainer` instances, one per scene.
* Do not import or display `LampDemo` on the landing page.
* Do not let a lamp component create `min-h-screen` or extra spacer height inside StoryIntro.
* Do not hide StoryIntro text behind the lamp.
* Do not regress the lamp into a barely visible single line — the downward cone beam and top horizontal line must be visible.
* Do not make navbar visible during StoryIntro.
* Do not make loading jump directly to HeroSection.
* Do not add large landing styles to `globals.css`.
* Do not animate blur/filter or use particle/canvas/WebGL effects for the lamp.
* Do not use `bg-gradient-conic` Tailwind class — it does not exist in the config. Use CSS `conic-gradient()` with CSS custom properties instead.
* Do not use `whileInView` for lamp animations inside the GSAP-pinned StoryIntro. Use one-time `initial`/`animate` on mount.
* Do not change `.rentivo-lamp` z-index below 1 (it must be above `.story-bg` at z-index 0 and below `.story-bg-vignette` at z-index 2).
* Do not remove or overwrite the existing story background (`.story-bg`, `.story-bg-1/2/3`). The lamp is an additional layer, not a replacement.
* Do not position the lamp light source below the text. The top horizontal line and cone beam must originate from ABOVE the headline area (top 15-18%).

---

## Recovery Notes

Codex recovery audit on June 16, 2026 found that `feat/frontend` and `backup-codex-recovery` pointed at the same commit, `77c61d2 backup: recover codex frontend changes`. No stash or separate reflog commit contained a more complete landing implementation, so the missing landing behavior was recreated from `DESIGN.md` and the final target flow.

### Recovered Contract

```txt
LandingPreloader -> StoryIntro -> LandingNavbar -> HeroSection
```

Active implementation files are TypeScript landing components under `src/components/landing`. Legacy `.js` landing tabs in the editor are not the active source if the file no longer exists on disk.

### Recovery Rules

* `DESIGN.md` is the source of truth for landing design recovery.
* Do not use README as the landing design source when it conflicts with this file.
* Do not run `git clean`, hard reset, or delete recovered landing files without explicit confirmation.
* Do not reintroduce `.landing-page.is-preloading > :not(.landing-preloader) { opacity: 0; }`; StoryIntro must remain visible behind the fixed preloader overlay.
* `StoryIntro` must receive `preloaderDone` so Scene 1 can reveal after the preloader exits.
* `RentivoLampBackdrop` is one ambient instance inside StoryIntro, not the raw Aceternity `LampDemo`.
* Hero/navbar reveal threshold must stay late enough that navbar is hidden during Story scene 3. Current overlap layout uses `top 12%`, not `top 100%` or `top bottom`.
* Animated words must preserve spaces with `\u00A0` or equivalent tested spacing.

### Recreated Pieces

* Premium PNG preloader using `/brand/rentivo-icon.png` and `/brand/rentivo-logo.png`.
* StoryIntro scene highlight system and first-scene reveal.
* Ambient lamp backdrop and lightweight lamp motion.
* Hero word spacing and safer hero/navbar trigger.
* Landing CSS recovery overrides in `src/styles/landing.css`.

---

## Loading Preloader Timing Revision

The active loading reveal must behave like a premium Rentivo brand reveal, not a generic simultaneous logo fade.

### Sequence

```txt
Icon reveal -> Icon settle -> Full logo slide/fade in -> Short premium hold -> Smooth exit to StoryIntro
```

### Timing Contract

* Cinematic background opens first with deep navy, cyan/blue glow, subtle beam, and vignette.
* Icon-only mark starts around `0.18s`, then reveals with opacity, scale, y, tiny rotation correction, rim light, trace, and one shine pass.
* Icon settle uses a short pulse around `0.25s` to `0.35s`; do not skip this hold.
* Full logo starts after the mark settles, around `1.32s`, with opacity `0 -> 1`, x `56 -> 0`, scale `0.97 -> 1`, and `power3.out`.
* Progress line and caption reveal after the full logo has started, never before the icon phase.
* Exit begins after a short brand hold and fades/scales the stage before fading the fixed overlay.
* Ideal total duration is about `3.2s` to `3.5s`; do not compress it back into a rushed 1s to 2s loader.

### Do Not Break

* Do not show the icon and full logo at the same time during the first phase.
* Do not let the hidden full logo push the icon off-center before it appears.
* Do not make loading jump directly to HeroSection.
* Do not hide StoryIntro behind an opaque blank section after the overlay exits.
* Do not call `onComplete` more than once.
* Do not add ScrollTrigger, canvas, WebGL, particles, or heavy infinite animation to the preloader.
* Reduced motion should show icon and logo briefly, then fade out to StoryIntro.

---

## Loading Preloader Dark Luxury FlowTech Revision

The preloader must feel like a high-end operational SaaS brand reveal. The visual language is Dark Luxury FlowTech: deep navy, controlled cyan/blue light, premium depth, and precise sequencing.

### Required Sequence

```txt
Dark Luxury Stage Open
-> Icon Mark Reveal
-> Icon Settle
-> Icon Crossfade Out
-> Full Logo Slide/Fade In
-> Premium Hold
-> Cinematic Exit to StoryIntro
```

### Visual Treatment

* Background uses deep navy base with cyan/blue aurora, soft mesh glow, subtle diagonal beam, thin grid, micro noise, and vignette.
* Icon-only mark is the only brand asset visible during the icon phase.
* Full logo must not appear until the icon has revealed and settled.
* The full logo layer sits above the icon layer.
* If the full logo PNG contains the icon, the icon-only layer must fade to opacity `0` during the crossfade.
* Final logo state must show only the full logo, with no icon ghosting behind it.

### Timing

* Stage open: `0.35s` to `0.45s`.
* Icon reveal: `0.75s` to `0.85s`.
* Icon settle: `0.25s` to `0.35s`.
* Icon crossfade out: about `0.3s` to `0.35s`.
* Full logo slide/fade: `0.75s` to `0.9s`.
* Premium hold: `0.45s` to `0.65s`.
* Total target: `2.7s` to `3.3s`, with a hard upper preference near `3.5s`.

### Do Not Break

* Do not leave icon-only visible when the full logo is active.
* Do not show icon-only and full logo together for longer than `0.25s`.
* Do not return to a basic flat navy background.
* Do not make the loader feel rushed.
* Do not make loading jump to HeroSection.
* Do not add blank spacer sections or hide StoryIntro behind an empty screen.
* Do not call `onComplete` more than once.
* Do not add ScrollTrigger, canvas, WebGL, particles, or heavy looped blur animation to the preloader.

---

## Loading Preloader Luxury Motion Revision

The preloader should feel like one continuous brand sequence, not a rigid swap between two assets.

### Motion Direction

* Use one GSAP timeline for the full preloader.
* Stage, icon, energy, logo, progress, caption, and exit must be choreographed as one sequence.
* Icon-only reveal should feel like the brand mark gathering light.
* Full logo reveal should feel like the mark resolving into the full Rentivo wordmark.
* CSS initial states must hide the full logo, progress, caption, icon core, icon glow, rim, trace, and shine before GSAP starts. This prevents the first browser paint from showing stacked logos before hydration.
* Icon glow is a low-opacity aura only; it must not reveal at the same opacity as the crisp icon core.
* Call the landing completion signal at the start of preloader exit, while the overlay is still visible, so StoryIntro can begin revealing behind it.
* Unmount the overlay only after the exit fade finishes.

### Visual Polish Rules

* Avoid harsh visible circles, obvious boxes, strong outlines, and hard-edge spotlights.
* Rim light should be a soft radial atmosphere, not a visible border ring.
* Grid and noise must stay barely visible, around 4% to 6% perceived opacity.
* Light sweep must be narrow and soft, never a visible rectangular block.
* Glow should create depth behind the mark/logo, not cover or blur the logo.
* Final full-logo state must be clean, readable, and free from icon ghosting.
* If logo overlap appears only on the first frame, fix CSS default opacity/transform states first before changing the render order.

### Performance Guardrails

* Animate opacity, transform, scale, x, y, rotate, clipPath, and scaleX only.
* Do not animate layout properties, large blur values, box-shadow, width, height, top, or left.
* No ScrollTrigger in the preloader.
* No canvas, WebGL, particle fields, or heavy infinite animation.
* Reduced motion should skip long shine/settle sequences and fade quickly into StoryIntro.

---

## StoryIntro Entry Motion

StoryIntro Scene 1 should begin while the preloader is fading out, not after the screen has already cleared.

### Entry Rules

* `preloaderDone` should be emitted at the start of preloader exit.
* Scene 1 reveal may start about `0.1s` to `0.2s` after that signal.
* Label enters with opacity and y movement.
* Headline words reveal with short stagger while preserving spaces.
* Highlight words receive a short, subtle cyan glow.
* Copy fades up after the headline begins.
* Do not add blur-heavy text animation, per-character effects, or new ScrollTrigger instances for the first reveal.
* Do not let Scene 1 appear too early behind the fully opaque loader or too late after the loader has disappeared.
* The preferred handoff is: preloader exit begins, `preloaderDone` fires shortly after, StoryIntro waits about `0.1s` to `0.2s`, then text reveal begins as the overlay opacity dissolves.

## Preloader Icon Reveal Smoothness Revision

The first Rentivo icon reveal must feel like a soft light-unveil, not a cropped pop-in.

### Rules

* Do not use a hard icon crop/mask as the primary reveal.
* The icon phase should rely on opacity, y, scale, tiny rotation correction, low-opacity glow, and one soft shine pass.
* Icon glow must stay lower than the crisp icon core so the mark does not look doubled.
* Icon settle may be slower and subtler than the logo reveal; avoid bouncy pulses.
* The logo can slide in after the icon has settled, but the icon-only layer must fade out cleanly before the full logo becomes dominant.

### Timing

```txt
icon reveal: about 0.9s to 1s
icon settle: about 0.3s to 0.45s
crossfade out: about 0.4s
logo reveal: about 0.9s
```

## StoryIntro Slow Luxury Scroll Revision

StoryIntro scroll must feel slow, cinematic, and premium without dropping frames.

### Performance Rules

* Do not animate every word span inside the scrubbed ScrollTrigger timeline.
* Word stagger is allowed for the initial Scene 1 reveal after preloader exit.
* During scroll, animate scene containers and background opacity only: `opacity`, `y`, and `scale`.
* Avoid scrubbed `textShadow` tweens. Use static highlight styling once the scene is visible.
* Do not combine CSS opacity transitions with GSAP scrubbed opacity on the same `.story-bg` layers.
* Keep lamp ambience mostly static during pinned scroll. One slow sweep is allowed; multiple infinite beam/glow/halo animations are too expensive.
* Use a slower scrub value, around `1.0` to `1.2`, and a longer story end distance when the user asks for a more luxury/slower feel.

### Do Not Break

* Do not reintroduce dozens of scrubbed word tweens in StoryIntro.
* Do not add continuous blur/filter animation to the lamp.
* Do not add multiple lamp instances per scene.
* Do not make the slower story scroll create a blank gap before HeroSection.

## StoryIntro To HeroSection Transition Rules

The handoff from StoryIntro to HeroSection must feel continuous and must not create an empty page between sections.

### Root Cause Fix

The blank gap was caused by combining a multi-viewport `.story-intro` height with GSAP `pin: true` on the StoryIntro container. That creates an extra pin spacer on top of the section's own scroll height, so Scene 3 can finish while the document still has dark spacer distance before HeroSection.

### Layout Rules

* StoryIntro desktop uses a tall `.story-intro` section and pins only `.story-stage`.
* ScrollTrigger should scrub progress with `start: "top top"` and `end: "bottom bottom"`.
* Use `pin: stageRef.current` with `pinSpacing: false`; do not use `pin: true` on the StoryIntro container.
* Do not make `ScrollTrigger end` longer than the actual `.story-intro` layout height.
* Do not add manual transition spacers, `story-exit-spacer`, large `padding-bottom`, or `margin-bottom`.
* `.story-intro` must keep `margin-bottom: 0`.
* `.landing-hero` must keep `margin-top: 0`.
* The final StoryIntro scene may fade down, but it should retain faint presence until HeroSection starts entering.

### Motion Rules

```txt
Scene 3 exit: opacity down, y up, tiny scale up
Hero entrance: opacity up, y 72 -> 0, scale 0.985 -> 1
Navbar reveal: opacity up, y -24 -> 0
```

Use opacity and transform only. Do not animate layout properties or add heavy effects.

## Landing Navbar Reveal System

The navbar is an independent fixed overlay, not a normal layout block between StoryIntro and HeroSection.

### Rules

* Navbar must not occupy document flow space.
* Navbar stays hidden during LandingPreloader and StoryIntro.
* Navbar visibility is controlled by a lightweight HeroSection ScrollTrigger that works across desktop, mobile, and reduced-motion modes.
* Hero entrance animation may be no-preference only, but navbar visibility must still work when motion is reduced.
* The navbar reveal should be around `0.55s` to `0.7s` with `power3.out`.
* Hiding the navbar when scrolling back into StoryIntro should also close the mobile menu.
* Do not tie navbar reveal to a sticky block or spacer that can create a blank gap before HeroSection.

---

## StoryIntro to HeroSection Handoff Revision

The current landing handoff must read as one cinematic sequence:

```txt
Scene 3 StoryIntro -> clean story fade -> navbar reveal -> premium HeroSection entrance
```

### Root Cause Notes

The page-break feeling came from StoryIntro fading Scene 3 and its backdrop too early in the scrubbed timeline while the document still had scroll distance before HeroSection. That left a dark empty viewport and made HeroSection feel like a new page. Story ghosting came from leaving the final scene partially visible while HeroSection and navbar were already entering.

### Fixed Contract

* Keep `.story-intro` margin-bottom at `0`.
* Keep `.landing-hero` margin-top at `0`.
* Do not add `story-exit-spacer`, `story-transition-spacer`, `blank-section`, or hero spacer blocks.
* Scene 3 stays readable for most of the final story range, then fades out near the end.
* The StoryIntro stage and final background fade to opacity `0` before Hero dominates, preventing text ghosting.
* Hero content may be revealed by the StoryIntro handoff timeline for seamless overlap, but `.landing-navbar` must not be animated inside StoryIntro.
* Navbar uses `HeroSection`'s own late threshold (`top 12%` in the current desktop overlap layout) and remains a fixed overlay, never a layout block between StoryIntro and HeroSection.

### Motion Rules

* Story exit uses opacity, y, and tiny scale only.
* Hero entrance uses opacity, y, scale, and staggered child reveals only.
* Navbar reveal uses opacity and y only.
* Do not animate blur, filters, box-shadow, width, height, top, or left.
* Do not add new heavy ScrollTrigger stacks, canvas, WebGL, or particles.

---

## StoryIntro Ambient Lamp Backdrop System

The lamp backdrop in the `StoryIntro` component functions as an ambient cinematic backdrop using the Aceternity / 21st.dev two-beam V shape structure. It blends smoothly into the deep navy base (#03113D) while providing a visible lamp effect with a top horizontal light and downward-spreading beams.

### Key Visual Constraints

* **Two-Beam V Shape:** Two separate conic gradient beams create the signature Aceternity "V" shape:
  - Left beam: `conic-gradient(from 70deg at center top)` at `right: 50%`
  - Right beam: `conic-gradient(from 290deg at center top)` at `left: 50%`
  - This matches the exact structure of the Aceternity demo
* **Top Horizontal Line:** A bright 2px cyan accent line at `top: 18%` with glow box-shadow, mimicking the Aceternity lamp aperture.
* **Layers:** 7 total layers inside `RentivoLampBackdrop`:
  1. `.rentivo-lamp__beam--left` — left conic beam (conic-gradient + mask-image)
  2. `.rentivo-lamp__beam--right` — right conic beam (conic-gradient + mask-image)
  3. `.rentivo-lamp__top-line` — bright horizontal accent line with glow
  4. `.rentivo-lamp__glow` — large radial glow behind headline area
  5. `.rentivo-lamp__spotlight` — secondary radial glow for depth
  6. `.rentivo-lamp__aura` — wide background radial glow
  7. `.rentivo-lamp__horizon` — subtle 1px static transition light
* **Light Source Position:** The light originates from ABOVE the text (top 15-18%), spreading downward in a V shape. This matches the Aceternity demo structure.
* **Soft Edges:** The beams use CSS `mask-image: linear-gradient(to bottom, ...)` to fade edges softly. No hard boxes or split backgrounds.
* **Opacity and Blur:** Beam opacity animates from 0 to 0.95 during reveal. Glow at 0.7 opacity with `filter: blur(60px)`. Beams at `filter: blur(16px)`. All blur values are static (not animated).
* **Contrast:** White text sits on `z-index: 3+`, vignetting on `z-index: 2`, lamp on `z-index: 1`, background on `z-index: 0`. The vignette's transparent center allows lamp beams to show through.
* **Background Preservation:** The existing story background (`.story-bg`, `.story-bg-1/2/3`) is never removed. The lamp is an additional layer on top.
* **Lightweight Performance:** Framer Motion fires once on mount (beams + line + glow reveal). CSS transitions handle scene color shifts. No WebGL, canvas, particles, or continuous script-based recalculations. Animate only `opacity` and `transform` (scaleX). All blur values are static CSS.
* **Story → Hero Transition:** The `.story-intro` height must remain at 300vh (desktop) to ensure smooth GSAP ScrollTrigger transitions. No duplicate height declarations that could override this value.

---

## HeroSection Dark Luxury Redesign

HeroSection is the first product promise after the editorial story. It should feel premium and operational, not like a generic SaaS template.

### Visual Direction

* Deep navy base with subtle cyan/blue aurora layers.
* Low-opacity FlowTech grid, not a loud tech pattern.
* Refined glass badge, command-center copy, strong headline, and clear CTA.
* Supporting operations panel shows the product flow: Chat, Booking, Payment, Return.
* Trust pills remain lightweight and secondary.

### Typography

* Primary sans carries the headline structure.
* Serif italic accent is limited to one emotional word such as `rapi`.
* Animated word spans must preserve spaces and never compress words together.

### Entrance Sequence

```txt
hero shell fade/raise
auras reveal
badge fade-up
headline word reveal
highlight and subtitle fade-up
CTA fade-up
flowline and operations panel reveal
panel items and trust pills stagger
```

Use GSAP with `power3.out`, opacity, y, and scale. Keep the sequence once-only and lightweight.

### Do Not Break

* Do not move navbar back into document flow.
* Do not show navbar during StoryIntro.
* Do not leave StoryIntro text visible behind HeroSection.
* Do not add a transition section to fake the handoff.
* Do not make HeroSection so tall that CTA is pushed too far below the fold on mobile.
* Do not make the hero look like a dashboard mockup-heavy section unless explicitly requested later.

---

## 20. Final Design Principle

Rentivo should feel like a premium operational SaaS product.

Landing page should impress.

Dashboard should help people work faster.

Every design decision must support the main product promise:

“Dari chat customer menjadi booking rental yang rapi, terukur, dan mudah dikelola.”
