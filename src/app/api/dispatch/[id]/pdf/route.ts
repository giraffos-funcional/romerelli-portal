import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { fetchOdooReportPdf } from '@/lib/odoo-client';
import { logger } from '@/lib/logger';

/**
 * GET /api/dispatch/:id/pdf
 * Download the Romerelli dispatch guide PDF for a stock.picking.
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
  const pickingId = parseInt(id, 10);
  if (isNaN(pickingId)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  try {
    const pdf = await fetchOdooReportPdf(
      'romerelli_portal.report_dispatch_guide_document',
      pickingId
    );
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="guia-${pickingId}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('dispatch-pdf-error', { pickingId, err: String(error) });
    return NextResponse.json(
      { error: 'Error al generar PDF de la guia' },
      { status: 500 }
    );
  }
}
