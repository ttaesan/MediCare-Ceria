'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);

  const loadData = () => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, status) => {
    let reject_reason = '';
    if (status === 'Rejected') {
      reject_reason = prompt('Masukkan alasan penolakan janji temu:');
      if (!reject_reason) return;
    }
    const res = await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, reject_reason }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadData();
  };

  return (
    <PortalLayout role="admin">
      <h1 className="text-3xl font-black mb-6">Validasi Semua Janji Temu Masuk</h1>

      <div className="space-y-4">
        {appointments.map((a) => (
          <div key={a.id} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                  {a.poli_name}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#E8F8F5] text-xs font-black border border-slate-900">
                  Status: {a.status}
                </span>
              </div>
              <h3 className="font-black text-lg">Pasien: {a.patient_name} → {a.doctor_name}</h3>
              <p className="text-xs font-bold text-slate-600">
                Tanggal: {new Date(a.booking_date).toLocaleDateString('id-ID')} ({a.day_of_week}, {a.start_time.slice(0, 5)}-{a.end_time.slice(0, 5)})
              </p>
              <p className="text-sm text-slate-700 mt-1">Keluhan: &ldquo;{a.complaint}&rdquo;</p>
            </div>

            {a.status === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(a.id, 'Approved')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#06D6A0] font-black text-xs border-2 border-slate-900 shadow-popSm"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleAction(a.id, 'Rejected')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF5C8D] text-white font-black text-xs border-2 border-slate-900 shadow-popSm"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
