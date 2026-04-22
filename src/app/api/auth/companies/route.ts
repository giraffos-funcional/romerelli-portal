import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import { DEMO_COMPANIES } from '@/lib/demo-dispatch';
import { getAllowedCompanies } from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;
const ODOO_API_UID = 2; // Administrator UID — used for shared API-key auth.

/**
 * GET /api/auth/companies — list companies the current session can access.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json({ companies: DEMO_COMPANIES });
  }

  try {
    const companies = await getAllowedCompanies(ODOO_API_UID);
    return NextResponse.json({
      companies: companies.map((c) => ({ id: c.id as number, name: c.name as string })),
    });
  } catch (error) {
    logger.error('Error fetching companies:', error);
    // Fallback: expose the current session company so the UI isn't empty.
    return NextResponse.json({
      companies: session.companyId && session.companyName
        ? [{ id: session.companyId, name: session.companyName }]
        : [],
    });
  }
}
