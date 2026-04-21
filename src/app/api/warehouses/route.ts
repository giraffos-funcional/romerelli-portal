import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

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

  // Demo mode returns hardcoded warehouses
  return NextResponse.json(DEMO_WAREHOUSES);
}
