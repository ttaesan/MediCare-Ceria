'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mendaftar.');
      } else {
        alert('Registrasi Pasien berhasil! Password terenkripsi aman. Silakan login.');
        router.push('/login');
      }
    } catch {
      setError('Kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D8F3DC] via-[#FFF3CD] to-[#FFE5EC] flex items-center justify-center p-5">
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-7 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#06D6A0] text-slate-900 flex items-center justify-center border-2 border-slate-900 shadow-popSm">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Registrasi Pasien</h1>
            <p className="text-xs font-bold text-slate-600">Pendaftaran mandiri khusus akun Pasien</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border-2 border-red-600 text-red-800 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Nama lengkap sesuai KTP"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFFDF7] font-semibold"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@domain.com"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFFDF7] font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1">Password (Min. 6 Karakter) *</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFFDF7] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Nomor Telepon / WhatsApp</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFFDF7] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Alamat Domisili</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat tempat tinggal saat ini"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-[#FFFDF7] font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#FF5C8D] hover:bg-[#ff427b] text-white font-black border-2 border-slate-900 shadow-popSm transition"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Akun Pasien'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t-2 border-slate-100 text-center space-y-2.5">
          <p className="text-sm font-semibold">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-black text-[#06D6A0] hover:underline">
              Login di sini
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#FFD166] text-slate-900 font-extrabold text-xs border-2 border-slate-900"
          >
            <Eye className="w-4 h-4" /> Lanjutkan sebagai Tamu (Continue as Guest)
          </Link>
        </div>
      </div>
    </div>
  );
}
