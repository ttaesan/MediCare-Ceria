import './globals.css';

export const metadata = {
  title: 'MediCare Ceria — Sistem Digitalisasi Rumah Sakit',
  description: 'Platform digitalisasi rumah sakit modern, cerah, cepat, dan terintegrasi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FFFDF7] text-slate-800 antialiased selection:bg-[#FFD166] selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
