import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/session';
import { DEMO_COMPANIES } from '@/lib/demo-dispatch';
import { getAllowedCompanies } from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;
const ODOO_API_UID = 2;

/**
 * POST /api/auth/switch-company
 * Update the companyId/companyName in the current session.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { companyId } = body;

    // Validate against allowed companies for this session context.
    let company: { id: number; name: string } | undefined;
    if (session.partnerId === DEMO_PARTNER_ID) {
      company = DEMO_COMPANIES.find((c) => c.id === companyId);
    } else {
      const allowed = await getAllowedCompanies(ODOO_API_UID);
      const match = allowed.find((c) => (c.id as number) === companyId);
      if (match) company = { id: match.id as number, name: match.name as string };
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada o no autorizada' },
        { status: 400 }
      );
    }

    await setSession({
      ...session,
      companyId: company.id,
      companyName: company.name,
    });

    return NextResponse.json({ ok: true, company });
  } catch (error) {
    console.error('Switch company error:', error);
    return NextResponse.json(
      { error: 'Error al cambiar empresa' },
      { status: 500 }
    );
  }
}
