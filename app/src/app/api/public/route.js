import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const polisRes = await query('SELECT * FROM polis ORDER BY id ASC');
    const doctorsRes = await query(`
      SELECT u.id, u.username, u.email, u.specialization, u.bio, u.poli_id, p.name AS poli_name, p.icon AS poli_icon
      FROM users u
      LEFT JOIN polis p ON u.poli_id = p.id
      WHERE u.role = 'dokter'
      ORDER BY u.username ASC
    `);
    const schedulesRes = await query(`
      SELECT s.*, u.username AS doctor_name
      FROM schedules s
      JOIN users u ON s.doctor_id = u.id
      ORDER BY CASE s.day_of_week
        WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3
        WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 WHEN 'Sabtu' THEN 6 ELSE 7
      END, s.start_time ASC
    `);
    const feedbacksRes = await query(`
      SELECT f.*, p.username AS patient_name, d.username AS doctor_name
      FROM feedbacks f
      JOIN users p ON f.patient_id = p.id
      LEFT JOIN users d ON f.doctor_id = d.id
      ORDER BY f.created_at DESC
      LIMIT 6
    `);

    return NextResponse.json({
      polis: polisRes.rows,
      doctors: doctorsRes.rows,
      schedules: schedulesRes.rows,
      feedbacks: feedbacksRes.rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal memuat data publik' }, { status: 500 });
  }
}
