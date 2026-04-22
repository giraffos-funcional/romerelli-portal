import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import { getCostCenters } from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;

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

  if (session.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json(DEMO_COST_CENTERS);
  }

  try {
    const costCenters = await getCostCenters();
    return NextResponse.json(costCenters);
  } catch (error) {
    logger.error('Error fetching cost centers:', error);
    return NextResponse.json(
      { error: 'Error al obtener centros de costo' },
      { status: 500 }
    );
  }
}
