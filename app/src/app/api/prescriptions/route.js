import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let sql = `
    SELECT pr.*,
           p.username AS patient_name, p.phone AS patient_phone,
           d.username AS doctor_name,
           mr.diagnosis, mr.created_at AS exam_date
    FROM prescriptions pr
    JOIN users p ON pr.patient_id = p.id
    JOIN medical_records mr ON pr.medical_record_id = mr.id
    JOIN users d ON mr.doctor_id = d.id
  `;
  const params = [];

  if (session.role === 'pasien') {
    params.push(session.id);
    sql += ' WHERE pr.patient_id = $1';
  }

  sql += ' ORDER BY pr.created_at DESC';
  const res = await query(sql, params);

  const list = [];
  for (const row of res.rows) {
    const itemsRes = await query(
      `SELECT pi.*, m.name AS medicine_name, m.stock AS current_stock, m.type AS medicine_type
       FROM prescription_items pi
       JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = $1`,
      [row.id]
    );
    list.push({ ...row, items: itemsRes.rows });
  }

  return NextResponse.json({ prescriptions: list });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya Admin Farmasi yang dapat memproses resep.' }, { status: 403 });
  }

  const client = await getClient();
  try {
    const { id, status } = await request.json();
    await client.query('BEGIN');

    const presRes = await client.query('SELECT * FROM prescriptions WHERE id = $1 FOR UPDATE', [id]);
    if (presRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Resep tidak ditemukan.' }, { status: 404 });
    }
    const prescription = presRes.rows[0];

    // Tahap 1: Menunggu Diproses -> Siap Diambil (Potong stok obat setelah cek kecukupan stok!)
    if (prescription.status === 'Menunggu Diproses' && status === 'Siap Diambil') {
      const itemsRes = await client.query(
        `SELECT pi.quantity, pi.medicine_id, m.name, m.stock
         FROM prescription_items pi
         JOIN medicines m ON pi.medicine_id = m.id
         WHERE pi.prescription_id = $1 FOR UPDATE`,
        [id]
      );

      for (const item of itemsRes.rows) {
        if (item.stock < item.quantity) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: `Stok obat "${item.name}" tidak mencukupi (Tersedia: ${item.stock}, Dibutuhkan: ${item.quantity}).` },
            { status: 400 }
          );
        }
      }

      for (const item of itemsRes.rows) {
        await client.query('UPDATE medicines SET stock = stock - $1 WHERE id = $2', [
          item.quantity,
          item.medicine_id,
        ]);
      }

      await client.query(
        "UPDATE prescriptions SET status = 'Siap Diambil', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
      );

      await client.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, 'Obat Siap Diambil di Loket Farmasi!', 'Resep obat Anda telah selesai disiapkan dan siap diambil di loket farmasi.')`,
        [prescription.patient_id]
      );

      await client.query('COMMIT');
      return NextResponse.json({ message: 'Status resep: Siap Diambil. Stok obat telah otomatis dipotong.' });
    }

    // Tahap 2: Siap Diambil -> Sudah Diambil
    if (prescription.status === 'Siap Diambil' && status === 'Sudah Diambil') {
      await client.query(
        "UPDATE prescriptions SET status = 'Sudah Diambil', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
      );
      await client.query('COMMIT');
      return NextResponse.json({ message: 'Konfirmasi penyerahan obat berhasil (Sudah Diambil).' });
    }

    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Transisi status resep tidak valid.' }, { status: 400 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return NextResponse.json({ error: 'Gagal memperbarui status resep.' }, { status: 500 });
  } finally {
    client.release();
  }
}
