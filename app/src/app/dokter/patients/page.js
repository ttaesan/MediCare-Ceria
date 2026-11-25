'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Search } from 'lucide-react';

export default function DokterPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`/api/users?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => setPatients(d.users || []));
  }, [search]);

  return (
    <PortalLayout role="dokter">
      <h1 className="text-3xl font-black mb-6">Daftar Pasien yang Pernah Ditangani</h1>

      <div className="relative max-w-md mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Cari nama atau email pasien..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white font-semibold text-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {patients.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border-2 border-slate-900 shadow-popSm p-5">
            <h3 className="font-black text-lg">{p.username}</h3>
            <p className="text-xs font-bold text-slate-600">{p.email} • {p.phone || '-'}</p>
            <p className="text-xs font-black text-[#06D6A0] mt-2">Total Kunjungan: {p.total_visits}x</p>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
