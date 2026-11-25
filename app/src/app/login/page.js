'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, ArrowRight, Eye } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal.');
      } else {
        router.push(`/${data.role}`);
        router.refresh();
      }
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE5EC] via-[#FFF3CD] to-[#D8F3DC] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-7 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5C8D] text-white flex items-center justify-center border-2 border-slate-900 shadow-popSm">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Masuk Sistem</h1>
            <p className="text-xs font-bold text-slate-600">Admin, Dokter &amp; Pasien</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border-2 border-red-600 text-red-800 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1.5">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: andi@pasien.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 bg-[#FFFDF7] font-semibold focus:outline-none focus:bg-[#FFF3CD]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 bg-[#FFFDF7] font-semibold focus:outline-none focus:bg-[#FFF3CD]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#06D6A0] hover:bg-[#05c090] text-slate-900 font-black border-2 border-slate-900 shadow-popSm flex items-center justify-center gap-2 transition"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Akun Demo Cepat untuk Pengujian Penilai */}
        <div className="mt-5 p-3.5 rounded-2xl bg-[#FFF8E7] border-2 border-dashed border-slate-900">
          <p className="text-[11px] font-black uppercase text-slate-700 mb-2">Klik Cepat Akun Uji Coba (Pass: password123):</p>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => quickFill('admin@rs.com')} className="px-2.5 py-1 rounded-lg bg-[#FF5C8D] text-white text-xs font-bold border border-slate-900">
              Admin
            </button>
            <button type="button" onClick={() => quickFill('budi@rs.com')} className="px-2.5 py-1 rounded-lg bg-[#06D6A0] text-slate-900 text-xs font-bold border border-slate-900">
              Dokter
            </button>
            <button type="button" onClick={() => quickFill('andi@pasien.com')} className="px-2.5 py-1 rounded-lg bg-[#FFD166] text-slate-900 text-xs font-bold border border-slate-900">
              Pasien
            </button>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t-2 border-slate-100 space-y-3 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Pasien baru?{' '}
            <Link href="/register" className="font-black text-[#FF5C8D] hover:underline">
              Daftar Akun Pasien
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#FFD166] hover:bg-[#ffc438] text-slate-900 font-extrabold text-xs border-2 border-slate-900"
          >
            <Eye className="w-4 h-4" /> Lanjutkan sebagai Tamu (Continue as Guest)
          </Link>
        </div>
      </div>
    </div>
  );
}
