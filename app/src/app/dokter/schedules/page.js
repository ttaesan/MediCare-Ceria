'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Plus, Trash2, Edit3, Clock } from 'lucide-react';

export default function DokterSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [dayOfWeek, setDayOfWeek] = useState('Senin');
  const [startTime, setStartTime] = useState('08:00');

  const loadSchedules = () => {
    fetch('/api/schedules')
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []));
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId
      ? { id: editingId, day_of_week: dayOfWeek, start_time: startTime }
      : { day_of_week: dayOfWeek, start_time: startTime };

    const res = await fetch('/api/schedules', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert(data.message);
    setEditingId(null);
    loadSchedules();
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return;
    await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
    loadSchedules();
  };

  return (
    <PortalLayout role="dokter">
      <h1 className="text-3xl font-black mb-2">Manajemen Jadwal Praktik</h1>
      <p className="text-sm text-slate-600 mb-6">
        Setiap sesi konsultasi otomatis berdurasi <b>30 menit</b> dan divalidasi agar tidak tumpang tindih.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 mb-8 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-black uppercase mb-1">Hari Praktik</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFF3CD] font-bold"
          >
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1">Jam Mulai (+30 Menit Otomatis)</label>
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-bold"
          />
        </div>

        <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06D6A0] font-black text-sm border-2 border-slate-900 shadow-popSm">
          <Plus className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Tambah Slot Jadwal'}
        </button>
      </form>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border-2 border-slate-900 shadow-popSm p-5 flex items-center justify-between">
            <div>
              <span className="px-3 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                {s.day_of_week}
              </span>
              <p className="font-black text-lg mt-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF5C8D]" />
                {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setEditingId(s.id);
                  setDayOfWeek(s.day_of_week);
                  setStartTime(s.start_time.slice(0, 5));
                }}
                className="p-2 rounded-lg bg-[#FFD166] border border-slate-900"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-[#FF5C8D] text-white border border-slate-900">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
