import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

function addThirtyMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m + 30;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctor_id');
  const session = await getSession();

  let sql = `
    SELECT s.*, u.username AS doctor_name, p.name AS poli_name
    FROM schedules s
    JOIN users u ON s.doctor_id = u.id
    LEFT JOIN polis p ON u.poli_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (doctorId) {
    params.push(doctorId);
    sql += ` AND s.doctor_id = $${params.length}`;
  } else if (session && session.role === 'dokter') {
    params.push(session.id);
    sql += ` AND s.doctor_id = $${params.length}`;
  }

  sql += ` ORDER BY CASE s.day_of_week
    WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3
    WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 WHEN 'Sabtu' THEN 6 ELSE 7
  END, s.start_time ASC`;

  const res = await query(sql, params);
  return NextResponse.json({ schedules: res.rows });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'dokter') {
    return NextResponse.json({ error: 'Hanya Dokter yang dapat mengatur jadwal.' }, { status: 403 });
  }

  try {
    const { day_of_week, start_time } = await request.json();
    if (!day_of_week || !start_time) {
      return NextResponse.json({ error: 'Hari dan jam mulai wajib diisi.' }, { status: 400 });
    }

    const formattedStart = start_time.length === 5 ? `${start_time}:00` : start_time;
    const end_time = addThirtyMinutes(formattedStart);

    // Validasi tumpang tindih (overlap) jadwal dokter di hari yang sama
    const overlap = await query(
      `SELECT id FROM schedules
       WHERE doctor_id = $1 AND day_of_week = $2
       AND ($3::time < end_time AND $4::time > start_time)`,
      [session.id, day_of_week, formattedStart, end_time]
    );

    if (overlap.rows.length > 0) {
      return NextResponse.json(
        { error: 'Jadwal tumpang tindih dengan sesi praktik Anda yang sudah ada!' },
        { status: 409 }
      );
    }

    const res = await query(
      'INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [session.id, day_of_week, formattedStart, end_time]
    );
    return NextResponse.json({ message: 'Jadwal praktik berhasil ditambahkan (durasi 30 menit).', schedule: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambahkan jadwal.' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.role !== 'dokter') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, day_of_week, start_time } = await request.json();
    const formattedStart = start_time.length === 5 ? `${start_time}:00` : start_time;
    const end_time = addThirtyMinutes(formattedStart);

    const overlap = await query(
      `SELECT id FROM schedules
       WHERE doctor_id = $1 AND day_of_week = $2 AND id != $3
       AND ($4::time < end_time AND $5::time > start_time)`,
      [session.id, day_of_week, id, formattedStart, end_time]
    );

    if (overlap.rows.length > 0) {
      return NextResponse.json({ error: 'Jadwal tumpang tindih dengan jadwal lain!' }, { status: 409 });
    }

    await query(
      'UPDATE schedules SET day_of_week=$1, start_time=$2, end_time=$3 WHERE id=$4 AND doctor_id=$5',
      [day_of_week, formattedStart, end_time, id, session.id]
    );
    return NextResponse.json({ message: 'Jadwal berhasil diperbarui.' });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal mengubah jadwal.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== 'dokter') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  await query('DELETE FROM schedules WHERE id = $1 AND doctor_id = $2', [id, session.id]);
  return NextResponse.json({ message: 'Jadwal dihapus.' });
}
