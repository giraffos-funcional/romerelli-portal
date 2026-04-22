import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createDemoGuide, DEMO_GUIDES } from '@/lib/demo-dispatch';
import { addDemoContainer } from '@/lib/demo-export-shipments';
import {
  createDispatchGuide,
  addContainerToShipment,
} from '@/lib/odoo-client';

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
    const {
      guideType, partnerId, dateDispatch, lines, notes,
      peso, patente, chofer, tipoMaterial, referencia,
      useFixedPrice,
      // Transfer fields
      warehouseOriginId, warehouseDestId, costCenterId,
      // Export fields
      shipmentId, containerNumber, sealNumber, netWeight, tareWeight,
    } = body;

    if (!guideType || !partnerId || !dateDispatch || !lines?.length) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: tipo, destinatario, fecha y al menos un producto' },
        { status: 400 }
      );
    }

    if (!peso || !patente || !chofer || !tipoMaterial) {
      return NextResponse.json(
        { error: 'Faltan datos de transporte: peso, patente, chofer y tipo de material son obligatorios' },
        { status: 400 }
      );
    }

    if (session.partnerId === DEMO_PARTNER_ID) {
      const guide = createDemoGuide({
        guideType,
        partnerId,
        dateDispatch,
        lines,
        peso,
        patente,
        chofer,
        tipoMaterial,
        referencia,
      });

      // For export type, also register the container in the shipment
      if (guideType === 'export' && shipmentId) {
        const containerResult = addDemoContainer({
          shipmentId,
          guideId: guide.id,
          guideName: guide.name,
          containerNumber: containerNumber || '',
          sealNumber: sealNumber || '',
          netWeight: netWeight || 0,
          tareWeight: tareWeight || 0,
        });

        if ('error' in containerResult) {
          return NextResponse.json(
            { error: containerResult.error },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        ok: true,
        guide,
        message: `Guia ${guide.name} creada exitosamente (modo demo)`,
      });
    }

    // Production mode — create picking in Odoo.
    // NOTE: `useFixedPrice` is resolved upstream (pricing comes from the
    // partner config endpoint); we only forward the already-priced lines.
    void useFixedPrice;

    const pickingId = await createDispatchGuide({
      partnerId,
      guideType,
      dateDispatch,
      notes,
      lines,
      saleOrderId: guideType === 'export' ? shipmentId ? undefined : undefined : undefined,
      customsAgencyId: undefined,
      peso,
      patente,
      chofer,
      tipoMaterial,
      referencia,
      warehouseOriginId,
      warehouseDestId,
      costCenterId,
    });

    // For export guides, also register the container in the shipment.
    if (guideType === 'export' && shipmentId) {
      try {
        await addContainerToShipment({
          shipmentId,
          pickingId,
          containerNumber: containerNumber || '',
          sealNumber: sealNumber || '',
          netWeight: Number(netWeight) || 0,
          tareWeight: Number(tareWeight) || 0,
        });
      } catch (error) {
        console.error('Error registering container:', error);
        // Picking was created; surface a partial-success error for the UI.
        return NextResponse.json(
          {
            ok: false,
            pickingId,
            error: 'Guia creada, pero fallo el registro del contenedor',
          },
          { status: 207 }
        );
      }
    }

    return NextResponse.json({ ok: true, pickingId });
  } catch (error) {
    console.error('Error creating dispatch guide:', error);
    return NextResponse.json(
      { error: 'Error al crear guia de despacho' },
      { status: 500 }
    );
  }
}
