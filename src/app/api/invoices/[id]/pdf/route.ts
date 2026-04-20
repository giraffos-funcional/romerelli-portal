import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/invoices/:id/pdf
 * Download invoice PDF. In demo mode returns a placeholder.
 * In production proxies the PDF from Odoo report service.
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

  if (session.partnerId === DEMO_PARTNER_ID) {
    // Generate a simple placeholder PDF for demo mode
    const pdfContent = generateDemoPdf(invoiceId);
    return new NextResponse(new Uint8Array(pdfContent), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${invoiceId}.pdf"`,
      },
    });
  }

  // TODO: Proxy to Odoo report service
  // const url = `${ODOO_URL}/report/pdf/account.report_invoice/${invoiceId}`;
  return NextResponse.json(
    { error: 'Descarga de PDF no disponible — conexion Odoo pendiente' },
    { status: 503 }
  );
}

/**
 * Generate a minimal valid PDF for demo purposes.
 * This creates a basic PDF 1.4 document with invoice info text.
 */
function generateDemoPdf(invoiceId: number): Buffer {
  const text = `Factura Demo #${invoiceId} - Romerelli SpA - Documento de ejemplo generado en modo demo.`;

  // Minimal PDF structure
  const objects: string[] = [];

  // Object 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  // Object 2: Pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');

  // Object 3: Page
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj'
  );

  // Object 4: Content stream
  const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  objects.push(
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`
  );

  // Object 5: Font
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'
  );

  // Build PDF
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}
