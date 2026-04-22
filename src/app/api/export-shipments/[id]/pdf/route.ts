import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { fetchOdooReportPdf } from '@/lib/odoo-client';
import { logger } from '@/lib/logger';

/**
 * GET /api/export-shipments/:id/pdf
 * Download the Romerelli export shipment PDF.
 */
export async function GET(
  _request: NextRequest,
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

  try {
    const pdf = await fetchOdooReportPdf(
      'romerelli_portal.report_export_shipment_document',
      shipmentId
    );
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="embarque-${shipmentId}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('shipment-pdf-error', { shipmentId, err: String(error) });
    return NextResponse.json(
      { error: 'Error al generar PDF del embarque' },
      { status: 500 }
    );
  }
}
