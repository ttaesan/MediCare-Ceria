import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, phone, address } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }

    // Hash password menggunakan bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register publik hanya untuk role 'pasien' sesuai ketentuan
    const result = await query(
      `INSERT INTO users (username, email, password, role, phone, address)
       VALUES ($1, $2, $3, 'pasien', $4, $5)
       RETURNING id, username, email, role`,
      [username.trim(), email.toLowerCase().trim(), hashedPassword, phone || '', address || '']
    );

    return NextResponse.json({
      message: 'Registrasi berhasil! Silakan login.',
      user: result.rows[0],
    }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
