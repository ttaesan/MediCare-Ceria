# MediCare Ceria — Sistem Digitalisasi Rumah Sakit
Tugas Final Praktikum Pemrograman Web 2026 (Next.js JSX, Tailwind CSS, PostgreSQL Raw SQL).

## Struktur Folder
- `database.sql` (Di luar folder `/app` sesuai ketentuan asisten lab)
- `app/` (Aplikasi Next.js App Router + Tailwind CSS + `pg` Raw SQL + `bcryptjs` + `src/middleware.js`)

## Cara Menjalankan
1. Buat database PostgreSQL baru bernama `rs_digitalisasi` di pgAdmin, lalu jalankan file `database.sql`.
2. Masuk ke folder `app`:
   ```bash
   cd app
   cp .env.example .env
   npm install
   npm run dev
   ```
3. Buka `http://localhost:3000`.
4. Akun uji coba (password semua akun: `password123`):
   - **Admin:** `admin@rs.com`
   - **Dokter:** `budi@rs.com` / `sarah@rs.com` / `citra@rs.com`
   - **Pasien:** `andi@pasien.com` (atau daftar akun baru lewat `/register`)
