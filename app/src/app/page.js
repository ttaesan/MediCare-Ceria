'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartPulse, Calendar, Stethoscope, Star, ArrowRight, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [data, setData] = useState({ polis: [], doctors: [], schedules: [], feedbacks: [] });
  const [selectedPoli, setSelectedPoli] = useState('all');

  useEffect(() => {
    fetch('/api/public')
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  const filteredDoctors =
    selectedPoli === 'all'
      ? data.doctors
      : data.doctors.filter((doc) => String(doc.poli_id) === String(selectedPoli));

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      {/* Navbar Publik */}
      <nav className="bg-white border-b-2 border-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5C8D] text-white flex items-center justify-center border-2 border-slate-900 shadow-popSm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900">MediCare Ceria</span>
              <p className="text-xs font-bold text-[#06D6A0]">Digitalisasi Rumah Sakit Modern</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-[#FFD166] hover:bg-[#ffc53d] text-slate-900 border-2 border-slate-900 shadow-popSm transition"
            >
              Masuk (Login)
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-[#06D6A0] hover:bg-[#05c090] text-slate-900 border-2 border-slate-900 shadow-popSm transition"
            >
              Daftar Pasien
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section Cerah */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFE5EC] via-[#FFF3CD] to-[#D8F3DC] border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 shadow-popSm text-xs font-black mb-5">
              <Sparkles className="w-4 h-4 text-[#FF5C8D]" />
              <span>LAYANAN KESEHATAN DIGITAL TERPADU</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-5">
              Berobat Lebih <span className="bg-[#FFD166] px-2 rounded-lg border-2 border-slate-900">Cepat</span>, Ramah &amp; Tanpa Antre Panjang!
            </h1>
            <p className="text-base md:text-lg text-slate-700 font-medium mb-8 leading-relaxed">
              Pilih Poli spesialis, cek jadwal praktik dokter secara real-time, booking konsultasi dari rumah, dan pantau kesiapan resep obat di loket farmasi dalam satu aplikasi cerah.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FF5C8D] hover:bg-[#ff427b] text-white font-black border-2 border-slate-900 shadow-pop transition"
              >
                Buat Janji Temu Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#daftar-poli"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black border-2 border-slate-900 shadow-pop transition"
              >
                Lihat Poli &amp; Dokter
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-[#FF5C8D] text-white border-2 border-slate-900 shadow-pop">
              <Calendar className="w-9 h-9 mb-3" />
              <h3 className="font-black text-xl mb-1">Booking Online</h3>
              <p className="text-sm text-pink-50">Pilih slot konsultasi 30 menit sesuai jadwal dokter.</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#FFD166] text-slate-900 border-2 border-slate-900 shadow-pop mt-6">
              <Stethoscope className="w-9 h-9 mb-3" />
              <h3 className="font-black text-xl mb-1">Rekam Medis</h3>
              <p className="text-sm text-slate-800">Arsip diagnosis &amp; resep obat digital dapat dicetak PDF.</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#06D6A0] text-slate-900 border-2 border-slate-900 shadow-pop">
              <Clock className="w-9 h-9 mb-3" />
              <h3 className="font-black text-xl mb-1">Pantau Farmasi</h3>
              <p className="text-sm text-slate-800">Notifikasi langsung saat obat siap diambil di loket.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white text-slate-900 border-2 border-slate-900 shadow-pop mt-6">
              <ShieldCheck className="w-9 h-9 text-[#FF5C8D] mb-3" />
              <h3 className="font-black text-xl mb-1">Keamanan Data</h3>
              <p className="text-sm text-slate-600">Dilindungi enkripsi password &amp; autentikasi server.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Poli */}
      <section id="daftar-poli" className="max-w-7xl mx-auto px-5 py-16 w-full">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#06D6A0] text-xs font-black border border-slate-900">
              LAYANAN POLIKLINIK
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Daftar Poli Rumah Sakit</h2>
          </div>
          <button
            onClick={() => setSelectedPoli('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm border-2 border-slate-900 ${
              selectedPoli === 'all' ? 'bg-[#FFD166] shadow-popSm' : 'bg-white'
            }`}
          >
            Semua Poli ({data.polis.length})
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.polis.map((poli) => {
            const active = String(selectedPoli) === String(poli.id);
            return (
              <div
                key={poli.id}
                onClick={() => setSelectedPoli(active ? 'all' : poli.id)}
                className={`cursor-pointer p-6 rounded-3xl border-2 border-slate-900 transition-all ${
                  active ? 'bg-[#FFD166] shadow-pop -translate-y-1' : 'bg-white hover:bg-[#FFF8E7] shadow-popSm'
                }`}
              >
                <div className="text-4xl mb-3">{poli.icon || '🏥'}</div>
                <h3 className="font-black text-xl text-slate-900 mb-2">{poli.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{poli.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Daftar Dokter & Jadwal Praktik (Read-Only untuk Guest) */}
      <section className="bg-[#E8F8F5] border-y-2 border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="mb-8">
            <span className="px-3 py-1 rounded-full bg-[#FF5C8D] text-white text-xs font-black border border-slate-900">
              TIM MEDIS PROFESIONAL
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Profil Dokter &amp; Jadwal Praktik</h2>
            <p className="text-sm text-slate-700 mt-1">
              Login sebagai Pasien untuk membuat janji temu konsultasi dengan dokter pilihan Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => {
              const docSchedules = data.schedules.filter((s) => s.doctor_id === doc.id);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                        {doc.poli_icon} {doc.poli_name || 'Poli Umum'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{doc.specialization}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{doc.username}</h3>
                    <p className="text-sm text-slate-600 mb-4">{doc.bio || 'Dokter spesialis berpengalaman dan ramah.'}</p>

                    <div className="bg-[#FFFDF7] rounded-2xl border-2 border-slate-900 p-3.5 mb-5">
                      <p className="text-xs font-black uppercase text-slate-700 mb-2">Jadwal Praktik (30 Menit/Sesi):</p>
                      {docSchedules.length === 0 ? (
                        <p className="text-xs text-slate-400">Belum ada jadwal tersedia.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {docSchedules.map((sch) => (
                            <span
                              key={sch.id}
                              className="px-2.5 py-1 rounded-lg bg-[#D8F3DC] border border-slate-900 text-xs font-bold text-slate-900"
                            >
                              {sch.day_of_week} • {sch.start_time.slice(0, 5)}-{sch.end_time.slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/login"
                    className="w-full text-center py-2.5 rounded-xl bg-[#06D6A0] hover:bg-[#05c090] text-slate-900 font-black text-sm border-2 border-slate-900 shadow-popSm transition"
                  >
                    Login untuk Buat Janji Temu
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ulasan Pasien */}
      <section className="max-w-7xl mx-auto px-5 py-16 w-full">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Star className="w-6 h-6 text-[#FFD166] fill-[#FFD166]" /> Apa Kata Pasien Kami?
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {data.feedbacks.map((fb) => (
            <div key={fb.id} className="p-5 rounded-2xl bg-white border-2 border-slate-900 shadow-popSm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm">{fb.patient_name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                  ⭐ {fb.rating}/5
                </span>
              </div>
              <p className="text-sm text-slate-700 italic">&ldquo;{fb.comment}&rdquo;</p>
              {fb.doctor_name && <p className="text-xs font-bold text-[#FF5C8D] mt-2">Dokter: {fb.doctor_name}</p>}
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-8 px-5 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="font-black text-lg text-[#FFD166]">MediCare Ceria Hospital System</p>
          <p className="text-xs text-slate-300">Tugas Final Praktikum Pemrograman Web 2026 • Next.js + PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
