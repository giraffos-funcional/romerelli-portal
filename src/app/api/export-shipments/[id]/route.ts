import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import { DEMO_SHIPMENTS, DEMO_CONTAINERS } from '@/lib/demo-export-shipments';
import { getExportShipmentDetail } from '@/lib/odoo-client';

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

  if (isNaN(shipmentId)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  if (session.partnerId === DEMO_PARTNER_ID) {
    const shipment = DEMO_SHIPMENTS.find((s) => s.id === shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: 'Embarque no encontrado' }, { status: 404 });
    }

    const containers = DEMO_CONTAINERS.filter((c) => c.shipmentId === shipmentId);
    return NextResponse.json({ shipment, containers });
  }

  try {
    const result = await getExportShipmentDetail(shipmentId);
    if (!result) {
      return NextResponse.json(
        { error: 'Embarque no encontrado' },
        { status: 404 }
      );
    }
    const s = result.shipment as Record<string, unknown>;
    const saleOrder = s.sale_order_id as [number, string] | false;
    const agency = s.customs_agency_id as [number, string] | false;
    const shipment = {
      id: shipmentId,
      name: s.name,
      dus: s.dus,
      despacho: s.despacho || '',
      booking: s.booking || '',
      saleOrderId: saleOrder ? saleOrder[0] : null,
      saleOrderName: saleOrder ? saleOrder[1] : '',
      customsAgencyId: agency ? agency[0] : null,
      customsAgencyName: agency ? agency[1] : '',
      containerLimit: (s.container_limit as number) || 0,
      containersUsed: (s.container_count as number) || 0,
      state: (s.state as string) || 'draft',
    };
    const containers = (result.containers as Array<Record<string, unknown>>).map((c) => {
      const picking = c.picking_id as [number, string] | false;
      return {
        id: c.id,
        pickingId: picking ? picking[0] : null,
        pickingName: picking ? picking[1] : '',
        containerNumber: c.container_number || '',
        sealNumber: c.seal_number || '',
        netWeight: c.net_weight || 0,
        tareWeight: c.tare_weight || 0,
      };
    });
    return NextResponse.json({ shipment, containers });
  } catch (error) {
    logger.error('Error fetching shipment detail:', error);
    return NextResponse.json(
      { error: 'Error al obtener embarque' },
      { status: 500 }
    );
  }
}
