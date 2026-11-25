'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { CalendarCheck, Pill, Users, Stethoscope, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => setReport(d));
  }, []);

  if (!report) {
    return (
      <PortalLayout role="admin">
        <p className="font-black text-lg">Memuat data operasional rumah sakit...</p>
      </PortalLayout>
    );
  }

  const getRoleCount = (r) => report.usersCount?.find((x) => x.role === r)?.total || 0;
  const menungguResep = report.pharmacyQueue?.find((x) => x.status === 'Menunggu Diproses')?.total || 0;
  const siapDiambil = report.pharmacyQueue?.find((x) => x.status === 'Siap Diambil')?.total || 0;

  return (
    <PortalLayout role="admin">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Dashboard Operasional &amp; Laporan</h1>
        <p className="text-sm text-slate-600 font-medium">Ringkasan harian rumah sakit hari ini ({report.todayName}).</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-3xl bg-[#FFD166] border-2 border-slate-900 shadow-pop">
          <CalendarCheck className="w-8 h-8 mb-2" />
          <p className="text-xs font-black uppercase">Janji Temu Pending</p>
          <p className="text-4xl font-black mt-1">{report.pendingAppointments}</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FF5C8D] text-white border-2 border-slate-900 shadow-pop">
          <Pill className="w-8 h-8 mb-2" />
          <p className="text-xs font-black uppercase">Antrean Resep Farmasi</p>
          <p className="text-2xl font-black mt-1">{menungguResep} Diproses • {siapDiambil} Siap</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#06D6A0] border-2 border-slate-900 shadow-pop">
          <Stethoscope className="w-8 h-8 mb-2" />
          <p className="text-xs font-black uppercase">Dokter Bertugas ({report.todayName})</p>
          <p className="text-4xl font-black mt-1">{report.doctorsToday?.length || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border-2 border-slate-900 shadow-pop">
          <Users className="w-8 h-8 text-[#FF5C8D] mb-2" />
          <p className="text-xs font-black uppercase">Total Pengguna</p>
          <p className="text-sm font-black mt-2">
            Admin: {getRoleCount('admin')} | Dokter: {getRoleCount('dokter')} | Pasien: {getRoleCount('pasien')}
          </p>
        </div>
      </div>

      {/* Dokter Bertugas Hari Ini */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 mb-8">
        <h2 className="text-xl font-black mb-4">Dokter Bertugas Hari Ini ({report.todayName})</h2>
        {report.doctorsToday?.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada jadwal praktik dokter hari ini.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {report.doctorsToday.map((doc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-slate-900">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                  {doc.poli_name}
                </span>
                <p className="font-black text-base mt-2">{doc.username}</p>
                <p className="text-xs font-bold text-[#06D6A0]">
                  Jam: {doc.start_time.slice(0, 5)} - {doc.end_time.slice(0, 5)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Laporan & Analitik (Advanced Feature) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-5">
          <h3 className="font-black text-base mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF5C8D]" /> Pasien per Poli
          </h3>
          <div className="space-y-2">
            {report.patientsPerPoli?.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-[#FFF8E7] border border-slate-900 text-sm font-bold">
                <span>{item.poli_name}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#FFD166] border border-slate-900">{item.total_appointments} Kunjungan</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-5">
          <h3 className="font-black text-base mb-3">Kinerja Dokter</h3>
          <div className="space-y-2">
            {report.doctorPerformance?.map((d, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#E8F8F5] border border-slate-900 text-xs font-bold">
                <p className="font-black text-sm">{d.doctor_name}</p>
                <p className="text-slate-600">{d.poli_name} • Selesai: {d.completed_consultations} • Rating: ⭐ {d.avg_rating}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-5">
          <h3 className="font-black text-base mb-3">Penggunaan Obat Farmasi</h3>
          <div className="space-y-2">
            {report.medicineUsage?.map((m, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-[#FFE5EC] border border-slate-900 text-xs font-bold">
                <span>{m.medicine_name}</span>
                <span>Terpakai: {m.total_dispensed} | Sisa: {m.remaining_stock}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
