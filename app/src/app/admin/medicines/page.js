'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'biasa',
    stock: 50,
    expired_date: '2027-12-31',
    image_url: '💊',
  });

  const loadMedicines = () => {
    const params = new URLSearchParams({ filter, search });
    fetch(`/api/medicines?${params}`)
      .then((r) => r.json())
      .then((d) => setMedicines(d.medicines || []));
  };

  useEffect(() => {
    loadMedicines();
  }, [filter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { ...form, id: editingId } : form;
    const res = await fetch('/api/medicines', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setEditingId(null);
    setForm({ name: '', description: '', type: 'biasa', stock: 50, expired_date: '2027-12-31', image_url: '💊' });
    loadMedicines();
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus obat ini?')) return;
    const res = await fetch(`/api/medicines?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadMedicines();
  };

  return (
    <PortalLayout role="admin">
      <h1 className="text-3xl font-black mb-6">Master Obat &amp; Manajemen Stok</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 mb-8 space-y-4">
        <h2 className="font-black text-lg text-[#FF5C8D]">{editingId ? 'Edit Data Obat' : 'Tambah Obat Baru'}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            required
            placeholder="Nama Obat"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-bold bg-[#FFF3CD]"
          >
            <option value="biasa">Obat Biasa (Bebas)</option>
            <option value="keras">Obat Keras (Resep Dokter)</option>
          </select>
          <input
            type="number"
            min={0}
            required
            placeholder="Jumlah Stok"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <input
            type="date"
            required
            value={form.expired_date}
            onChange={(e) => setForm({ ...form, expired_date: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <input
            type="text"
            placeholder="Ikon / URL Gambar (contoh: 💊)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <input
            type="text"
            required
            placeholder="Deskripsi & Kegunaan Obat"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>
        <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06D6A0] font-black text-sm border-2 border-slate-900 shadow-popSm">
          <Plus className="w-4 h-4" /> {editingId ? 'Simpan Obat' : 'Tambah Obat'}
        </button>
      </form>

      {/* Filter & Search */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama obat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white font-semibold text-sm"
          />
        </div>
        {['all', 'available', 'out_of_stock', 'expired'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-bold text-xs border-2 border-slate-900 ${
              filter === f ? 'bg-[#FFD166] shadow-popSm' : 'bg-white'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'available' ? 'Tersedia' : f === 'out_of_stock' ? 'Stok Habis' : 'Kadaluarsa'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFD166] border-b-2 border-slate-900 text-xs font-black uppercase">
              <th className="p-4">Obat</th>
              <th className="p-4">Tipe</th>
              <th className="p-4">Stok</th>
              <th className="p-4">Kadaluarsa</th>
              <th className="p-4">Deskripsi</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {medicines.map((m) => {
              const isExpired = new Date(m.expired_date) < new Date();
              return (
                <tr key={m.id}>
                  <td className="p-4 font-black">
                    <span className="mr-2 text-lg">{m.image_url}</span>
                    {m.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border border-slate-900 ${m.type === 'keras' ? 'bg-[#FF5C8D] text-white' : 'bg-[#D8F3DC]'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="p-4 font-black">{m.stock} unit</td>
                  <td className="p-4 text-xs font-bold">
                    {new Date(m.expired_date).toLocaleDateString('id-ID')}{' '}
                    {isExpired && <span className="text-red-600">(Kadaluarsa)</span>}
                  </td>
                  <td className="p-4 text-xs text-slate-600">{m.description}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(m.id);
                        setForm({
                          name: m.name,
                          description: m.description,
                          type: m.type,
                          stock: m.stock,
                          expired_date: m.expired_date.slice(0, 10),
                          image_url: m.image_url,
                        });
                      }}
                      className="p-2 rounded-lg bg-[#FFD166] border border-slate-900"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg bg-[#FF5C8D] text-white border border-slate-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
