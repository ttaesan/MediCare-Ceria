'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Plus, Edit3, Trash2 } from 'lucide-react';

export default function AdminPolisPage() {
  const [polis, setPolis] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '🏥' });

  const loadPolis = () => {
    fetch('/api/polis')
      .then((r) => r.json())
      .then((d) => setPolis(d.polis || []));
  };

  useEffect(() => {
    loadPolis();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { ...form, id: editingId } : form;
    const res = await fetch('/api/polis', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setEditingId(null);
    setForm({ name: '', description: '', icon: '🏥' });
    loadPolis();
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus Poli ini?')) return;
    await fetch(`/api/polis?id=${id}`, { method: 'DELETE' });
    loadPolis();
  };

  return (
    <PortalLayout role="admin">
      <h1 className="text-3xl font-black mb-6">Manajemen Data Poli</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 mb-8 space-y-4">
        <h2 className="font-black text-lg text-[#FF5C8D]">{editingId ? 'Edit Poli' : 'Tambah Poli Baru'}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            required
            placeholder="Nama Poli (Unik)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <input
            type="text"
            placeholder="Ikon Emoji (Contoh: 🦷, 🩺, 🧸)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
          <input
            type="text"
            required
            placeholder="Deskripsi Layanan Poli"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-900 font-semibold"
          />
        </div>
        <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06D6A0] font-black text-sm border-2 border-slate-900 shadow-popSm">
          <Plus className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Tambah Poli'}
        </button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {polis.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 flex flex-col justify-between">
            <div>
              <div className="text-4xl mb-2">{p.icon}</div>
              <h3 className="text-xl font-black">{p.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{p.description}</p>
            </div>
            <div className="flex gap-2 mt-5 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setEditingId(p.id);
                  setForm({ name: p.name, description: p.description, icon: p.icon });
                }}
                className="flex-1 py-2 rounded-xl bg-[#FFD166] font-black text-xs border border-slate-900 flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex-1 py-2 rounded-xl bg-[#FF5C8D] text-white font-black text-xs border border-slate-900 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
