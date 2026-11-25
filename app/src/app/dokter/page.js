'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { CalendarCheck, Stethoscope, Clock, Users } from 'lucide-react';

export default function DokterDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments || []));
    fetch('/api/medical-records')
      .then((r) => r.json())
      .then((d) => setRecords(d.records || []));
  }, []);

  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const approvedToday = appointments.filter((a) => a.status === 'Approved');
  const recentFive = records.slice(0, 5);

  return (
    <PortalLayout role="dokter">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black">Dashboard Praktik Dokter</h1>
          <p className="text-sm text-slate-600">Pantau antrean konsultasi dan jadwal praktik Anda hari ini.</p>
        </div>
        <Link
          href="/dokter/schedules"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FFD166] font-black text-sm border-2 border-slate-900 shadow-popSm"
        >
          <Clock className="w-4 h-4" /> Atur Jadwal Praktik
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="p-6 rounded-3xl bg-[#FFD166] border-2 border-slate-900 shadow-pop">
          <CalendarCheck className="w-8 h-8 mb-2" />
          <p className="text-xs font-black uppercase">Janji Temu Perlu Validasi</p>
          <p className="text-4xl font-black mt-1">{pendingCount}</p>
        </div>
        <div className="p-6 rounded-3xl bg-[#06D6A0] border-2 border-slate-900 shadow-pop">
          <Stethoscope className="w-8 h-8 mb-2" />
          <p className="text-xs font-black uppercase">Antrean Konsultasi (Approved)</p>
          <p className="text-4xl font-black mt-1">{approvedToday.length}</p>
        </div>
        <div className="p-6 rounded-3xl bg-[#FF5C8D] text-white border-2 border-slate-900 shadow-pop">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-xs font-black uppercase">Total Pemeriksaan Selesai</p>
          <p className="text-4xl font-black mt-1">{records.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6">
          <h2 className="text-xl font-black mb-4">Antrean Janji Temu Siap Diperiksa</h2>
          {approvedToday.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada antrean konsultasi saat ini.</p>
          ) : (
            <div className="space-y-3">
              {approvedToday.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-[#E8F8F5] border-2 border-slate-900 flex items-center justify-between">
                  <div>
                    <p className="font-black">{a.patient_name}</p>
                    <p className="text-xs font-bold text-slate-600">{a.complaint}</p>
                  </div>
                  <Link
                    href="/dokter/consultations"
                    className="px-3.5 py-2 rounded-xl bg-[#06D6A0] font-black text-xs border border-slate-900"
                  >
                    Periksa
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6">
          <h2 className="text-xl font-black mb-4">5 Pasien Terbaru yang Telah Diperiksa</h2>
          {recentFive.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada riwayat pemeriksaan.</p>
          ) : (
            <div className="space-y-3">
              {recentFive.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-[#FFF8E7] border border-slate-900">
                  <div className="flex justify-between">
                    <p className="font-black text-sm">{r.patient_name}</p>
                    <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="text-xs font-bold text-[#FF5C8D] mt-1">Diagnosis: {r.diagnosis}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
