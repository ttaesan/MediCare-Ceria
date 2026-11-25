'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Printer, Pill } from 'lucide-react';

export default function PasienRecordsPage() {
  const [records, setRecords] = useState([]);
  const [printRecord, setPrintRecord] = useState(null);

  useEffect(() => {
    fetch('/api/medical-records')
      .then((r) => r.json())
      .then((d) => setRecords(d.records || []));
  }, []);

  const handlePrint = (rec) => {
    setPrintRecord(rec);
    setTimeout(() => window.print(), 200);
  };

  return (
    <PortalLayout role="pasien">
      <div className="no-print">
        <h1 className="text-3xl font-black mb-2">Riwayat Rekam Medis &amp; Status Resep Obat</h1>
        <p className="text-sm text-slate-600 mb-6">
          Arsip rekam medis bersifat permanen dan dapat dicetak menjadi lembar PDF bukti konsultasi.
        </p>

        <div className="space-y-5">
          {records.length === 0 ? (
            <p className="p-6 bg-white rounded-3xl border-2 border-slate-900 font-bold">Belum ada riwayat rekam medis.</p>
          ) : (
            records.map((rec) => (
              <div key={rec.id} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b-2 border-slate-100">
                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                      {rec.poli_name}
                    </span>
                    <h3 className="font-black text-xl mt-1">{rec.doctor_name}</h3>
                    <p className="text-xs text-slate-500">Tanggal Konsultasi: {new Date(rec.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <button
                    onClick={() => handlePrint(rec)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF5C8D] text-white font-black text-xs border-2 border-slate-900 shadow-popSm"
                  >
                    <Printer className="w-4 h-4" /> Cetak / Simpan PDF
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="p-3 rounded-2xl bg-[#FFF8E7] border border-slate-900">
                    <p className="text-xs font-black uppercase text-slate-500">Diagnosis</p>
                    <p className="font-bold mt-0.5">{rec.diagnosis}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#E8F8F5] border border-slate-900">
                    <p className="text-xs font-black uppercase text-slate-500">Tindakan Medis</p>
                    <p className="font-bold mt-0.5">{rec.medical_action}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFE5EC] border border-slate-900">
                    <p className="text-xs font-black uppercase text-slate-500">Catatan Dokter</p>
                    <p className="font-bold mt-0.5">{rec.notes}</p>
                  </div>
                </div>

                {rec.medicines?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-slate-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-[#FF5C8D]" /> Rincian Resep Obat
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-[#06D6A0] text-xs font-black border border-slate-900">
                        Status Farmasi: {rec.prescription_status}
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm font-bold">
                      {rec.medicines.map((m) => (
                        <li key={m.id}>
                          • {m.medicine_name} — {m.quantity} unit ({m.dosage})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Format Cetak PDF Bersih */}
      {printRecord && (
        <div className="hidden print-only p-8 border-2 border-black">
          <h1 className="text-2xl font-bold mb-1">RUMAH SAKIT MEDICARE CERIA</h1>
          <p className="text-sm mb-4 border-b pb-2">Bukti Rekam Medis &amp; Resep Elektronik Pasien</p>
          <p><b>Nama Pasien:</b> {printRecord.patient_name}</p>
          <p><b>Poli / Dokter:</b> {printRecord.poli_name} — {printRecord.doctor_name}</p>
          <p><b>Tanggal Pemeriksaan:</b> {new Date(printRecord.created_at).toLocaleString('id-ID')}</p>
          <hr className="my-3" />
          <p><b>Diagnosis:</b> {printRecord.diagnosis}</p>
          <p><b>Tindakan Medis:</b> {printRecord.medical_action}</p>
          <p><b>Catatan Dokter:</b> {printRecord.notes}</p>
          <h3 className="font-bold mt-4">Resep Obat ({printRecord.prescription_status}):</h3>
          <ul className="list-disc pl-5">
            {printRecord.medicines?.map((m) => (
              <li key={m.id}>{m.medicine_name} ({m.quantity} unit) - {m.dosage}</li>
            ))}
          </ul>
        </div>
      )}
    </PortalLayout>
  );
}
