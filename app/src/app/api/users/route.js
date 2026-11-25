import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const search = searchParams.get('search') || '';
  const dateFilter = searchParams.get('date') || '';

  if (session.role === 'admin') {
    let sql = `
      SELECT u.id, u.username, u.email, u.role, u.poli_id, u.phone, u.address, u.specialization, u.created_at, p.name AS poli_name
      FROM users u
      LEFT JOIN polis p ON u.poli_id = p.id
      WHERE 1=1
    `;
    const params = [];
    if (role && role !== 'all') {
      params.push(role);
      sql += ` AND u.role = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (u.username ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    if (dateFilter) {
      params.push(dateFilter);
      sql += ` AND DATE(u.created_at) = $${params.length}`;
    }
    sql += ' ORDER BY u.created_at DESC';
    const res = await query(sql, params);
    return NextResponse.json({ users: res.rows });
  }

  if (session.role === 'dokter') {
    // Dokter melihat daftar pasien yang pernah ditangani
    let sql = `
      SELECT DISTINCT u.id, u.username, u.email, u.phone, u.address,
             COUNT(a.id) AS total_visits
      FROM users u
      JOIN appointments a ON a.patient_id = u.id
      WHERE a.doctor_id = $1
    `;
    const params = [session.id];
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (u.username ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    sql += ' GROUP BY u.id ORDER BY u.username ASC';
    const res = await query(sql, params);
    return NextResponse.json({ users: res.rows });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya Admin yang dapat menambah pengguna.' }, { status: 403 });
  }

  try {
    const { username, email, password, role, poli_id, specialization, phone, address } = await request.json();
    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: 'Username, email, password, dan role wajib diisi.' }, { status: 400 });
    }
    if (role === 'dokter' && !poli_id) {
      return NextResponse.json({ error: 'Poli wajib dipilih untuk akun Dokter.' }, { status: 400 });
    }

    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: 'Email sudah digunakan.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const res = await query(
      `INSERT INTO users (username, email, password, role, poli_id, specialization, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, email, role, poli_id`,
      [
        username.trim(),
        email.toLowerCase().trim(),
        hashed,
        role,
        role === 'dokter' ? Number(poli_id) : null,
        specialization || '',
        phone || '',
        address || '',
      ]
    );
    return NextResponse.json({ message: 'Pengguna berhasil dibuat.', user: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal membuat pengguna.' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const targetId = session.role === 'admin' && body.id ? Number(body.id) : session.id;

    if (session.role !== 'admin' && targetId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username, email, password, role, poli_id, phone, address, specialization, bio } = body;
    if (!username || !email) {
      return NextResponse.json({ error: 'Username dan email wajib diisi.' }, { status: 400 });
    }

    if (session.role === 'admin') {
      const finalRole = role || 'pasien';
      if (finalRole === 'dokter' && !poli_id) {
        return NextResponse.json({ error: 'Poli wajib diisi untuk Dokter.' }, { status: 400 });
      }
      if (password && password.trim().length > 0) {
        const hashed = await bcrypt.hash(password, 10);
        await query(
          `UPDATE users SET username=$1, email=$2, password=$3, role=$4, poli_id=$5, phone=$6, address=$7, specialization=$8, bio=$9 WHERE id=$10`,
          [username, email.toLowerCase(), hashed, finalRole, finalRole === 'dokter' ? Number(poli_id) : null, phone || '', address || '', specialization || '', bio || '', targetId]
        );
      } else {
        await query(
          `UPDATE users SET username=$1, email=$2, role=$3, poli_id=$4, phone=$5, address=$6, specialization=$7, bio=$8 WHERE id=$9`,
          [username, email.toLowerCase(), finalRole, finalRole === 'dokter' ? Number(poli_id) : null, phone || '', address || '', specialization || '', bio || '', targetId]
        );
      }
    } else {
      // Update profil pribadi dokter/pasien
      if (password && password.trim().length > 0) {
        const hashed = await bcrypt.hash(password, 10);
        await query(
          `UPDATE users SET username=$1, email=$2, password=$3, phone=$4, address=$5, specialization=$6, bio=$7 WHERE id=$8`,
          [username, email.toLowerCase(), hashed, phone || '', address || '', specialization || '', bio || '', targetId]
        );
      } else {
        await query(
          `UPDATE users SET username=$1, email=$2, phone=$3, address=$4, specialization=$5, bio=$6 WHERE id=$7`,
          [username, email.toLowerCase(), phone || '', address || '', specialization || '', bio || '', targetId]
        );
      }
    }

    return NextResponse.json({ message: 'Data berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya Admin yang dapat menghapus pengguna.' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
  if (id === session.id) {
    return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri.' }, { status: 400 });
  }
  await query('DELETE FROM users WHERE id = $1', [id]);
  return NextResponse.json({ message: 'Pengguna berhasil dihapus.' });
}
