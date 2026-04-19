import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createDemoGuide, DEMO_GUIDES } from '@/lib/demo-dispatch';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/dispatch — list guides
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json({ guides: DEMO_GUIDES });
  }

  return NextResponse.json({ guides: [] });
}

/**
 * POST /api/dispatch — create a new dispatch guide
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guideType, partnerId, dateDispatch, lines, notes, saleOrderId, customsAgencyId, useFixedPrice } = body;

    if (!guideType || !partnerId || !dateDispatch || !lines?.length) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: tipo, destinatario, fecha y al menos un producto' },
        { status: 400 }
      );
    }

    if (session.partnerId === DEMO_PARTNER_ID) {
      const guide = createDemoGuide({
        guideType,
        partnerId,
        dateDispatch,
        lines,
      });

      return NextResponse.json({
        ok: true,
        guide,
        message: `Guía ${guide.name} creada exitosamente (modo demo)`,
      });
    }

    // TODO: call createDispatchGuide from odoo-client
    // Pass: guideType, partnerId, dateDispatch, lines, notes, saleOrderId, customsAgencyId, useFixedPrice
    return NextResponse.json(
      { error: 'Conexión con Odoo no configurada' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error creating dispatch guide:', error);
    return NextResponse.json(
      { error: 'Error al crear guía de despacho' },
      { status: 500 }
    );
  }
}
