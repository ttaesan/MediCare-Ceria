import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const res = await query('SELECT * FROM polis ORDER BY id ASC');
  return NextResponse.json({ polis: res.rows });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { name, description, icon } = await request.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'Nama Poli dan deskripsi wajib diisi.' }, { status: 400 });
    }
    const dup = await query('SELECT id FROM polis WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'Nama Poli sudah ada (harus unik).' }, { status: 409 });
    }
    const res = await query(
      'INSERT INTO polis (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), description.trim(), icon || '🏥']
    );
    return NextResponse.json({ message: 'Poli berhasil ditambahkan.', poli: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menambah Poli.' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { id, name, description, icon } = await request.json();
    if (!id || !name || !description) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }
    const dup = await query('SELECT id FROM polis WHERE LOWER(name) = LOWER($1) AND id != $2', [name.trim(), id]);
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'Nama Poli tidak boleh duplikat.' }, { status: 409 });
    }
    await query('UPDATE polis SET name=$1, description=$2, icon=$3 WHERE id=$4', [
      name.trim(),
      description.trim(),
      icon || '🏥',
      id,
    ]);
    return NextResponse.json({ message: 'Data Poli diperbarui.' });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui Poli.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  await query('DELETE FROM polis WHERE id = $1', [id]);
  return NextResponse.json({ message: 'Poli berhasil dihapus.' });
}
