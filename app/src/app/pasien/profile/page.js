'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';

export default function PasienProfilePage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm({
            username: d.user.username || '',
            email: d.user.email || '',
            phone: d.user.phone || '',
            address: d.user.address || '',
            password: '',
          });
        }
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <PortalLayout role="pasien">
      <h1 className="text-3xl font-black mb-6">Profil Pasien</h1>
      <form onSubmit={handleSave} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 max-w-xl space-y-4">
        <div>
          <label className="block text-xs font-black uppercase mb-1">Nama Lengkap</label>
          <input
            type="text"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-1">Nomor Telepon</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-1">Alamat</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-1">Password Baru (Opsional)</label>
          <input
            type="password"
            placeholder="Kosongkan jika tidak diubah"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>
        <button type="submit" className="px-6 py-3 rounded-xl bg-[#FFD166] font-black text-sm border-2 border-slate-900 shadow-popSm">
          Simpan Perubahan Profil
        </button>
      </form>
    </PortalLayout>
  );
}
