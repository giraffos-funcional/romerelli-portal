import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getWarehouses } from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;

const DEMO_WAREHOUSES = [
  { id: 1, name: 'Bodega Central Quilicura' },
  { id: 2, name: 'Bodega Valparaiso' },
  { id: 3, name: 'Patio Chatarra Norte' },
];

/**
 * GET /api/warehouses — list warehouses
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json(DEMO_WAREHOUSES);
  }

  try {
    const warehouses = await getWarehouses();
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Error al obtener bodegas' },
      { status: 500 }
    );
  }
}
