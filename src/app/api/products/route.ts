import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { DEMO_PRODUCTS } from '@/lib/demo-dispatch';
import { searchProducts } from '@/lib/odoo-client';

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
      ? DEMO_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.default_code && p.default_code.toLowerCase().includes(query))
        )
      : DEMO_PRODUCTS;
    return NextResponse.json(filtered);
  }

  try {
    const products = await searchProducts(query);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
