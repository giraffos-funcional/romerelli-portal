import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import { getVendorInvoices } from '@/lib/odoo-client';
import { DEMO_INVOICES } from '@/lib/demo-data';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/invoices
 * Get invoices for the authenticated vendor.
 * Query params: page, limit, dateFrom, dateTo, paymentState
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  const paymentState = searchParams.get('paymentState') || undefined;
  const search = (searchParams.get('q') || '').toLowerCase();

  // Demo mode — return mock data
  if (session.partnerId === DEMO_PARTNER_ID) {
    let filtered = [...DEMO_INVOICES];
    if (search) {
      filtered = filtered.filter(
        (inv) =>
          inv.name.toLowerCase().includes(search) ||
          (inv.ref && inv.ref.toLowerCase().includes(search)) ||
          (inv.l10n_latam_document_number &&
            String(inv.l10n_latam_document_number).toLowerCase().includes(search))
      );
    }
    if (paymentState) {
      filtered = filtered.filter((inv) => inv.payment_state === paymentState);
    }
    if (dateFrom) {
      filtered = filtered.filter((inv) => inv.invoice_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((inv) => inv.invoice_date <= dateTo);
    }
    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      invoices: paginated,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  }

  // Production mode — call Odoo API
  try {
    const result = await getVendorInvoices(session.partnerId, {
      offset: (page - 1) * limit,
      limit,
      dateFrom,
      dateTo,
      paymentState,
    });

    return NextResponse.json({
      invoices: result.invoices,
      total: result.total,
      page,
      pages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    );
  }
}
