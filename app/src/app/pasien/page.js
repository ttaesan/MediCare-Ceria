'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { CalendarPlus, Pill, CheckCircle, FileText } from 'lucide-react';

export default function PasienDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments || []));
    fetch('/api/prescriptions')
      .then((r) => r.json())
      .then((d) => setPrescriptions(d.prescriptions || []));
  }, []);

  const latestApp = appointments[0];
  const readyPrescription = prescriptions.find((p) => p.status === 'Siap Diambil');
  const approvedApp = appointments.find((a) => a.status === 'Approved');

  return (
    <PortalLayout role="pasien">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black">Beranda Kesehatan Pasien</h1>
          <p className="text-sm text-slate-600">Pantau janji temu dokter, rekam medis, dan kesiapan obat farmasi Anda.</p>
        </div>
        <Link
          href="/pasien/book"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF5C8D] text-white font-black text-sm border-2 border-slate-900 shadow-popSm"
        >
          <CalendarPlus className="w-4 h-4" /> Buat Janji Temu Baru
        </Link>
      </div>

      {/* Alert Banners */}
      <div className="space-y-3 mb-8">
        {readyPrescription && (
          <div className="p-4 rounded-2xl bg-[#06D6A0] border-2 border-slate-900 shadow-popSm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pill className="w-6 h-6" />
              <p className="font-black text-sm">
                Obat Anda SIAP DIAMBIL di Loket Farmasi! (Dokter: {readyPrescription.doctor_name})
              </p>
            </div>
            <Link href="/pasien/records" className="px-3 py-1.5 rounded-xl bg-white text-xs font-black border border-slate-900">
              Lihat Resep
            </Link>
          </div>
        )}

        {approvedApp && (
          <div className="p-4 rounded-2xl bg-[#FFD166] border-2 border-slate-900 shadow-popSm flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <p className="font-black text-sm">
              Janji Temu Anda dengan {approvedApp.doctor_name} pada {new Date(approvedApp.booking_date).toLocaleDateString('id-ID')} telah DISETUJUI!
            </p>
          </div>
        )}
      </div>

      {/* Status Janji Temu Terakhir */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6">
          <h2 className="text-xl font-black mb-4">Status Janji Temu Terakhir</h2>
          {!latestApp ? (
            <p className="text-sm text-slate-500">Anda belum memiliki janji temu. Yuk buat janji temu sekarang!</p>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-slate-900 space-y-2">
              <div className="flex justify-between">
                <span className="px-3 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                  {latestApp.poli_name}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#D8F3DC] text-xs font-black border border-slate-900">
                  {latestApp.status}
                </span>
              </div>
              <p className="font-black text-lg">{latestApp.doctor_name}</p>
              <p className="text-xs font-bold text-slate-600">
                Tanggal: {new Date(latestApp.booking_date).toLocaleDateString('id-ID')} ({latestApp.day_of_week}, {latestApp.start_time.slice(0, 5)})
              </p>
              <p className="text-sm">Keluhan: {latestApp.complaint}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black mb-2">Arsip Rekam Medis &amp; Resep</h2>
            <p className="text-sm text-slate-600 mb-4">
              Akses seluruh hasil diagnosis dokter dan unduh lembar bukti konsultasi dalam format PDF.
            </p>
          </div>
          <Link
            href="/pasien/records"
            className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#06D6A0] font-black text-sm border-2 border-slate-900 shadow-popSm"
          >
            <FileText className="w-4 h-4" /> Buka Rekam Medis Saya
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
