import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/demo
 * Create a demo session with mock vendor data (no Odoo connection needed).
 */
export async function POST() {
  const sessionData = {
    partnerId: 9999,
    partnerName: 'Proveedor Demo S.A.',
    vat: '76.123.456-7',
    email: 'demo@proveedor.cl',
    type: 'vendor' as const,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  };

  const cookieStore = await cookies();
  cookieStore.set('portal_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
