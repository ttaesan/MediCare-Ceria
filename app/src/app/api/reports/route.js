import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Agregasi untuk laporan & dashboard
  const usersCount = await query('SELECT role, COUNT(*)::int AS total FROM users GROUP BY role');
  const pendingApps = await query("SELECT COUNT(*)::int AS total FROM appointments WHERE status = 'Pending'");
  const pharmacyQueue = await query(
    "SELECT status, COUNT(*)::int AS total FROM prescriptions WHERE status IN ('Menunggu Diproses', 'Siap Diambil') GROUP BY status"
  );

  const todayDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = todayDays[new Date().getDay()];
  const doctorsToday = await query(
    `SELECT DISTINCT u.id, u.username, u.specialization, p.name AS poli_name, s.start_time, s.end_time
     FROM schedules s
     JOIN users u ON s.doctor_id = u.id
     LEFT JOIN polis p ON u.poli_id = p.id
     WHERE s.day_of_week = $1
     ORDER BY s.start_time ASC`,
    [todayName]
  );

  // Advanced Reports: Pasien per Poli, Kinerja Dokter, Penggunaan Obat
  const patientsPerPoli = await query(`
    SELECT po.name AS poli_name, COUNT(a.id)::int AS total_appointments
    FROM polis po
    LEFT JOIN users d ON d.poli_id = po.id
    LEFT JOIN appointments a ON a.doctor_id = d.id
    GROUP BY po.id, po.name
    ORDER BY total_appointments DESC
  `);

  const doctorPerformance = await query(`
    SELECT d.username AS doctor_name, po.name AS poli_name,
           COUNT(CASE WHEN a.status = 'Selesai' THEN 1 END)::int AS completed_consultations,
           COALESCE(ROUND(AVG(f.rating), 1), 0) AS avg_rating
    FROM users d
    LEFT JOIN polis po ON d.poli_id = po.id
    LEFT JOIN appointments a ON a.doctor_id = d.id
    LEFT JOIN feedbacks f ON f.doctor_id = d.id
    WHERE d.role = 'dokter'
    GROUP BY d.id, d.username, po.name
    ORDER BY completed_consultations DESC
  `);

  const medicineUsage = await query(`
    SELECT m.name AS medicine_name, m.type, m.stock AS remaining_stock,
           COALESCE(SUM(pi.quantity), 0)::int AS total_dispensed
    FROM medicines m
    LEFT JOIN prescription_items pi ON pi.medicine_id = m.id
    GROUP BY m.id, m.name, m.type, m.stock
    ORDER BY total_dispensed DESC
  `);

  return NextResponse.json({
    todayName,
    usersCount: usersCount.rows,
    pendingAppointments: pendingApps.rows[0]?.total || 0,
    pharmacyQueue: pharmacyQueue.rows,
    doctorsToday: doctorsToday.rows,
    patientsPerPoli: patientsPerPoli.rows,
    doctorPerformance: doctorPerformance.rows,
    medicineUsage: medicineUsage.rows,
  });
}
