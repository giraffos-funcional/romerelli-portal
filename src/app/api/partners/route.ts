import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { DEMO_PARTNERS } from '@/lib/demo-dispatch';

const DEMO_PARTNER_ID = 9999;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').toLowerCase();

  if (session.partnerId === DEMO_PARTNER_ID) {
    const filtered = query
      ? DEMO_PARTNERS.filter(
          (p) => p.name.toLowerCase().includes(query) || p.vat.includes(query)
        )
      : DEMO_PARTNERS;
    return NextResponse.json(filtered);
  }

  // TODO: call searchPartners from odoo-client
  return NextResponse.json([]);
}
