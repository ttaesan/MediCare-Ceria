'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HeartPulse, LayoutDashboard, Users, Building2, Pill, CalendarCheck,
  FileText, UserCircle, LogOut, Bell, Clock, Stethoscope, Star, Menu, X
} from 'lucide-react';

export default function PortalLayout({ children, role }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    fetchNotifications();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menus = {
    admin: [
      { href: '/admin', label: 'Dashboard & Laporan', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Manajemen Pengguna', icon: Users },
      { href: '/admin/polis', label: 'Manajemen Poli', icon: Building2 },
      { href: '/admin/medicines', label: 'Master Obat & Stok', icon: Pill },
      { href: '/admin/appointments', label: 'Validasi Janji Temu', icon: CalendarCheck },
      { href: '/admin/pharmacy', label: 'Loket Farmasi (Resep)', icon: HeartPulse },
      { href: '/admin/profile', label: 'Profil Saya', icon: UserCircle },
    ],
    dokter: [
      { href: '/dokter', label: 'Dashboard Dokter', icon: LayoutDashboard },
      { href: '/dokter/schedules', label: 'Jadwal Praktik', icon: Clock },
      { href: '/dokter/appointments', label: 'Validasi Janji Temu', icon: CalendarCheck },
      { href: '/dokter/consultations', label: 'Konsultasi & Rekam Medis', icon: Stethoscope },
      { href: '/dokter/patients', label: 'Daftar Pasien Saya', icon: Users },
      { href: '/dokter/profile', label: 'Profil Dokter', icon: UserCircle },
    ],
    pasien: [
      { href: '/pasien', label: 'Beranda Pasien', icon: LayoutDashboard },
      { href: '/pasien/book', label: 'Buat Janji Temu', icon: CalendarCheck },
      { href: '/pasien/appointments', label: 'Riwayat Janji Temu', icon: Clock },
      { href: '/pasien/records', label: 'Rekam Medis & Resep', icon: FileText },
      { href: '/pasien/feedback', label: 'Beri Ulasan Layanan', icon: Star },
      { href: '/pasien/profile', label: 'Profil Pasien', icon: UserCircle },
    ],
  };

  const navItems = menus[role] || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const badgeColors = {
    admin: 'bg-[#FF5C8D] text-white',
    dokter: 'bg-[#06D6A0] text-slate-900',
    pasien: 'bg-[#FFD166] text-slate-900',
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFDF7]">
      {/* Sidebar Desktop */}
      <aside className="no-print hidden md:flex md:w-72 flex-col bg-white border-r-2 border-slate-900 p-5 justify-between sticky top-0 h-screen">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-[#FFD166] border-2 border-slate-900 shadow-popSm">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C8D] text-white flex items-center justify-center border-2 border-slate-900">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight text-slate-900">MediCare Ceria</h1>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Portal {role}</span>
            </div>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                    active
                      ? 'bg-[#06D6A0] text-slate-900 border-slate-900 shadow-popSm translate-x-1'
                      : 'bg-white text-slate-700 border-transparent hover:bg-[#FFF3CD] hover:border-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#FF5C8D] hover:bg-[#ff427b] text-white font-extrabold border-2 border-slate-900 shadow-popSm transition active:translate-y-0.5"
        >
          <LogOut className="w-4 h-4" />
          Keluar Akun
        </button>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="no-print bg-white border-b-2 border-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 rounded-xl bg-[#FFD166] border-2 border-slate-900"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <p className="text-xs font-bold text-slate-500">Selamat datang kembali,</p>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base md:text-lg text-slate-900">{user?.username || 'Memuat...'}</h2>
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border border-slate-900 ${badgeColors[role]}`}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2.5 rounded-xl bg-[#FFD166] hover:bg-[#ffc642] border-2 border-slate-900 shadow-popSm transition"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 text-slate-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF5C8D] text-white text-xs font-black flex items-center justify-center border-2 border-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border-2 border-slate-900 shadow-pop p-4 z-50">
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-slate-100">
                  <span className="font-black text-sm">Notifikasi Terbaru</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-bold text-[#FF5C8D] hover:underline">
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Belum ada notifikasi.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs ${
                          n.is_read ? 'bg-slate-50 border-slate-200' : 'bg-[#FFF3CD] border-slate-900 font-semibold'
                        }`}
                      >
                        <p className="font-black text-slate-900 mb-0.5">{n.title}</p>
                        <p className="text-slate-700">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenu && (
          <div className="no-print md:hidden bg-white border-b-2 border-slate-900 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#FFFDF7] border border-slate-900"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-[#FF5C8D] text-white font-bold border-2 border-slate-900"
            >
              Keluar Akun
            </button>
          </div>
        )}

        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
