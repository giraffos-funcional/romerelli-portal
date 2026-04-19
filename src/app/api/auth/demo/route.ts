import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';

/**
 * POST /api/auth/demo
 * Create a demo session with mock vendor data (no Odoo connection needed).
 */
export async function POST() {
  await setSession({
    partnerId: 9999,
    partnerName: 'Proveedor Demo S.A.',
    vat: '76.123.456-7',
    email: 'demo@proveedor.cl',
    type: 'vendor',
    exp: Date.now() + 8 * 60 * 60 * 1000,
  });

  return NextResponse.json({ ok: true });
}
