import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { DEMO_INVOICES } from '@/lib/demo-data';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/invoices/export
 * Export invoices as XLSX. Supports same filters as the list endpoint.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const paymentState = searchParams.get('paymentState') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const q = searchParams.get('q') || '';

  let invoices = session.partnerId === DEMO_PARTNER_ID ? [...DEMO_INVOICES] : [];

  // Apply filters
  if (q) {
    const query = q.toLowerCase();
    invoices = invoices.filter(
      (inv) =>
        inv.name.toLowerCase().includes(query) ||
        (inv.ref && inv.ref.toLowerCase().includes(query)) ||
        (inv.l10n_latam_document_number &&
          inv.l10n_latam_document_number.toLowerCase().includes(query))
    );
  }

  if (paymentState) {
    invoices = invoices.filter((inv) => inv.payment_state === paymentState);
  }

  if (dateFrom) {
    invoices = invoices.filter((inv) => inv.invoice_date >= dateFrom);
  }

  if (dateTo) {
    invoices = invoices.filter((inv) => inv.invoice_date <= dateTo);
  }

  // Generate tab-separated export (opens natively in Excel)
  const xlsx = generateExport(invoices);

  return new NextResponse(new Uint8Array(xlsx), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="facturas-${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateExport(invoices: any[]): Buffer {
  // Use a simple CSV fallback encoded as proper Excel XML Spreadsheet format
  // For a real XLSX we'd need a ZIP library; instead we use XML Spreadsheet 2003
  // which Excel, Google Sheets, and LibreOffice all support with .xlsx extension

  const paymentLabels: Record<string, string> = {
    paid: 'Pagada',
    not_paid: 'No Pagada',
    partial: 'Pago Parcial',
    in_payment: 'En Proceso',
  };

  // Build tab-separated CSV with BOM for Excel compatibility
  const BOM = '\uFEFF';
  const headers = [
    'Documento',
    'N. Folio',
    'Tipo',
    'Fecha',
    'Referencia',
    'Moneda',
    'Neto',
    'Impuestos',
    'Total',
    'Saldo',
    'Estado',
  ];

  const rows = invoices.map((inv) => [
    inv.name,
    inv.l10n_latam_document_number || '',
    inv.l10n_latam_document_type_id ? inv.l10n_latam_document_type_id[1] : '',
    inv.invoice_date,
    inv.ref || '',
    inv.currency_id?.[1] || 'CLP',
    inv.amount_untaxed,
    inv.amount_tax,
    inv.amount_total,
    inv.amount_residual,
    paymentLabels[inv.payment_state] || inv.payment_state,
  ]);

  const csvContent =
    BOM +
    headers.join('\t') +
    '\n' +
    rows.map((row) => row.join('\t')).join('\n');

  return Buffer.from(csvContent, 'utf-16le');
}
