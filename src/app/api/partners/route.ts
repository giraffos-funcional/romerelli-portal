import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { DEMO_PARTNERS } from '@/lib/demo-dispatch';
import { searchPartners } from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').toLowerCase();
  const isCustomer = searchParams.get('isCustomer') === 'true';
  const isSupplier = searchParams.get('isSupplier') === 'true';

  if (session.partnerId === DEMO_PARTNER_ID) {
    const filtered = query
      ? DEMO_PARTNERS.filter(
          (p) => p.name.toLowerCase().includes(query) || p.vat.includes(query)
        )
      : DEMO_PARTNERS;
    return NextResponse.json(filtered);
  }

  try {
    const partners = await searchPartners(query, { isCustomer, isSupplier });
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
}
