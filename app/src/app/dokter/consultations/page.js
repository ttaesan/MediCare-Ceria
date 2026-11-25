'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Plus, Trash2, Printer, CheckCircle } from 'lucide-react';

export default function DokterConsultationsPage() {
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalAction, setMedicalAction] = useState('');
  const [notes, setNotes] = useState('');
  const [medItems, setMedItems] = useState([{ medicine_id: '', quantity: 1, dosage: '3x1 Sesudah Makan' }]);
  const [printRecord, setPrintRecord] = useState(null);

  const loadAll = () => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((d) => setAppointments((d.appointments || []).filter((a) => a.status === 'Approved')));
    fetch('/api/medicines?filter=available')
      .then((r) => r.json())
      .then((d) => setMedicines(d.medicines || []));
    fetch('/api/medical-records')
      .then((r) => r.json())
      .then((d) => setRecords(d.records || []));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addMedRow = () => {
    setMedItems([...medItems, { medicine_id: '', quantity: 1, dosage: '3x1 Sesudah Makan' }]);
  };

  const removeMedRow = (idx) => {
    setMedItems(medItems.filter((_, i) => i !== idx));
  };

  const updateMedRow = (idx, field, val) => {
    const copy = [...medItems];
    copy[idx][field] = val;
    setMedItems(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return alert('Pilih janji temu pasien terlebih dahulu.');

    const res = await fetch('/api/medical-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointment_id: Number(selectedApp),
        diagnosis,
        medical_action: medicalAction,
        notes,
        medicines: medItems,
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert(data.message);
    setSelectedApp('');
    setDiagnosis('');
    setMedicalAction('');
    setNotes('');
    setMedItems([{ medicine_id: '', quantity: 1, dosage: '3x1 Sesudah Makan' }]);
    loadAll();
  };

  const handlePrint = (rec) => {
    setPrintRecord(rec);
    setTimeout(() => window.print(), 200);
  };

  return (
    <PortalLayout role="dokter">
      <h1 className="text-3xl font-black mb-6">Konsultasi, Rekam Medis &amp; Penulisan Resep</h1>

      {/* Form Pemeriksaan */}
      <form onSubmit={handleSubmit} className="no-print bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 mb-10 space-y-4">
        <h2 className="font-black text-lg text-[#FF5C8D]">Form Pemeriksaan Pasien (Janji Temu Approved)</h2>

        <div>
          <label className="block text-xs font-black uppercase mb-1">Pilih Antrean Pasien *</label>
          <select
            required
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 bg-[#FFF3CD] font-bold"
          >
            <option value="">-- Pilih Pasien yang Disetujui --</option>
            {appointments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.patient_name} — {new Date(a.booking_date).toLocaleDateString('id-ID')} (Keluhan: {a.complaint})
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Diagnosis Medis *</label>
            <input
              type="text"
              required
              placeholder="Contoh: ISPA Akut / Demam Berdarah"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-1">Tindakan Medis *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemeriksaan fisik, observasi suhu, terapi obat"
              value={medicalAction}
              onChange={(e) => setMedicalAction(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1">Catatan Dokter *</label>
          <textarea
            rows={2}
            required
            placeholder="Anjuran istirahat, pola makan, atau jadwal kontrol ulang"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>

        {/* Resep Obat */}
        <div className="p-4 rounded-2xl bg-[#E8F8F5] border-2 border-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm">Resep Obat Digital (Opsional / Bisa Lebih dari 1)</span>
            <button
              type="button"
              onClick={addMedRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFD166] font-black text-xs border border-slate-900"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Obat
            </button>
          </div>

          {medItems.map((row, idx) => (
            <div key={idx} className="grid sm:grid-cols-12 gap-2 items-center">
              <select
                value={row.medicine_id}
                onChange={(e) => updateMedRow(idx, 'medicine_id', e.target.value)}
                className="sm:col-span-5 px-3 py-2 rounded-xl border border-slate-900 bg-white font-bold text-xs"
              >
                <option value="">-- Pilih Obat --</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Stok: {m.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) => updateMedRow(idx, 'quantity', e.target.value)}
                placeholder="Jumlah"
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-900 bg-white font-bold text-xs"
              />
              <input
                type="text"
                value={row.dosage}
                onChange={(e) => updateMedRow(idx, 'dosage', e.target.value)}
                placeholder="Dosis (3x1)"
                className="sm:col-span-4 px-3 py-2 rounded-xl border border-slate-900 bg-white font-bold text-xs"
              />
              <button
                type="button"
                onClick={() => removeMedRow(idx)}
                className="sm:col-span-1 p-2 rounded-xl bg-[#FF5C8D] text-white border border-slate-900 flex justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06D6A0] font-black text-sm border-2 border-slate-900 shadow-popSm"
        >
          <CheckCircle className="w-4 h-4" /> Simpan Rekam Medis &amp; Kirim Resep ke Farmasi
        </button>
      </form>

      {/* Arsip Rekam Medis Read-Only */}
      <div className="no-print">
        <h2 className="text-2xl font-black mb-4">Arsip Rekam Medis Pasien (Read-Only / Permanen)</h2>
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec.id} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <span className="px-3 py-0.5 rounded-full bg-[#FFD166] text-xs font-black border border-slate-900">
                    Arsip Permanen #{rec.id}
                  </span>
                  <h3 className="font-black text-lg mt-1">Pasien: {rec.patient_name}</h3>
                  <p className="text-xs text-slate-500">Tanggal Periksa: {new Date(rec.created_at).toLocaleString('id-ID')}</p>
                </div>
                <button
                  onClick={() => handlePrint(rec)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5C8D] text-white font-black text-xs border-2 border-slate-900 shadow-popSm"
                >
                  <Printer className="w-4 h-4" /> Cetak PDF Rekam Medis
                </button>
              </div>
              <p className="text-sm"><b>Diagnosis:</b> {rec.diagnosis}</p>
              <p className="text-sm"><b>Tindakan:</b> {rec.medical_action}</p>
              <p className="text-sm"><b>Catatan:</b> {rec.notes}</p>
              {rec.medicines?.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[#FFFDF7] border border-slate-900 text-xs">
                  <p className="font-black mb-1">Resep Obat ({rec.prescription_status}):</p>
                  <ul className="list-disc pl-5">
                    {rec.medicines.map((m) => (
                      <li key={m.id}>{m.medicine_name} — {m.quantity} unit ({m.dosage})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Printable Sheet */}
      {printRecord && (
        <div className="hidden print-only p-8 border-2 border-black">
          <h1 className="text-2xl font-bold mb-1">RUMAH SAKIT MEDICARE CERIA</h1>
          <p className="text-sm mb-4 border-b pb-2">Lembar Hasil Rekam Medis &amp; Resep Elektronik</p>
          <p><b>Pasien:</b> {printRecord.patient_name}</p>
          <p><b>Dokter Pemeriksa:</b> {printRecord.doctor_name} ({printRecord.poli_name})</p>
          <p><b>Tanggal:</b> {new Date(printRecord.created_at).toLocaleString('id-ID')}</p>
          <hr className="my-3" />
          <p><b>Diagnosis:</b> {printRecord.diagnosis}</p>
          <p><b>Tindakan Medis:</b> {printRecord.medical_action}</p>
          <p><b>Catatan Dokter:</b> {printRecord.notes}</p>
          <h3 className="font-bold mt-4">Rincian Resep Obat:</h3>
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
