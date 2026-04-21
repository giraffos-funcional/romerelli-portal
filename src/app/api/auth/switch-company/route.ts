import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/session';
import { DEMO_COMPANIES } from '@/lib/demo-dispatch';

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

    // TODO: In production, validate companyId against the Odoo user's
    // allowed_company_ids via getAllowedCompanies(uid) from odoo-client.
    // For now, only DEMO_COMPANIES are accepted — multi-company switching
    // will require the real Odoo session bound to a specific user.
    const company = DEMO_COMPANIES.find((c) => c.id === companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
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
