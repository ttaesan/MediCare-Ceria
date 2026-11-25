'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Pill, CheckCircle2 } from 'lucide-react';

export default function AdminPharmacyPage() {
  const [prescriptions, setPrescriptions] = useState([]);

  const loadData = () => {
    fetch('/api/prescriptions')
      .then((r) => r.json())
      .then((d) => setPrescriptions(d.prescriptions || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    const res = await fetch('/api/prescriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert(data.message);
    loadData();
  };

  return (
    <PortalLayout role="admin">
      <h1 className="text-3xl font-black mb-2">Loket Farmasi — Antrean Resep Obat</h1>
      <p className="text-sm text-slate-600 mb-6">
        Menandai resep menjadi <b>Siap Diambil</b> akan otomatis memotong stok obat di master farmasi.
      </p>

      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <p className="p-6 bg-white rounded-3xl border-2 border-slate-900 font-bold">Belum ada resep masuk dari dokter.</p>
        ) : (
          prescriptions.map((pr) => (
            <div key={pr.id} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-slate-100">
                <div>
                  <h3 className="font-black text-lg">Pasien: {pr.patient_name}</h3>
                  <p className="text-xs font-bold text-slate-500">Dokter: {pr.doctor_name} • Diagnosis: {pr.diagnosis}</p>
                </div>
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-black border-2 border-slate-900 ${
                    pr.status === 'Menunggu Diproses'
                      ? 'bg-[#FFD166]'
                      : pr.status === 'Siap Diambil'
                      ? 'bg-[#06D6A0]'
                      : 'bg-slate-200'
                  }`}
                >
                  {pr.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {pr.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FFFDF7] border border-slate-900 text-sm">
                    <span className="font-bold">
                      <Pill className="w-4 h-4 inline mr-1.5 text-[#FF5C8D]" />
                      {item.medicine_name} ({item.dosage})
                    </span>
                    <span className="font-black text-xs">
                      Jumlah: {item.quantity} unit (Stok Gudang: {item.current_stock})
                    </span>
                  </div>
                ))}
              </div>

              {pr.status === 'Menunggu Diproses' && (
                <button
                  onClick={() => updateStatus(pr.id, 'Siap Diambil')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06D6A0] font-black text-xs border-2 border-slate-900 shadow-popSm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Siapkan Obat &amp; Potong Stok (Siap Diambil)
                </button>
              )}

              {pr.status === 'Siap Diambil' && (
                <button
                  onClick={() => updateStatus(pr.id, 'Sudah Diambil')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5C8D] text-white font-black text-xs border-2 border-slate-900 shadow-popSm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Konfirmasi Obat Diserahkan (Sudah Diambil)
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  );
}
