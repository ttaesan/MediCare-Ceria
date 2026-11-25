'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Star } from 'lucide-react';

export default function PasienFeedbackPage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch('/api/public')
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: doctorId, rating, comment }),
    });
    const data = await res.json();
    alert(data.message || data.error);
    setComment('');
  };

  return (
    <PortalLayout role="pasien">
      <h1 className="text-3xl font-black mb-6">Umpan Balik &amp; Rating Layanan</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 max-w-xl space-y-4">
        <div>
          <label className="block text-xs font-black uppercase mb-1">Pilih Dokter (Opsional)</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFF3CD] font-bold"
          >
            <option value="">-- Layanan Rumah Sakit Umum --</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.username}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1">Rating Kepuasan (1-5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setRating(num)}
                className={`px-4 py-2 rounded-xl border-2 border-slate-900 font-black text-sm ${
                  rating === num ? 'bg-[#FFD166] shadow-popSm' : 'bg-white'
                }`}
              >
                ⭐ {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1">Ulasan Anda *</label>
          <textarea
            rows={3}
            required
            placeholder="Ceritakan pengalaman pelayanan dokter & farmasi..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>

        <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06D6A0] font-black text-sm border-2 border-slate-900 shadow-popSm">
          <Star className="w-4 h-4" /> Kirim Ulasan
        </button>
      </form>
    </PortalLayout>
  );
}
