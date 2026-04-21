import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { DEMO_SHIPMENTS, DEMO_CONTAINERS } from '@/lib/demo-export-shipments';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/export-shipments/[id] — shipment detail with containers
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const shipmentId = parseInt(id, 10);

  if (session.partnerId === DEMO_PARTNER_ID) {
    const shipment = DEMO_SHIPMENTS.find((s) => s.id === shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: 'Embarque no encontrado' }, { status: 404 });
    }

    const containers = DEMO_CONTAINERS.filter((c) => c.shipmentId === shipmentId);
    return NextResponse.json({ shipment, containers });
  }

  return NextResponse.json({ error: 'Embarque no encontrado' }, { status: 404 });
}
