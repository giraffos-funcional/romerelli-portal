import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  DEMO_SHIPMENTS,
  createDemoShipment,
} from '@/lib/demo-export-shipments';
import { DEMO_SALE_ORDERS, DEMO_PARTNERS } from '@/lib/demo-dispatch';

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

  return NextResponse.json({ shipments: [] });
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

    if (!dus || !despacho || !booking || !saleOrderId || !customsAgencyId || !containerLimit) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
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

    return NextResponse.json(
      { error: 'Conexion con Odoo no configurada' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { error: 'Error al crear embarque' },
      { status: 500 }
    );
  }
}
