import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { DEMO_PARTNERS } from '@/lib/demo-dispatch';
import { getPartnerConfig } from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/partners/[id]/config
 * Returns per-partner pricing configuration: whether a fixed price applies,
 * and the fixed price value (if any).
 *
 * Response shape: { fixedPrice: boolean, fixedPriceValue: number }
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const partnerId = parseInt(id, 10);

  if (isNaN(partnerId)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  // Demo mode — partners 1 and 2 ship with a fixed price value.
  if (session.partnerId === DEMO_PARTNER_ID) {
    const partner = DEMO_PARTNERS.find((p) => p.id === partnerId);
    if (!partner) {
      return NextResponse.json({ fixedPrice: false, fixedPriceValue: 0 });
    }
    const value = partner.fixedPrice ?? 0;
    return NextResponse.json({
      fixedPrice: value > 0,
      fixedPriceValue: value,
    });
  }

  // Production mode — read custom fields from res.partner.
  try {
    const config = await getPartnerConfig(partnerId);
    if (!config) {
      return NextResponse.json({ fixedPrice: false, fixedPriceValue: 0 });
    }
    return NextResponse.json({
      fixedPrice: Boolean(config.x_fixed_price),
      fixedPriceValue: Number(config.x_fixed_price_value) || 0,
    });
  } catch (error) {
    console.error('Error fetching partner config:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuracion del cliente' },
      { status: 500 }
    );
  }
}
