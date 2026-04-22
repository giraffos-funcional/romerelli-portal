import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import { DEMO_SALE_ORDERS } from '@/lib/demo-dispatch';
import { searchSaleOrders } from '@/lib/odoo-client';

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
      ? DEMO_SALE_ORDERS.filter(
          (so) =>
            so.name.toLowerCase().includes(query) ||
            String(so.partner_id[1]).toLowerCase().includes(query)
        )
      : DEMO_SALE_ORDERS;
    return NextResponse.json(filtered);
  }

  try {
    const orders = await searchSaleOrders(query);
    return NextResponse.json(orders);
  } catch (error) {
    logger.error('Error fetching sale orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener ordenes de venta' },
      { status: 500 }
    );
  }
}
