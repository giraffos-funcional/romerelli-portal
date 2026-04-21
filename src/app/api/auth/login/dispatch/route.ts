import { NextRequest, NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Demo dispatch users
 */
const DISPATCH_USERS: Record<string, { password: string; role: 'cajera' | 'admin_comex'; displayName: string }> = {
  'cajera1': { password: 'demo123', role: 'cajera', displayName: 'Cajera Demo' },
  'admin.comex': { password: 'demo123', role: 'admin_comex', displayName: 'Admin Comex Demo' },
};

/**
 * POST /api/auth/login/dispatch
 * Authenticate a dispatch user by username/password.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(`dispatch-${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espere un minuto.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contrasena son requeridos' },
        { status: 400 }
      );
    }

    const user = DISPATCH_USERS[username];
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Usuario o contrasena incorrectos' },
        { status: 401 }
      );
    }

    await setSession({
      partnerId: 0, // real Odoo mode (module romerelli_portal installed)
      partnerName: user.displayName,
      vat: '',
      email: `${username}@romerelli.cl`,
      type: 'dispatch',
      role: user.role,
      companyId: 1,
      companyName: 'Romerelli SpA',
      exp: Date.now() + 8 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      ok: true,
      user: { name: user.displayName, role: user.role },
    });
  } catch (error) {
    console.error('Dispatch login error:', error);
    return NextResponse.json(
      { error: 'Error de conexion con el servidor' },
      { status: 500 }
    );
  }
}
