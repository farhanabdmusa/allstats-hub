# 📊 Allstats BPS Backend (Next.js 15.4.5)

Backend resmi untuk aplikasi **Allstats BPS**, yang tersedia di [Play Store](https://play.google.com/store/apps/details?id=id.go.bps.allstats) dan [App Store](https://apps.apple.com/id/app/allstats-bps/id1495703496). Dibangun menggunakan **Next.js v15.4.5** dengan App Router dan dukungan API Routes sebagai backend yang ringan, fleksibel, dan modern.

---

## 🚀 Teknologi yang Digunakan

- **Next.js v15.4.5** — App Router & API Routes
- **Node.js 20+**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Zod**
- **JWT**

---

## 📦 Struktur Proyek

```
/app
  /api
    /v1
      /auth
      /like
      /notification
      ...
/lib
  - db.ts (konfigurasi database)
  - utils.ts (fungsi utilitas)
/types
  - index.ts (tipe TypeScript global)
/middleware.ts
/next.config.js
/prisma (opsional)
/README.md
```

---

## 🔧 Setup Lokal

### 1. Clone Repository
```bash
git clone https://git.bps.go.id/tim-website/allstats-backend.git
cd allstats-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Buat file `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
```

### 4. Jalankan Server Development
```bash
npm run dev
```

---

## 🔒 Keamanan & Pembatasan

- Validasi input via `Zod`
- Logging & error handling konsisten
- Middleware otentikasi (jika diperlukan)

---

## 🧪 Testing

Gunakan Postman, Insomnia, atau curl untuk menguji API endpoint.

Contoh:
```bash
curl http://localhost:3000/api/v1/meta
```

---

## 👨‍💻 Kontribusi

Tim Pengembang:
- Developer: Farhan Abdurrahman Musa
- Instansi: Badan Pusat Statistik (BPS)
- Platform: [https://bps.go.id](https://bps.go.id)

---

## 📄 Lisensi

Hak Cipta © 2025 Badan Pusat Statistik  
Kode sumber hanya digunakan untuk kebutuhan internal dan pengembangan aplikasi Allstats.

---

## 📱 Tentang Allstats BPS

Allstats BPS adalah aplikasi resmi yang menyajikan data strategis statistik Indonesia secara cepat dan interaktif. Tersedia di:

- ✅ [Google Play Store](https://play.google.com/store/apps/details?id=id.go.bps.allstats)
- ✅ [Apple App Store](https://apps.apple.com/id/app/allstats-bps/id1495703496)

---