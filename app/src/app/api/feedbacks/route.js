import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const res = await query(`
    SELECT f.*, p.username AS patient_name, d.username AS doctor_name
    FROM feedbacks f
    JOIN users p ON f.patient_id = p.id
    LEFT JOIN users d ON f.doctor_id = d.id
    ORDER BY f.created_at DESC
  `);
  return NextResponse.json({ feedbacks: res.rows });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'pasien') {
    return NextResponse.json({ error: 'Hanya Pasien yang dapat mengirim ulasan.' }, { status: 403 });
  }
  const { doctor_id, rating, comment } = await request.json();
  if (!rating || !comment) {
    return NextResponse.json({ error: 'Rating dan komentar wajib diisi.' }, { status: 400 });
  }
  await query(
    'INSERT INTO feedbacks (patient_id, doctor_id, rating, comment) VALUES ($1, $2, $3, $4)',
    [session.id, doctor_id ? Number(doctor_id) : null, Number(rating), comment.trim()]
  );
  return NextResponse.json({ message: 'Terima kasih atas ulasan & penilaian Anda!' }, { status: 201 });
}
