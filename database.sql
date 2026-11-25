-- ============================================================================
-- DATABASE SCHEMA & SEEDER: DIGITALISASI RUMAH SAKIT (MEDICARE BRIGHT)
-- Praktikum Pemrograman Web 2026 - Raw SQL PostgreSQL
-- ============================================================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS polis CASCADE;

-- 1. Tabel Polis
CREATE TABLE polis (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255) DEFAULT '🏥',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Users (Admin, Dokter, Pasien)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'dokter', 'pasien')),
    poli_id INT REFERENCES polis(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    address TEXT,
    specialization VARCHAR(150),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Schedules (Jadwal Praktik Dokter - Durasi 30 Menit)
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Medicines (Master Obat)
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('keras', 'biasa')),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    expired_date DATE NOT NULL,
    image_url TEXT DEFAULT '💊',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Appointments (Janji Temu)
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    complaint TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Selesai', 'Dibatalkan')),
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Medical Records (Arsip Permanen / Read-Only)
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INT UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    medical_action TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Prescriptions (Resep Obat & Status Farmasi)
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    medical_record_id INT UNIQUE NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu Diproses' CHECK (status IN ('Menunggu Diproses', 'Siap Diambil', 'Sudah Diambil')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Prescription Items (Rincian Obat per Resep)
CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id INT NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    dosage VARCHAR(100) DEFAULT '3x1 Sesudah Makan'
);

-- 9. Tabel Feedbacks (Ulasan & Rating Layanan)
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES users(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabel Notifications (In-App Notifications)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA AWAL
-- ============================================================================

INSERT INTO polis (name, description, icon) VALUES
('Poli Umum', 'Pelayanan pemeriksaan kesehatan umum, konsultasi gejala awal, dan rujukan medis terpadu.', '🩺'),
('Poli Gigi & Mulut', 'Perawatan kesehatan gigi, pembersihan karang gigi, penambalan, dan bedah mulut ringan.', '🦷'),
('Poli Anak', 'Layanan tumbuh kembang anak, imunisasi lengkap, serta penanganan kesehatan bayi dan balita.', '🧸'),
('Poli Penyakit Dalam', 'Penanganan komprehensif penyakit organ dalam, hipertensi, diabetes, dan metabolisme.', '🫀');

-- Catatan Penting:
-- Sesuai instruksi asisten lab, password menggunakan bcryptjs hash!
-- Hash di bawah ini adalah hasil bcrypt.hash('password123', 10)
INSERT INTO users (username, email, password, role, poli_id, phone, address, specialization, bio) VALUES
('Admin RS Ceria', 'admin@rs.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', NULL, '081100001111', 'Gedung Administrasi Lt. 2', 'Kepala Operasional & Farmasi', 'Mengelola operasional rumah sakit dan pelayanan farmasi.'),
('dr. Sarah Wijaya, Sp.A', 'sarah@rs.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'dokter', 3, '081234567801', 'Klinik Anak Lt. 1', 'Spesialis Anak', 'Berpengalaman 8 tahun menangani kesehatan anak dan tumbuh kembang.'),
('dr. Budi Santoso', 'budi@rs.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'dokter', 1, '081234567802', 'Klinik Umum Lt. 1', 'Dokter Umum', 'Ramah, komunikatif, dan fokus pada pelayanan preventif pasien.'),
('drg. Citra Lestari', 'citra@rs.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'dokter', 2, '081234567803', 'Klinik Gigi Lt. 2', 'Dokter Gigi', 'Ahli estetika gigi dan perawatan gigi anak maupun dewasa.'),
('Andi Pratama', 'andi@pasien.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'pasien', NULL, '085299887766', 'Jl. Melati No. 14, Palopo', NULL, 'Pasien terdaftar aktif.');

-- Jadwal Praktik Dokter (Durasi wajib 30 menit per slot)
INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time) VALUES
(2, 'Senin', '08:00:00', '08:30:00'),
(2, 'Senin', '08:30:00', '09:00:00'),
(2, 'Rabu', '09:00:00', '09:30:00'),
(2, 'Jumat', '10:00:00', '10:30:00'),
(3, 'Senin', '09:00:00', '09:30:00'),
(3, 'Selasa', '10:00:00', '10:30:00'),
(3, 'Kamis', '13:00:00', '13:30:00'),
(4, 'Selasa', '08:30:00', '09:00:00'),
(4, 'Kamis', '09:30:00', '10:00:00');

-- Master Obat
INSERT INTO medicines (name, description, type, stock, expired_date, image_url) VALUES
('Paracetamol 500mg', 'Pereda demam dan nyeri ringan hingga sedang.', 'biasa', 120, '2027-12-31', '💊'),
('Amoxicillin 500mg', 'Antibiotik spektrum luas untuk infeksi bakteri (Wajib resep dokter).', 'keras', 65, '2027-08-15', '🧪'),
('Vitamin C 500mg', 'Suplemen daya tahan tubuh dan antioksidan harian.', 'biasa', 200, '2028-03-20', '🍋'),
('Asam Mefenamat 500mg', 'Pereda nyeri gigi, nyeri otot, dan peradangan.', 'keras', 45, '2027-05-10', '💉'),
('Obat Batuk Herbal Sirup', 'Meredakan batuk berdahak dan tenggorokan gatal.', 'biasa', 0, '2027-01-15', '🍯'),
('Ibuprofen 400mg (Stok Lama)', 'Antiinflamasi non-steroid untuk nyeri dan demam.', 'keras', 10, '2025-11-01', '🩹');

-- Sample Janji Temu
INSERT INTO appointments (patient_id, doctor_id, schedule_id, booking_date, complaint, status) VALUES
(5, 3, 5, CURRENT_DATE, 'Demam ringan dan pusing sejak 2 hari lalu.', 'Approved'),
(5, 2, 1, CURRENT_DATE + INTERVAL '2 days', 'Kontrol rutin imunisasi anak.', 'Pending');

-- Sample Feedback
INSERT INTO feedbacks (patient_id, doctor_id, rating, comment) VALUES
(5, 3, 5, 'Pelayanan sangat cepat, dokternya ramah, dan antrean farmasi terpantau jelas!');
