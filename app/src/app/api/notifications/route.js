import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ notifications: [] });
  const res = await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
    [session.id]
  );
  return NextResponse.json({ notifications: res.rows });
}

export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [session.id]);
  return NextResponse.json({ message: 'Notifikasi ditandai sudah dibaca.' });
}
