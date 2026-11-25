'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { XCircle } from 'lucide-react';

export default function PasienAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);

  const loadData = () => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Batalkan janji temu ini?')) return;
    const res = await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'Dibatalkan' }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadData();
  };

  return (
    <PortalLayout role="pasien">
      <h1 className="text-3xl font-black mb-6">Riwayat Janji Temu Saya</h1>

      <div className="space-y-4">
        {appointments.map((a) => (
          <div key={a.id} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                  {a.poli_name}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#D8F3DC] text-xs font-black border border-slate-900">
                  {a.status}
                </span>
              </div>
              <h3 className="font-black text-lg">{a.doctor_name}</h3>
              <p className="text-xs font-bold text-slate-600">
                Tanggal: {new Date(a.booking_date).toLocaleDateString('id-ID')} ({a.day_of_week}, {a.start_time.slice(0, 5)}-{a.end_time.slice(0, 5)})
              </p>
              <p className="text-sm mt-1">Keluhan: {a.complaint}</p>
              {a.reject_reason && (
                <p className="text-xs font-bold text-red-600 mt-1">Alasan Ditolak: {a.reject_reason}</p>
              )}
            </div>

            {a.status === 'Pending' && (
              <button
                onClick={() => handleCancel(a.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF5C8D] text-white font-black text-xs border-2 border-slate-900 shadow-popSm"
              >
                <XCircle className="w-4 h-4" /> Batalkan Janji Temu
              </button>
            )}
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
