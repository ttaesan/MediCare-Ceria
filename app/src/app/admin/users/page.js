'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Plus, Trash2, Edit3, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [polis, setPolis] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'dokter',
    poli_id: '',
    specialization: '',
    phone: '',
    address: '',
  });

  const loadData = () => {
    const params = new URLSearchParams({ role: roleFilter, search, date: dateFilter });
    fetch(`/api/users?${params}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
    fetch('/api/polis')
      .then((r) => r.json())
      .then((d) => setPolis(d.polis || []));
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, search, dateFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { ...form, id: editingId } : form;
    const res = await fetch('/api/users', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert(data.message);
    setEditingId(null);
    setForm({ username: '', email: '', password: '', role: 'dokter', poli_id: '', specialization: '', phone: '', address: '' });
    loadData();
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({
      username: u.username,
      email: u.email,
      password: '',
      role: u.role,
      poli_id: u.poli_id || '',
      specialization: u.specialization || '',
      phone: u.phone || '',
      address: u.address || '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin menghapus pengguna ini?')) return;
    const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadData();
  };

  return (
    <PortalLayout role="admin">
      <h1 className="text-3xl font-black mb-6">Manajemen Pengguna (CRUD)</h1>

      {/* Form Create / Edit */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 mb-8 space-y-4">
        <h2 className="font-black text-lg text-[#FF5C8D]">
          {editingId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru (Admin / Dokter / Pasien)'}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            required
            placeholder="Username / Nama Lengkap"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <input
            type="password"
            required={!editingId}
            placeholder={editingId ? 'Password Baru (Kosongkan jika tetap)' : 'Password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-bold bg-[#FFF3CD]"
          >
            <option value="admin">Admin</option>
            <option value="dokter">Dokter</option>
            <option value="pasien">Pasien</option>
          </select>

          {form.role === 'dokter' && (
            <>
              <select
                required
                value={form.poli_id}
                onChange={(e) => setForm({ ...form, poli_id: e.target.value })}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-bold bg-[#D8F3DC]"
              >
                <option value="">-- Pilih Poli Dokter --</option>
                {polis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Spesialisasi (Contoh: Spesialis Anak)"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
              />
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06D6A0] font-black text-sm border-2 border-slate-900 shadow-popSm"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ username: '', email: '', password: '', role: 'dokter', poli_id: '', specialization: '', phone: '', address: '' });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-200 font-bold text-sm border-2 border-slate-900"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama dokter / pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white font-semibold text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFD166] font-bold text-sm"
        >
          <option value="all">Semua Peran</option>
          <option value="admin">Admin</option>
          <option value="dokter">Dokter</option>
          <option value="pasien">Pasien</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white font-bold text-sm"
        />
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFD166] border-b-2 border-slate-900 text-xs font-black uppercase">
              <th className="p-4">Nama</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Poli / Info</th>
              <th className="p-4">Tgl Daftar</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#FFFDF7]">
                <td className="p-4 font-bold">{u.username}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D8F3DC] border border-slate-900 text-xs font-black uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-xs font-bold">{u.poli_name || '-'}</td>
                <td className="p-4 text-xs">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => startEdit(u)} className="p-2 rounded-lg bg-[#FFD166] border border-slate-900">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg bg-[#FF5C8D] text-white border border-slate-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
