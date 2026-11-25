'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/components/PortalLayout';
import { CalendarCheck } from 'lucide-react';

export default function PasienBookPage() {
  const router = useRouter();
  const [publicData, setPublicData] = useState({ polis: [], doctors: [], schedules: [] });
  const [selectedPoli, setSelectedPoli] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [complaint, setComplaint] = useState('');

  useEffect(() => {
    fetch('/api/public')
      .then((r) => r.json())
      .then((d) => setPublicData(d));
  }, []);

  const filteredDoctors = publicData.doctors.filter((d) => String(d.poli_id) === String(selectedPoli));
  const filteredSchedules = publicData.schedules.filter((s) => String(s.doctor_id) === String(selectedDoctor));

  const handleBooking = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor_id: selectedDoctor,
        schedule_id: selectedSchedule,
        booking_date: bookingDate,
        complaint,
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert(data.message);
    router.push('/pasien/appointments');
  };

  return (
    <PortalLayout role="pasien">
      <h1 className="text-3xl font-black mb-2">Buat Janji Temu Online</h1>
      <p className="text-sm text-slate-600 mb-6">Alur mudah: 1. Pilih Poli → 2. Pilih Dokter &amp; Jadwal → 3. Konfirmasi Keluhan.</p>

      <form onSubmit={handleBooking} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 max-w-2xl space-y-5">
        {/* Step 1: Pilih Poli */}
        <div>
          <label className="block text-xs font-black uppercase mb-1.5">Langkah 1: Pilih Poliklinik *</label>
          <select
            required
            value={selectedPoli}
            onChange={(e) => {
              setSelectedPoli(e.target.value);
              setSelectedDoctor('');
              setSelectedSchedule('');
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 bg-[#FFF3CD] font-bold"
          >
            <option value="">-- Pilih Poli Tujuan --</option>
            {publicData.polis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Pilih Dokter */}
        {selectedPoli && (
          <div>
            <label className="block text-xs font-black uppercase mb-1.5">Langkah 2: Pilih Dokter *</label>
            <select
              required
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                setSelectedSchedule('');
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 bg-[#D8F3DC] font-bold"
            >
              <option value="">-- Pilih Dokter --</option>
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.username} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step 3: Pilih Slot Jadwal */}
        {selectedDoctor && (
          <div>
            <label className="block text-xs font-black uppercase mb-1.5">Langkah 3: Pilih Slot Jadwal Praktik (30 Menit) *</label>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {filteredSchedules.map((sch) => (
                <button
                  type="button"
                  key={sch.id}
                  onClick={() => setSelectedSchedule(sch.id)}
                  className={`p-3 rounded-xl border-2 border-slate-900 text-left font-bold text-xs ${
                    String(selectedSchedule) === String(sch.id) ? 'bg-[#FF5C8D] text-white shadow-popSm' : 'bg-[#FFFDF7]'
                  }`}
                >
                  {sch.day_of_week} • {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-black uppercase mb-1.5">Tanggal Kunjungan *</label>
          <input
            type="date"
            required
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1.5">Keluhan Singkat *</label>
          <textarea
            rows={3}
            required
            placeholder="Jelaskan gejala atau keluhan yang Anda rasakan..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[#06D6A0] hover:bg-[#05c090] font-black text-sm border-2 border-slate-900 shadow-popSm flex items-center justify-center gap-2"
        >
          <CalendarCheck className="w-5 h-5" /> Konfirmasi Buat Janji Temu
        </button>
      </form>
    </PortalLayout>
  );
}
