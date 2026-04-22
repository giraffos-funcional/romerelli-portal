import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import { getInvoiceDetail } from '@/lib/odoo-client';
import { DEMO_INVOICES, DEMO_INVOICE_LINES } from '@/lib/demo-data';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/invoices/:id
 * Get invoice detail for the authenticated vendor.
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
  const invoiceId = parseInt(id);

  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  // Demo mode
  if (session.partnerId === DEMO_PARTNER_ID) {
    const invoice = DEMO_INVOICES.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ...invoice,
      lines: DEMO_INVOICE_LINES[invoiceId] || [],
    });
  }

  // Production mode
  try {
    const invoice = await getInvoiceDetail(invoiceId, session.partnerId);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    logger.error('Error fetching invoice detail:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalle de factura' },
      { status: 500 }
    );
  }
}
