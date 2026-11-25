'use client';

import { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';

export default function AdminProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  return (
    <PortalLayout role="admin">
      <h1 className="text-3xl font-black mb-6">Profil Administrator</h1>
      {user && (
        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-pop p-6 max-w-xl space-y-3">
          <p className="text-xs font-black uppercase text-[#FF5C8D]">Role: {user.role}</p>
          <h2 className="text-2xl font-black">{user.username}</h2>
          <p className="text-sm font-bold text-slate-600">Email: {user.email}</p>
          <p className="text-sm font-bold text-slate-600">Jabatan: {user.specialization || 'Admin Rumah Sakit'}</p>
        </div>
      )}
    </PortalLayout>
  );
}
