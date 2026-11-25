import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientIdFilter = searchParams.get('patient_id');

  let sql = `
    SELECT mr.*,
           p.username AS patient_name, p.email AS patient_email, p.phone AS patient_phone, p.address AS patient_address,
           d.username AS doctor_name, d.specialization,
           po.name AS poli_name,
           a.booking_date, a.complaint,
           pr.id AS prescription_id, pr.status AS prescription_status
    FROM medical_records mr
    JOIN users p ON mr.patient_id = p.id
    JOIN users d ON mr.doctor_id = d.id
    LEFT JOIN polis po ON d.poli_id = po.id
    JOIN appointments a ON mr.appointment_id = a.id
    LEFT JOIN prescriptions pr ON pr.medical_record_id = mr.id
    WHERE 1=1
  `;
  const params = [];

  if (session.role === 'pasien') {
    params.push(session.id);
    sql += ` AND mr.patient_id = $${params.length}`;
  } else if (patientIdFilter) {
    params.push(patientIdFilter);
    sql += ` AND mr.patient_id = $${params.length}`;
  }

  sql += ' ORDER BY mr.created_at DESC';
  const recordsRes = await query(sql, params);

  // Ambil detail item obat per resep
  const records = [];
  for (const rec of recordsRes.rows) {
    let items = [];
    if (rec.prescription_id) {
      const itemsRes = await query(
        `SELECT pi.*, m.name AS medicine_name, m.type AS medicine_type
         FROM prescription_items pi
         JOIN medicines m ON pi.medicine_id = m.id
         WHERE pi.prescription_id = $1`,
        [rec.prescription_id]
      );
      items = itemsRes.rows;
    }
    records.push({ ...rec, medicines: items });
  }

  return NextResponse.json({ records });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'dokter') {
    return NextResponse.json({ error: 'Hanya Dokter yang dapat mencatat rekam medis.' }, { status: 403 });
  }

  const client = await getClient();
  try {
    const { appointment_id, diagnosis, medical_action, notes, medicines } = await request.json();

    if (!appointment_id || !diagnosis || !medical_action || !notes) {
      return NextResponse.json({ error: 'Diagnosis, tindakan medis, dan catatan wajib diisi.' }, { status: 400 });
    }

    await client.query('BEGIN');

    const appRes = await client.query(
      "SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2 AND status = 'Approved'",
      [appointment_id, session.id]
    );
    if (appRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Janji temu tidak valid atau belum disetujui.' }, { status: 400 });
    }
    const appointment = appRes.rows[0];

    // 1. Buat Rekam Medis (Permanen)
    const mrRes = await client.query(
      `INSERT INTO medical_records (appointment_id, patient_id, doctor_id, diagnosis, medical_action, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [appointment.id, appointment.patient_id, session.id, diagnosis.trim(), medical_action.trim(), notes.trim()]
    );
    const medicalRecord = mrRes.rows[0];

    // 2. Buat Resep Obat (Status: Menunggu Diproses)
    if (Array.isArray(medicines) && medicines.length > 0) {
      const validMeds = medicines.filter((m) => m.medicine_id && Number(m.quantity) > 0);
      if (validMeds.length > 0) {
        const presRes = await client.query(
          `INSERT INTO prescriptions (medical_record_id, patient_id, status)
           VALUES ($1, $2, 'Menunggu Diproses') RETURNING *`,
          [medicalRecord.id, appointment.patient_id]
        );
        const prescription = presRes.rows[0];

        for (const item of validMeds) {
          await client.query(
            `INSERT INTO prescription_items (prescription_id, medicine_id, quantity, dosage)
             VALUES ($1, $2, $3, $4)`,
            [prescription.id, Number(item.medicine_id), Number(item.quantity), item.dosage || '3x1 Sesudah Makan']
          );
        }
      }
    }

    // 3. Ubah status Janji Temu menjadi "Selesai"
    await client.query("UPDATE appointments SET status = 'Selesai' WHERE id = $1", [appointment.id]);

    // 4. Kirim Notifikasi ke Pasien
    await client.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, 'Konsultasi Selesai & Rekam Medis Terbit', 'Rekam medis pemeriksaan Anda telah dicatat. Cek status resep Anda di loket farmasi.')`,
      [appointment.patient_id]
    );

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Rekam medis & resep berhasil disimpan! Status janji temu: Selesai.' }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return NextResponse.json({ error: 'Gagal menyimpan rekam medis.' }, { status: 500 });
  } finally {
    client.release();
  }
}
