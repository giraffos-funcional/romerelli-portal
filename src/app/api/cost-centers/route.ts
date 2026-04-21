import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const DEMO_COST_CENTERS = [
  { id: 1, name: 'Operaciones Santiago' },
  { id: 2, name: 'Exportaciones' },
  { id: 3, name: 'Reciclaje Interno' },
  { id: 4, name: 'Mantenimiento' },
];

/**
 * GET /api/cost-centers — list cost centers
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Demo mode returns hardcoded cost centers
  return NextResponse.json(DEMO_COST_CENTERS);
}
