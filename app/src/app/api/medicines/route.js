import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all'; // all, available, out_of_stock, expired
  const search = searchParams.get('search') || '';

  let sql = 'SELECT * FROM medicines WHERE 1=1';
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND name ILIKE $${params.length}`;
  }

  if (filter === 'available') {
    sql += ' AND stock > 0 AND expired_date >= CURRENT_DATE';
  } else if (filter === 'out_of_stock') {
    sql += ' AND stock = 0';
  } else if (filter === 'expired') {
    sql += ' AND expired_date < CURRENT_DATE';
  }

  sql += ' ORDER BY name ASC';
  const res = await query(sql, params);
  return NextResponse.json({ medicines: res.rows });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, description, type, stock, expired_date, image_url } = await request.json();
    if (!name || !description || !type || stock === undefined || !expired_date) {
      return NextResponse.json({ error: 'Semua field obat wajib diisi dengan benar.' }, { status: 400 });
    }
    if (!['keras', 'biasa'].includes(type)) {
      return NextResponse.json({ error: 'Tipe obat harus keras atau biasa.' }, { status: 400 });
    }
    if (Number(stock) < 0) {
      return NextResponse.json({ error: 'Stok obat tidak boleh negatif.' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO medicines (name, description, type, stock, expired_date, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name.trim(), description.trim(), type, Number(stock), expired_date, image_url || '💊']
    );
    return NextResponse.json({ message: 'Data obat berhasil ditambahkan.', medicine: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menambahkan data obat.' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, name, description, type, stock, expired_date, image_url } = await request.json();
    if (!id || !name || !description || !type || stock === undefined || !expired_date) {
      return NextResponse.json({ error: 'Data obat tidak boleh kosong.' }, { status: 400 });
    }

    await query(
      `UPDATE medicines SET name=$1, description=$2, type=$3, stock=$4, expired_date=$5, image_url=$6 WHERE id=$7`,
      [name.trim(), description.trim(), type, Number(stock), expired_date, image_url || '💊', id]
    );
    return NextResponse.json({ message: 'Data obat berhasil diperbarui.' });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui obat.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try {
    await query('DELETE FROM medicines WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Obat berhasil dihapus.' });
  } catch (err) {
    return NextResponse.json({ error: 'Obat tidak bisa dihapus karena sudah tercatat di riwayat resep.' }, { status: 400 });
  }
}
