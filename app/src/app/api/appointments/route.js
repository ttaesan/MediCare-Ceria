import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let sql = `
    SELECT a.*,
           p.username AS patient_name, p.email AS patient_email, p.phone AS patient_phone,
           d.username AS doctor_name, d.specialization,
           po.name AS poli_name, po.icon AS poli_icon,
           s.day_of_week, s.start_time, s.end_time
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users d ON a.doctor_id = d.id
    LEFT JOIN polis po ON d.poli_id = po.id
    JOIN schedules s ON a.schedule_id = s.id
  `;
  const params = [];

  if (session.role === 'pasien') {
    params.push(session.id);
    sql += ' WHERE a.patient_id = $1';
  } else if (session.role === 'dokter') {
    params.push(session.id);
    sql += ' WHERE a.doctor_id = $1';
  }

  sql += ' ORDER BY a.booking_date DESC, a.created_at DESC';
  const res = await query(sql, params);
  return NextResponse.json({ appointments: res.rows });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'pasien') {
    return NextResponse.json({ error: 'Hanya Pasien yang dapat membuat janji temu.' }, { status: 403 });
  }

  try {
    const { doctor_id, schedule_id, booking_date, complaint } = await request.json();
    if (!doctor_id || !schedule_id || !booking_date || !complaint) {
      return NextResponse.json({ error: 'Semua data janji temu wajib diisi.' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO appointments (patient_id, doctor_id, schedule_id, booking_date, complaint, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending') RETURNING *`,
      [session.id, Number(doctor_id), Number(schedule_id), booking_date, complaint.trim()]
    );

    // Kirim notifikasi in-app ke Dokter terkait
    await query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, 'Pengajuan Janji Temu Baru', $2)`,
      [Number(doctor_id), `Pasien ${session.username} mengajukan janji temu pada ${booking_date}.`]
    );

    return NextResponse.json({
      message: 'Janji temu berhasil diajukan! Status saat ini: Pending.',
      appointment: res.rows[0],
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal membuat janji temu.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status, reject_reason } = await request.json();
    const appRes = await query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return NextResponse.json({ error: 'Janji temu tidak ditemukan.' }, { status: 404 });
    }
    const appointment = appRes.rows[0];

    // Pasien hanya boleh membatalkan saat status masih Pending
    if (session.role === 'pasien') {
      if (appointment.patient_id !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (status !== 'Dibatalkan' || appointment.status !== 'Pending') {
        return NextResponse.json({ error: 'Janji temu hanya dapat dibatalkan saat status masih Pending.' }, { status: 400 });
      }
      await query("UPDATE appointments SET status = 'Dibatalkan' WHERE id = $1", [id]);
      return NextResponse.json({ message: 'Janji temu berhasil dibatalkan.' });
    }

    // Admin & Dokter yang bersangkutan memvalidasi (Approved / Rejected)
    if (session.role === 'admin' || (session.role === 'dokter' && appointment.doctor_id === session.id)) {
      if (!['Approved', 'Rejected'].includes(status)) {
        return NextResponse.json({ error: 'Status validasi tidak valid.' }, { status: 400 });
      }
      if (status === 'Rejected' && !reject_reason) {
        return NextResponse.json({ error: 'Alasan penolakan wajib diisi.' }, { status: 400 });
      }

      await query(
        'UPDATE appointments SET status = $1, reject_reason = $2 WHERE id = $3',
        [status, status === 'Rejected' ? reject_reason : null, id]
      );

      // Notifikasi In-App untuk Pasien
      const notifMsg =
        status === 'Approved'
          ? `Janji temu Anda pada tanggal ${new Date(appointment.booking_date).toLocaleDateString('id-ID')} telah DISETUJUI.`
          : `Janji temu Anda DITOLAK. Alasan: ${reject_reason}`;

      await query(
        `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
        [appointment.patient_id, `Status Janji Temu: ${status}`, notifMsg]
      );

      return NextResponse.json({ message: `Janji temu berhasil diubah menjadi ${status}.` });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal memperbarui status janji temu.' }, { status: 500 });
  }
}
