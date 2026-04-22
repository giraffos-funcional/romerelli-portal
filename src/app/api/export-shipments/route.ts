import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import {
  DEMO_SHIPMENTS,
  createDemoShipment,
} from '@/lib/demo-export-shipments';
import { DEMO_SALE_ORDERS, DEMO_PARTNERS } from '@/lib/demo-dispatch';
import {
  getExportShipments,
  createExportShipment,
} from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/export-shipments — list shipments
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json({ shipments: DEMO_SHIPMENTS });
  }

  try {
    const raw = await getExportShipments();
    // Map snake_case Odoo fields + Many2one tuples to the camelCase shape
    // the UI expects (containersUsed/containerLimit/customsAgencyName, etc.).
    const shipments = raw.map((s) => {
      const saleOrder = s.sale_order_id as [number, string] | false;
      const agency = s.customs_agency_id as [number, string] | false;
      return {
        id: s.id,
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
        createdAt: (s.create_date as string) || '',
      };
    });
    return NextResponse.json({ shipments });
  } catch (error) {
    logger.error('Error fetching shipments:', error);
    return NextResponse.json(
      { error: 'Error al obtener embarques' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/export-shipments — create a new shipment
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dus, despacho, booking, saleOrderId, customsAgencyId, containerLimit } = body;

    if (!dus || !containerLimit) {
      return NextResponse.json(
        { error: 'DUS y limite de contenedores son obligatorios' },
        { status: 400 }
      );
    }

    if (session.partnerId === DEMO_PARTNER_ID) {
      const saleOrder = DEMO_SALE_ORDERS.find((so) => so.id === saleOrderId);
      const agency = DEMO_PARTNERS.find((p) => p.id === customsAgencyId);

      const shipment = createDemoShipment({
        dus,
        despacho,
        booking,
        saleOrderId,
        saleOrderName: saleOrder?.name || `SO-${saleOrderId}`,
        customsAgencyId,
        customsAgencyName: agency?.name || 'Agencia desconocida',
        containerLimit: Number(containerLimit),
      });

      return NextResponse.json({ ok: true, shipment });
    }

    try {
      const shipmentId = await createExportShipment({
        dus,
        despacho,
        booking,
        saleOrderId,
        customsAgencyId,
        containerLimit: Number(containerLimit),
      });
      return NextResponse.json({ ok: true, shipmentId });
    } catch (error) {
      logger.error('Error creating shipment in Odoo:', error);
      return NextResponse.json(
        { error: 'Error al crear embarque en Odoo' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error creating shipment:', error);
    return NextResponse.json(
      { error: 'Error al crear embarque' },
      { status: 500 }
    );
  }
}
