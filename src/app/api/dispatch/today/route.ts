import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listUserPickings } from '@/lib/odoo-client';
import { logger } from '@/lib/logger';

const DEMO_PARTNER_ID = 9999;

/**
 * GET /api/dispatch/today
 * Returns today's dispatch guides for the cajera dashboard.
 * In demo mode, returns the in-memory DEMO_GUIDES list.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Demo mode: return demo guides
  if (session.partnerId === DEMO_PARTNER_ID) {
    const { DEMO_GUIDES } = await import('@/lib/demo-dispatch');
    return NextResponse.json({ guides: DEMO_GUIDES.slice(0, 10) });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const guides = await listUserPickings({
      dateFrom: today,
      dateTo: today,
      limit: 30,
    });
    return NextResponse.json({ guides });
  } catch (error) {
    logger.error('today-pickings-error', { err: String(error) });
    return NextResponse.json({ guides: [] });
  }
}
