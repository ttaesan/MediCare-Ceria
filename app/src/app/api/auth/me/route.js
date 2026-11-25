import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const res = await query(
    `SELECT u.id, u.username, u.email, u.role, u.poli_id, u.phone, u.address, u.specialization, u.bio, p.name AS poli_name
     FROM users u
     LEFT JOIN polis p ON u.poli_id = p.id
     WHERE u.id = $1`,
    [session.id]
  );
  return NextResponse.json({ user: res.rows[0] || null });
}
