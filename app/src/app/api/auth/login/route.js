import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const result = await query(
      'SELECT id, username, email, password, role, poli_id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    const user = result.rows[0];

    // Verifikasi password menggunakan bcrypt.compare
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      poli_id: user.poli_id,
    });

    const response = NextResponse.json({
      message: 'Login berhasil!',
      role: user.role,
      username: user.username,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
